<?php

use App\Models\User;
use Database\Seeders\MenuItemSeeder;
use Database\Seeders\RoleAndPermissionSeeder;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    $this->seed([
        RoleAndPermissionSeeder::class,
        MenuItemSeeder::class,
    ]);
});

test('guests cannot access roles management', function () {
    $this->get(route('panel.roles.index'))->assertRedirect(route('login'));
});

test('super admin can visit roles page and view roles list', function () {
    $user = User::factory()->interno()->create();
    $user->assignRole('super-admin');

    $this->actingAs($user)
        ->get(route('panel.roles.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/roles/index')
            ->has('roles')
            ->has('grouped_permissions')
            ->has('filters')
        );
});

test('super admin can create a new role with permissions', function () {
    $user = User::factory()->interno()->create();
    $user->assignRole('super-admin');

    $response = $this->actingAs($user)
        ->post(route('panel.roles.store'), [
            'name' => 'veterinario-jefe',
            'permissions' => [
                'dashboard.ver',
                'veterinaria.ver',
                'veterinaria.gestionar',
            ],
        ]);

    $response->assertRedirect(route('panel.roles.index'));

    $role = Role::firstWhere('name', 'veterinario-jefe');
    expect($role)->not->toBeNull()
        ->and($role->hasPermissionTo('veterinaria.gestionar'))->toBeTrue()
        ->and($role->hasPermissionTo('casos.ver'))->toBeFalse();
});

test('creating a role validates required and unique name', function () {
    $user = User::factory()->interno()->create();
    $user->assignRole('super-admin');

    $response = $this->actingAs($user)
        ->post(route('panel.roles.store'), [
            'name' => 'admin', // already exists
        ]);

    $response->assertSessionHasErrors(['name']);
});

test('super admin can update a role and its permissions', function () {
    $user = User::factory()->interno()->create();
    $user->assignRole('super-admin');

    $role = Role::create(['name' => 'asistente-temporal', 'guard_name' => 'web']);

    $response = $this->actingAs($user)
        ->put(route('panel.roles.update', $role), [
            'name' => 'asistente-general',
            'permissions' => [
                'dashboard.ver',
                'casos.ver',
            ],
        ]);

    $response->assertRedirect(route('panel.roles.index'));
    expect($role->fresh()->name)->toBe('asistente-general')
        ->and($role->fresh()->hasPermissionTo('casos.ver'))->toBeTrue();
});

test('super-admin role cannot be deleted', function () {
    $user = User::factory()->interno()->create();
    $user->assignRole('super-admin');

    $superAdminRole = Role::firstWhere('name', 'super-admin');

    $response = $this->actingAs($user)
        ->delete(route('panel.roles.destroy', $superAdminRole));

    $response->assertRedirect(route('panel.roles.index'));
    expect(Role::firstWhere('name', 'super-admin'))->not->toBeNull();
});

test('a role with assigned users cannot be deleted', function () {
    $user = User::factory()->interno()->create();
    $user->assignRole('super-admin');

    $adminRole = Role::firstWhere('name', 'admin');
    $assignedUser = User::factory()->interno()->create();
    $assignedUser->assignRole('admin');

    $response = $this->actingAs($user)
        ->delete(route('panel.roles.destroy', $adminRole));

    $response->assertRedirect(route('panel.roles.index'));
    expect(Role::firstWhere('name', 'admin'))->not->toBeNull();
});

test('an unused custom role can be deleted', function () {
    $user = User::factory()->interno()->create();
    $user->assignRole('super-admin');

    $tempRole = Role::create(['name' => 'rol-para-borrar', 'guard_name' => 'web']);

    $response = $this->actingAs($user)
        ->delete(route('panel.roles.destroy', $tempRole));

    $response->assertRedirect(route('panel.roles.index'));
    expect(Role::firstWhere('name', 'rol-para-borrar'))->toBeNull();
});
