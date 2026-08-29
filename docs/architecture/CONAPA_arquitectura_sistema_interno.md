---
title: "CONAPA — Arquitectura del Sistema Interno de Gestión"
document_type: "architecture-instruction"
project: "CONAPA"
subproject: "Sistema Interno (backoffice + portal externo)"
stack: ["Laravel 13", "React", "Spatie Permission", "Spatie Activitylog"]
status: "vigente"
version: "1.0"
last_updated: "2026-08-29"
source_reference: "CONAPA_indice_referencia.md"
tags: ["roles", "permisos", "rbac", "menus", "rutas", "arquitectura", "ong"]
---

# CONAPA — Arquitectura del Sistema Interno de Gestión (Instrucción de Proyecto)

## Cómo usar este documento

Este archivo es la **fuente de verdad** sobre roles, permisos, menús y rutas del sistema interno de CONAPA. Aplica al backend (Laravel 13 + Spatie Permission + Spatie Activitylog) y al frontend (React).

Reglas para cualquier persona o agente (incluyendo asistentes de IA/MCP) que trabaje sobre este proyecto:

1. **Consultar este documento antes** de crear un rol, permiso, menú o ruta nueva.
2. Si una implementación se aparta de lo aquí definido, debe **justificarse y luego actualizarse este archivo** — no al revés.
3. Los nombres de roles, permisos y rutas deben seguir exactamente las convenciones de las secciones 1, 4 y 5.
4. Este documento se referencia desde `CONAPA_indice_referencia.md` (misión, visión y estructura del sitio público) — ver Anexo B para el mapeo entre ambos.
5. Actualizar los campos `version` y `last_updated` del encabezado cada vez que se apruebe un cambio de arquitectura.

---

## Resumen ejecutivo — decisiones clave

1. **Un solo guard de autenticación**, no dos. La separación interno/externo se maneja con un campo `tipo_usuario` (interno/externo) + roles y permisos de Spatie.
2. **Denunciante no es un rol tradicional**: se permite la denuncia sin registro obligatorio (con código de seguimiento) y se ofrece cuenta opcional después.
3. **El escalafón del voluntariado** (Distrital → Provincial → Regional → Embajador) se modela con **Spatie Teams** (equipos = distritos/regiones) + un campo de "rango" informativo, no con roles de permisos adicionales.
4. **Menús dirigidos por configuración**, no hardcodeados por rol: un único registro de menú filtrado por permisos.
5. **Módulos como paquetes independientes** (Casos, Albergues, Veterinaria, Voluntariado, Donaciones, Convenios, Contenidos): se activan/desactivan por instalación sin tocar código.
6. **Rutas separadas por prefijo** (`/panel/...` interno, `/mi-cuenta/...` externo, raíz pública sin prefijo).

---

## 0. Principios de diseño

- **Modularidad por dominio**: cada área funcional (casos, albergues, veterinaria, voluntariado, donaciones, convenios, contenidos) es un módulo autocontenido con sus propias rutas, políticas y permisos.
- **Seguridad por capas**: middleware de tipo de usuario (grueso) → permiso Spatie (fino) → policy a nivel de registro (propio vs. todos).
- **Trazabilidad total**: toda acción sensible queda registrada con Spatie Activitylog.
- **Reutilización**: la arquitectura no asume que la ONG es de bienestar animal; los nombres de módulo son configurables para que otra ONG reutilice el mismo esqueleto.

---

## 1. Tipos de usuario y roles

### 1.1 Internos vs. externos

| | Usuarios internos | Usuarios externos |
|---|---|---|
| Quiénes | Director/Dueño, Administrador, Administrador de Contenidos | Donador, Voluntariado, Socio, Denunciante |
| Acceden a | Panel de gestión completo | Portal de autoservicio limitado |
| Autenticación | Igual mecanismo, distinto middleware de área | Igual mecanismo, distinto middleware de área |
| Alta de cuenta | Creada por un Administrador | Autorregistro (formulario público) o invitación |

### 1.2 Tabla de roles (nombres para Spatie Permission)

| Rol (`name` en Spatie) | Tipo | Corresponde a | Nivel de acceso |
|---|---|---|---|
| `super-admin` | Interno | Director / Jefe / Dueño | Total, incluida configuración y gestión de roles |
| `admin` | Interno | Administrador | Alto, operativo (sin configuración global) |
| `content-admin` | Interno | Administrador de Contenidos | Medio, acotado al CMS del sitio público |
| `donor` | Externo | Donador | Autoservicio (solo sus datos) |
| `volunteer` | Externo | Voluntariado | Autoservicio + vistas de su equipo/turnos |
| `partner` | Externo | Socio | Autoservicio (convenio propio) |
| `complainant` | Externo / invitado | Denunciante | Muy acotado (solo sus propios casos) |

> Espacio para roles futuros sin romper el modelo: `veterinarian`, `legal-team`, `shelter-coordinator`, etc. — se agregan como nuevos roles con sus propios permisos.

### 1.3 Caso especial: Denunciante

- **Decisión:** formulario público sin login obligatorio → se genera un **código de seguimiento** (ej. `DEN-2026-00042`) para consultar el estado. Al finalizar, se ofrece "crear cuenta" para centralizar futuras denuncias.
- Internamente, toda denuncia (con o sin cuenta) se convierte en un registro de **Caso**, gestionado por el equipo legal/administrador.
- Si se registra, el `complainant` solo ve *sus* casos (policy scopeada por `user_id`, nunca la lista completa).

### 1.4 Escalafón de voluntariado → Spatie Teams

- Usar **Teams** de Spatie Permission, donde cada team = distrito, provincia o región.
- El campo `rango` (enum: junior, distrital, provincial, regional, embajador) vive en el perfil del voluntario; es informativo/de reconocimiento.
- Solo los rangos de coordinación (provincial en adelante) obtienen el permiso adicional `voluntariado.gestionar-equipo`, scopeado a su team.

---

## 2. Menús y submenús por rol

### 2.1 Mapa de módulos del panel interno

`Dashboard · Casos/Denuncias · Rescates · Beneficiarios (animales) · Albergues · Veterinaria · Voluntariado · Donaciones · Convenios · Contenidos Web (CMS) · Usuarios y Roles · Reportes · Configuración · Auditoría`

El menú real de cada usuario es un **subconjunto filtrado por permisos** de este mapa (ver sección 6.1).

### 2.2 Director / Dueño (`super-admin`)
- Dashboard ejecutivo
- Casos/Denuncias · Rescates · Beneficiarios · Albergues · Veterinaria · Voluntariado · Donaciones · Convenios
- Contenidos Web
- **Usuarios y Roles**
- Reportes (todos)
- **Configuración del sistema**
- **Auditoría** (log completo)

### 2.3 Administrador (`admin`)
- Dashboard operativo
- Casos/Denuncias · Rescates · Beneficiarios · Albergues · Veterinaria · Voluntariado · Donaciones · Convenios
- Usuarios (gestión de externos e internos, salvo `super-admin`)
- Reportes
- Auditoría (solo lectura)

### 2.4 Administrador de Contenidos (`content-admin`)
- Dashboard resumido (métricas de contenido/tráfico)
- **Contenidos Web:** Inicio, Proyectos, Convenios (landing), Reconocimiento, Voluntarios (landing), Donaciones (landing), Contáctanos
- Multimedia / Galería
- Blog / Noticias
- Mi cuenta

### 2.5 Voluntariado (`volunteer`, portal externo)
- Mi Perfil · Mis Asignaciones/Turnos · Mi Rango/Escalafón
- Capacitaciones y Certificados
- Bolsa Nacional de Trabajo
- *Si es coordinador:* Mi Equipo
- Mi cuenta

### 2.6 Donador (`donor`, portal externo)
- Mi Perfil · Mis Donaciones · Nueva Donación
- Apadrinamiento · Certificado de donación
- Mi cuenta

### 2.7 Socio (`partner`, portal externo)
- Mi Perfil · Mi Convenio · Recursos institucionales
- Mi cuenta

### 2.8 Denunciante (`complainant`, portal externo o invitado)
- Nueva Denuncia (sin login) · Seguimiento de mi Denuncia
- Mi cuenta (solo si se registró)

---

## 3. Módulos compartidos entre internos y externos

| Módulo | Vista interna | Vista externa | Mecanismo de separación |
|---|---|---|---|
| Casos/Denuncias | Gestión completa, asignación, cierre | Crear + ver solo sus casos | Policy `manage` vs. `viewOwn` |
| Donaciones | Conciliación, reportes, todas | Historial propio, nueva donación | Scope por `user_id` |
| Voluntariado | Roster completo, evaluaciones | Perfil propio, turnos propios | Scope por `user_id`/`team_id` |
| Convenios | Crear/gestionar todos | Ver su propio convenio | Scope por `user_id` |
| Beneficiarios (animales) | CRUD completo, historia clínica | Lectura de apadrinados | Permiso `ver` vs. `ver-propias` |
| Notificaciones/Mensajería | Envío masivo, plantillas | Recepción, respuesta | Mismo modelo, permiso distinto |
| Mi cuenta / Perfil | — | — | Idéntico para todos |
| Contenidos públicos | Edición (solo `content-admin`) | Solo lectura | Permiso `contenidos.editar` |

**Regla:** un solo modelo Eloquent, un solo controlador, una sola ruta base — la diferencia la determinan permisos + policies, nunca código duplicado.

---

## 4. Permisos y control de acceso (Spatie Permission)

### 4.1 Convención de nombres

Patrón `modulo.accion`, sufijo `-propias` para alcance limitado:

```
casos.ver              casos.ver-propias        casos.gestionar
donaciones.ver         donaciones.ver-propias    donaciones.registrar
voluntariado.ver       voluntariado.gestionar-equipo
convenios.ver          convenios.ver-propio      convenios.gestionar
contenidos.editar      contenidos.publicar
usuarios.gestionar      roles.gestionar
configuracion.editar    auditoria.ver
```

Sembrar con un **seeder data-driven** (arreglo de configuración, no hardcodeado en migraciones).

### 4.2 Capas de control

1. **`auth`** — usuario autenticado (Sanctum, sesión SPA).
2. **`tipo.usuario:interno|externo`** (middleware propio) — bloquea el acceso a `/panel/*` si el usuario es externo, sin evaluar permisos.
3. **`permission:modulo.accion`** (middleware de Spatie) — control fino por ruta.
4. **Policy a nivel de registro** — aplica el `where user_id = ...` cuando el permiso es "propios".

### 4.3 Auditoría con Activitylog

- `LogsActivity` en modelos sensibles: Casos, Usuarios, Roles/Permisos, Donaciones, Convenios, Configuración.
- Usar `logOnlyDirty()`.
- `logName` por módulo (`casos`, `donaciones`, `usuarios`...).
- Pantalla "Auditoría": lectura/escritura para `super-admin`, solo lectura para `admin`.

---

## 5. Organización de rutas/URLs

### 5.1 Grupos de rutas

| Prefijo | Público objetivo | Ejemplos |
|---|---|---|
| *(sin prefijo)* | Público general | `/`, `/proyectos`, `/convenios`, `/denuncias`, `/reconocimiento`, `/voluntarios`, `/contactanos`, `/donaciones` |
| `/login`, `/registro` | Todos | Autenticación única, redirección según `tipo_usuario` |
| `/mi-cuenta/...` | Externos | `/mi-cuenta/dashboard`, `/mi-cuenta/donaciones`, `/mi-cuenta/voluntariado`, `/mi-cuenta/convenio`, `/mi-cuenta/denuncias` |
| `/panel/...` | Internos | `/panel/dashboard`, `/panel/casos`, `/panel/albergues`, `/panel/veterinaria`, `/panel/voluntariado`, `/panel/donaciones`, `/panel/contenidos`, `/panel/usuarios`, `/panel/configuracion`, `/panel/auditoria` |
| `/api/v1/...` | Consumido por el SPA en React | `/api/v1/panel/casos`, `/api/v1/portal/donaciones` |

### 5.2 Ejemplo de definición de rutas

```php
// routes/web.php — sitio público
Route::get('/', [HomeController::class, 'index']);
Route::get('/proyectos/{slug?}', [ProyectoController::class, 'show']);
Route::get('/denuncias', [DenunciaPublicaController::class, 'create']);
Route::post('/denuncias', [DenunciaPublicaController::class, 'store']);
Route::get('/voluntarios', [VoluntarioPublicoController::class, 'form']);

// Portal externo
Route::prefix('mi-cuenta')
    ->middleware(['auth', 'tipo.usuario:externo'])
    ->group(function () {
        Route::get('dashboard', [PortalController::class, 'index']);
        Route::resource('donaciones', PortalDonacionController::class)
            ->only(['index', 'store']);
        Route::resource('denuncias', PortalDenunciaController::class)
            ->only(['index', 'show']);
    });

// Panel interno
Route::prefix('panel')
    ->middleware(['auth', 'tipo.usuario:interno'])
    ->group(function () {
        Route::middleware('permission:casos.ver')
            ->get('casos', [CasoController::class, 'index']);
        Route::middleware('permission:usuarios.gestionar')
            ->resource('usuarios', UsuarioController::class);
        Route::middleware('permission:configuracion.editar')
            ->get('configuracion', [ConfiguracionController::class, 'edit']);
    });
```

---

## 6. Navegación reutilizable y escalable

### 6.1 Registro de menú dirigido por configuración

Registro único (tabla `menu_items`): `key · label · icon · route · permission_required · parent_id · order`.

El backend expone `GET /api/v1/me/menu`, filtrando por `$user->can(...)`. El React consume el árbol ya filtrado — cero lógica de roles en el frontend.

### 6.2 Registro de módulos (multi-ONG)

`config/ngo-modules.php`:

```php
return [
    'casos' => true,
    'albergues' => true,
    'veterinaria' => true,
    'voluntariado' => true,
    'donaciones' => true,
    'convenios' => true,
];
```

El `super-admin` activa/desactiva módulos desde Configuración sin despliegue de código nuevo.

### 6.3 Diagrama de capas

```
Sitio publico -> Auth Gateway (1 guard, Sanctum)
              -> Portal externo (/mi-cuenta) | Panel interno (/panel)
              -> Modulos compartidos (policies)
              -> Base de datos
```

---

## Anexo A — Matriz rápida de permisos por módulo

| Módulo | Director | Admin | Admin-Contenidos | Voluntariado | Donador | Socio | Denunciante |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Casos/Denuncias | Total | Gestión | — | — | — | — | Propias |
| Rescates | Total | Gestión | — | Lectura* | — | — | — |
| Beneficiarios | Total | Gestión | Lectura | Lectura | Apadrinados | — | — |
| Albergues | Total | Gestión | — | Lectura | — | — | — |
| Veterinaria | Total | Gestión | — | Lectura* | — | — | — |
| Voluntariado | Total | Gestión | — | Propio | — | — | — |
| Donaciones | Total | Gestión | — | — | Propias | — | — |
| Convenios | Total | Gestión | Lectura | — | — | Propio | — |
| Contenidos Web | Total | Gestión | Gestión | — | — | — | — |
| Usuarios y Roles | Total | Gestión limitada | — | — | — | — | — |
| Reportes | Total | Gestión | Lectura | — | — | — | — |
| Configuración | Total | — | — | — | — | — | — |
| Auditoría | Total | Lectura | — | — | — | — | — |

*Lectura solo si está asignado al caso/rescate/turno correspondiente.*

## Anexo B — Conexión con el sitio público (índice de referencia, §5)

| Página pública | Alimenta módulo interno | ¿Genera cuenta externa? |
|---|---|---|
| Denuncias (formato) | Casos/Denuncias | Opcional (`complainant`) |
| Voluntarios (inscripción) | Voluntariado (onboarding) | Sí (`volunteer`) |
| Donaciones institucionales | Donaciones | Sí, si es recurrente (`donor`) |
| Convenios (Padrinazgo / Socios honorarios) | Convenios | Sí (`partner`) |
| Proyectos (Albergue / Clínica) | Beneficiarios/Albergues/Veterinaria | No |
| Reconocimiento | Contenidos Web (galería) | No |
| Contáctanos | Mensajería básica | No |

## Anexo C — Próximos pasos sugeridos

1. Modelar tablas base: `users` (+`tipo_usuario`), roles/permisos (Spatie), teams.
2. Sembrar roles y permisos con seeder data-driven.
3. Construir el registro de menú + endpoint `GET /api/v1/me/menu`.
4. Implementar middleware `tipo.usuario` + middleware `permission` de Spatie.
5. Definir policies por módulo (empezando por Casos y Donaciones).
6. Configurar Activitylog en modelos críticos y construir pantalla de Auditoría.
7. Documentar cada módulo como paquete independiente para reutilización.

---
*Documento fuente: `CONAPA_indice_referencia.md`. Este archivo (`CONAPA_arquitectura_sistema_interno.md`) es su complemento de arquitectura técnica.*
