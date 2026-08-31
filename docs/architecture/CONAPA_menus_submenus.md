---
title: "CONAPA — Menús y Submenús del Sistema"
document_type: "navigation-map"
project: "CONAPA"
subproject: "Sistema Interno (backoffice + portal externo)"
stack: ["Laravel 13", "React", "Spatie Permission"]
status: "vigente"
version: "1.0"
last_updated: "2026-08-30"
source_reference: "CONAPA_arquitectura_sistema_interno.md"
tags: ["menus", "navegacion", "modulos", "fase1", "fase2", "ong"]
---

# CONAPA — Menús y Submenús del Sistema

## Propósito de este documento

Define el **árbol maestro de navegación** del sistema CONAPA. Cada menú listado aquí se alimenta desde la tabla `menu_items` y se filtra por permisos Spatie — el frontend React recibe el árbol ya recortado como propiedad compartida de Inertia (`$page.props.menu`).

> **Relación con otros documentos:**
> - La **asignación de menús por rol** se detalla en [`CONAPA_arquitectura_sistema_interno.md`](CONAPA_arquitectura_sistema_interno.md), sección 2 (§2.2–§2.8).
> - La **matriz de permisos por módulo** está en el Anexo A del mismo documento.
> - Los **datos institucionales y ejes estratégicos** se encuentran en [`CONAPA_indice_referencia.md`](CONAPA_indice_referencia.md).

## Convenciones

- **[F2]** — Corresponde a la Fase 2 (Perú País Animalista 2035). No se construye todavía, pero queda en el árbol para que la estructura nunca tenga que reordenarse; solo se "enciende" cuando el módulo entre en `config/ngo-modules.php`.
- **[TBD]** — Pendiente de mayor definición.
- **`permission_required`** — El permiso Spatie que controla la visibilidad del ítem en el menú.

---

## Panel Interno (`/panel/...`)

Accesible por usuarios internos: `super-admin`, `admin`, `content-admin`.

### Dashboard

| Submenú | Ruta esperada | `permission_required` |
|---|---|---|
| Resumen ejecutivo (KPIs: casos abiertos, rescates del mes, donaciones, voluntarios activos) | `/panel/dashboard` | `dashboard.ver` |
| Widgets por módulo (configurable según permisos del usuario) | `/panel/dashboard` | `dashboard.ver` |

---

### Casos / Denuncias

| Submenú | Ruta esperada | `permission_required` |
|---|---|---|
| Bandeja de casos (todos / asignados a mí / sin asignar) | `/panel/casos` | `casos.ver` |
| Nuevo caso (registro manual — ej. denuncia recibida por teléfono) | `/panel/casos/crear` | `casos.gestionar` |
| Seguimiento legal (subestados: recibido, en investigación, judicializado, cerrado) | `/panel/casos/{id}/seguimiento` | `casos.ver` |
| Derivaciones (comisaría, fiscalía, municipalidad) | `/panel/casos/{id}/derivaciones` | `casos.gestionar` |
| Documentos y evidencias adjuntas | `/panel/casos/{id}/documentos` | `casos.ver` |
| Códigos de seguimiento (consulta pública) | `/panel/casos/codigos` | `casos.ver` |

---

### Rescates

| Submenú | Ruta esperada | `permission_required` |
|---|---|---|
| Bandeja de solicitudes de rescate | `/panel/rescates` | `rescates.ver` |
| Asignación de brigada/voluntario | `/panel/rescates/{id}/asignar` | `rescates.gestionar` |
| Seguimiento en curso (estado en tiempo real) | `/panel/rescates/{id}/seguimiento` | `rescates.ver` |
| Historial de rescates | `/panel/rescates/historial` | `rescates.ver` |

---

### Beneficiarios (Animales)

| Submenú | Ruta esperada | `permission_required` |
|---|---|---|
| Ficha del animal (identificación, foto, especie, estado) | `/panel/beneficiarios/{id}` | `beneficiarios.ver` |
| Historia clínica (vínculo con Veterinaria) | `/panel/beneficiarios/{id}/historia-clinica` | `beneficiarios.ver` |
| Apadrinamientos (vínculo con Donaciones) | `/panel/beneficiarios/{id}/apadrinamientos` | `donaciones.ver` |
| Adopciones (proceso + seguimiento post-adopción) | `/panel/beneficiarios/adopciones` | `beneficiarios.gestionar` |
| Galería del animal | `/panel/beneficiarios/{id}/galeria` | `beneficiarios.ver` |

---

### Albergues

| Submenú | Ruta esperada | `permission_required` |
|---|---|---|
| Directorio de albergues [F2: red nacional; Fase 1: el propio/en proyecto] | `/panel/albergues` | `albergues.ver` |
| Capacidad y ocupación | `/panel/albergues/{id}/ocupacion` | `albergues.ver` |
| Ingresos y egresos de animales | `/panel/albergues/{id}/movimientos` | `albergues.gestionar` |
| Inventario de insumos del albergue | `/panel/albergues/{id}/inventario` | `albergues.gestionar` |

---

### Veterinaria

| Submenú | Ruta esperada | `permission_required` |
|---|---|---|
| Agenda de consultas | `/panel/veterinaria/agenda` | `veterinaria.ver` |
| Historias clínicas (vínculo con Beneficiarios) | `/panel/veterinaria/historias` | `veterinaria.ver` |
| Campañas de vacunación y esterilización | `/panel/veterinaria/campanas` | `veterinaria.gestionar` |
| Farmacia / inventario de medicamentos | `/panel/veterinaria/farmacia` | `veterinaria.gestionar` |
| Laboratorio y diagnóstico por imágenes **[F2]** | `/panel/veterinaria/laboratorio` | `veterinaria.gestionar` |
| Cirugías / procedimientos | `/panel/veterinaria/cirugias` | `veterinaria.gestionar` |

---

### Voluntariado

| Submenú | Ruta esperada | `permission_required` |
|---|---|---|
| Directorio de voluntarios | `/panel/voluntariado` | `voluntariado.ver` |
| Postulaciones (bandeja de nuevas inscripciones) | `/panel/voluntariado/postulaciones` | `voluntariado.gestionar` |
| Asignaciones y turnos | `/panel/voluntariado/turnos` | `voluntariado.gestionar` |
| Escalafón y rangos (distrital → provincial → regional → embajador, vía Teams) | `/panel/voluntariado/escalafon` | `voluntariado.ver` |
| Capacitaciones y certificados | `/panel/voluntariado/capacitaciones` | `voluntariado.gestionar` |
| Evaluaciones de desempeño | `/panel/voluntariado/evaluaciones` | `voluntariado.gestionar` |
| Bolsa Nacional de Trabajo **[F2]** | `/panel/voluntariado/bolsa-trabajo` | `voluntariado.ver` |
| Becas universitarias/técnicas **[F2]** | `/panel/voluntariado/becas` | `voluntariado.ver` |

---

### Donaciones

| Submenú | Ruta esperada | `permission_required` |
|---|---|---|
| Directorio de donantes | `/panel/donaciones/donantes` | `donaciones.ver` |
| Registro de donaciones (dinero / especie) | `/panel/donaciones` | `donaciones.ver` |
| Donaciones recurrentes y apadrinamientos | `/panel/donaciones/recurrentes` | `donaciones.ver` |
| Conciliación y reportes financieros | `/panel/donaciones/conciliacion` | `donaciones.gestionar` |
| Certificados de donación | `/panel/donaciones/certificados` | `donaciones.gestionar` |
| Banco Nacional de Donaciones (alimentos, medicamentos, equipos, vehículos) **[F2]** | `/panel/donaciones/banco-nacional` | `donaciones.gestionar` |

---

### Convenios

| Submenú | Ruta esperada | `permission_required` |
|---|---|---|
| Directorio de socios/aliados | `/panel/convenios` | `convenios.ver` |
| Convenios activos (gobierno, empresas, universidades, ONG) | `/panel/convenios/activos` | `convenios.ver` |
| Padrinazgo institucional / socios honorarios | `/panel/convenios/padrinazgo` | `convenios.gestionar` |
| Vencimientos y renovaciones (alertas) | `/panel/convenios/vencimientos` | `convenios.gestionar` |

---

### Contenidos Web (CMS)

| Submenú | Ruta esperada | `permission_required` |
|---|---|---|
| Páginas institucionales (Inicio, Quiénes Somos, Misión/Visión/Valores) | `/panel/contenidos/paginas` | `contenidos.editar` |
| Proyectos (Albergue, Clínica Veterinaria — landing pages) | `/panel/contenidos/proyectos` | `contenidos.editar` |
| Blog / Noticias | `/panel/contenidos/blog` | `contenidos.editar` |
| Multimedia / Galería (fotos, videos, eventos) | `/panel/contenidos/multimedia` | `contenidos.editar` |
| Reconocimientos y prensa | `/panel/contenidos/reconocimientos` | `contenidos.editar` |
| Banners / slider del hero | `/panel/contenidos/banners` | `contenidos.editar` |
| Formularios públicos (configuración de campos: Denuncias, Voluntariado, Contacto) | `/panel/contenidos/formularios` | `contenidos.publicar` |
| SEO y metadatos | `/panel/contenidos/seo` | `contenidos.publicar` |

---

### Gestión de acceso

| Submenú | Ruta esperada | `permission_required` |
|---|---|---|
| Usuarios internos | `/panel/usuarios?tipo=interno` | `usuarios.gestionar` |
| Usuarios externos | `/panel/usuarios?tipo=externo` | `usuarios.gestionar` |
| Roles y permisos | `/panel/usuarios/roles` | `roles.gestionar` |
| Asignación de menús (la matriz Roles × Menús) | `/panel/usuarios/menus` | `roles.gestionar` |
| Equipos / territorios (Teams: distrito, provincia, región) | `/panel/usuarios/equipos` | `usuarios.gestionar` |

---

### Reportes

| Submenú | Ruta esperada | `permission_required` |
|---|---|---|
| Reportes de casos (por estado, tipo, zona, período) | `/panel/reportes/casos` | `reportes.ver` |
| Reportes de donaciones (por donante, tipo, período, conciliación) | `/panel/reportes/donaciones` | `reportes.ver` |
| Reportes de voluntariado (activos, horas, desempeño, por equipo) | `/panel/reportes/voluntariado` | `reportes.ver` |
| Reportes de adopciones/beneficiarios (tasa de adopción, seguimiento post) | `/panel/reportes/beneficiarios` | `reportes.ver` |
| Reportes ejecutivos consolidados (exportables PDF/Excel) | `/panel/reportes/ejecutivo` | `reportes.ver` |

---

### Configuración

| Submenú | Ruta esperada | `permission_required` |
|---|---|---|
| Datos de la organización | `/panel/configuracion/organizacion` | `configuracion.editar` |
| Módulos activos/inactivos (toggle de `config/ngo-modules.php` desde UI) | `/panel/configuracion/modulos` | `configuracion.editar` |
| Parámetros generales (numeración de casos, formato de códigos de seguimiento) | `/panel/configuracion/parametros` | `configuracion.editar` |
| Plantillas de notificaciones (correo/SMS) | `/panel/configuracion/notificaciones` | `configuracion.editar` |
| Integraciones (pasarela de pagos, redes sociales) | `/panel/configuracion/integraciones` | `configuracion.editar` |

---

### Auditoría

| Submenú | Ruta esperada | `permission_required` |
|---|---|---|
| Log de actividad general | `/panel/auditoria` | `auditoria.ver` |
| Log por módulo (filtrar por `logName`) | `/panel/auditoria?modulo={modulo}` | `auditoria.ver` |
| Sesiones activas / accesos | `/panel/auditoria/sesiones` | `auditoria.ver` |

---

## Portal Externo (`/portal/...`)

Accesible por usuarios externos (`tipo_usuario = 'externo'`).

### Voluntariado (`volunteer`)

| Submenú | Ruta esperada | `permission_required` |
|---|---|---|
| Mi Perfil | `/portal/perfil` | `voluntariado.ver-propias` |
| Mis Asignaciones / Turnos | `/portal/voluntariado/turnos` | `voluntariado.ver-propias` |
| Mi Rango / Escalafón | `/portal/voluntariado/escalafon` | `voluntariado.ver-propias` |
| Capacitaciones y Certificados | `/portal/voluntariado/capacitaciones` | `voluntariado.ver-propias` |
| Bolsa Nacional de Trabajo **[F2]** | `/portal/voluntariado/bolsa-trabajo` | `voluntariado.ver-propias` |
| Mi Equipo (solo si es coordinador) | `/portal/voluntariado/equipo` | `voluntariado.gestionar-equipo` |

### Donador (`donor`)

| Submenú | Ruta esperada | `permission_required` |
|---|---|---|
| Mi Perfil | `/portal/perfil` | `donaciones.ver-propias` |
| Mis Donaciones | `/portal/donaciones` | `donaciones.ver-propias` |
| Nueva Donación | `/portal/donaciones/crear` | `donaciones.registrar` |
| Apadrinamiento | `/portal/donaciones/apadrinamiento` | `donaciones.ver-propias` |
| Certificado de donación | `/portal/donaciones/certificados` | `donaciones.ver-propias` |

### Socio (`partner`)

| Submenú | Ruta esperada | `permission_required` |
|---|---|---|
| Mi Perfil | `/portal/perfil` | `convenios.ver-propio` |
| Mi Convenio | `/portal/convenio` | `convenios.ver-propio` |
| Recursos institucionales | `/portal/convenio/recursos` | `convenios.ver-propio` |

### Denunciante (`complainant`)

| Submenú | Ruta esperada | `permission_required` |
|---|---|---|
| Mis Denuncias | `/portal/denuncias` | `casos.ver-propias` |
| Seguimiento de mi Denuncia | `/portal/denuncias/{codigo}` | `casos.ver-propias` |

> **Nota:** El denunciante también puede crear una denuncia **sin cuenta** desde el sitio público (ver sección siguiente).

---

## Sitio Público (raíz, sin prefijo)

No requiere autenticación. Estas rutas no tienen `permission_required`.

| Página | Ruta esperada | Alimenta módulo interno |
|---|---|---|
| Inicio | `/` | Contenidos Web |
| Quiénes Somos / Misión / Visión / Valores | `/quienes-somos` | Contenidos Web |
| Proyectos (Albergue, Clínica Veterinaria) | `/proyectos/{slug?}` | Beneficiarios / Albergues / Veterinaria |
| Convenios (Padrinazgo / Socios honorarios) | `/convenios` | Convenios |
| Denuncias (formato público) | `/denuncias` | Casos/Denuncias |
| Seguimiento de denuncia por código | `/denuncias/seguimiento` | Casos/Denuncias |
| Reconocimientos (fotos, videos, eventos) | `/reconocimiento` | Contenidos Web |
| Voluntarios (formato de inscripción) | `/voluntarios` | Voluntariado |
| Contáctanos | `/contactanos` | Mensajería |
| Donaciones institucionales | `/donaciones` | Donaciones |

---

## Módulos exclusivos de Fase 2

Nuevos ítems de primer nivel en el Panel Interno — no son submenús de lo anterior. Se activarán en `config/ngo-modules.php` cuando la Fase 2 entre en operación.

### Instituto Superior de Ciencias Veterinarias **[F2]** [TBD]

| Submenú | Ruta esperada | `permission_required` |
|---|---|---|
| Matrículas | `/panel/instituto/matriculas` | `instituto.ver` |
| Cursos y malla curricular | `/panel/instituto/cursos` | `instituto.ver` |
| Docentes | `/panel/instituto/docentes` | `instituto.gestionar` |
| Modalidades (presencial, semipresencial, virtual) | `/panel/instituto/modalidades` | `instituto.gestionar` |
| Certificaciones | `/panel/instituto/certificaciones` | `instituto.ver` |

### RENIAN (Registro Nacional de Mascotas) **[F2]** [TBD]

| Submenú | Ruta esperada | `permission_required` |
|---|---|---|
| Registro de mascota | `/panel/renian/registro` | `renian.gestionar` |
| Búsqueda pública | `/panel/renian/busqueda` | `renian.ver` |
| Historial sanitario | `/panel/renian/{id}/historial` | `renian.ver` |
| Propietario responsable | `/panel/renian/{id}/propietario` | `renian.ver` |

### Reforma Legislativa **[F2]** [TBD]

| Submenú | Ruta esperada | `permission_required` |
|---|---|---|
| Proyectos de ley en seguimiento | `/panel/legislacion/proyectos` | `legislacion.ver` |
| Estado parlamentario (comisión, debate, votación) | `/panel/legislacion/{id}/estado` | `legislacion.ver` |
| Documentos legales adjuntos | `/panel/legislacion/{id}/documentos` | `legislacion.gestionar` |

### Infraestructura y Patrimonio **[F2]** [TBD]

| Submenú | Ruta esperada | `permission_required` |
|---|---|---|
| Inventario de terrenos/locales | `/panel/infraestructura` | `infraestructura.ver` |
| Estado de cesión/convenio | `/panel/infraestructura/{id}/cesion` | `infraestructura.gestionar` |
| Proyectos de adecuación | `/panel/infraestructura/{id}/proyectos` | `infraestructura.gestionar` |

### Logística Nacional **[F2]** [TBD]

| Submenú | Ruta esperada | `permission_required` |
|---|---|---|
| Flota (camionetas de rescate, ambulancias veterinarias) | `/panel/logistica/flota` | `logistica.ver` |
| Equipos de comunicación | `/panel/logistica/equipos` | `logistica.ver` |
| Centros de monitoreo | `/panel/logistica/monitoreo` | `logistica.gestionar` |
| Uniformes e indumentaria | `/panel/logistica/uniformes` | `logistica.gestionar` |

---

## Notas técnicas

### Implementación del menú
 
- Tabla `menu_items` con campos: `key`, `label`, `icon`, `route`, `permission_required`, `parent_id`, `order`, `module` (referencia a `config/ngo-modules.php`).
- Inyección mediante `HandleInertiaRequests::share()` en la prop `menu` — filtra por `$user->can(...)` y por módulos activos.
- **Cero lógica de roles en el frontend.** React consume el árbol ya filtrado.

### Alineación de rutas pendiente

Las rutas actuales del código usan prefijos distintos a los definidos aquí:

| Este documento define | Código actual | Archivo |
|---|---|---|
| `/panel/contenidos/*` | `/cms/*` | `routes/cms.php` |
| `/panel/usuarios/*` | `/admin/users` | `routes/admin.php` |

Estos prefijos deben migrarse a `/panel/...` conforme se implemente cada módulo.

---

*Documento fuente: [`CONAPA_arquitectura_sistema_interno.md`](CONAPA_arquitectura_sistema_interno.md). Este archivo define la navegación; la arquitectura técnica (roles, permisos, capas de seguridad) se mantiene en el documento fuente.*
