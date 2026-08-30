<?php

use App\Models\User;

test('guests cannot access user management', function () {
    $this->get(route('admin.users.index'))->assertRedirect(route('login'));
    $this->get(route('admin.users.create'))->assertRedirect(route('login'));
    $this->post(route('admin.users.store'))->assertRedirect(route('login'));
});

test('authenticated users can view the users list', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('admin.users.index'));
    $response->assertOk();
});

test('authenticated users can view the create user form', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('admin.users.create'));
    $response->assertOk();
});

test('a new user can be created', function () {
    $admin = User::factory()->create();
    $this->actingAs($admin);

    $response = $this->post(route('admin.users.store'), [
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertRedirect(route('admin.users.index'));
    $this->assertDatabaseHas('users', [
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
    ]);
});

test('creating a user validates required fields', function () {
    $admin = User::factory()->create();
    $this->actingAs($admin);

    $response = $this->post(route('admin.users.store'), []);

    $response->assertSessionHasErrors(['name', 'email', 'password']);
});

test('creating a user validates unique email', function () {
    $admin = User::factory()->create();
    $existing = User::factory()->create(['email' => 'taken@example.com']);
    $this->actingAs($admin);

    $response = $this->post(route('admin.users.store'), [
        'name' => 'Duplicate',
        'email' => 'taken@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertSessionHasErrors(['email']);
});

test('authenticated users can view the edit user form', function () {
    $admin = User::factory()->create();
    $target = User::factory()->create();
    $this->actingAs($admin);

    $response = $this->get(route('admin.users.edit', $target));
    $response->assertOk();
});

test('a user can be updated', function () {
    $admin = User::factory()->create();
    $target = User::factory()->create();
    $this->actingAs($admin);

    $response = $this->put(route('admin.users.update', $target), [
        'name' => 'Updated Name',
        'email' => 'updated@example.com',
    ]);

    $response->assertRedirect(route('admin.users.index'));
    $this->assertDatabaseHas('users', [
        'id' => $target->id,
        'name' => 'Updated Name',
        'email' => 'updated@example.com',
    ]);
});

test('updating a user with password changes the password', function () {
    $admin = User::factory()->create();
    $target = User::factory()->create();
    $this->actingAs($admin);

    $response = $this->put(route('admin.users.update', $target), [
        'name' => $target->name,
        'email' => $target->email,
        'password' => 'newpassword123',
        'password_confirmation' => 'newpassword123',
    ]);

    $response->assertRedirect(route('admin.users.index'));
    $target->refresh();
    expect(Hash::check('newpassword123', $target->password))->toBeTrue();
});

test('a user can be deleted', function () {
    $admin = User::factory()->create();
    $target = User::factory()->create();
    $this->actingAs($admin);

    $response = $this->delete(route('admin.users.destroy', $target));

    $response->assertRedirect(route('admin.users.index'));
    $this->assertDatabaseMissing('users', ['id' => $target->id]);
});

test('users list supports search filter', function () {
    $admin = User::factory()->create(['name' => 'Admin User']);
    User::factory()->create(['name' => 'Findable Person', 'email' => 'findable@test.com']);
    User::factory()->create(['name' => 'Hidden Person', 'email' => 'hidden@test.com']);
    $this->actingAs($admin);

    $response = $this->get(route('admin.users.index', ['search' => 'Findable']));
    $response->assertOk();
});
