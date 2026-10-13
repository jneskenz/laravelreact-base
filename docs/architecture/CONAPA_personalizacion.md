---
title: "CONAPA — Módulo de Personalización y Apariencia"
document_type: "module-spec"
project: "CONAPA"
subproject: "Sistema Interno (backoffice)"
stack: ["Laravel 13", "Inertia v3", "React 19", "Spatie Permission"]
status: "vigente"
version: "1.1"
last_updated: "2026-10-13"
source_reference: "CONAPA_menus_submenus.md"
tags: ["configuracion", "temas", "apariencia", "personalizacion", "colores"]
---

# CONAPA — Módulo de Personalización y Apariencia

## Propósito

Permite al equipo de la organización administrar los **temas de color** del sistema: crear temas nuevos, editarlos, duplicarlos, eliminarlos y elegir cuál es el **tema por defecto**.

Hay dos niveles:

| Nivel | Quién | Dónde | Qué decide |
|---|---|---|---|
| Organización | Usuarios con `configuracion.editar` | `/panel/configuracion/personalizacion` | Qué temas existen y cuál es el tema por defecto |
| Usuario | Cualquier usuario autenticado | `/panel/settings/appearance` (internos) o `/portal/settings/appearance` (externos) | Qué tema, modo (claro, oscuro…) y tamaño de letra usa él mismo |

**Regla de aplicación:** un usuario ve el tema que eligió en *Ajustes › Apariencia*. Si nunca eligió uno, ve el **tema por defecto** de la organización.

**Alcance:** la personalización (modo, tamaño de letra, colores y esquinas del tema) **solo se aplica dentro de `/panel/...` y `/portal/...`**. El sitio público (`/`) y las pantallas de autenticación (`/login`, `/register`, recuperación de contraseña, 2FA…) siempre usan los estilos base de `app.css`. Por eso los ajustes de cuenta también viven dentro de cada área (ver sección 6.1).

---

## 1. Conceptos

### 1.1 Tema

Un tema es un registro de la tabla `themes`:

| Campo | Tipo | Descripción |
|---|---|---|
| `name` | string(100) | Nombre visible |
| `slug` | string(100), único | Se genera desde el nombre; no se modifica al editar |
| `description` | string(255), opcional | Para qué se usa el tema |
| `color` | `#rrggbb` | Color principal (también es el punto de color del listado) |
| `radius` | uno de `0rem`, `0.375rem`, `0.625rem`, `1rem`, `1.5rem` | Redondeo de esquinas |
| `modes_config` | JSON | Colores de cada uno de los 4 modos (ver 1.2) |
| `is_system` | bool | Tema sembrado por `ThemeSeeder`. **No se puede eliminar** |
| `is_default` | bool | Tema por defecto. **Siempre hay exactamente uno** |
| `created_by` | FK `users`, opcional | Quién creó el tema |

### 1.2 Modos y colores

Cada tema define 4 modos: `light` (claro), `dark` (oscuro), `eye_care` (descanso visual) y `semi_dark` (semi-oscuro). Cada modo tiene estos colores, todos en formato `#rrggbb`:

| Grupo | Claves |
|---|---|
| Fondos y texto | `background`, `card`, `border`, `foreground` |
| Acción principal | `primary`, `primary_foreground` |
| Estados | `secondary`, `success`, `warning`, `danger`, `alert`, `muted`, `light`, `dark` |

En el navegador estos valores se convierten en variables CSS (`--primary`, `--background`, `--destructive`, etc.) desde `applyThemeToDom()` en [use-appearance.tsx](../../resources/js/hooks/use-appearance.tsx).

### 1.3 Temas del sistema

`ThemeSeeder` crea 6 temas con `is_system = true`; *Verde Esperanza (CONAPA)* es el tema por defecto inicial. Los temas del sistema se pueden **editar** pero no **eliminar**. Para conservar el original y hacer una variante, usa **Duplicar**.

---

## 2. Rutas y permisos

Todas viven en [routes/panel.php](../../routes/panel.php), dentro del grupo `auth` con prefijo `/panel` y nombre `panel.`. Todas exigen el permiso `configuracion.editar` (403 si falta).

| Método | URL | Nombre de ruta | Acción |
|---|---|---|---|
| GET | `/panel/configuracion/personalizacion` | `panel.configuracion.personalizacion.index` | Listado |
| GET | `/panel/configuracion/personalizacion/create?base={id}` | `…personalizacion.create` | Formulario de nuevo tema |
| POST | `/panel/configuracion/personalizacion` | `…personalizacion.store` | Guardar nuevo tema |
| GET | `/panel/configuracion/personalizacion/{theme}/edit` | `…personalizacion.edit` | Formulario de edición |
| PUT | `/panel/configuracion/personalizacion/{theme}` | `…personalizacion.update` | Guardar cambios |
| PATCH | `/panel/configuracion/personalizacion/{theme}/default` | `…personalizacion.default` | Marcar como tema por defecto |
| DELETE | `/panel/configuracion/personalizacion/{theme}` | `…personalizacion.destroy` | Eliminar |

En el frontend se usan las funciones generadas por Wayfinder desde `@/routes/panel/configuracion/personalizacion` (`index`, `create`, `store`, `edit`, `update`, `defaultMethod`, `destroy`).

Controlador: [ThemeManagementController.php](../../app/Http/Controllers/Admin/ThemeManagementController.php). Validación: [StoreThemeRequest.php](../../app/Http/Requests/Admin/StoreThemeRequest.php) (`UpdateThemeRequest` hereda las mismas reglas).

---

## 3. Vista: Listado

**URL:** `/panel/configuracion/personalizacion`
**Página:** [index.tsx](../../resources/js/pages/admin/configuracion/personalizacion/index.tsx)
**Props:** `themes: DbTheme[]`, ordenados así: primero el tema por defecto, luego los del sistema y después por nombre.

### Qué ve el usuario

1. **Encabezado** con el título *Personalización* y el botón **Nuevo tema**.
2. **Nota informativa:** explica que el tema por defecto se aplica a quien no eligió uno propio.
3. **Tarjetas de tema** (una por tema), cada una con:
   - punto de color y nombre;
   - etiquetas: **Por defecto** (estrella), **Sistema** o **Personalizado**;
   - descripción;
   - **dos miniaturas** del panel pintadas con el tema: modo claro y modo oscuro;
   - **botones visibles** (sin menús ocultos):

| Botón | Cuándo aparece | Qué hace |
|---|---|---|
| **Editar** | Siempre | Abre la vista de edición |
| **Por defecto** | Si el tema no es el por defecto | Pide confirmación y lo marca como tema por defecto |
| **Duplicar** | Siempre | Abre *Nuevo tema* con los colores de este tema |
| 🗑 (papelera) | Solo temas personalizados que no son el por defecto | Pide confirmación y elimina |

4. **Estado vacío:** si no hay temas, muestra un aviso con un botón *Crear tema* y el comando del seeder.

La tarjeta del tema por defecto se resalta con un borde del color principal.

### Diálogos de confirmación

- **Usar por defecto:** *"Todos los usuarios que no hayan elegido un tema propio verán este tema en su próxima navegación. Quienes ya eligieron uno lo conservan."*
- **Eliminar:** *"Esta acción no se puede deshacer. Los usuarios que lo tenían elegido pasarán a usar el tema por defecto."*

### Reglas del servidor

- **Hacer por defecto** (`setDefault`): en una transacción quita la marca al tema actual y se la pone al elegido, así nunca hay dos ni ninguno.
- **Eliminar** (`destroy`):
  - si el tema es del sistema → no se borra; aviso de error *"Los temas del sistema no se pueden eliminar."*;
  - si es el tema por defecto → no se borra; aviso de error *"No se puede eliminar el tema por defecto…"*;
  - si se borra, a los usuarios que lo tenían elegido se les quita `active_theme_id` y `active_theme` de `theme_settings`, y vuelven al tema por defecto.

Todos los mensajes llegan como **toast** mediante `Inertia::flash('toast', …)`, que el hook `useFlashToast` muestra automáticamente.

---

## 4. Vista: Nuevo tema

**URL:** `/panel/configuracion/personalizacion/create` (opcional `?base={id}`)
**Página:** [create.tsx](../../resources/js/pages/admin/configuracion/personalizacion/create.tsx), que renderiza el formulario compartido [theme-designer-form.tsx](../../resources/js/pages/admin/configuracion/personalizacion/components/theme-designer-form.tsx).
**Props:** `baseTheme: DbTheme`, que es el tema indicado en `?base=`. Si no se indica, se usa el tema por defecto.

### Punto de partida

El formulario **copia los colores y el redondeo** del tema base. El nombre y la descripción empiezan vacíos, y la casilla *por defecto* empieza desmarcada. Así, **Duplicar** desde el listado es la manera más rápida de crear una variante.

### Diseño de la pantalla

En pantallas grandes, el formulario va a la izquierda y la vista previa a la derecha (fija al hacer scroll). En móvil, la vista previa queda debajo.

**Sección 1 — Datos básicos**

| Campo | Obligatorio | Reglas |
|---|---|---|
| Nombre | Sí | Máx. 100 caracteres. El slug se genera solo y es único (`nombre`, `nombre-1`…) |
| Descripción | No | Máx. 255 caracteres |

**Sección 2 — Color y estilo** (lo único que la mayoría necesita tocar)

- **Color principal:** selector de color más un campo `#RRGGBB`. Al cambiarlo, se **adapta solo a los 4 modos**:
  - *Claro:* se usa tal cual.
  - *Descanso visual:* se oscurece un 10 %.
  - *Oscuro y Semi-oscuro:* se aclara un 25 % para mantener el contraste.
  - En cada modo, el *texto sobre principal* se elige solo (blanco o casi negro), según la luminancia.
- **Esquinas:** 5 botones con una muestra visual (Rectas, Sutiles, Estándar, Redondeadas, Píldora).
- **Usar como tema por defecto:** casilla opcional.

**Sección 3 — Ajustes avanzados (opcional)**, plegada por defecto

- Pestañas por modo: ☀️ Claro · 🌙 Oscuro · 👓 Descanso visual · 🌌 Semi-oscuro.
- *Fondos y texto:* fondo de página, tarjetas, bordes y texto.
- *Colores de estado y acciones:* los 10 colores (principal, texto sobre principal, secundario, éxito, advertencia, peligro, atención, atenuado, claro, oscuro), cada uno con una ayuda breve.
- **Restaurar colores de este modo:** devuelve el modo activo a los valores con que se abrió el formulario.
- Si el servidor rechaza algún color, la sección se abre sola y muestra el error.

**Vista previa (columna derecha)**

Es una maqueta del panel (cabecera, tarjeta de estadística, botones Guardar/Cancelar/Eliminar y etiquetas Aprobado/Pendiente/Urgente) que se actualiza en vivo. Tiene sus propias pestañas de modo, sincronizadas con las de *Ajustes avanzados*.

### Campos de texto de color

El componente [color-field.tsx](../../resources/js/pages/admin/configuracion/personalizacion/components/color-field.tsx) acepta lo que se escribe, pero **solo actualiza el formulario cuando el valor es un `#RRGGBB` válido**. Si se sale del campo con un valor incompleto, vuelve al último valor válido. Si se escribe sin `#`, se agrega solo.

### Al guardar

- **Validación** ([StoreThemeRequest.php](../../app/Http/Requests/Admin/StoreThemeRequest.php)): `color` y todos los `modes_config.*.*` deben cumplir `#rrggbb`; `radius` debe ser una de las 5 opciones; los 4 modos son obligatorios.
- Si se marcó *por defecto*, en una transacción se quita la marca al tema anterior.
- Se redirige al listado con el toast *"Tema '…' creado correctamente."*

---

## 5. Vista: Editar tema

**URL:** `/panel/configuracion/personalizacion/{id}/edit`
**Página:** [edit.tsx](../../resources/js/pages/admin/configuracion/personalizacion/edit.tsx), con el mismo formulario compartido que *Nuevo tema*.
**Props:** `theme: DbTheme` y `usersCount: int` (cuántos usuarios eligieron este tema en *Ajustes › Apariencia*).

### Diferencias con *Nuevo tema*

| Elemento | Comportamiento en edición |
|---|---|
| Título | *Editar tema: {nombre}* |
| Campos | Precargados con los valores actuales del tema |
| Aviso **"Antes de editar"** | Aparece si el tema es del sistema (se puede editar, no eliminar; sugiere *Duplicar*) o si `usersCount > 0` (*"N usuarios lo tienen elegido; verán los cambios en su próximo inicio de sesión"*) |
| Casilla *por defecto* | Si el tema **ya es el por defecto**, se reemplaza por un texto que indica que, para cambiarlo, hay que marcar otro tema desde el listado |
| Botón | **Guardar cambios** |

### Reglas del servidor (`update`)

- Mismas validaciones que al crear. El `slug` **no cambia** al renombrar.
- **No se puede desmarcar el tema por defecto desde aquí:** si el tema ya es el por defecto, sigue siéndolo aunque llegue `is_default = false`. Así la organización nunca queda sin tema por defecto.
- Si se marca como por defecto, en una transacción se quita la marca al anterior.
- A los usuarios que eligieron este tema se les **actualiza la copia** guardada en `users.theme_settings.active_theme`.
- Se redirige al listado con el toast *"Tema '…' actualizado correctamente."*

---

## 6. Cómo llega el tema a la pantalla del usuario

1. `HandleInertiaRequests` comparte, para usuarios autenticados, la prop `defaultTheme` (`id`, `name`, `slug`, `color`, `radius`, `modes_config`, `updated_at`), calculada con `Theme::default()`.
2. `AppLayout` llama a `applyDefaultTheme(defaultTheme)` en cada navegación.
3. `use-appearance` aplica **el tema que eligió el usuario** (guardado en `localStorage` y en `users.theme_settings`) o, si no eligió ninguno, el `defaultTheme`.
4. Al elegir un tema en *Ajustes › Apariencia* (`selectTheme`), se guarda en `localStorage` y en la base de datos (`PATCH /{area}/settings/appearance`).

> **Limitación conocida:** la elección del usuario se sincroniza desde la base de datos solo al **iniciar sesión** (ver `AppLayout`). Si un administrador edita o elimina un tema que el usuario tiene elegido, el usuario lo verá en su próximo inicio de sesión. El tema **por defecto**, en cambio, se actualiza en la siguiente navegación.

### 6.1 Restricción a `/panel` y `/portal`

| Capa | Dónde | Comportamiento |
|---|---|---|
| Primer pintado | Script en línea de [app.blade.php](../../resources/views/app.blade.php) | Solo agrega la clase de modo (`dark`, `eye-care`, `semi-dark`) si la URL empieza por `/panel` o `/portal` |
| React | `isThemedPath()` en [use-appearance.tsx](../../resources/js/hooks/use-appearance.tsx) | `applyThemeToDom()` aplica el tema solo en esas rutas; fuera de ellas **limpia** clases, `font-size` y variables CSS (`--primary`, `--radius`…) |
| Navegación | `router.on('navigate')` en `initializeTheme()` | Reevalúa en cada visita de Inertia: al entrar a `/panel` o `/portal` se aplica y al salir (p. ej. cerrar sesión) se restablece |

### 6.2 Ajustes de cuenta dentro de cada área

Los ajustes de cuenta (Perfil, Seguridad, Apariencia) están en [routes/settings.php](../../routes/settings.php) con el prefijo `{area}/settings`, donde `area` es `panel` o `portal`:

| Usuario (`tipo_usuario`) | URL |
|---|---|
| `interno` | `/panel/settings/profile`, `/panel/settings/security`, `/panel/settings/appearance` |
| `externo` | `/portal/settings/profile`, `/portal/settings/security`, `/portal/settings/appearance` |

- `User::area()` devuelve `panel` o `portal` según `tipo_usuario`.
- **`SetUserAreaUrlDefaults`** (grupo `web` y grupo de ajustes) define `URL::defaults(['area' => …])`, así `route('profile.edit')` no necesita argumentos. Wayfinder detecta este valor y deja `area` como **opcional** en `@/routes/profile`, `@/routes/security` y `@/routes/appearance`.
- En el frontend, la prop compartida `area` y `syncUrlArea()` ([lib/area.ts](../../resources/js/lib/area.ts)) fijan `setUrlDefaults({ area })`. Se llama en `AppLayout` y en los *layout callbacks* de las páginas de ajustes, para que las migas de pan y el menú de ajustes generen la URL correcta.
- **`EnsureUserArea`**: si un usuario entra al área que no le corresponde, una petición `GET` se redirige a la misma página en su área (conservando la query string) y cualquier otro método responde 404.
- Las URL antiguas `/settings`, `/settings/profile`, `/settings/security` y `/settings/appearance` redirigen al área del usuario. `/.well-known/passkey-endpoints` apunta a `/settings/security`, que redirige igual.
- El atajo **Administrar Temas** de *Apariencia* solo aparece si el usuario tiene `configuracion.editar` (prop `canManageThemes`).

---

## 7. Archivos del módulo

| Capa | Archivo |
|---|---|
| Rutas | [routes/panel.php](../../routes/panel.php) |
| Controlador | [ThemeManagementController.php](../../app/Http/Controllers/Admin/ThemeManagementController.php) |
| Validación | [StoreThemeRequest.php](../../app/Http/Requests/Admin/StoreThemeRequest.php), [UpdateThemeRequest.php](../../app/Http/Requests/Admin/UpdateThemeRequest.php) |
| Modelo | [Theme.php](../../app/Models/Theme.php) (`Theme::default()`) |
| Prop compartida | [HandleInertiaRequests.php](../../app/Http/Middleware/HandleInertiaRequests.php) (`defaultTheme`) |
| Datos iniciales | [ThemeSeeder.php](../../database/seeders/ThemeSeeder.php), menú en [MenuItemSeeder.php](../../database/seeders/MenuItemSeeder.php) |
| Páginas | [index.tsx](../../resources/js/pages/admin/configuracion/personalizacion/index.tsx), [create.tsx](../../resources/js/pages/admin/configuracion/personalizacion/create.tsx), [edit.tsx](../../resources/js/pages/admin/configuracion/personalizacion/edit.tsx) |
| Componentes | [theme-designer-form.tsx](../../resources/js/pages/admin/configuracion/personalizacion/components/theme-designer-form.tsx), [theme-preview.tsx](../../resources/js/pages/admin/configuracion/personalizacion/components/theme-preview.tsx), [color-field.tsx](../../resources/js/pages/admin/configuracion/personalizacion/components/color-field.tsx), [theme-utils.ts](../../resources/js/pages/admin/configuracion/personalizacion/components/theme-utils.ts) |
| Aplicación en el DOM | [use-appearance.tsx](../../resources/js/hooks/use-appearance.tsx), [app-layout.tsx](../../resources/js/layouts/app-layout.tsx), [app.blade.php](../../resources/views/app.blade.php) |
| Área de ajustes | [routes/settings.php](../../routes/settings.php), [SetUserAreaUrlDefaults.php](../../app/Http/Middleware/SetUserAreaUrlDefaults.php), [EnsureUserArea.php](../../app/Http/Middleware/EnsureUserArea.php), [lib/area.ts](../../resources/js/lib/area.ts) |
| Tests | [ThemeManagementTest.php](../../tests/Feature/Admin/ThemeManagementTest.php), [SettingsAreaTest.php](../../tests/Feature/Settings/SettingsAreaTest.php) |
