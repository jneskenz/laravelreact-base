import type { SemanticColors, ThemeModeConfigs } from '@/hooks/use-appearance';

export type ThemeMode = 'light' | 'dark' | 'eye_care' | 'semi_dark';

export const THEME_MODES: { id: ThemeMode; label: string; emoji: string }[] = [
    { id: 'light', label: 'Claro', emoji: '☀️' },
    { id: 'dark', label: 'Oscuro', emoji: '🌙' },
    { id: 'eye_care', label: 'Descanso visual', emoji: '👓' },
    { id: 'semi_dark', label: 'Semi-oscuro', emoji: '🌌' },
];

export const RADIUS_OPTIONS = [
    { label: 'Rectas', value: '0rem' },
    { label: 'Sutiles', value: '0.375rem' },
    { label: 'Estándar', value: '0.625rem' },
    { label: 'Redondeadas', value: '1rem' },
    { label: 'Píldora', value: '1.5rem' },
];

export const SURFACE_KEYS: { key: keyof SemanticColors; label: string }[] = [
    { key: 'background', label: 'Fondo de página' },
    { key: 'card', label: 'Tarjetas' },
    { key: 'border', label: 'Bordes' },
    { key: 'foreground', label: 'Texto' },
];

export const SEMANTIC_KEYS: {
    key: keyof SemanticColors;
    label: string;
    hint: string;
}[] = [
    {
        key: 'primary',
        label: 'Principal',
        hint: 'Botones y enlaces principales',
    },
    {
        key: 'primary_foreground',
        label: 'Texto sobre principal',
        hint: 'Texto dentro de botones principales',
    },
    { key: 'secondary', label: 'Secundario', hint: 'Acciones de apoyo' },
    { key: 'success', label: 'Éxito', hint: 'Aprobado, completado' },
    { key: 'warning', label: 'Advertencia', hint: 'Pendiente, revisar' },
    { key: 'danger', label: 'Peligro', hint: 'Eliminar, errores' },
    { key: 'alert', label: 'Atención', hint: 'Urgente, llamados de atención' },
    { key: 'muted', label: 'Atenuado', hint: 'Textos secundarios' },
    { key: 'light', label: 'Claro', hint: 'Superficies claras' },
    { key: 'dark', label: 'Oscuro', hint: 'Contrastes profundos' },
];

export const FALLBACK_MODES: ThemeModeConfigs = {
    light: {
        background: '#ffffff',
        foreground: '#0f172a',
        card: '#ffffff',
        border: '#e2e8f0',
        primary: '#059669',
        primary_foreground: '#ffffff',
        secondary: '#64748b',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        alert: '#f97316',
        muted: '#64748b',
        light: '#ffffff',
        dark: '#0f172a',
    },
    dark: {
        background: '#09090b',
        foreground: '#f8fafc',
        card: '#18181b',
        border: '#27272a',
        primary: '#34d399',
        primary_foreground: '#09090b',
        secondary: '#94a3b8',
        success: '#34d399',
        warning: '#fbbf24',
        danger: '#f87171',
        alert: '#fb923c',
        muted: '#94a3b8',
        light: '#f8fafc',
        dark: '#020617',
    },
    eye_care: {
        background: '#fbf7ee',
        foreground: '#292524',
        card: '#f5f0e6',
        border: '#e7dfd1',
        primary: '#047857',
        primary_foreground: '#ffffff',
        secondary: '#78716c',
        success: '#059669',
        warning: '#d97706',
        danger: '#dc2626',
        alert: '#ea580c',
        muted: '#78716c',
        light: '#fefefe',
        dark: '#1c1917',
    },
    semi_dark: {
        background: '#0f172a',
        foreground: '#f1f5f9',
        card: '#1e293b',
        border: '#334155',
        primary: '#10b981',
        primary_foreground: '#0f172a',
        secondary: '#94a3b8',
        success: '#34d399',
        warning: '#fbbf24',
        danger: '#f87171',
        alert: '#fb923c',
        muted: '#64748b',
        light: '#f1f5f9',
        dark: '#0f172a',
    },
};

const HEX_PATTERN = /^#[0-9a-fA-F]{6}$/;

export function isHexColor(value: string | undefined): value is string {
    return !!value && HEX_PATTERN.test(value);
}

function toRgb(hex: string): [number, number, number] {
    return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [
        number,
        number,
        number,
    ];
}

function toHex([r, g, b]: [number, number, number]): string {
    return `#${[r, g, b].map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Blend a color with white by the given amount (0 to 1).
 */
export function lighten(hex: string, amount: number): string {
    return toHex(
        toRgb(hex).map((c) => c + (255 - c) * amount) as [
            number,
            number,
            number,
        ],
    );
}

/**
 * Blend a color with black by the given amount (0 to 1).
 */
export function darken(hex: string, amount: number): string {
    return toHex(
        toRgb(hex).map((c) => c * (1 - amount)) as [number, number, number],
    );
}

/**
 * Pick black or white text, whichever reads better on the given background.
 */
export function readableTextOn(hex: string): string {
    const [r, g, b] = toRgb(hex).map((c) => {
        const channel = c / 255;

        return channel <= 0.03928
            ? channel / 12.92
            : ((channel + 0.055) / 1.055) ** 2.4;
    });
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    return luminance > 0.4 ? '#0f172a' : '#ffffff';
}

/**
 * Apply a main brand color to every mode: as is on light backgrounds,
 * lightened on dark backgrounds so it keeps enough contrast.
 */
export function applyPrimaryToModes(
    modes: ThemeModeConfigs,
    primary: string,
): ThemeModeConfigs {
    const darkPrimary = lighten(primary, 0.25);
    const eyeCarePrimary = darken(primary, 0.1);

    return {
        ...modes,
        light: {
            ...modes.light,
            primary,
            primary_foreground: readableTextOn(primary),
        },
        dark: {
            ...modes.dark,
            primary: darkPrimary,
            primary_foreground: readableTextOn(darkPrimary),
        },
        eye_care: {
            ...modes.eye_care,
            primary: eyeCarePrimary,
            primary_foreground: readableTextOn(eyeCarePrimary),
        },
        semi_dark: {
            ...modes.semi_dark,
            primary: darkPrimary,
            primary_foreground: readableTextOn(darkPrimary),
        },
    };
}
