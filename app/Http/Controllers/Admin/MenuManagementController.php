<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class MenuManagementController extends Controller
{
    /**
     * Display a listing of menu items with search, filters, and role assignments.
     */
    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'area' => ['nullable', 'string', 'in:all,panel,portal'],
            'module' => ['nullable', 'string', 'max:50'],
            'status' => ['nullable', 'string', 'in:all,active,inactive'],
            'per_page' => ['nullable', 'integer', 'in:10,20,50,100'],
        ]);

        $perPage = (int) ($validated['per_page'] ?? 20);

        // Fetch all roles with their permissions to map access
        $roles = Role::with('permissions:id,name')->get(['id', 'name']);

        $menuItemsQuery = MenuItem::query()
            ->with(['parent:id,key,label'])
            ->when($validated['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('label', 'like', "%{$search}%")
                        ->orWhere('key', 'like', "%{$search}%")
                        ->orWhere('permission_required', 'like', "%{$search}%")
                        ->orWhere('module', 'like', "%{$search}%");
                });
            })
            ->when(! empty($validated['area']) && $validated['area'] !== 'all', function ($query) use ($validated) {
                $query->where('area', $validated['area']);
            })
            ->when(! empty($validated['module']) && $validated['module'] !== 'all', function ($query) use ($validated) {
                $query->where('module', $validated['module']);
            })
            ->when(! empty($validated['status']) && $validated['status'] !== 'all', function ($query) use ($validated) {
                if ($validated['status'] === 'active') {
                    $query->where('is_active', true);
                } elseif ($validated['status'] === 'inactive') {
                    $query->where('is_active', false);
                }
            })
            ->orderBy('area')
            ->orderBy('order');

        $paginated = $menuItemsQuery->paginate($perPage)->withQueryString();

        // Transform collection to include roles with access
        $paginated->through(function (MenuItem $item) use ($roles) {
            $rolesWithAccess = [];

            if (! empty($item->permission_required)) {
                foreach ($roles as $role) {
                    // super-admin has access by definition, or check direct permission assignment
                    if ($role->name === 'super-admin' || $role->permissions->contains('name', $item->permission_required)) {
                        $rolesWithAccess[] = $role->name;
                    }
                }
            } else {
                // If no permission required, all roles have access
                $rolesWithAccess = $roles->pluck('name')->toArray();
            }

            return [
                'id' => $item->id,
                'key' => $item->key,
                'label' => $item->label,
                'icon' => $item->icon,
                'route' => $item->route,
                'url' => $item->url,
                'resolved_url' => $item->resolveUrl(),
                'permission_required' => $item->permission_required,
                'module' => $item->module,
                'area' => $item->area,
                'parent_id' => $item->parent_id,
                'parent_label' => $item->parent?->label,
                'order' => $item->order,
                'is_active' => $item->is_active,
                'roles_with_access' => $rolesWithAccess,
            ];
        });

        // List distinct modules from DB for filter dropdown
        $modules = MenuItem::whereNotNull('module')
            ->distinct()
            ->pluck('module')
            ->sort()
            ->values();

        // List top-level parent menus for creation modal
        $parentMenus = MenuItem::whereNull('parent_id')
            ->orderBy('area')
            ->orderBy('order')
            ->get(['id', 'key', 'label', 'area']);

        return Inertia::render('admin/menus/index', [
            'menus' => $paginated,
            'roles' => $roles->map(fn ($r) => ['id' => $r->id, 'name' => $r->name]),
            'modules' => $modules,
            'parent_menus' => $parentMenus,
            'filters' => [
                'search' => $validated['search'] ?? '',
                'area' => $validated['area'] ?? 'all',
                'module' => $validated['module'] ?? 'all',
                'status' => $validated['status'] ?? 'all',
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * Store a newly created menu item in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'key' => ['required', 'string', 'max:100', 'unique:menu_items,key'],
            'label' => ['required', 'string', 'max:255'],
            'icon' => ['nullable', 'string', 'max:50'],
            'route' => ['nullable', 'string', 'max:100'],
            'url' => ['nullable', 'string', 'max:255'],
            'permission_required' => ['nullable', 'string', 'max:100'],
            'module' => ['nullable', 'string', 'max:50'],
            'area' => ['required', 'string', 'in:panel,portal'],
            'parent_id' => ['nullable', 'integer', 'exists:menu_items,id'],
            'order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
            'roles' => ['nullable', 'array'],
            'roles.*' => ['string', 'exists:roles,name'],
        ]);

        $menuItem = MenuItem::create([
            'key' => $validated['key'],
            'label' => $validated['label'],
            'icon' => $validated['icon'] ?? null,
            'route' => $validated['route'] ?? null,
            'url' => $validated['url'] ?? null,
            'permission_required' => $validated['permission_required'] ?? null,
            'module' => $validated['module'] ?? null,
            'area' => $validated['area'],
            'parent_id' => $validated['parent_id'] ?? null,
            'order' => $validated['order'] ?? 0,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        // If permission_required and roles are provided, assign permission to roles
        if (! empty($menuItem->permission_required) && ! empty($validated['roles'])) {
            $permission = Permission::firstOrCreate([
                'name' => $menuItem->permission_required,
                'guard_name' => 'web',
            ]);

            foreach ($validated['roles'] as $roleName) {
                $role = Role::firstWhere('name', $roleName);
                if ($role && $role->name !== 'super-admin') {
                    $role->givePermissionTo($permission);
                }
            }

            app()[PermissionRegistrar::class]->forgetCachedPermissions();
        }

        return redirect()->back()
            ->with('success', "Nuevo menú '{$menuItem->label}' creado exitosamente.");
    }

    /**
     * Toggle the active status of a menu item.
     */
    public function toggleActive(MenuItem $menuItem): RedirectResponse
    {
        $menuItem->update([
            'is_active' => ! $menuItem->is_active,
        ]);

        $statusText = $menuItem->is_active ? 'activado' : 'desactivado';

        return redirect()->back()
            ->with('success', "El menú '{$menuItem->label}' ha sido {$statusText}.");
    }

    /**
     * Update role access for a specific menu item.
     */
    public function updateRoles(Request $request, MenuItem $menuItem): RedirectResponse
    {
        $validated = $request->validate([
            'roles' => ['required', 'array'],
            'roles.*' => ['string', 'exists:roles,name'],
        ]);

        if (empty($menuItem->permission_required)) {
            return redirect()->back()
                ->with('error', 'Este menú no tiene un permiso asociado para restringir por roles.');
        }

        // Ensure permission exists in DB
        $permission = Permission::firstOrCreate([
            'name' => $menuItem->permission_required,
            'guard_name' => 'web',
        ]);

        $selectedRoleNames = $validated['roles'];
        $allRoles = Role::all();

        foreach ($allRoles as $role) {
            // Keep super-admin untouched
            if ($role->name === 'super-admin') {
                continue;
            }

            if (in_array($role->name, $selectedRoleNames, true)) {
                $role->givePermissionTo($permission);
            } else {
                $role->revokePermissionTo($permission);
            }
        }

        // Reset permission cache
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        return redirect()->back()
            ->with('success', "Permisos de roles actualizados para '{$menuItem->label}'.");
    }

    /**
     * Update menu item details.
     */
    public function update(Request $request, MenuItem $menuItem): RedirectResponse
    {
        $validated = $request->validate([
            'label' => ['required', 'string', 'max:255'],
            'icon' => ['nullable', 'string', 'max:50'],
            'order' => ['required', 'integer', 'min:0'],
            'is_active' => ['required', 'boolean'],
            'permission_required' => ['nullable', 'string', 'max:100'],
        ]);

        $menuItem->update($validated);

        return redirect()->back()
            ->with('success', "Menú '{$menuItem->label}' actualizado exitosamente.");
    }

    /**
     * Remove the specified menu item from storage.
     */
    public function destroy(MenuItem $menuItem): RedirectResponse
    {
        $label = $menuItem->label;
        $menuItem->delete();

        return redirect()->back()
            ->with('success', "Menú '{$label}' eliminado exitosamente.");
    }
}
