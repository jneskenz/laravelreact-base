<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class UserController extends Controller
{
    /**
     * List of capability presets for external users.
     *
     * @var array<int, array<string, string>>
     */
    protected array $externalCapabilities = [
        ['name' => 'voluntariado.ver-propias', 'label' => 'Voluntariado', 'description' => 'Acceso a turnos, escalafón y equipo'],
        ['name' => 'donaciones.ver-propias', 'label' => 'Donante', 'description' => 'Historial de donaciones y certificados'],
        ['name' => 'convenios.ver-propio', 'label' => 'Socio / Convenio', 'description' => 'Detalle del convenio y recursos'],
        ['name' => 'casos.ver-propias', 'label' => 'Denunciante', 'description' => 'Seguimiento de denuncias realizadas'],
        ['name' => 'beneficiarios.ver-propias', 'label' => 'Padrino / Adoptante', 'description' => 'Seguimiento de animales apadrinados'],
    ];

    /**
     * Display a listing of users with search, filter, and pagination support.
     */
    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'in:verified,pending'],
            'tipo_usuario' => ['nullable', 'string', 'in:all,interno,externo'],
            'role' => ['nullable', 'string', 'max:100'],
            'per_page' => ['nullable', 'integer', 'in:10,20,50'],
        ]);

        $perPage = (int) ($validated['per_page'] ?? 10);
        $roles = Role::orderBy('name')->get(['id', 'name']);

        $users = User::query()
            ->with(['roles:id,name', 'permissions:id,name'])
            ->select('id', 'name', 'email', 'tipo_usuario', 'email_verified_at', 'created_at')
            ->when($validated['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when(isset($validated['status']), function ($query) use ($validated) {
                if ($validated['status'] === 'verified') {
                    $query->whereNotNull('email_verified_at');
                } else {
                    $query->whereNull('email_verified_at');
                }
            })
            ->when(! empty($validated['tipo_usuario']) && $validated['tipo_usuario'] !== 'all', function ($query) use ($validated) {
                $query->where('tipo_usuario', $validated['tipo_usuario']);
            })
            ->when(! empty($validated['role']) && $validated['role'] !== 'all', function ($query) use ($validated) {
                $query->whereHas('roles', function ($q) use ($validated) {
                    $q->where('name', $validated['role']);
                });
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'roles' => $roles,
            'external_capabilities' => $this->externalCapabilities,
            'filters' => [
                'search' => $validated['search'] ?? '',
                'status' => $validated['status'] ?? '',
                'tipo_usuario' => $validated['tipo_usuario'] ?? 'all',
                'role' => $validated['role'] ?? 'all',
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create(): Response
    {
        $roles = Role::orderBy('name')->get(['id', 'name']);

        return Inertia::render('admin/users/create', [
            'roles' => $roles,
            'external_capabilities' => $this->externalCapabilities,
        ]);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(StoreUserRequest $request): RedirectResponse
    {
        $tipoUsuario = $request->validated('tipo_usuario');

        $user = User::create([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'password' => Hash::make($request->validated('password')),
            'tipo_usuario' => $tipoUsuario,
        ]);

        if ($tipoUsuario === 'interno' && $request->has('roles')) {
            $user->syncRoles($request->validated('roles'));
        } elseif ($tipoUsuario === 'externo' && $request->has('permissions')) {
            $user->syncPermissions($request->validated('permissions'));
        }

        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        return redirect()
            ->route('panel.usuarios.index')
            ->with('success', 'Usuario creado exitosamente.');
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(User $user): Response
    {
        $user->load(['roles:id,name', 'permissions:id,name']);
        $roles = Role::orderBy('name')->get(['id', 'name']);

        return Inertia::render('admin/users/edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'tipo_usuario' => $user->tipo_usuario,
                'roles' => $user->roles->pluck('name'),
                'permissions' => $user->permissions->pluck('name'),
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at,
            ],
            'roles' => $roles,
            'external_capabilities' => $this->externalCapabilities,
        ]);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $tipoUsuario = $request->validated('tipo_usuario');

        $data = [
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'tipo_usuario' => $tipoUsuario,
        ];

        if ($request->validated('password')) {
            $data['password'] = Hash::make($request->validated('password'));
        }

        $user->update($data);

        if ($tipoUsuario === 'interno') {
            $user->syncRoles($request->validated('roles') ?? []);
            $user->syncPermissions([]); // Clear direct external permissions
        } else {
            $user->syncRoles([]); // Clear internal roles
            $user->syncPermissions($request->validated('permissions') ?? []);
        }

        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        return redirect()
            ->route('panel.usuarios.index')
            ->with('success', 'Usuario actualizado exitosamente.');
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user): RedirectResponse
    {
        $user->delete();

        return redirect()
            ->route('panel.usuarios.index')
            ->with('success', 'Usuario eliminado exitosamente.');
    }

    /**
     * Update user role or external capabilities directly.
     */
    public function updateRoles(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'tipo_usuario' => ['required', 'string', 'in:interno,externo'],
            'roles' => ['nullable', 'array'],
            'roles.*' => ['string', 'exists:roles,name'],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ]);

        $tipoUsuario = $validated['tipo_usuario'];
        $user->update(['tipo_usuario' => $tipoUsuario]);

        if ($tipoUsuario === 'interno') {
            $user->syncRoles($validated['roles'] ?? []);
            $user->syncPermissions([]);
        } else {
            $user->syncRoles([]);
            $user->syncPermissions($validated['permissions'] ?? []);
        }

        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        return redirect()
            ->route('panel.usuarios.index')
            ->with('success', "Roles y permisos de '{$user->name}' actualizados exitosamente.");
    }
}
