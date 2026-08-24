const paletteVersion = 'maurione_cars_palette_v3';
try {
  if (!localStorage.getItem(paletteVersion)) {
    localStorage.setItem('maurione_cars_theme', 'light');
    localStorage.setItem(paletteVersion, '1');
  }
} catch (_) {}
