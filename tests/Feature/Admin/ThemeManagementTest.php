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

test('users with permission can access theme create page', function () {
    $admin = User::factory()->create(['tipo_usuario' => 'interno']);
    $admin->givePermissionTo('configuracion.editar');

    $this->actingAs($admin)
        ->get(route('panel.configuracion.personalizacion.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/configuracion/personalizacion/create')
            ->has('baseTheme')
        );
});

test('users with permission can access theme edit page', function () {
    $admin = User::factory()->create(['tipo_usuario' => 'interno']);
    $admin->givePermissionTo('configuracion.editar');

    $theme = Theme::query()->first();

    $this->actingAs($admin)
        ->get(route('panel.configuracion.personalizacion.edit', $theme))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/configuracion/personalizacion/edit')
            ->has('theme')
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

test('can update an existing theme', function () {
    $admin = User::factory()->create(['tipo_usuario' => 'interno']);
    $admin->givePermissionTo('configuracion.editar');

    $theme = Theme::query()->first();

    $payload = [
        'name' => 'Tema Editado Especial',
        'description' => 'Descripción actualizada',
        'color' => '#8b5cf6',
        'radius' => '1rem',
        'is_default' => false,
        'modes_config' => $theme->modes_config,
    ];

    $this->actingAs($admin)
        ->put(route('panel.configuracion.personalizacion.update', $theme), $payload)
        ->assertRedirect(route('panel.configuracion.personalizacion.index'));

    expect($theme->fresh()->name)->toBe('Tema Editado Especial');
    expect($theme->fresh()->color)->toBe('#8b5cf6');
    expect($theme->fresh()->radius)->toBe('1rem');
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
        ->assertRedirect()
        ->assertInertiaFlash('toast.type', 'error');

    $this->assertDatabaseHas('themes', ['id' => $systemTheme->id]);
});

/**
 * Create a non-system theme that copies the colors of the default seeded theme.
 */
function makeCustomTheme(array $attributes = []): Theme
{
    $base = Theme::query()->where('slug', 'verde-esperanza')->firstOrFail();

    return Theme::create([
        'name' => 'Tema Personalizado',
        'slug' => 'tema-personalizado',
        'color' => $base->color,
        'radius' => $base->radius,
        'modes_config' => $base->modes_config,
        'is_system' => false,
        'is_default' => false,
        ...$attributes,
    ]);
}

test('create page uses the requested theme as base', function () {
    $admin = User::factory()->create(['tipo_usuario' => 'interno']);
    $admin->givePermissionTo('configuracion.editar');

    $base = Theme::query()->where('slug', 'azul-oceano')->first();

    $this->actingAs($admin)
        ->get(route('panel.configuracion.personalizacion.create', ['base' => $base->id]))
        ->assertInertia(fn (Assert $page) => $page->where('baseTheme.id', $base->id));
});

test('rejects colors that are not in the #rrggbb format', function () {
    $admin = User::factory()->create(['tipo_usuario' => 'interno']);
    $admin->givePermissionTo('configuracion.editar');

    $modes = Theme::query()->first()->modes_config;
    $modes['dark']['primary'] = 'red';

    $this->actingAs($admin)
        ->post(route('panel.configuracion.personalizacion.store'), [
            'name' => 'Tema inválido',
            'color' => '#12',
            'radius' => '0.625rem',
            'modes_config' => $modes,
        ])
        ->assertSessionHasErrors(['color', 'modes_config.dark.primary']);

    $this->assertDatabaseMissing('themes', ['name' => 'Tema inválido']);
});

test('saving the default theme cannot leave the organization without a default', function () {
    $admin = User::factory()->create(['tipo_usuario' => 'interno']);
    $admin->givePermissionTo('configuracion.editar');

    $default = Theme::query()->where('is_default', true)->first();

    $this->actingAs($admin)
        ->put(route('panel.configuracion.personalizacion.update', $default), [
            'name' => $default->name,
            'color' => $default->color,
            'radius' => $default->radius,
            'modes_config' => $default->modes_config,
            'is_default' => false,
        ])
        ->assertInertiaFlash('toast.type', 'success');

    expect($default->fresh()->is_default)->toBeTrue();
});

test('updating a theme refreshes the copy stored for users who selected it', function () {
    $admin = User::factory()->create(['tipo_usuario' => 'interno']);
    $admin->givePermissionTo('configuracion.editar');

    $theme = makeCustomTheme();
    $member = User::factory()->create([
        'theme_settings' => ['active_theme_id' => $theme->id, 'active_theme' => ['id' => $theme->id, 'color' => $theme->color]],
    ]);

    $this->actingAs($admin)
        ->put(route('panel.configuracion.personalizacion.update', $theme), [
            'name' => 'Tema Renombrado',
            'color' => '#8b5cf6',
            'radius' => '1rem',
            'modes_config' => $theme->modes_config,
        ]);

    expect($member->fresh()->theme_settings['active_theme'])
        ->toMatchArray(['name' => 'Tema Renombrado', 'color' => '#8b5cf6', 'radius' => '1rem']);
});

test('deleting a custom theme returns its users to the default theme', function () {
    $admin = User::factory()->create(['tipo_usuario' => 'interno']);
    $admin->givePermissionTo('configuracion.editar');

    $theme = makeCustomTheme();
    $member = User::factory()->create([
        'theme_settings' => ['appearance' => 'dark', 'active_theme_id' => $theme->id, 'active_theme' => ['id' => $theme->id]],
    ]);

    $this->actingAs($admin)
        ->delete(route('panel.configuracion.personalizacion.destroy', $theme))
        ->assertRedirect(route('panel.configuracion.personalizacion.index'))
        ->assertInertiaFlash('toast.type', 'success');

    $this->assertDatabaseMissing('themes', ['id' => $theme->id]);
    expect($member->fresh()->theme_settings)->toBe(['appearance' => 'dark']);
});

test('deleting the default theme is refused with an error message', function () {
    $admin = User::factory()->create(['tipo_usuario' => 'interno']);
    $admin->givePermissionTo('configuracion.editar');

    $theme = makeCustomTheme(['is_default' => true]);

    $this->actingAs($admin)
        ->delete(route('panel.configuracion.personalizacion.destroy', $theme))
        ->assertInertiaFlash('toast.type', 'error');

    $this->assertDatabaseHas('themes', ['id' => $theme->id]);
});

test('the default theme is shared with authenticated users', function () {
    $user = User::factory()->create(['tipo_usuario' => 'interno']);
    $default = Theme::query()->where('is_default', true)->first();

    $this->actingAs($user)
        ->get(route('panel.dashboard'))
        ->assertInertia(fn (Assert $page) => $page->where('defaultTheme.id', $default->id));
});
