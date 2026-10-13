# CONAPA — Sistema Interno de Gestión

Backoffice interno y portal externo de CONAPA, construido sobre el starter kit oficial de Laravel + React.

- **Panel interno** (`/panel/...`): para el personal de la institución (`tipo_usuario = interno`).
- **Portal externo** (`/portal/...`): para voluntarios, donantes, aliados y otros usuarios externos (`tipo_usuario = externo`).
- **Sitio público**: rutas en la raíz, sin prefijo.

La arquitectura de roles, permisos, menús y rutas está definida en [docs/architecture/CONAPA_arquitectura_sistema_interno.md](docs/architecture/CONAPA_arquitectura_sistema_interno.md). **Léelo antes de crear un rol, permiso, menú o ruta nueva.**

## Stack

| Capa | Tecnología |
| --- | --- |
| Backend | PHP 8.4, Laravel 13, Fortify (auth, 2FA, passkeys), Spatie Laravel Permission |
| Frontend | React 19, Inertia.js v3, TypeScript, Tailwind CSS v4, Radix UI (shadcn/ui) |
| Rutas tipadas | Laravel Wayfinder (`@/actions`, `@/routes`) |
| Build | Vite 8 |
| Calidad | Pest 5, Larastan (PHPStan), Pint, ESLint, Prettier |

## Requisitos

- PHP 8.3+ (el proyecto se desarrolla con 8.4) y Composer
- Node.js 22+ y npm
- SQLite (por defecto) o MySQL — en Windows se recomienda [Laragon](https://laragon.org)

## Instalación

```bash
composer run setup
```

Esto instala dependencias de PHP y Node, crea `.env`, genera la `APP_KEY`, ejecuta las migraciones y compila los assets.

Luego carga los datos iniciales (roles, permisos, menús, temas y usuarios de prueba):

```bash
php artisan db:seed
```

### Usuario de prueba

| Email | Contraseña | Rol |
| --- | --- | --- |
| `test@example.com` | `password` | `super-admin` (interno) |

El seeder también crea usuarios internos, externos y no verificados aleatorios.

## Desarrollo

```bash
composer run dev
```

Levanta en paralelo el servidor (`php artisan serve`), el worker de colas y Vite. Si usas Laragon con hosts virtuales, el sitio queda disponible en su dominio `.test` y basta con `npm run dev` (ajusta `APP_URL` en `.env`).

> Si un cambio en el frontend no se refleja, verifica que Vite esté corriendo (`npm run dev`) o recompila con `npm run build`.

## Estructura principal

```
app/
├── Http/Controllers/Admin/     # Usuarios, roles, menús y temas del panel
├── Http/Controllers/Settings/  # Perfil, seguridad y apariencia del usuario
├── Http/Middleware/            # HandleInertiaRequests (comparte auth y menú), HandleAppearance
└── Models/                     # User, MenuItem, Theme
database/seeders/               # RoleAndPermissionSeeder, MenuItemSeeder, ThemeSeeder
docs/architecture/              # Documentación de arquitectura (fuente de verdad)
resources/js/
├── pages/admin/                # Pantallas del panel (users, roles, menus, configuracion)
├── pages/cms/                  # Contenidos web (institucional, proyectos, reconocimientos)
├── components/, layouts/       # Componentes compartidos y layouts
└── actions/, routes/           # Generados por Wayfinder — no editar a mano
routes/
├── web.php                     # Público + redirección de /dashboard según tipo_usuario
├── panel.php                   # Rutas internas (/panel, nombres panel.*)
├── portal.php                  # Rutas externas (/portal, nombres portal.*)
└── settings.php                # Configuración de la cuenta del usuario
```

## Módulos implementados

- **Usuarios y roles** — CRUD de usuarios, asignación de roles y gestión de roles con permisos (Spatie).
- **Menús dinámicos** — el sidebar se construye desde la tabla `menu_items` y se filtra por los permisos del usuario (`MenuItem::treeForUser`). Se administra desde `/panel/menus`.
- **Personalización de temas** — temas institucionales con esquemas de color personalizados, tema por defecto y preferencia por usuario. Se administra desde `/panel/configuracion/personalizacion`.
- **Autenticación** — login, registro, verificación de email, recuperación de contraseña, 2FA y passkeys vía Fortify.

### Roles y permisos

Los permisos siguen el formato `modulo.accion` (p. ej. `casos.gestionar`, `donaciones.ver-propias`). Los roles base son `super-admin`, `admin` y `content-admin`; ver [RoleAndPermissionSeeder.php](database/seeders/RoleAndPermissionSeeder.php) y el documento de arquitectura para el catálogo completo.

## Pruebas y calidad

```bash
php artisan test --compact                 # Suite de Pest
php artisan test --compact --filter=Theme  # Ejecutar un subconjunto

composer run lint        # Formatear PHP con Pint
composer run types:check # Análisis estático con Larastan
npm run lint             # ESLint
npm run format           # Prettier
npm run types:check      # Chequeo de tipos TypeScript

composer run ci:check    # Todo lo anterior, como en CI
```

## Convenciones

- Nuevos archivos con `php artisan make:* --no-interaction`; cada cambio debe ir acompañado de su prueba.
- En el frontend, usa las funciones de Wayfinder en lugar de URLs escritas a mano.
- Ejecuta `vendor/bin/pint --dirty` antes de hacer commit de cambios en PHP.
- Las guías para asistentes de IA están en [CLAUDE.md](CLAUDE.md) / [AGENTS.md](AGENTS.md).
