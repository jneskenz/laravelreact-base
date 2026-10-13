<?php

use App\Models\Theme;
use App\Models\User;
use Illuminate\Support\Facades\URL;
use Inertia\Testing\AssertableInertia as Assert;

/*
 * Factory users are external, so their settings live under /portal/settings/....
 */
beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'ThemeSeeder']);
    URL::defaults(['area' => 'portal']);
});

test('guests cannot access appearance settings', function () {
    $this->get(route('appearance.edit'))->assertRedirect(route('login'));
});

test('authenticated verified users can access appearance edit page with themes', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('appearance.edit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/appearance')
            ->has('themes')
        );
});

test('authenticated user can update and persist their appearance preferences in database', function () {
    $user = User::factory()->create();
    $theme = Theme::query()->first();

    $payload = [
        'appearance' => 'eye-care',
        'layout' => 'header',
        'font_size' => 'compact',
        'active_theme_id' => $theme->id,
    ];

    $this->actingAs($user)
        ->patch(route('appearance.update'), $payload)
        ->assertRedirect();

    $user->refresh();

    expect($user->theme_settings)->not->toBeNull()
        ->and($user->theme_settings['appearance'])->toBe('eye-care')
        ->and($user->theme_settings['layout'])->toBe('header')
        ->and($user->theme_settings['font_size'])->toBe('compact')
        ->and($user->theme_settings['active_theme_id'])->toBe($theme->id);
});
