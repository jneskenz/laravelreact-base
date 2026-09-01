<?php

use App\Models\Theme;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'RoleAndPermissionSeeder']);
    $this->artisan('db:seed', ['--class' => 'ThemeSeeder']);
});

test('guests cannot access theme management', function () {
    $this->get(route('panel.configuracion.personalizacion.index'))
        ->assertRedirect(route('login'));
});

test('users without permission cannot access theme management', function () {
    $user = User::factory()->create(['tipo_usuario' => 'interno']);

    $this->actingAs($user)
        ->get(route('panel.configuracion.personalizacion.index'))
        ->assertForbidden();
});

test('users with permission can access theme management index', function () {
    $admin = User::factory()->create(['tipo_usuario' => 'interno']);
    $admin->givePermissionTo('configuracion.editar');

    $this->actingAs($admin)
        ->get(route('panel.configuracion.personalizacion.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/configuracion/personalizacion/index')
            ->has('themes')
        );
});

test('can create a new institutional theme with semantic color configs', function () {
    $admin = User::factory()->create(['tipo_usuario' => 'interno']);
    $admin->givePermissionTo('configuracion.editar');

    $payload = [
        'name' => 'Tema Brigada Voluntaria',
        'description' => 'Tema para brigadas activas en campo',
        'color' => '#10b981',
        'radius' => '0.625rem',
        'is_default' => false,
        'modes_config' => [
            'light' => [
                'background' => '#ffffff',
                'foreground' => '#0f172a',
                'primary' => '#10b981',
                'secondary' => '#64748b',
                'success' => '#10b981',
                'warning' => '#f59e0b',
                'danger' => '#ef4444',
                'alert' => '#f97316',
                'muted' => '#64748b',
                'light' => '#ffffff',
                'dark' => '#0f172a',
            ],
            'dark' => [
                'background' => '#09090b',
                'foreground' => '#f8fafc',
                'primary' => '#34d399',
                'secondary' => '#94a3b8',
                'success' => '#34d399',
                'warning' => '#fbbf24',
                'danger' => '#f87171',
                'alert' => '#fb923c',
                'muted' => '#94a3b8',
                'light' => '#f8fafc',
                'dark' => '#020617',
            ],
            'eye_care' => [
                'background' => '#fbf7ee',
                'foreground' => '#292524',
                'primary' => '#059669',
                'secondary' => '#78716c',
                'success' => '#059669',
                'warning' => '#d97706',
                'danger' => '#dc2626',
                'alert' => '#ea580c',
                'muted' => '#78716c',
                'light' => '#fefefe',
                'dark' => '#1c1917',
            ],
            'semi_dark' => [
                'background' => '#0f172a',
                'foreground' => '#f1f5f9',
                'primary' => '#10b981',
                'secondary' => '#94a3b8',
                'success' => '#34d399',
                'warning' => '#fbbf24',
                'danger' => '#f87171',
                'alert' => '#fb923c',
                'muted' => '#64748b',
                'light' => '#f1f5f9',
                'dark' => '#0f172a',
            ],
        ],
    ];

    $this->actingAs($admin)
        ->post(route('panel.configuracion.personalizacion.store'), $payload)
        ->assertRedirect(route('panel.configuracion.personalizacion.index'));

    $this->assertDatabaseHas('themes', [
        'name' => 'Tema Brigada Voluntaria',
        'color' => '#10b981',
        'is_system' => false,
    ]);
});

test('can set a theme as default', function () {
    $admin = User::factory()->create(['tipo_usuario' => 'interno']);
    $admin->givePermissionTo('configuracion.editar');

    $theme = Theme::query()->where('slug', 'azul-oceano')->first();
    expect($theme->is_default)->toBeFalse();

    $this->actingAs($admin)
        ->patch(route('panel.configuracion.personalizacion.default', $theme))
        ->assertRedirect();

    expect($theme->fresh()->is_default)->toBeTrue();
    expect(Theme::query()->where('slug', 'verde-esperanza')->first()->is_default)->toBeFalse();
});

test('cannot delete a system theme', function () {
    $admin = User::factory()->create(['tipo_usuario' => 'interno']);
    $admin->givePermissionTo('configuracion.editar');

    $systemTheme = Theme::query()->where('is_system', true)->first();

    $this->actingAs($admin)
        ->delete(route('panel.configuracion.personalizacion.destroy', $systemTheme))
        ->assertRedirect();

    $this->assertDatabaseHas('themes', ['id' => $systemTheme->id]);
});
