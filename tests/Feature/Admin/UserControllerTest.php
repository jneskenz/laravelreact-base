<?php

use App\Models\User;
use Database\Seeders\MenuItemSeeder;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Support\Facades\Hash;

beforeEach(function () {
    $this->seed([
        RoleAndPermissionSeeder::class,
        MenuItemSeeder::class,
    ]);
});

test('guests cannot access user management', function () {
    $this->get(route('panel.usuarios.index'))->assertRedirect(route('login'));
    $this->get(route('panel.usuarios.create'))->assertRedirect(route('login'));
    $this->post(route('panel.usuarios.store'))->assertRedirect(route('login'));
});

test('authenticated users can view the users list', function () {
    $user = User::factory()->interno()->create();
    $user->assignRole('super-admin');

    $response = $this->actingAs($user)->get(route('panel.usuarios.index'));
    $response->assertOk();
});

test('authenticated users can view the create user form with roles and capabilities', function () {
    $user = User::factory()->interno()->create();
    $user->assignRole('super-admin');

    $response = $this->actingAs($user)->get(route('panel.usuarios.create'));
    $response->assertOk();
});

test('an internal user can be created with a role', function () {
    $admin = User::factory()->interno()->create();
    $admin->assignRole('super-admin');

    $response = $this->actingAs($admin)->post(route('panel.usuarios.store'), [
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'tipo_usuario' => 'interno',
        'roles' => ['admin'],
    ]);

    $response->assertRedirect(route('panel.usuarios.index'));

    $created = User::firstWhere('email', 'jane@example.com');
    expect($created)->not->toBeNull()
        ->and($created->tipo_usuario)->toBe('interno')
        ->and($created->hasRole('admin'))->toBeTrue();
});

test('an external user can be created with direct permissions', function () {
    $admin = User::factory()->interno()->create();
    $admin->assignRole('super-admin');

    $response = $this->actingAs($admin)->post(route('panel.usuarios.store'), [
        'name' => 'Carlos Voluntario',
        'email' => 'carlos@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'tipo_usuario' => 'externo',
        'permissions' => ['voluntariado.ver-propias', 'donaciones.ver-propias'],
    ]);

    $response->assertRedirect(route('panel.usuarios.index'));

    $created = User::firstWhere('email', 'carlos@example.com');
    expect($created)->not->toBeNull()
        ->and($created->tipo_usuario)->toBe('externo')
        ->and($created->roles)->toBeEmpty()
        ->and($created->hasPermissionTo('voluntariado.ver-propias'))->toBeTrue()
        ->and($created->hasPermissionTo('donaciones.ver-propias'))->toBeTrue();
});

test('creating a user validates required fields', function () {
    $admin = User::factory()->interno()->create();
    $admin->assignRole('super-admin');

    $response = $this->actingAs($admin)->post(route('panel.usuarios.store'), []);

    $response->assertSessionHasErrors(['name', 'email', 'password', 'tipo_usuario']);
});

test('creating a user validates unique email', function () {
    $admin = User::factory()->interno()->create();
    $admin->assignRole('super-admin');
    $existing = User::factory()->create(['email' => 'taken@example.com']);

    $response = $this->actingAs($admin)->post(route('panel.usuarios.store'), [
        'name' => 'Duplicate',
        'email' => 'taken@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'tipo_usuario' => 'interno',
    ]);

    $response->assertSessionHasErrors(['email']);
});

test('authenticated users can view the edit user form', function () {
    $admin = User::factory()->interno()->create();
    $admin->assignRole('super-admin');
    $target = User::factory()->create();

    $response = $this->actingAs($admin)->get(route('panel.usuarios.edit', $target));
    $response->assertOk();
});

test('a user can be updated with roles', function () {
    $admin = User::factory()->interno()->create();
    $admin->assignRole('super-admin');
    $target = User::factory()->interno()->create();

    $response = $this->actingAs($admin)->put(route('panel.usuarios.update', $target), [
        'name' => 'Updated Name',
        'email' => 'updated@example.com',
        'tipo_usuario' => 'interno',
        'roles' => ['content-admin'],
    ]);

    $response->assertRedirect(route('panel.usuarios.index'));
    expect($target->fresh()->name)->toBe('Updated Name')
        ->and($target->fresh()->hasRole('content-admin'))->toBeTrue();
});

test('updating a user with password changes the password', function () {
    $admin = User::factory()->interno()->create();
    $admin->assignRole('super-admin');
    $target = User::factory()->create();

    $response = $this->actingAs($admin)->put(route('panel.usuarios.update', $target), [
        'name' => $target->name,
        'email' => $target->email,
        'tipo_usuario' => 'interno',
        'password' => 'newpassword123',
        'password_confirmation' => 'newpassword123',
    ]);

    $response->assertRedirect(route('panel.usuarios.index'));
    $target->refresh();
    expect(Hash::check('newpassword123', $target->password))->toBeTrue();
});

test('a user can be deleted', function () {
    $admin = User::factory()->interno()->create();
    $admin->assignRole('super-admin');
    $target = User::factory()->create();

    $response = $this->actingAs($admin)->delete(route('panel.usuarios.destroy', $target));

    $response->assertRedirect(route('panel.usuarios.index'));
    $this->assertDatabaseMissing('users', ['id' => $target->id]);
});

test('users list supports search and tipo_usuario filter', function () {
    $admin = User::factory()->interno()->create(['name' => 'Admin User']);
    $admin->assignRole('super-admin');
    User::factory()->interno()->create(['name' => 'Findable Person', 'email' => 'findable@test.com']);
    User::factory()->externo()->create(['name' => 'External Person', 'email' => 'external@test.com']);

    $response = $this->actingAs($admin)->get(route('panel.usuarios.index', [
        'search' => 'Findable',
        'tipo_usuario' => 'interno',
    ]));
    $response->assertOk();
});

test('user roles can be quickly assigned via updateRoles endpoint', function () {
    $admin = User::factory()->interno()->create();
    $admin->assignRole('super-admin');
    $target = User::factory()->interno()->create();

    $response = $this->actingAs($admin)->put(route('panel.usuarios.update-roles', $target), [
        'tipo_usuario' => 'interno',
        'roles' => ['admin', 'content-admin'],
    ]);

    $response->assertRedirect(route('panel.usuarios.index'));
    expect($target->fresh()->hasRole('admin'))->toBeTrue()
        ->and($target->fresh()->hasRole('content-admin'))->toBeTrue();
});

test('user external capabilities can be quickly assigned via updateRoles endpoint', function () {
    $admin = User::factory()->interno()->create();
    $admin->assignRole('super-admin');
    $target = User::factory()->externo()->create();

    $response = $this->actingAs($admin)->put(route('panel.usuarios.update-roles', $target), [
        'tipo_usuario' => 'externo',
        'permissions' => ['voluntariado.ver-propias', 'donaciones.ver-propias'],
    ]);

    $response->assertRedirect(route('panel.usuarios.index'));
    expect($target->fresh()->hasPermissionTo('voluntariado.ver-propias'))->toBeTrue()
        ->and($target->fresh()->hasPermissionTo('donaciones.ver-propias'))->toBeTrue()
        ->and($target->fresh()->roles)->toBeEmpty();
});
