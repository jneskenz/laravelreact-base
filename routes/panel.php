<?php

use App\Http\Controllers\Admin\MenuManagementController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('panel')->name('panel.')->group(function () {
    // Dashboard interno
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Gestión de acceso - Usuarios
    Route::resource('usuarios', UserController::class)->except(['show'])->parameters(['usuarios' => 'user'])->names('usuarios');
    Route::resource('users', UserController::class)->except(['show'])->parameters(['users' => 'user'])->names('users');

    // Gestión de acceso - Asignación de Menús
    Route::get('menus', [MenuManagementController::class, 'index'])->name('menus.index');
    Route::post('menus', [MenuManagementController::class, 'store'])->name('menus.store');
    Route::patch('menus/{menuItem}/toggle', [MenuManagementController::class, 'toggleActive'])->name('menus.toggle');
    Route::put('menus/{menuItem}/roles', [MenuManagementController::class, 'updateRoles'])->name('menus.update-roles');
    Route::put('menus/{menuItem}', [MenuManagementController::class, 'update'])->name('menus.update');
    Route::delete('menus/{menuItem}', [MenuManagementController::class, 'destroy'])->name('menus.destroy');

    // Contenidos Web (CMS)
    Route::prefix('contenidos')->name('contenidos.')->group(function () {
        Route::inertia('institucional', 'cms/institucional')->name('institucional');
        Route::inertia('proyectos', 'cms/proyectos')->name('proyectos');
        Route::inertia('reconocimientos', 'cms/reconocimientos')->name('reconocimientos');
    });
});
