<?php

use App\Models\User;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('internal users are redirected to panel dashboard', function () {
    $user = User::factory()->interno()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('panel.dashboard'));

    $panelResponse = $this->get(route('panel.dashboard'));
    $panelResponse->assertOk();
});

test('external users are redirected to portal dashboard', function () {
    $user = User::factory()->externo()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('portal.dashboard'));

    $portalResponse = $this->get(route('portal.dashboard'));
    $portalResponse->assertOk();
});
