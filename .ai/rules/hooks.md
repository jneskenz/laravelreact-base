---
paths:
  - resources/js/hooks/use-appearance.tsx
---

# Hooks

## La personalización solo se aplica en /panel y /portal
El modo, el tamaño de letra y los colores del tema solo se aplican si la URL empieza por /panel o /portal (isThemedPath en use-appearance.tsx y script en línea de app.blade.php). En el resto de páginas se restablecen. Si generas URLs de rutas con {area} al importar un módulo (migas de pan, menús), el área aún no está definida: hazlo al renderizar o en un layout callback que llame a syncUrlArea(area).
