<?php

use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('portal')->name('portal.')->group(function () {
    // Dashboard externo
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});
