<?php

namespace Database\Seeders;

use App\Models\MenuItem;
use Illuminate\Database\Seeder;

class MenuItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        MenuItem::truncate();

        // ---------------------------------------------------------------------
        // PANEL INTERNO (/panel/...) - area: 'panel'
        // ---------------------------------------------------------------------

        // 1. Dashboard
        MenuItem::create([
            'key' => 'dashboard',
            'label' => 'Dashboard',
            'icon' => 'LayoutGrid',
            'route' => 'dashboard',
            'permission_required' => 'dashboard.ver',
            'area' => 'panel',
            'order' => 1,
        ]);

        // 2. Casos / Denuncias
        $casos = MenuItem::create([
            'key' => 'casos',
            'label' => 'Casos / Denuncias',
            'icon' => 'Scale',
            'module' => 'casos',
            'permission_required' => 'casos.ver',
            'area' => 'panel',
            'order' => 2,
        ]);
        $this->createChildren($casos, [
            ['key' => 'casos.bandeja', 'label' => 'Bandeja de casos', 'url' => '/panel/casos', 'permission_required' => 'casos.ver', 'module' => 'casos', 'order' => 1],
            ['key' => 'casos.crear', 'label' => 'Nuevo caso', 'url' => '/panel/casos/crear', 'permission_required' => 'casos.gestionar', 'module' => 'casos', 'order' => 2],
            ['key' => 'casos.seguimiento', 'label' => 'Seguimiento legal', 'url' => '/panel/casos/seguimiento', 'permission_required' => 'casos.ver', 'module' => 'casos', 'order' => 3],
            ['key' => 'casos.derivaciones', 'label' => 'Derivaciones', 'url' => '/panel/casos/derivaciones', 'permission_required' => 'casos.gestionar', 'module' => 'casos', 'order' => 4],
            ['key' => 'casos.documentos', 'label' => 'Documentos y evidencias', 'url' => '/panel/casos/documentos', 'permission_required' => 'casos.ver', 'module' => 'casos', 'order' => 5],
            ['key' => 'casos.codigos', 'label' => 'Códigos de seguimiento', 'url' => '/panel/casos/codigos', 'permission_required' => 'casos.ver', 'module' => 'casos', 'order' => 6],
        ]);

        // 3. Rescates
        $rescates = MenuItem::create([
            'key' => 'rescates',
            'label' => 'Rescates',
            'icon' => 'Siren',
            'module' => 'rescates',
            'permission_required' => 'rescates.ver',
            'area' => 'panel',
            'order' => 3,
        ]);
        $this->createChildren($rescates, [
            ['key' => 'rescates.bandeja', 'label' => 'Bandeja de solicitudes', 'url' => '/panel/rescates', 'permission_required' => 'rescates.ver', 'module' => 'rescates', 'order' => 1],
            ['key' => 'rescates.asignar', 'label' => 'Asignación de brigada', 'url' => '/panel/rescates/asignar', 'permission_required' => 'rescates.gestionar', 'module' => 'rescates', 'order' => 2],
            ['key' => 'rescates.seguimiento', 'label' => 'Seguimiento en curso', 'url' => '/panel/rescates/seguimiento', 'permission_required' => 'rescates.ver', 'module' => 'rescates', 'order' => 3],
            ['key' => 'rescates.historial', 'label' => 'Historial de rescates', 'url' => '/panel/rescates/historial', 'permission_required' => 'rescates.ver', 'module' => 'rescates', 'order' => 4],
        ]);

        // 4. Beneficiarios (Animales)
        $beneficiarios = MenuItem::create([
            'key' => 'beneficiarios',
            'label' => 'Beneficiarios (Animales)',
            'icon' => 'PawPrint',
            'module' => 'beneficiarios',
            'permission_required' => 'beneficiarios.ver',
            'area' => 'panel',
            'order' => 4,
        ]);
        $this->createChildren($beneficiarios, [
            ['key' => 'beneficiarios.ficha', 'label' => 'Ficha del animal', 'url' => '/panel/beneficiarios', 'permission_required' => 'beneficiarios.ver', 'module' => 'beneficiarios', 'order' => 1],
            ['key' => 'beneficiarios.clinica', 'label' => 'Historia clínica', 'url' => '/panel/beneficiarios/historia-clinica', 'permission_required' => 'beneficiarios.ver', 'module' => 'beneficiarios', 'order' => 2],
            ['key' => 'beneficiarios.apadrinamientos', 'label' => 'Apadrinamientos', 'url' => '/panel/beneficiarios/apadrinamientos', 'permission_required' => 'donaciones.ver', 'module' => 'beneficiarios', 'order' => 3],
            ['key' => 'beneficiarios.adopciones', 'label' => 'Adopciones', 'url' => '/panel/beneficiarios/adopciones', 'permission_required' => 'beneficiarios.gestionar', 'module' => 'beneficiarios', 'order' => 4],
            ['key' => 'beneficiarios.galeria', 'label' => 'Galería del animal', 'url' => '/panel/beneficiarios/galeria', 'permission_required' => 'beneficiarios.ver', 'module' => 'beneficiarios', 'order' => 5],
        ]);

        // 5. Albergues
        $albergues = MenuItem::create([
            'key' => 'albergues',
            'label' => 'Albergues',
            'icon' => 'Home',
            'module' => 'albergues',
            'permission_required' => 'albergues.ver',
            'area' => 'panel',
            'order' => 5,
        ]);
        $this->createChildren($albergues, [
            ['key' => 'albergues.directorio', 'label' => 'Directorio de albergues', 'url' => '/panel/albergues', 'permission_required' => 'albergues.ver', 'module' => 'albergues', 'order' => 1],
            ['key' => 'albergues.ocupacion', 'label' => 'Capacidad y ocupación', 'url' => '/panel/albergues/ocupacion', 'permission_required' => 'albergues.ver', 'module' => 'albergues', 'order' => 2],
            ['key' => 'albergues.movimientos', 'label' => 'Ingresos y egresos', 'url' => '/panel/albergues/movimientos', 'permission_required' => 'albergues.gestionar', 'module' => 'albergues', 'order' => 3],
            ['key' => 'albergues.inventario', 'label' => 'Inventario de insumos', 'url' => '/panel/albergues/inventario', 'permission_required' => 'albergues.gestionar', 'module' => 'albergues', 'order' => 4],
        ]);

        // 6. Veterinaria
        $veterinaria = MenuItem::create([
            'key' => 'veterinaria',
            'label' => 'Veterinaria',
            'icon' => 'Stethoscope',
            'module' => 'veterinaria',
            'permission_required' => 'veterinaria.ver',
            'area' => 'panel',
            'order' => 6,
        ]);
        $this->createChildren($veterinaria, [
            ['key' => 'veterinaria.agenda', 'label' => 'Agenda de consultas', 'url' => '/panel/veterinaria/agenda', 'permission_required' => 'veterinaria.ver', 'module' => 'veterinaria', 'order' => 1],
            ['key' => 'veterinaria.historias', 'label' => 'Historias clínicas', 'url' => '/panel/veterinaria/historias', 'permission_required' => 'veterinaria.ver', 'module' => 'veterinaria', 'order' => 2],
            ['key' => 'veterinaria.campanas', 'label' => 'Campañas de salud', 'url' => '/panel/veterinaria/campanas', 'permission_required' => 'veterinaria.gestionar', 'module' => 'veterinaria', 'order' => 3],
            ['key' => 'veterinaria.farmacia', 'label' => 'Farmacia e inventario', 'url' => '/panel/veterinaria/farmacia', 'permission_required' => 'veterinaria.gestionar', 'module' => 'veterinaria', 'order' => 4],
            ['key' => 'veterinaria.cirugias', 'label' => 'Cirugías y procedimientos', 'url' => '/panel/veterinaria/cirugias', 'permission_required' => 'veterinaria.gestionar', 'module' => 'veterinaria', 'order' => 5],
        ]);

        // 7. Voluntariado
        $voluntariado = MenuItem::create([
            'key' => 'voluntariado',
            'label' => 'Voluntariado',
            'icon' => 'Users',
            'module' => 'voluntariado',
            'permission_required' => 'voluntariado.ver',
            'area' => 'panel',
            'order' => 7,
        ]);
        $this->createChildren($voluntariado, [
            ['key' => 'voluntariado.directorio', 'label' => 'Directorio de voluntarios', 'url' => '/panel/voluntariado', 'permission_required' => 'voluntariado.ver', 'module' => 'voluntariado', 'order' => 1],
            ['key' => 'voluntariado.postulaciones', 'label' => 'Postulaciones', 'url' => '/panel/voluntariado/postulaciones', 'permission_required' => 'voluntariado.gestionar', 'module' => 'voluntariado', 'order' => 2],
            ['key' => 'voluntariado.turnos', 'label' => 'Asignaciones y turnos', 'url' => '/panel/voluntariado/turnos', 'permission_required' => 'voluntariado.gestionar', 'module' => 'voluntariado', 'order' => 3],
            ['key' => 'voluntariado.escalafon', 'label' => 'Escalafón y rangos', 'url' => '/panel/voluntariado/escalafon', 'permission_required' => 'voluntariado.ver', 'module' => 'voluntariado', 'order' => 4],
            ['key' => 'voluntariado.capacitaciones', 'label' => 'Capacitaciones y certificados', 'url' => '/panel/voluntariado/capacitaciones', 'permission_required' => 'voluntariado.gestionar', 'module' => 'voluntariado', 'order' => 5],
            ['key' => 'voluntariado.evaluaciones', 'label' => 'Evaluaciones de desempeño', 'url' => '/panel/voluntariado/evaluaciones', 'permission_required' => 'voluntariado.gestionar', 'module' => 'voluntariado', 'order' => 6],
        ]);

        // 8. Donaciones
        $donaciones = MenuItem::create([
            'key' => 'donaciones',
            'label' => 'Donaciones',
            'icon' => 'Heart',
            'module' => 'donaciones',
            'permission_required' => 'donaciones.ver',
            'area' => 'panel',
            'order' => 8,
        ]);
        $this->createChildren($donaciones, [
            ['key' => 'donaciones.donantes', 'label' => 'Directorio de donantes', 'url' => '/panel/donaciones/donantes', 'permission_required' => 'donaciones.ver', 'module' => 'donaciones', 'order' => 1],
            ['key' => 'donaciones.registro', 'label' => 'Registro de donaciones', 'url' => '/panel/donaciones', 'permission_required' => 'donaciones.ver', 'module' => 'donaciones', 'order' => 2],
            ['key' => 'donaciones.recurrentes', 'label' => 'Recurrentes y apadrinamiento', 'url' => '/panel/donaciones/recurrentes', 'permission_required' => 'donaciones.ver', 'module' => 'donaciones', 'order' => 3],
            ['key' => 'donaciones.conciliacion', 'label' => 'Conciliación financiera', 'url' => '/panel/donaciones/conciliacion', 'permission_required' => 'donaciones.gestionar', 'module' => 'donaciones', 'order' => 4],
            ['key' => 'donaciones.certificados', 'label' => 'Certificados de donación', 'url' => '/panel/donaciones/certificados', 'permission_required' => 'donaciones.gestionar', 'module' => 'donaciones', 'order' => 5],
        ]);

        // 9. Convenios
        $convenios = MenuItem::create([
            'key' => 'convenios',
            'label' => 'Convenios',
            'icon' => 'Handshake',
            'module' => 'convenios',
            'permission_required' => 'convenios.ver',
            'area' => 'panel',
            'order' => 9,
        ]);
        $this->createChildren($convenios, [
            ['key' => 'convenios.directorio', 'label' => 'Directorio de socios/aliados', 'url' => '/panel/convenios', 'permission_required' => 'convenios.ver', 'module' => 'convenios', 'order' => 1],
            ['key' => 'convenios.activos', 'label' => 'Convenios activos', 'url' => '/panel/convenios/activos', 'permission_required' => 'convenios.ver', 'module' => 'convenios', 'order' => 2],
            ['key' => 'convenios.padrinazgo', 'label' => 'Padrinazgo institucional', 'url' => '/panel/convenios/padrinazgo', 'permission_required' => 'convenios.gestionar', 'module' => 'convenios', 'order' => 3],
            ['key' => 'convenios.vencimientos', 'label' => 'Vencimientos y alertas', 'url' => '/panel/convenios/vencimientos', 'permission_required' => 'convenios.gestionar', 'module' => 'convenios', 'order' => 4],
        ]);

        // 10. Contenidos Web (CMS)
        $contenidos = MenuItem::create([
            'key' => 'contenidos',
            'label' => 'Contenidos Web (CMS)',
            'icon' => 'FileText',
            'module' => 'contenidos',
            'permission_required' => 'contenidos.editar',
            'area' => 'panel',
            'order' => 10,
        ]);
        $this->createChildren($contenidos, [
            ['key' => 'contenidos.paginas', 'label' => 'Páginas institucionales', 'route' => 'cms.institucional', 'url' => '/panel/contenidos/paginas', 'permission_required' => 'contenidos.editar', 'module' => 'contenidos', 'order' => 1],
            ['key' => 'contenidos.proyectos', 'label' => 'Proyectos', 'route' => 'cms.proyectos', 'url' => '/panel/contenidos/proyectos', 'permission_required' => 'contenidos.editar', 'module' => 'contenidos', 'order' => 2],
            ['key' => 'contenidos.reconocimientos', 'label' => 'Reconocimientos y prensa', 'route' => 'cms.reconocimientos', 'url' => '/panel/contenidos/reconocimientos', 'permission_required' => 'contenidos.editar', 'module' => 'contenidos', 'order' => 3],
            ['key' => 'contenidos.blog', 'label' => 'Blog / Noticias', 'url' => '/panel/contenidos/blog', 'permission_required' => 'contenidos.editar', 'module' => 'contenidos', 'order' => 4],
            ['key' => 'contenidos.multimedia', 'label' => 'Multimedia / Galería', 'url' => '/panel/contenidos/multimedia', 'permission_required' => 'contenidos.editar', 'module' => 'contenidos', 'order' => 5],
            ['key' => 'contenidos.banners', 'label' => 'Banners / Hero', 'url' => '/panel/contenidos/banners', 'permission_required' => 'contenidos.editar', 'module' => 'contenidos', 'order' => 6],
            ['key' => 'contenidos.formularios', 'label' => 'Formularios públicos', 'url' => '/panel/contenidos/formularios', 'permission_required' => 'contenidos.publicar', 'module' => 'contenidos', 'order' => 7],
            ['key' => 'contenidos.seo', 'label' => 'SEO y metadatos', 'url' => '/panel/contenidos/seo', 'permission_required' => 'contenidos.publicar', 'module' => 'contenidos', 'order' => 8],
        ]);

        // 11. Gestión de acceso
        $usuarios = MenuItem::create([
            'key' => 'usuarios',
            'label' => 'Gestión de acceso',
            'icon' => 'Shield',
            'permission_required' => 'usuarios.gestionar',
            'area' => 'panel',
            'order' => 11,
        ]);
        $this->createChildren($usuarios, [
            ['key' => 'usuarios.internos', 'label' => 'Usuarios internos', 'route' => 'admin.users.index', 'url' => '/admin/users', 'permission_required' => 'usuarios.gestionar', 'order' => 1],
            ['key' => 'usuarios.externos', 'label' => 'Usuarios externos', 'url' => '/panel/usuarios/externos', 'permission_required' => 'usuarios.gestionar', 'order' => 2],
            ['key' => 'usuarios.roles', 'label' => 'Roles y permisos', 'url' => '/panel/usuarios/roles', 'permission_required' => 'roles.gestionar', 'order' => 3],
            ['key' => 'usuarios.menus', 'label' => 'Asignación de menús', 'url' => '/panel/usuarios/menus', 'permission_required' => 'roles.gestionar', 'order' => 4],
        ]);

        // 12. Reportes
        $reportes = MenuItem::create([
            'key' => 'reportes',
            'label' => 'Reportes',
            'icon' => 'BarChart3',
            'permission_required' => 'reportes.ver',
            'area' => 'panel',
            'order' => 12,
        ]);
        $this->createChildren($reportes, [
            ['key' => 'reportes.casos', 'label' => 'Reportes de casos', 'url' => '/panel/reportes/casos', 'permission_required' => 'reportes.ver', 'order' => 1],
            ['key' => 'reportes.donaciones', 'label' => 'Reportes de donaciones', 'url' => '/panel/reportes/donaciones', 'permission_required' => 'reportes.ver', 'order' => 2],
            ['key' => 'reportes.voluntariado', 'label' => 'Reportes de voluntariado', 'url' => '/panel/reportes/voluntariado', 'permission_required' => 'reportes.ver', 'order' => 3],
            ['key' => 'reportes.beneficiarios', 'label' => 'Reportes de beneficiarios', 'url' => '/panel/reportes/beneficiarios', 'permission_required' => 'reportes.ver', 'order' => 4],
            ['key' => 'reportes.ejecutivo', 'label' => 'Reporte consolidado', 'url' => '/panel/reportes/ejecutivo', 'permission_required' => 'reportes.ver', 'order' => 5],
        ]);

        // 13. Configuración
        $configuracion = MenuItem::create([
            'key' => 'configuracion',
            'label' => 'Configuración',
            'icon' => 'Settings',
            'permission_required' => 'configuracion.editar',
            'area' => 'panel',
            'order' => 13,
        ]);
        $this->createChildren($configuracion, [
            ['key' => 'configuracion.organizacion', 'label' => 'Datos de la organización', 'url' => '/panel/configuracion/organizacion', 'permission_required' => 'configuracion.editar', 'order' => 1],
            ['key' => 'configuracion.modulos', 'label' => 'Módulos activos', 'url' => '/panel/configuracion/modulos', 'permission_required' => 'configuracion.editar', 'order' => 2],
            ['key' => 'configuracion.parametros', 'label' => 'Parámetros generales', 'url' => '/panel/configuracion/parametros', 'permission_required' => 'configuracion.editar', 'order' => 3],
            ['key' => 'configuracion.notificaciones', 'label' => 'Plantillas de notificaciones', 'url' => '/panel/configuracion/notificaciones', 'permission_required' => 'configuracion.editar', 'order' => 4],
            ['key' => 'configuracion.integraciones', 'label' => 'Integraciones y pasarelas', 'url' => '/panel/configuracion/integraciones', 'permission_required' => 'configuracion.editar', 'order' => 5],
        ]);

        // 14. Auditoría
        $auditoria = MenuItem::create([
            'key' => 'auditoria',
            'label' => 'Auditoría',
            'icon' => 'Eye',
            'permission_required' => 'auditoria.ver',
            'area' => 'panel',
            'order' => 14,
        ]);
        $this->createChildren($auditoria, [
            ['key' => 'auditoria.general', 'label' => 'Log de actividad general', 'url' => '/panel/auditoria', 'permission_required' => 'auditoria.ver', 'order' => 1],
            ['key' => 'auditoria.modulo', 'label' => 'Log por módulo', 'url' => '/panel/auditoria/modulo', 'permission_required' => 'auditoria.ver', 'order' => 2],
            ['key' => 'auditoria.sesiones', 'label' => 'Sesiones activas', 'url' => '/panel/auditoria/sesiones', 'permission_required' => 'auditoria.ver', 'order' => 3],
        ]);

        // ---------------------------------------------------------------------
        // PORTAL EXTERNO (/mi-cuenta/...) - area: 'portal'
        // ---------------------------------------------------------------------

        // 1. Dashboard Externo
        MenuItem::create([
            'key' => 'mi.dashboard',
            'label' => 'Mi Panel',
            'icon' => 'LayoutGrid',
            'route' => 'dashboard',
            'area' => 'portal',
            'order' => 1,
        ]);

        // 2. Mi Voluntariado
        $miVoluntariado = MenuItem::create([
            'key' => 'mi.voluntariado',
            'label' => 'Mi Voluntariado',
            'icon' => 'Users',
            'module' => 'voluntariado',
            'permission_required' => 'voluntariado.ver-propias',
            'area' => 'portal',
            'order' => 2,
        ]);
        $this->createChildren($miVoluntariado, [
            ['key' => 'mi.voluntariado.turnos', 'label' => 'Mis Turnos', 'url' => '/mi-cuenta/voluntariado/turnos', 'permission_required' => 'voluntariado.ver-turnos', 'module' => 'voluntariado', 'order' => 1],
            ['key' => 'mi.voluntariado.escalafon', 'label' => 'Mi Rango y Escalafón', 'url' => '/mi-cuenta/voluntariado/escalafon', 'permission_required' => 'voluntariado.ver-propias', 'module' => 'voluntariado', 'order' => 2],
            ['key' => 'mi.voluntariado.capacitaciones', 'label' => 'Mis Capacitaciones', 'url' => '/mi-cuenta/voluntariado/capacitaciones', 'permission_required' => 'voluntariado.ver-propias', 'module' => 'voluntariado', 'order' => 3],
            ['key' => 'mi.voluntariado.equipo', 'label' => 'Mi Equipo', 'url' => '/mi-cuenta/voluntariado/equipo', 'permission_required' => 'voluntariado.gestionar-equipo', 'module' => 'voluntariado', 'order' => 4],
        ], 'portal');

        // 3. Mis Donaciones
        $miDonaciones = MenuItem::create([
            'key' => 'mi.donaciones',
            'label' => 'Mis Donaciones',
            'icon' => 'Heart',
            'module' => 'donaciones',
            'permission_required' => 'donaciones.ver-propias',
            'area' => 'portal',
            'order' => 3,
        ]);
        $this->createChildren($miDonaciones, [
            ['key' => 'mi.donaciones.historial', 'label' => 'Historial de Donaciones', 'url' => '/mi-cuenta/donaciones', 'permission_required' => 'donaciones.ver-propias', 'module' => 'donaciones', 'order' => 1],
            ['key' => 'mi.donaciones.nueva', 'label' => 'Nueva Donación', 'url' => '/mi-cuenta/donaciones/crear', 'permission_required' => 'donaciones.registrar', 'module' => 'donaciones', 'order' => 2],
            ['key' => 'mi.donaciones.apadrinamiento', 'label' => 'Mi Apadrinamiento', 'url' => '/mi-cuenta/donaciones/apadrinamiento', 'permission_required' => 'donaciones.ver-propias', 'module' => 'donaciones', 'order' => 3],
            ['key' => 'mi.donaciones.certificados', 'label' => 'Mis Certificados', 'url' => '/mi-cuenta/donaciones/certificados', 'permission_required' => 'donaciones.ver-propias', 'module' => 'donaciones', 'order' => 4],
        ], 'portal');

        // 4. Mis Denuncias
        $miDenuncias = MenuItem::create([
            'key' => 'mi.denuncias',
            'label' => 'Mis Denuncias',
            'icon' => 'Scale',
            'module' => 'casos',
            'permission_required' => 'casos.ver-propias',
            'area' => 'portal',
            'order' => 4,
        ]);
        $this->createChildren($miDenuncias, [
            ['key' => 'mi.denuncias.lista', 'label' => 'Historial de Denuncias', 'url' => '/mi-cuenta/denuncias', 'permission_required' => 'casos.ver-propias', 'module' => 'casos', 'order' => 1],
            ['key' => 'mi.denuncias.seguimiento', 'label' => 'Seguimiento por Código', 'url' => '/mi-cuenta/denuncias/seguimiento', 'permission_required' => 'casos.ver-propias', 'module' => 'casos', 'order' => 2],
        ], 'portal');

        // 5. Mi Convenio
        $miConvenio = MenuItem::create([
            'key' => 'mi.convenio',
            'label' => 'Mi Convenio',
            'icon' => 'Handshake',
            'module' => 'convenios',
            'permission_required' => 'convenios.ver-propio',
            'area' => 'portal',
            'order' => 5,
        ]);
        $this->createChildren($miConvenio, [
            ['key' => 'mi.convenio.detalle', 'label' => 'Detalle del Convenio', 'url' => '/mi-cuenta/convenio', 'permission_required' => 'convenios.ver-propio', 'module' => 'convenios', 'order' => 1],
            ['key' => 'mi.convenio.recursos', 'label' => 'Recursos Institucionales', 'url' => '/mi-cuenta/convenio/recursos', 'permission_required' => 'convenios.ver-propio', 'module' => 'convenios', 'order' => 2],
        ], 'portal');

        // 6. Mis Apadrinados (Beneficiarios)
        MenuItem::create([
            'key' => 'mi.beneficiarios',
            'label' => 'Mis Apadrinados',
            'icon' => 'PawPrint',
            'module' => 'beneficiarios',
            'url' => '/mi-cuenta/apadrinados',
            'permission_required' => 'beneficiarios.ver-propias',
            'area' => 'portal',
            'order' => 6,
        ]);
    }

    /**
     * Helper to create child menu items.
     *
     * @param  array<int, array<string, mixed>>  $children
     */
    protected function createChildren(MenuItem $parent, array $children, string $area = 'panel'): void
    {
        foreach ($children as $child) {
            MenuItem::create([
                'parent_id' => $parent->id,
                'area' => $area,
                ...$child,
            ]);
        }
    }
}
