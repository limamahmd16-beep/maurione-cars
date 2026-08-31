import { auth, db } from './lib/firebase.js';
import {
  collection,
  doc,
  increment,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

const OWNER_UID = 'sC94v8XaXmUMHK6eineEy25GIst2';

const FIELD_BY_EVENT = {
  view: 'views',
  whatsapp: 'whatsappClicks',
  phone: 'phoneClicks',
  favorite: 'favoriteAdds',
};

const demoLabels = {
  'demo-range': 'رينج روفر سبورت 2022',
  'demo-land': 'تويوتا لاند كروزر 2021',
};

const stats = new Map();
const cars = new Map();
let stopStats = null;
let stopCars = null;
let adminListening = false;
let renderRaf = 0;

function carIdFromPath() {
  const match = window.location.pathname.match(/^\/cars\/([^/]+)/);
  if (!match) return '';
  try { return decodeURIComponent(match[1]); } catch { return match[1]; }
}

function currentUserReady() {
  const user = auth?.currentUser;
  return Boolean(user && user.uid !== OWNER_UID && db);
}

async function record(carId, type) {
  const field = FIELD_BY_EVENT[type];
  if (!carId || !field || !currentUserReady()) return false;

  const payload = {
    views: increment(field === 'views' ? 1 : 0),
    whatsappClicks: increment(field === 'whatsappClicks' ? 1 : 0),
    phoneClicks: increment(field === 'phoneClicks' ? 1 : 0),
    favoriteAdds: increment(field === 'favoriteAdds' ? 1 : 0),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'carStats', carId), payload, { merge: true });
    return true;
  } catch (error) {
    console.warn('[MauriOne analytics] write blocked', error?.code || error?.message || error);
    return false;
  }
}

async function recordViewIfNeeded() {
  const carId = carIdFromPath();
  if (!carId || !document.querySelector('.mxDetail')) return;
  const key = `maurione_viewed_${carId}`;
  try {
    if (sessionStorage.getItem(key) === '1' || sessionStorage.getItem(key) === 'pending') return;
    sessionStorage.setItem(key, 'pending');
  } catch {}

  const ok = await record(carId, 'view');
  try {
    if (ok) sessionStorage.setItem(key, '1');
    else sessionStorage.removeItem(key);
  } catch {}
}

function savedFavorites() {
  try {
    const value = JSON.parse(localStorage.getItem('maurione_favorites') || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function onClick(event) {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const wa = target.closest('.mxDetail .mxContact a.wa, body:has(.mxDetail) a.mxGlobalWhatsApp');
  if (wa) {
    const carId = carIdFromPath();
    if (carId) record(carId, 'whatsapp');
    return;
  }

  const phone = target.closest('.mxDetail .mxContact a[href^="tel:"]');
  if (phone) {
    const carId = carIdFromPath();
    if (carId) record(carId, 'phone');
    return;
  }

  const fav = target.closest('.mxFav');
  if (fav) {
    const before = new Set(savedFavorites());
    setTimeout(() => {
      const after = savedFavorites();
      const added = after.find(id => !before.has(id));
      if (added) record(String(added), 'favorite');
    }, 40);
  }
}

function num(value) {
  return new Intl.NumberFormat('en-US').format(Number(value || 0));
}

function labelFor(id) {
  const car = cars.get(id);
  if (car) return `${car.brand || ''} ${car.model || ''} ${car.year || ''}`.trim() || id;
  return demoLabels[id] || id;
}

function score(row) {
  return Number(row.whatsappClicks || 0) * 5 +
    Number(row.phoneClicks || 0) * 4 +
    Number(row.favoriteAdds || 0) * 2 +
    Number(row.views || 0);
}

function ensureStyle() {
  if (document.getElementById('mx-car-analytics-style')) return;
  const style = document.createElement('style');
  style.id = 'mx-car-analytics-style';
  style.textContent = `
    .mxAnalyticsPanel{margin:14px 0;border:1px solid #e7e9ed;border-radius:24px;background:#fff;padding:16px;box-shadow:0 8px 26px rgba(15,23,42,.04)}
    .mxAnalyticsHead{display:flex;align-items:flex-end;justify-content:space-between;gap:10px;margin-bottom:13px}
    .mxAnalyticsHead h2{margin:0;font-size:18px;color:#111318}.mxAnalyticsHead span{font-size:11px;color:#90959d}
    .mxAnalyticsGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
    .mxAnalyticsCard{border:1px solid #eceef1;border-radius:17px;background:#fafbfc;padding:13px;min-height:78px;display:flex;flex-direction:column;justify-content:center;gap:4px}
    .mxAnalyticsCard span{font-size:11px;color:#777d86;font-weight:700}.mxAnalyticsCard strong{font-size:24px;line-height:1;color:#15171b;font-weight:900;direction:ltr;text-align:right}
    .mxAnalyticsCard.accent{background:#fff7f2;border-color:#ffd8c4}.mxAnalyticsCard.accent strong{color:#ff5a12}
    .mxAnalyticsRank{margin-top:14px;border-top:1px solid #eef0f2;padding-top:12px}.mxAnalyticsRank h3{font-size:14px;margin:0 0 9px;color:#22252a}
    .mxAnalyticsRows{display:grid;gap:7px}.mxAnalyticsRow{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;border:1px solid #eceef1;border-radius:14px;padding:10px;background:#fff}
    .mxAnalyticsRow>div:first-child{min-width:0}.mxAnalyticsRow strong{display:block;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#202328}.mxAnalyticsRow small{display:block;margin-top:3px;color:#91969e;font-size:9.5px}
    .mxAnalyticsChips{display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end}.mxAnalyticsChips b{font-size:9px;padding:5px 7px;border-radius:999px;background:#f4f5f7;color:#666d76;white-space:nowrap}.mxAnalyticsChips b.wa{background:#edf9f1;color:#168443}
    .mxAnalyticsEmpty{padding:18px 8px;text-align:center;color:#9297a0;font-size:12px}
    @media(min-width:720px){.mxAnalyticsGrid{grid-template-columns:repeat(4,minmax(0,1fr))}}
    html[data-theme='dark'] .mxAnalyticsPanel{background:#171a1f;border-color:#2a2e35;box-shadow:none}
    html[data-theme='dark'] .mxAnalyticsHead h2,html[data-theme='dark'] .mxAnalyticsRank h3,html[data-theme='dark'] .mxAnalyticsRow strong{color:#f4f5f7}
    html[data-theme='dark'] .mxAnalyticsCard,html[data-theme='dark'] .mxAnalyticsRow{background:#111419;border-color:#2b2f36}
    html[data-theme='dark'] .mxAnalyticsCard span{color:#a8adb5}html[data-theme='dark'] .mxAnalyticsCard strong{color:#f4f5f7}
    html[data-theme='dark'] .mxAnalyticsCard.accent{background:#2a1a13;border-color:#6a3923}html[data-theme='dark'] .mxAnalyticsCard.accent strong{color:#ff7a3d}
    html[data-theme='dark'] .mxAnalyticsRank{border-color:#30343b}html[data-theme='dark'] .mxAnalyticsChips b{background:#24282f;color:#b9bec6}
  `;
  document.head.appendChild(style);
}

function renderAdmin() {
  cancelAnimationFrame(renderRaf);
  renderRaf = requestAnimationFrame(() => {
    const admin = document.querySelector('.mxAdmin');
    if (!admin) return;
    ensureStyle();

    let panel = admin.querySelector('.mxAnalyticsPanel');
    if (!panel) {
      panel = document.createElement('section');
      panel.className = 'mxAnalyticsPanel';
      panel.innerHTML = `
        <div class="mxAnalyticsHead"><h2>تفاعل العملاء مع السيارات</h2><span>إحصائيات فعلية</span></div>
        <div class="mxAnalyticsGrid">
          <div class="mxAnalyticsCard" data-stat="views"><span>مشاهدات السيارات</span><strong>0</strong></div>
          <div class="mxAnalyticsCard accent" data-stat="whatsapp"><span>ضغطات واتساب</span><strong>0</strong></div>
          <div class="mxAnalyticsCard" data-stat="phone"><span>ضغطات الاتصال</span><strong>0</strong></div>
          <div class="mxAnalyticsCard" data-stat="favorites"><span>إضافات المفضلة</span><strong>0</strong></div>
        </div>
        <div class="mxAnalyticsRank"><h3>السيارات الأكثر اهتمامًا</h3><div class="mxAnalyticsRows"></div></div>`;
      const overview = admin.querySelector('.mxAdminV3Overview');
      const metrics = admin.querySelector('.mxMetrics');
      if (overview) overview.insertAdjacentElement('afterend', panel);
      else if (metrics) metrics.insertAdjacentElement('afterend', panel);
      else admin.querySelector('.mxAdminInner')?.prepend(panel);
    }

    const rows = [...stats.entries()].map(([id, data]) => ({ id, ...data }));
    const totals = rows.reduce((acc, row) => {
      acc.views += Number(row.views || 0);
      acc.whatsapp += Number(row.whatsappClicks || 0);
      acc.phone += Number(row.phoneClicks || 0);
      acc.favorites += Number(row.favoriteAdds || 0);
      return acc;
    }, { views: 0, whatsapp: 0, phone: 0, favorites: 0 });

    panel.querySelector('[data-stat="views"] strong').textContent = num(totals.views);
    panel.querySelector('[data-stat="whatsapp"] strong').textContent = num(totals.whatsapp);
    panel.querySelector('[data-stat="phone"] strong').textContent = num(totals.phone);
    panel.querySelector('[data-stat="favorites"] strong').textContent = num(totals.favorites);

    const list = panel.querySelector('.mxAnalyticsRows');
    const ranked = rows.sort((a, b) => score(b) - score(a)).slice(0, 6);
    if (!ranked.length) {
      list.innerHTML = '<div class="mxAnalyticsEmpty">ستظهر الإحصائيات هنا بعد أول تفاعل مع السيارات.</div>';
      return;
    }
    list.innerHTML = ranked.map(row => `
      <div class="mxAnalyticsRow">
        <div><strong>${escapeHtml(labelFor(row.id))}</strong><small>درجة الاهتمام: ${num(score(row))}</small></div>
        <div class="mxAnalyticsChips">
          <b>${num(row.views)} مشاهدة</b>
          <b class="wa">${num(row.whatsappClicks)} واتساب</b>
          <b>${num(row.phoneClicks)} اتصال</b>
          <b>${num(row.favoriteAdds)} مفضلة</b>
        </div>
      </div>`).join('');
  });
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>'"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[ch]));
}

function startAdminListeners() {
  if (adminListening || !db || !auth?.currentUser || !document.querySelector('.mxAdmin')) return;
  adminListening = true;

  stopStats = onSnapshot(collection(db, 'carStats'), snapshot => {
    stats.clear();
    snapshot.forEach(item => stats.set(item.id, item.data() || {}));
    renderAdmin();
  }, error => {
    console.warn('[MauriOne analytics] stats read blocked', error?.code || error?.message || error);
  });

  stopCars = onSnapshot(collection(db, 'cars'), snapshot => {
    cars.clear();
    snapshot.forEach(item => cars.set(item.id, item.data() || {}));
    renderAdmin();
  }, () => {});
}

function schedule() {
  recordViewIfNeeded();
  startAdminListeners();
  if (document.querySelector('.mxAdmin')) renderAdmin();
}

document.addEventListener('click', onClick, true);
window.addEventListener('popstate', () => setTimeout(schedule, 0));
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule, { once: true });
else schedule();

const observer = new MutationObserver(() => schedule());
observer.observe(document.documentElement, { childList: true, subtree: true });

window.addEventListener('beforeunload', () => {
  stopStats?.();
  stopCars?.();
});
