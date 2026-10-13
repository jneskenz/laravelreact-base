<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreThemeRequest;
use App\Http\Requests\Admin\UpdateThemeRequest;
use App\Models\Theme;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
            ->orderByDesc('is_system')
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/configuracion/personalizacion/index', [
            'themes' => $themes,
        ]);
    }

    /**
     * Show the form for creating a new theme, optionally based on an existing one.
     */
    public function create(Request $request): Response
    {
        abort_unless(auth()->user()?->can('configuracion.editar'), 403);

        $baseTheme = Theme::query()->find($request->integer('base'))
            ?? Theme::default();

        return Inertia::render('admin/configuracion/personalizacion/create', [
            'baseTheme' => $baseTheme,
        ]);
    }

    /**
     * Store a newly created theme in storage.
     */
    public function store(StoreThemeRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $theme = DB::transaction(function () use ($validated, $request): Theme {
            $isDefault = (bool) ($validated['is_default'] ?? false);

            if ($isDefault) {
                Theme::query()->where('is_default', true)->update(['is_default' => false]);
            }

            return Theme::create([
                'name' => $validated['name'],
                'slug' => $this->uniqueSlug($validated['name']),
                'description' => $validated['description'] ?? null,
                'color' => $validated['color'],
                'radius' => $validated['radius'],
                'modes_config' => $validated['modes_config'],
                'is_system' => false,
                'is_default' => $isDefault,
                'created_by' => $request->user()?->id,
            ]);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => "Tema '{$theme->name}' creado correctamente."]);

        return to_route('panel.configuracion.personalizacion.index');
    }

    /**
     * Show the form for editing the specified theme.
     */
    public function edit(Theme $theme): Response
    {
        abort_unless(auth()->user()?->can('configuracion.editar'), 403);

        return Inertia::render('admin/configuracion/personalizacion/edit', [
            'theme' => $theme,
            'usersCount' => User::query()->where('theme_settings->active_theme_id', $theme->id)->count(),
        ]);
    }

    /**
     * Update the specified theme in storage.
     *
     * The default theme cannot be unmarked from here: another theme must be
     * made the default instead, so the organization always has one.
     */
    public function update(UpdateThemeRequest $request, Theme $theme): RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $theme): void {
            $isDefault = $theme->is_default || (bool) ($validated['is_default'] ?? false);

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

            $this->refreshUsersSnapshot($theme);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => "Tema '{$theme->name}' actualizado correctamente."]);

        return to_route('panel.configuracion.personalizacion.index');
    }

    /**
     * Set a theme as the organizational default.
     */
    public function setDefault(Theme $theme): RedirectResponse
    {
        abort_unless(auth()->user()?->can('configuracion.editar'), 403);

        DB::transaction(function () use ($theme): void {
            Theme::query()->where('is_default', true)->update(['is_default' => false]);
            $theme->update(['is_default' => true]);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => "'{$theme->name}' es ahora el tema por defecto."]);

        return back();
    }

    /**
     * Remove the specified custom theme from storage.
     */
    public function destroy(Theme $theme): RedirectResponse
    {
        abort_unless(auth()->user()?->can('configuracion.editar'), 403);

        if ($theme->is_system) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Los temas del sistema no se pueden eliminar.']);

            return back();
        }

        if ($theme->is_default) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'No se puede eliminar el tema por defecto. Elige otro tema por defecto primero.']);

            return back();
        }

        $name = $theme->name;

        DB::transaction(function () use ($theme): void {
            $this->forgetThemeForUsers($theme);
            $theme->delete();
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => "Tema '{$name}' eliminado correctamente."]);

        return to_route('panel.configuracion.personalizacion.index');
    }

    /**
     * Build a slug from the name that no other theme is using.
     */
    private function uniqueSlug(string $name): string
    {
        $baseSlug = Str::slug($name);
        $slug = $baseSlug;
        $suffix = 1;

        while (Theme::query()->where('slug', $slug)->exists()) {
            $slug = "{$baseSlug}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }

    /**
     * Update the copy of the theme stored in the settings of users who selected it.
     */
    private function refreshUsersSnapshot(Theme $theme): void
    {
        User::query()
            ->where('theme_settings->active_theme_id', $theme->id)
            ->each(function (User $user) use ($theme): void {
                $settings = $user->theme_settings ?? [];
                $settings['active_theme'] = $theme->only(['id', 'name', 'slug', 'color', 'radius', 'modes_config']);
                $user->update(['theme_settings' => $settings]);
            });
    }

    /**
     * Remove a deleted theme from the settings of users who selected it, so they fall back to the default theme.
     */
    private function forgetThemeForUsers(Theme $theme): void
    {
        User::query()
            ->where('theme_settings->active_theme_id', $theme->id)
            ->each(function (User $user): void {
                $settings = $user->theme_settings ?? [];
                unset($settings['active_theme_id'], $settings['active_theme']);
                $user->update(['theme_settings' => $settings]);
            });
    }
}
