<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreThemeRequest;
use App\Http\Requests\Admin\UpdateThemeRequest;
use App\Models\Theme;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ThemeManagementController extends Controller
{
    /**
     * Display a listing of institutional and custom themes.
     */
    public function index(): Response
    {
        abort_unless(auth()->user()?->can('configuracion.editar'), 403);

        $themes = Theme::query()
            ->with('creator:id,name,email')
            ->orderByDesc('is_default')
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/configuracion/personalizacion/index', [
            'themes' => $themes,
        ]);
    }

    /**
     * Show the form for creating a new theme.
     */
    public function create(): Response
    {
        abort_unless(auth()->user()?->can('configuracion.editar'), 403);

        $defaultTheme = Theme::query()->where('is_default', true)->first()
            ?? Theme::query()->first();

        return Inertia::render('admin/configuracion/personalizacion/create', [
            'baseTheme' => $defaultTheme,
        ]);
    }

    /**
     * Store a newly created theme in storage.
     */
    public function store(StoreThemeRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $slug = Str::slug($validated['name']);

        // Ensure unique slug
        $originalSlug = $slug;
        $count = 1;
        while (Theme::query()->where('slug', $slug)->exists()) {
            $slug = "{$originalSlug}-{$count}";
            $count++;
        }

        $isDefault = $validated['is_default'] ?? false;
        if ($isDefault) {
            Theme::query()->where('is_default', true)->update(['is_default' => false]);
        }

        $theme = Theme::create([
            'name' => $validated['name'],
            'slug' => $slug,
            'description' => $validated['description'] ?? null,
            'color' => $validated['color'],
            'radius' => $validated['radius'],
            'modes_config' => $validated['modes_config'],
            'is_system' => false,
            'is_default' => $isDefault,
            'created_by' => $request->user()?->id,
        ]);

        return redirect()
            ->route('panel.configuracion.personalizacion.index')
            ->with('success', "Tema '{$theme->name}' creado exitosamente.");
    }

    /**
     * Show the form for editing the specified theme.
     */
    public function edit(Theme $theme): Response
    {
        abort_unless(auth()->user()?->can('configuracion.editar'), 403);

        return Inertia::render('admin/configuracion/personalizacion/edit', [
            'theme' => $theme,
        ]);
    }

    /**
     * Update the specified theme in storage.
     */
    public function update(UpdateThemeRequest $request, Theme $theme): RedirectResponse
    {
        $validated = $request->validated();

        $isDefault = $validated['is_default'] ?? $theme->is_default;
        if ($isDefault && ! $theme->is_default) {
            Theme::query()->where('is_default', true)->update(['is_default' => false]);
        }

        $theme->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'color' => $validated['color'],
            'radius' => $validated['radius'],
            'modes_config' => $validated['modes_config'],
            'is_default' => $isDefault,
        ]);

        return redirect()
            ->route('panel.configuracion.personalizacion.index')
            ->with('success', "Tema '{$theme->name}' actualizado correctamente.");
    }

    /**
     * Set a theme as the organizational default.
     */
    public function setDefault(Theme $theme): RedirectResponse
    {
        abort_unless(auth()->user()?->can('configuracion.editar'), 403);

        Theme::query()->where('is_default', true)->update(['is_default' => false]);
        $theme->update(['is_default' => true]);

        return redirect()
            ->back()
            ->with('success', "El tema '{$theme->name}' ha sido establecido como el tema por defecto.");
    }

    /**
     * Remove the specified custom theme from storage.
     */
    public function destroy(Theme $theme): RedirectResponse
    {
        abort_unless(auth()->user()?->can('configuracion.editar'), 403);

        if ($theme->is_system) {
            return redirect()
                ->back()
                ->with('error', 'Los temas predeterminados del sistema no pueden ser eliminados.');
        }

        if ($theme->is_default) {
            return redirect()
                ->back()
                ->with('error', 'No se puede eliminar el tema que está actualmente configurado por defecto.');
        }

        $name = $theme->name;
        $theme->delete();

        return redirect()
            ->route('panel.configuracion.personalizacion.index')
            ->with('success', "Tema '{$name}' eliminado correctamente.");
    }
}
