try {
  localStorage.setItem('maurione_cars_theme', 'light');
} catch (_) {}
document.documentElement.dataset.theme = 'light';
document.documentElement.style.colorScheme = 'light';
