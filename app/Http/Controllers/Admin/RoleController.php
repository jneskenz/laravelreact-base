<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreRoleRequest;
use App\Http\Requests\Admin\UpdateRoleRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleController extends Controller
{
    /**
     * Map of modules to their user-friendly labels.
     *
     * @var array<string, string>
     */
    protected array $moduleLabels = [
        'dashboard' => 'Dashboard y Métricas',
        'casos' => 'Casos y Denuncias',
        'rescates' => 'Rescates y Operaciones',
        'beneficiarios' => 'Beneficiarios / Animales',
        'albergues' => 'Albergues y Hogares',
        'veterinaria' => 'Atención Veterinaria',
        'voluntariado' => 'Voluntariado y Brigadas',
        'donaciones' => 'Donaciones y Padrinazgos',
        'convenios' => 'Convenios Institucionales',
        'contenidos' => 'Contenidos Web (CMS)',
        'usuarios' => 'Gestión de Acceso y Roles',
        'reportes' => 'Reportes y Estadísticas',
        'configuracion' => 'Configuración del Sistema',
        'auditoria' => 'Auditoría y Trazabilidad',
    ];

    /**
     * Display a listing of roles with user counts and permission matrix.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');

        $roles = Role::query()
            ->withCount('users')
            ->with('permissions:id,name')
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->orderBy('id')
            ->get()
            ->map(function (Role $role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'is_system' => $role->name === 'super-admin',
                    'users_count' => $role->users_count,
                    'permissions_count' => $role->permissions->count(),
                    'permissions' => $role->permissions->pluck('name'),
                ];
            });

        // Group all available permissions by module
        $allPermissions = Permission::orderBy('name')->get();
        $groupedPermissions = [];

        foreach ($allPermissions as $perm) {
            $prefix = explode('.', $perm->name)[0];
            $moduleKey = array_key_exists($prefix, $this->moduleLabels) ? $prefix : 'otros';
            $moduleTitle = $this->moduleLabels[$moduleKey] ?? 'Otros Permisos';

            if (! isset($groupedPermissions[$moduleKey])) {
                $groupedPermissions[$moduleKey] = [
                    'key' => $moduleKey,
                    'title' => $moduleTitle,
                    'permissions' => [],
                ];
            }

            $groupedPermissions[$moduleKey]['permissions'][] = [
                'id' => $perm->id,
                'name' => $perm->name,
            ];
        }

        return Inertia::render('admin/roles/index', [
            'roles' => $roles,
            'grouped_permissions' => array_values($groupedPermissions),
            'filters' => [
                'search' => $search ?? '',
            ],
        ]);
    }

    /**
     * Store a newly created role in storage.
     */
    public function store(StoreRoleRequest $request): RedirectResponse
    {
        $role = Role::create([
            'name' => $request->validated('name'),
            'guard_name' => 'web',
        ]);

        if ($request->has('permissions')) {
            $role->syncPermissions($request->validated('permissions'));
        }

        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        return redirect()
            ->route('panel.roles.index')
            ->with('success', "Rol '{$role->name}' creado exitosamente.");
    }

    /**
     * Update the specified role in storage.
     */
    public function update(UpdateRoleRequest $request, Role $role): RedirectResponse
    {
        // Protect super-admin role
        if ($role->name === 'super-admin') {
            $role->syncPermissions(Permission::all());
            app()[PermissionRegistrar::class]->forgetCachedPermissions();

            return redirect()
                ->route('panel.roles.index')
                ->with('success', "El rol '{$role->name}' mantiene todos los permisos del sistema.");
        }

        $role->update([
            'name' => $request->validated('name'),
        ]);

        $role->syncPermissions($request->validated('permissions') ?? []);
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        return redirect()
            ->route('panel.roles.index')
            ->with('success', "Rol '{$role->name}' actualizado exitosamente.");
    }

    /**
     * Remove the specified role from storage.
     */
    public function destroy(Role $role): RedirectResponse
    {
        if ($role->name === 'super-admin') {
            return redirect()
                ->route('panel.roles.index')
                ->with('error', 'El rol de Super Administrador es del sistema y no puede ser eliminado.');
        }

        if ($role->users()->count() > 0) {
            return redirect()
                ->route('panel.roles.index')
                ->with('error', "No se puede eliminar el rol '{$role->name}' porque tiene {$role->users()->count()} usuario(s) asignado(s).");
        }

        $roleName = $role->name;
        $role->delete();

        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        return redirect()
            ->route('panel.roles.index')
            ->with('success', "Rol '{$roleName}' eliminado exitosamente.");
    }
}
