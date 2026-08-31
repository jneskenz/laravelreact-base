<?php

use App\Models\MenuItem;
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

test('guests cannot access menu management page', function () {
    $response = $this->get(route('admin.menus.index'));
    $response->assertRedirect(route('login'));
});

test('super admin can visit menu management page and view menus list', function () {
    $user = User::factory()->interno()->create();
    $user->assignRole('super-admin');

    $this->actingAs($user)
        ->get(route('admin.menus.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/menus/index')
            ->has('menus.data')
            ->has('roles')
            ->has('modules')
            ->has('filters')
        );
});

test('menus index supports search filtering', function () {
    $user = User::factory()->interno()->create();
    $user->assignRole('super-admin');

    $this->actingAs($user)
        ->get(route('admin.menus.index', ['search' => 'veterinaria']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/menus/index')
            ->where('menus.data.0.module', 'veterinaria')
        );
});

test('menus index supports area filtering', function () {
    $user = User::factory()->interno()->create();
    $user->assignRole('super-admin');

    $this->actingAs($user)
        ->get(route('admin.menus.index', ['area' => 'portal']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/menus/index')
            ->where('menus.data.0.area', 'portal')
        );
});

test('admin can toggle active status of a menu item', function () {
    $user = User::factory()->interno()->create();
    $user->assignRole('super-admin');

    $menuItem = MenuItem::firstWhere('key', 'casos');
    $initialState = $menuItem->is_active;

    $this->actingAs($user)
        ->patch(route('admin.menus.toggle', $menuItem))
        ->assertRedirect();

    expect($menuItem->fresh()->is_active)->toBe(! $initialState);
});

test('admin can update role access for a menu item', function () {
    $user = User::factory()->interno()->create();
    $user->assignRole('super-admin');

    $menuItem = MenuItem::firstWhere('key', 'veterinaria');
    $permissionName = $menuItem->permission_required;

    // Initially content-admin does not have veterinaria.ver
    $contentAdmin = Role::firstWhere('name', 'content-admin');
    expect($contentAdmin->hasPermissionTo($permissionName))->toBeFalse();

    // Grant access to content-admin and admin
    $this->actingAs($user)
        ->put(route('admin.menus.update-roles', $menuItem), [
            'roles' => ['admin', 'content-admin'],
        ])
        ->assertRedirect();

    expect($contentAdmin->fresh()->hasPermissionTo($permissionName))->toBeTrue();
});

test('admin can update menu item details', function () {
    $user = User::factory()->interno()->create();
    $user->assignRole('super-admin');

    $menuItem = MenuItem::firstWhere('key', 'dashboard');

    $this->actingAs($user)
        ->put(route('admin.menus.update', $menuItem), [
            'label' => 'Panel Principal',
            'icon' => 'LayoutGrid',
            'order' => 1,
            'is_active' => true,
            'permission_required' => 'dashboard.ver',
        ])
        ->assertRedirect();

    expect($menuItem->fresh()->label)->toBe('Panel Principal');
});

test('admin can create a new menu item with role permissions', function () {
    $user = User::factory()->interno()->create();
    $user->assignRole('super-admin');

    $this->actingAs($user)
        ->post(route('admin.menus.store'), [
            'key' => 'custom.reportes',
            'label' => 'Reportes Personalizados',
            'icon' => 'BarChart3',
            'area' => 'panel',
            'module' => 'casos',
            'url' => '/panel/casos/reportes-custom',
            'permission_required' => 'casos.reportes-custom',
            'order' => 10,
            'is_active' => true,
            'roles' => ['admin'],
        ])
        ->assertRedirect();

    $created = MenuItem::firstWhere('key', 'custom.reportes');
    expect($created)->not->toBeNull()
        ->and($created->label)->toBe('Reportes Personalizados');

    $adminRole = Role::firstWhere('name', 'admin');
    expect($adminRole->hasPermissionTo('casos.reportes-custom'))->toBeTrue();
});

test('admin can delete a menu item', function () {
    $user = User::factory()->interno()->create();
    $user->assignRole('super-admin');

    $menuItem = MenuItem::create([
        'key' => 'temp.menu',
        'label' => 'Menú Temporal',
        'area' => 'panel',
        'order' => 99,
        'is_active' => true,
    ]);

    $this->actingAs($user)
        ->delete(route('admin.menus.destroy', $menuItem))
        ->assertRedirect();

    expect(MenuItem::firstWhere('key', 'temp.menu'))->toBeNull();
});
