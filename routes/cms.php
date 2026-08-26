<?php

use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('cms')->name('cms.')->group(function () {
    Route::inertia('institucional', 'cms/institucional')->name('institucional');
    Route::inertia('proyectos', 'cms/proyectos')->name('proyectos');
    Route::inertia('reconocimientos', 'cms/reconocimientos')->name('reconocimientos');
});
