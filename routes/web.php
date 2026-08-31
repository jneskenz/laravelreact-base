<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->get('/dashboard', function (Request $request) {
    if ($request->user()?->tipo_usuario === 'interno') {
        return redirect()->route('panel.dashboard');
    }

    return redirect()->route('portal.dashboard');
})->name('dashboard');

require __DIR__.'/settings.php';
require __DIR__.'/panel.php';
require __DIR__.'/portal.php';
