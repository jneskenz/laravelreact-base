<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleAndPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // 1. Permisos del sistema
        $permissions = [
            // Dashboard
            'dashboard.ver',

            // Casos / Denuncias
            'casos.ver',
            'casos.gestionar',
            'casos.ver-propias',

            // Rescates
            'rescates.ver',
            'rescates.gestionar',

            // Beneficiarios (Animales)
            'beneficiarios.ver',
            'beneficiarios.gestionar',
            'beneficiarios.ver-propias',

            // Albergues
            'albergues.ver',
            'albergues.gestionar',

            // Veterinaria
            'veterinaria.ver',
            'veterinaria.gestionar',

            // Voluntariado
            'voluntariado.ver',
            'voluntariado.gestionar',
            'voluntariado.ver-propias',
            'voluntariado.ver-turnos',
            'voluntariado.gestionar-equipo',

            // Donaciones
            'donaciones.ver',
            'donaciones.gestionar',
            'donaciones.ver-propias',
            'donaciones.registrar',

            // Convenios
            'convenios.ver',
            'convenios.gestionar',
            'convenios.ver-propio',

            // Contenidos Web (CMS)
            'contenidos.editar',
            'contenidos.publicar',

            // Gestión de acceso
            'usuarios.gestionar',
            'roles.gestionar',

            // Reportes
            'reportes.ver',

            // Configuración
            'configuracion.editar',

            // Auditoría
            'auditoria.ver',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // 2. Roles internos

        // Super Admin (Director / Dueño) - Todos los permisos
        $superAdmin = Role::firstOrCreate(['name' => 'super-admin']);
        $superAdmin->syncPermissions(Permission::all());

        // Admin (Operativo)
        $admin = Role::firstOrCreate(['name' => 'admin']);
        $admin->syncPermissions([
            'dashboard.ver',
            'casos.ver',
            'casos.gestionar',
            'rescates.ver',
            'rescates.gestionar',
            'beneficiarios.ver',
            'beneficiarios.gestionar',
            'albergues.ver',
            'albergues.gestionar',
            'veterinaria.ver',
            'veterinaria.gestionar',
            'voluntariado.ver',
            'voluntariado.gestionar',
            'donaciones.ver',
            'donaciones.gestionar',
            'convenios.ver',
            'convenios.gestionar',
            'contenidos.editar',
            'contenidos.publicar',
            'usuarios.gestionar',
            'reportes.ver',
            'auditoria.ver',
        ]);

        // Content Admin (CMS)
        $contentAdmin = Role::firstOrCreate(['name' => 'content-admin']);
        $contentAdmin->syncPermissions([
            'dashboard.ver',
            'contenidos.editar',
            'contenidos.publicar',
        ]);
    }
}
