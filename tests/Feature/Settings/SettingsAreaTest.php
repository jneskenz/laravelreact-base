<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('internal users have their settings under the panel', function () {
    $user = User::factory()->interno()->create();

    $this->actingAs($user)
        ->get('/panel/settings/profile')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/profile')
            ->where('area', 'panel')
        );
});

test('external users have their settings under the portal', function () {
    $user = User::factory()->externo()->create();

    $this->actingAs($user)
        ->get('/portal/settings/profile')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('area', 'portal'));
});

test('users visiting the other area are sent to the same page in their own area', function (string $tipoUsuario, string $from, string $to) {
    $user = User::factory()->create(['tipo_usuario' => $tipoUsuario]);

    $this->actingAs($user)
        ->get($from)
        ->assertRedirect($to);
})->with([
    'interno en portal' => ['interno', '/portal/settings/appearance?tab=1', '/panel/settings/appearance?tab=1'],
    'externo en panel' => ['externo', '/panel/settings/profile', '/portal/settings/profile'],
]);

test('changes sent to the other area are rejected', function () {
    $user = User::factory()->interno()->create();

    $this->actingAs($user)
        ->patch('/portal/settings/profile', ['name' => 'Otro nombre', 'email' => $user->email])
        ->assertNotFound();

    expect($user->fresh()->name)->not->toBe('Otro nombre');
});

test('former settings urls redirect to the user area', function () {
    $user = User::factory()->interno()->create();

    $this->actingAs($user)->get('/settings')->assertRedirect('/panel/settings/profile');
    $this->actingAs($user)->get('/settings/appearance')->assertRedirect('/panel/settings/appearance');
});

test('only users who manage configuration see the manage themes shortcut', function (bool $canManage) {
    $this->artisan('db:seed', ['--class' => 'RoleAndPermissionSeeder']);
    $this->artisan('db:seed', ['--class' => 'ThemeSeeder']);

    $user = User::factory()->interno()->create();

    if ($canManage) {
        $user->givePermissionTo('configuracion.editar');
    }

    $this->actingAs($user)
        ->get('/panel/settings/appearance')
        ->assertInertia(fn (Assert $page) => $page->where('canManageThemes', $canManage));
})->with([true, false]);
