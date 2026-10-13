---
paths:
  - routes/settings.php
---

# Routes

## Ajustes de cuenta dentro de /panel o /portal
Las rutas de ajustes llevan el prefijo {area}/settings (area = panel|portal según User::area()). SetUserAreaUrlDefaults rellena {area} vía URL::defaults: debe estar en el grupo de rutas (no solo en el grupo web), porque Wayfinder solo lo detecta ahí y así deja `area` como opcional en el TS. EnsureUserArea redirige los GET al área correcta y devuelve 404 en otros métodos. En tests, fija URL::defaults(['area' => 'portal']), porque los usuarios de la factory son externos.
