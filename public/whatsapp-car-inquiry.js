(() => {
  const clean=value=>String(value||'').replace(/\s+/g,' ').trim();
  const spec=(specs,...keys)=>{for(const key of keys)if(specs[key])return specs[key];return''};
  function normalizeNumber(number=''){
    let digits=String(number||'').replace(/\D/g,'');
    if(digits.startsWith('00244'))digits=digits.slice(2);
    if(digits.length===9)digits=`244${digits}`;
    return digits;
  }
  function whatsappNumber(link){const href=link?.getAttribute('href')||'';const match=href.match(/(?:wa\.me\/|[?&]phone=)(\d+)/i);return normalizeNumber(match?.[1]||'')}
  function readCarDetails(){
    const detail=document.querySelector('.mxDetail');if(!detail)return null;
    const brand=clean(detail.querySelector('.mxSummary > span')?.textContent),title=clean(detail.querySelector('.mxSummary h1')?.textContent),price=clean(detail.querySelector('.mxDetailPrice')?.textContent),image=detail.querySelector('.mxThumbs button:first-child img')?.src||detail.querySelector('.mxGallery img')?.src||'',specs={};
    detail.querySelectorAll('.mxDetailSpecs .mxSpec').forEach(item=>{const label=clean(item.querySelector('small')?.textContent),value=clean(item.querySelector('strong')?.textContent);if(label)specs[label]=value});
    const sharePath=location.pathname.startsWith('/cars/')?location.pathname.replace(/^\/cars\//,'/share/car/'):location.pathname;
    const shareUrl=new URL(`${location.origin}${sharePath}`),carName=clean(`${brand} ${title}`);
    if(carName)shareUrl.searchParams.set('n',carName);if(price)shareUrl.searchParams.set('p',price);if(image)shareUrl.searchParams.set('i',image);
    const mileage=spec(specs,'Quilometragem','km','كم'),fuel=spec(specs,'Combustível','Fuel','Carburant','الوقود'),transmission=spec(specs,'Transmissão','Transmission','ناقل الحركة');
    if(mileage)shareUrl.searchParams.set('m',mileage);if(fuel)shareUrl.searchParams.set('f',fuel);if(transmission)shareUrl.searchParams.set('tr',transmission);
    return{brand,title,price,adUrl:shareUrl.toString(),specs};
  }
  function buildMessage(car){
    const year=spec(car.specs,'Ano','Year','Année','السنة'),mileage=spec(car.specs,'Quilometragem','km','كم'),fuel=spec(car.specs,'Combustível','Fuel','Carburant','الوقود'),transmission=spec(car.specs,'Transmissão','Transmission','ناقل الحركة'),drive=spec(car.specs,'Tração','Drive','الدفع');
    const lines=['Olá, gostaria de saber mais sobre este carro na MauriOne:','',`🚗 Carro: ${clean(`${car.brand} ${car.title}`)}`,car.price?`💰 Preço: ${car.price}`:'',year?`📅 Ano: ${year}`:'',mileage?`🛣️ Quilometragem: ${mileage}${/km/i.test(mileage)?'':' km'}`:'',fuel?`⛽ Combustível: ${fuel}`:'',transmission?`⚙️ Transmissão: ${transmission}`:'',drive?`🚙 Tração: ${drive}`:'','','🔗 Link do anúncio na MauriOne:',car.adUrl];
    return lines.filter((line,index,array)=>line!==''||(index>0&&array[index-1]!=='')).join('\n').trim();
  }
  function apply(){
    const car=readCarDetails();if(!car)return;
    const links=[...document.querySelectorAll('.mxDetail .mxContact a.wa'),...document.querySelectorAll('a.mxGlobalWhatsApp')];
    let fallback='';for(const link of links)fallback=whatsappNumber(link)||fallback;if(!fallback)return;
    const message=buildMessage(car);
    links.forEach(link=>{const number=whatsappNumber(link)||fallback;if(!number)return;const next=`https://wa.me/${number}?text=${encodeURIComponent(message)}`;if(link.getAttribute('href')!==next)link.setAttribute('href',next);link.target='_blank';link.rel='noreferrer'});
  }
  function start(){apply();const root=document.getElementById('root')||document.body;new MutationObserver(apply).observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['src','href']});window.addEventListener('popstate',()=>setTimeout(apply,0));document.addEventListener('click',event=>{if(event.target.closest?.('.mxDetail .mxContact a.wa, a.mxGlobalWhatsApp, .mxThumbs button'))setTimeout(apply,0)},true)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();