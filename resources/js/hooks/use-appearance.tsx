import { router } from '@inertiajs/react';
import { useSyncExternalStore } from 'react';
import { update as updateAppearanceRoute } from '@/routes/appearance';

export type AppearanceMode = 'light' | 'dark' | 'system' | 'eye-care' | 'semi-dark' | 'custom';
export type Appearance = AppearanceMode;
export type FontSize = 'compact' | 'normal' | 'large';
export type LayoutType = 'sidebar' | 'header';

export interface SemanticColors {
    background?: string;
    foreground?: string;
    card?: string;
    border?: string;
    primary: string;
    primary_foreground?: string;
    secondary?: string;
    success?: string;
    warning?: string;
    danger?: string;
    alert?: string;
    muted?: string;
    light?: string;
    dark?: string;
}

export interface ThemeModeConfigs {
    light: SemanticColors;
    dark: SemanticColors;
    eye_care: SemanticColors;
    semi_dark: SemanticColors;
    custom?: SemanticColors;
}

export interface DbTheme {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_system?: boolean;
    is_default?: boolean;
    color: string;
    radius: string;
    modes_config: ThemeModeConfigs;
}

export interface UserThemeSettings {
    appearance?: AppearanceMode;
    layout?: LayoutType;
    font_size?: FontSize;
    active_theme_id?: number;
    active_theme?: DbTheme;
    custom_overrides?: Partial<SemanticColors>;
}

const FONT_SIZE_MAP: Record<FontSize, string> = {
    compact: '14px',
    normal: '16px',
    large: '18px',
};

function getStoredString(key: string, fallback: string): string {
    if (typeof window === 'undefined') return fallback;
    try {
        return localStorage.getItem(key) || fallback;
    } catch {
        return fallback;
    }
}

function getStoredJson<T>(key: string, fallback: T | null): T | null {
    if (typeof window === 'undefined') return fallback;
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

// Global in-memory state initialized directly from localStorage
let globalAppearance: AppearanceMode = (getStoredString('appearance_mode', 'system') as AppearanceMode);
let globalFontSize: FontSize = (getStoredString('appearance_font_size', 'normal') as FontSize);
let globalLayoutType: LayoutType = (getStoredString('appearance_layout', 'sidebar') as LayoutType);
let globalActiveTheme: DbTheme | null = getStoredJson<DbTheme>('appearance_active_theme', null);
let globalActiveThemeId: number | null = globalActiveTheme?.id || null;
let globalCustomOverrides: Partial<SemanticColors> | null = null;
let globalDefaultTheme: DbTheme | null = null;

/**
 * The theme the user picked, or the organization's default theme when they never picked one.
 */
function effectiveTheme(): DbTheme | null {
    return globalActiveTheme ?? globalDefaultTheme;
}

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());
const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

function getSystemMode(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveEffectiveMode(appearance: AppearanceMode): 'light' | 'dark' | 'eye-care' | 'semi-dark' | 'custom' {
    if (appearance === 'system') {
        return getSystemMode();
    }
    return appearance;
}

const THEME_CSS_VARIABLES = [
    '--radius', '--background', '--foreground', '--card', '--border', '--primary', '--ring',
    '--sidebar-primary', '--primary-foreground', '--sidebar-primary-foreground', '--secondary',
    '--success', '--warning', '--danger', '--destructive', '--alert', '--muted', '--light', '--dark',
];

/**
 * The personalization (mode, font size and theme colors) only applies inside the
 * internal panel (/panel) and the external portal (/portal). Public and auth pages
 * always use the base styles from app.css.
 */
export function isThemedPath(pathname: string = window.location.pathname): boolean {
    return /^\/(panel|portal)(\/|$)/.test(pathname);
}

function resetThemeOnDom(root: HTMLElement) {
    root.classList.remove('dark', 'eye-care', 'semi-dark', 'custom-mode');
    root.style.colorScheme = '';
    root.style.fontSize = '';
    THEME_CSS_VARIABLES.forEach((variable) => root.style.removeProperty(variable));
}

export function applyThemeToDom(
    appearance: AppearanceMode,
    fontSize: FontSize,
    theme?: DbTheme | null,
    customOverrides?: Partial<SemanticColors> | null
) {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    if (!isThemedPath()) {
        resetThemeOnDom(root);

        return;
    }
    const effective = resolveEffectiveMode(appearance);

    // 1. Mode Classes on <html>
    root.classList.remove('dark', 'eye-care', 'semi-dark', 'custom-mode');
    if (effective === 'dark') root.classList.add('dark');
    else if (effective === 'eye-care') root.classList.add('eye-care');
    else if (effective === 'semi-dark') root.classList.add('semi-dark');
    else if (effective === 'custom') root.classList.add('custom-mode');

    root.style.colorScheme = (effective === 'dark' || effective === 'semi-dark') ? 'dark' : 'light';

    // 2. Font Size
    root.style.fontSize = FONT_SIZE_MAP[fontSize] || '16px';

    // 3. Border Radius
    if (theme?.radius) {
        root.style.setProperty('--radius', theme.radius);
    }

    // 4. Semantic Colors from active Theme for the effective mode
    if (theme?.modes_config) {
        const modeKey = effective === 'eye-care' ? 'eye_care' : effective === 'semi-dark' ? 'semi_dark' : effective;
        const config = theme.modes_config[modeKey as keyof ThemeModeConfigs] || theme.modes_config.light;

        if (config) {
            const merged = { ...config, ...(customOverrides || {}) };

            if (merged.background) root.style.setProperty('--background', merged.background);
            if (merged.foreground) root.style.setProperty('--foreground', merged.foreground);
            if (merged.card) root.style.setProperty('--card', merged.card);
            if (merged.border) root.style.setProperty('--border', merged.border);
            if (merged.primary) {
                root.style.setProperty('--primary', merged.primary);
                root.style.setProperty('--ring', merged.primary);
                root.style.setProperty('--sidebar-primary', merged.primary);
            }
            if (merged.primary_foreground) {
                root.style.setProperty('--primary-foreground', merged.primary_foreground);
                root.style.setProperty('--sidebar-primary-foreground', merged.primary_foreground);
            }
            if (merged.secondary) root.style.setProperty('--secondary', merged.secondary);
            if (merged.success) root.style.setProperty('--success', merged.success);
            if (merged.warning) root.style.setProperty('--warning', merged.warning);
            if (merged.danger) {
                root.style.setProperty('--danger', merged.danger);
                root.style.setProperty('--destructive', merged.danger);
            }
            if (merged.alert) root.style.setProperty('--alert', merged.alert);
            if (merged.muted) root.style.setProperty('--muted', merged.muted);
            if (merged.light) root.style.setProperty('--light', merged.light);
            if (merged.dark) root.style.setProperty('--dark', merged.dark);
        }
    }
}

export function initializeTheme() {
    if (typeof window === 'undefined') return;

    try {
        globalAppearance = (localStorage.getItem('appearance_mode') as AppearanceMode) || 'system';
        globalFontSize = (localStorage.getItem('appearance_font_size') as FontSize) || 'normal';
        globalLayoutType = (localStorage.getItem('appearance_layout') as LayoutType) || 'sidebar';
        const rawTheme = localStorage.getItem('appearance_active_theme');
        globalActiveTheme = rawTheme ? JSON.parse(rawTheme) : null;
        if (globalActiveTheme?.id) {
            globalActiveThemeId = globalActiveTheme.id;
        }

        applyThemeToDom(globalAppearance, globalFontSize, effectiveTheme());

        // Re-evaluate on every Inertia navigation: entering /panel or /portal applies the theme, leaving it resets it
        router.on('navigate', () => {
            applyThemeToDom(globalAppearance, globalFontSize, effectiveTheme(), globalCustomOverrides);
        });

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if (globalAppearance === 'system') {
                applyThemeToDom('system', globalFontSize, effectiveTheme());
            }
        });
    } catch {
        // Fallback safely
    }
}

/**
 * Synchronize theme settings from database into client localStorage ONLY on login.
 */
export function applyThemeSettingsToStorage(settings?: UserThemeSettings | null) {
    if (typeof window === 'undefined' || !settings) return;

    try {
        if (settings.appearance) {
            globalAppearance = settings.appearance;
            localStorage.setItem('appearance_mode', globalAppearance);
        }
        if (settings.font_size) {
            globalFontSize = settings.font_size;
            localStorage.setItem('appearance_font_size', globalFontSize);
        }
        if (settings.layout) {
            globalLayoutType = settings.layout;
            localStorage.setItem('appearance_layout', globalLayoutType);
        }
        if (settings.active_theme_id !== undefined) {
            globalActiveThemeId = settings.active_theme_id;
        }
        if (settings.active_theme) {
            globalActiveTheme = settings.active_theme;
            localStorage.setItem('appearance_active_theme', JSON.stringify(globalActiveTheme));
        }
        if (settings.custom_overrides) {
            globalCustomOverrides = settings.custom_overrides;
        }

        applyThemeToDom(globalAppearance, globalFontSize, effectiveTheme(), globalCustomOverrides);
        notify();
    } catch {
        // Safe fallback
    }
}

/**
 * Register the organization's default theme (shared by the server) and apply it
 * when the user has not selected a theme of their own.
 */
export function applyDefaultTheme(theme?: DbTheme | null) {
    if (typeof window === 'undefined' || !theme) {
        return;
    }

    globalDefaultTheme = theme;

    if (!globalActiveTheme) {
        applyThemeToDom(globalAppearance, globalFontSize, effectiveTheme(), globalCustomOverrides);
    }
}

export function useAppearance() {
    const appearance = useSyncExternalStore(
        subscribe,
        () => globalAppearance,
        () => 'system' as AppearanceMode
    );

    const fontSize = useSyncExternalStore(
        subscribe,
        () => globalFontSize,
        () => 'normal' as FontSize
    );

    const layoutType = useSyncExternalStore(
        subscribe,
        () => globalLayoutType,
        () => 'sidebar' as LayoutType
    );

    const activeThemeId = useSyncExternalStore(
        subscribe,
        () => globalActiveThemeId,
        () => null as number | null
    );

    function syncToDatabase(payload: Partial<UserThemeSettings>) {
        router.patch(
            updateAppearanceRoute.url(),
            {
                appearance: globalAppearance,
                font_size: globalFontSize,
                layout: globalLayoutType,
                active_theme_id: globalActiveThemeId,
                ...payload,
            } as any,
            {
                preserveScroll: true,
                preserveState: true,
                only: ['auth'],
            }
        );
    }

    function updateAppearance(newMode: AppearanceMode) {
        globalAppearance = newMode;
        if (typeof window !== 'undefined') {
            localStorage.setItem('appearance_mode', newMode);
        }
        applyThemeToDom(globalAppearance, globalFontSize, effectiveTheme(), globalCustomOverrides);
        notify();
        syncToDatabase({ appearance: newMode });
    }

    function updateFontSize(newSize: FontSize) {
        globalFontSize = newSize;
        if (typeof window !== 'undefined') {
            localStorage.setItem('appearance_font_size', newSize);
        }
        applyThemeToDom(globalAppearance, globalFontSize, effectiveTheme(), globalCustomOverrides);
        notify();
        syncToDatabase({ font_size: newSize });
    }

    function updateLayout(newLayout: LayoutType) {
        globalLayoutType = newLayout;
        if (typeof window !== 'undefined') {
            localStorage.setItem('appearance_layout', newLayout);
        }
        notify();
        syncToDatabase({ layout: newLayout });
    }

    function selectTheme(theme: DbTheme) {
        globalActiveThemeId = theme.id;
        globalActiveTheme = theme;
        if (typeof window !== 'undefined') {
            localStorage.setItem('appearance_active_theme', JSON.stringify(theme));
        }

        applyThemeToDom(globalAppearance, globalFontSize, effectiveTheme(), globalCustomOverrides);
        notify();
        syncToDatabase({ active_theme_id: theme.id });
    }

    const effectiveMode = resolveEffectiveMode(appearance);
    const resolvedAppearance: 'light' | 'dark' = (effectiveMode === 'dark' || effectiveMode === 'semi-dark') ? 'dark' : 'light';

    return {
        appearance,
        effectiveMode,
        resolvedAppearance,
        fontSize,
        layoutType,
        activeThemeId,
        updateAppearance,
        updateFontSize,
        updateLayout,
        selectTheme,
    };
}
