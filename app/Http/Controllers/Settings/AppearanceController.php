<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateAppearanceRequest;
use App\Models\Theme;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AppearanceController extends Controller
{
    /**
     * Show the user appearance settings page.
     */
    public function edit(Request $request): Response
    {
        $themes = Theme::query()
            ->orderByDesc('is_default')
            ->orderBy('name')
            ->get();

        $defaultTheme = Theme::query()->where('is_default', true)->first()
            ?? Theme::query()->first();

        return Inertia::render('settings/appearance', [
            'themes' => $themes,
            'defaultThemeId' => $defaultTheme?->id,
            'canManageThemes' => $request->user()->can('configuracion.editar'),
        ]);
    }

    /**
     * Update user appearance preferences in database.
     */
    public function update(UpdateAppearanceRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        $currentSettings = $user->theme_settings ?? [];
        $newSettings = array_merge($currentSettings, array_filter($validated, fn ($val) => $val !== null));

        if (! empty($newSettings['active_theme_id'])) {
            $theme = Theme::find($newSettings['active_theme_id']);
            if ($theme) {
                $newSettings['active_theme'] = [
                    'id' => $theme->id,
                    'name' => $theme->name,
                    'slug' => $theme->slug,
                    'color' => $theme->color,
                    'radius' => $theme->radius,
                    'modes_config' => $theme->modes_config,
                ];
            }
        }

        $user->update([
            'theme_settings' => $newSettings,
        ]);

        return redirect()
            ->back()
            ->with('success', 'Preferencias de apariencia actualizadas exitosamente.');
    }
}
