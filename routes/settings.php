<?php

use App\Http\Controllers\Settings\AppearanceController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use App\Http\Middleware\EnsureUserArea;
use App\Http\Middleware\SetUserAreaUrlDefaults;
use Illuminate\Auth\Middleware\RequirePassword;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
| Account settings live inside each user's area: /panel/settings/... for internal
| users and /portal/settings/... for external ones. The {area} parameter is filled
| automatically (see SetUserAreaUrlDefaults), so route('profile.edit') needs no arguments.
*/
Route::prefix('{area}/settings')
    ->where(['area' => 'panel|portal'])
    ->middleware(['auth', SetUserAreaUrlDefaults::class, EnsureUserArea::class])
    ->group(function () {
        Route::get('/', fn () => to_route('profile.edit'))->name('settings');

        Route::get('profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('profile', [ProfileController::class, 'update'])->name('profile.update');

        Route::get('appearance', [AppearanceController::class, 'edit'])->name('appearance.edit');
        Route::patch('appearance', [AppearanceController::class, 'update'])->name('appearance.update');

        Route::middleware('verified')->group(function () {
            Route::delete('profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

            Route::get('security', [SecurityController::class, 'edit'])
                ->middleware(RequirePassword::class)
                ->name('security.edit');

            Route::put('password', [SecurityController::class, 'update'])
                ->middleware('throttle:6,1')
                ->name('user-password.update');
        });
    });

// Former /settings/... URLs (bookmarks, passkey managers) are sent to the user's area.
Route::middleware('auth')->get('settings/{page?}', function (Request $request, ?string $page = null) {
    return redirect('/'.$request->user()->area().'/settings/'.($page ?? 'profile'));
})->where('page', 'profile|appearance|security');

Route::get('.well-known/passkey-endpoints', function () {
    return response()->json([
        'enroll' => url('settings/security'),
        'manage' => url('settings/security'),
    ]);
})->name('well-known.passkeys');
