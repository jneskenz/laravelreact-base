<?php

use App\Models\MenuItem;
use App\Models\User;
use Database\Seeders\MenuItemSeeder;
use Database\Seeders\RoleAndPermissionSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed([
        RoleAndPermissionSeeder::class,
        MenuItemSeeder::class,
    ]);
});

test('super admin receives full internal panel menu tree', function () {
    $user = User::factory()->interno()->create();
    $user->assignRole('super-admin');

    $tree = MenuItem::treeForUser($user);
    $keys = array_column($tree, 'key');

    expect($keys)->toContain('dashboard')
        ->toContain('casos')
        ->toContain('rescates')
        ->toContain('beneficiarios')
        ->toContain('albergues')
        ->toContain('veterinaria')
        ->toContain('voluntariado')
        ->toContain('donaciones')
        ->toContain('convenios')
        ->toContain('contenidos')
        ->toContain('usuarios')
        ->toContain('reportes')
        ->toContain('configuracion')
        ->toContain('auditoria');

    $casosItem = collect($tree)->firstWhere('key', 'casos');
    expect($casosItem['children'])->not->toBeEmpty();
    expect(array_column($casosItem['children'], 'key'))->toContain('casos.bandeja');
});

test('content admin receives only dashboard and contents menu', function () {
    $user = User::factory()->interno()->create();
    $user->assignRole('content-admin');

    $tree = MenuItem::treeForUser($user);
    $keys = array_column($tree, 'key');

    expect($keys)->toContain('dashboard')
        ->toContain('contenidos')
        ->not->toContain('casos')
        ->not->toContain('usuarios')
        ->not->toContain('configuracion');
});

test('external user without permissions receives only portal dashboard', function () {
    $user = User::factory()->externo()->create();

    $tree = MenuItem::treeForUser($user);
    $keys = array_column($tree, 'key');

    expect($keys)->toEqual(['mi.dashboard']);
});

test('external user with donation permissions receives donations portal section', function () {
    $user = User::factory()->externo()->create();
    $user->givePermissionTo(['donaciones.ver-propias', 'donaciones.registrar']);

    $tree = MenuItem::treeForUser($user);
    $keys = array_column($tree, 'key');

    expect($keys)->toContain('mi.dashboard')
        ->toContain('mi.donaciones')
        ->not->toContain('mi.voluntariado')
        ->not->toContain('casos');

    $donacionesItem = collect($tree)->firstWhere('key', 'mi.donaciones');
    expect($donacionesItem['children'])->not->toBeEmpty();
    $childKeys = array_column($donacionesItem['children'], 'key');
    expect($childKeys)->toContain('mi.donaciones.historial')
        ->toContain('mi.donaciones.nueva');
});

test('external user with multiple permissions accumulates portal sections without conflict', function () {
    $user = User::factory()->externo()->create();
    $user->givePermissionTo([
        'donaciones.ver-propias',
        'voluntariado.ver-propias',
        'casos.ver-propias',
    ]);

    $tree = MenuItem::treeForUser($user);
    $keys = array_column($tree, 'key');

    expect($keys)->toContain('mi.dashboard')
        ->toContain('mi.donaciones')
        ->toContain('mi.voluntariado')
        ->toContain('mi.denuncias')
        ->not->toContain('mi.convenio');
});

test('disabled module hides corresponding menu items even for super admin', function () {
    config(['ngo-modules.casos' => false]);

    $user = User::factory()->interno()->create();
    $user->assignRole('super-admin');

    $tree = MenuItem::treeForUser($user);
    $keys = array_column($tree, 'key');

    expect($keys)->not->toContain('casos')
        ->toContain('dashboard')
        ->toContain('rescates');
});

test('unauthenticated user gets empty menu tree', function () {
    $tree = MenuItem::treeForUser(null);
    expect($tree)->toBeEmpty();
});

test('inertia response shares menu prop to authenticated user', function () {
    $user = User::factory()->interno()->create();
    $user->assignRole('super-admin');

    $this->actingAs($user)
        ->get(route('panel.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->has('menu')
            ->where('menu.0.key', 'dashboard')
        );
});
