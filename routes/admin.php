<?php

use App\Http\Controllers\Admin\MenuManagementController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {
    Route::resource('users', UserController::class)->except(['show']);

    // Gestión de acceso - Asignación de Menús
    Route::get('menus', [MenuManagementController::class, 'index'])->name('menus.index');
    Route::post('menus', [MenuManagementController::class, 'store'])->name('menus.store');
    Route::patch('menus/{menuItem}/toggle', [MenuManagementController::class, 'toggleActive'])->name('menus.toggle');
    Route::put('menus/{menuItem}/roles', [MenuManagementController::class, 'updateRoles'])->name('menus.update-roles');
    Route::put('menus/{menuItem}', [MenuManagementController::class, 'update'])->name('menus.update');
    Route::delete('menus/{menuItem}', [MenuManagementController::class, 'destroy'])->name('menus.destroy');
});
