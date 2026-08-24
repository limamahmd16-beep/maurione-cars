const paletteVersion = 'maurione_cars_palette_v2';
try {
  if (!localStorage.getItem(paletteVersion)) {
    localStorage.setItem('maurione_cars_theme', 'dark');
    localStorage.setItem(paletteVersion, '1');
  }
} catch (_) {}
