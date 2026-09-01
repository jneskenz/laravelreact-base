import { useState } from 'react';
import { router, Link } from '@inertiajs/react';
import {
    Sun,
    Moon,
    Save,
    ArrowLeft,
    Shield,
    CheckCircle2,
    CircleDot,
    Eye,
    Sparkles,
    Wand2,
} from 'lucide-react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { DbTheme, SemanticColors, ThemeModeConfigs } from '@/hooks/use-appearance';

const RADIUS_OPTIONS = [
    { label: 'Recto', value: '0rem', desc: '0px' },
    { label: 'Sutil', value: '0.375rem', desc: '6px' },
    { label: 'Estándar', value: '0.625rem', desc: '10px' },
    { label: 'Redondeado', value: '1rem', desc: '16px' },
    { label: 'Píldora', value: '1.5rem', desc: '24px' },
];

const SEMANTIC_KEYS: { key: keyof SemanticColors; label: string; desc: string }[] = [
    { key: 'primary', label: 'Primary (Marca)', desc: 'Botones y acciones primarias' },
    { key: 'secondary', label: 'Secondary (Neutro)', desc: 'Acciones de soporte y badges' },
    { key: 'success', label: 'Success (Éxito)', desc: 'Aprobaciones y estados verificados' },
    { key: 'warning', label: 'Warning (Advertencia)', desc: 'Pendientes y alertas preventivas' },
    { key: 'danger', label: 'Danger (Peligro)', desc: 'Eliminaciones y errores críticos' },
    { key: 'alert', label: 'Alert (Atención)', desc: 'Llamados de atención urgente' },
    { key: 'muted', label: 'Muted (Atenuado)', desc: 'Textos secundarios y deshabilitados' },
    { key: 'light', label: 'Light (Claro)', desc: 'Superficies y fondos claros' },
    { key: 'dark', label: 'Dark (Oscuro)', desc: 'Contrastes y fondos profundos' },
];

interface Props {
    theme?: DbTheme;
    isEditing?: boolean;
}

export function ThemeDesignerForm({ theme, isEditing = false }: Props) {
    const [name, setName] = useState(theme?.name || '');
    const [description, setDescription] = useState(theme?.description || '');
    const [color, setColor] = useState(theme?.color || '#059669');
    const [radius, setRadius] = useState(theme?.radius || '0.625rem');
    const [isDefault] = useState(theme?.is_default || false);

    // Modes Config
    const [activeTab, setActiveTab] = useState<'light' | 'dark' | 'eye_care' | 'semi_dark'>('light');
    const [previewMode, setPreviewMode] = useState<'light' | 'dark' | 'eye_care' | 'semi_dark'>('light');

    const [modesConfig, setModesConfig] = useState<ThemeModeConfigs>(() => {
        if (theme?.modes_config) return theme.modes_config;
        return {
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
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    function updateColorInMode(mode: 'light' | 'dark' | 'eye_care' | 'semi_dark', key: keyof SemanticColors, hex: string) {
        setModesConfig((prev) => ({
            ...prev,
            [mode]: {
                ...prev[mode],
                [key]: hex,
            },
        }));

        if (mode === 'light' && key === 'primary') {
            setColor(hex);
        }
    }

    function autoCalibrateFromLight() {
        const lightPrimary = modesConfig.light.primary || color;

        setModesConfig((prev) => ({
            ...prev,
            dark: {
                ...prev.dark,
                primary: lightPrimary,
            },
            eye_care: {
                ...prev.eye_care,
                primary: lightPrimary,
            },
            semi_dark: {
                ...prev.semi_dark,
                primary: lightPrimary,
            },
        }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsSubmitting(true);

        const payload: Record<string, any> = {
            name,
            description,
            color,
            radius,
            is_default: isDefault,
            modes_config: modesConfig,
        };

        if (isEditing && theme) {
            router.put(`/panel/configuracion/personalizacion/${theme.id}`, payload, {
                onFinish: () => setIsSubmitting(false),
            });
        } else {
            router.post('/panel/configuracion/personalizacion', payload, {
                onFinish: () => setIsSubmitting(false),
            });
        }
    }

    // Colors for the active preview mode
    const previewColors = modesConfig[previewMode];
    const currentModeConfig = modesConfig[activeTab];

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Link
                        href="/panel/configuracion/personalizacion"
                        className="text-muted-foreground hover:text-foreground transition-colors p-1"
                    >
                        <ArrowLeft className="size-4" />
                    </Link>
                    <Heading
                        title={isEditing ? `Editar Tema: ${theme?.name}` : 'Crear Nuevo Tema Institucional'}
                        description="Calibra los 9 colores semánticos para cada modo visual y previsualiza el resultado en vivo."
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild size="sm">
                        <Link href="/panel/configuracion/personalizacion">
                            Cancelar
                        </Link>
                    </Button>
                    <Button type="submit" disabled={isSubmitting} size="sm" className="gap-2">
                        <Save className="size-4" />
                        {isEditing ? 'Guardar Cambios' : 'Crear Tema'}
                    </Button>
                </div>
            </div>

            {/* Layout Principal: 7 cols Formulario + 5 cols Live Preview */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Panel de Configuración (7 cols) */}
                <div className="xl:col-span-7 space-y-6">
                    {/* 1. Datos Generales */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold">1. Información del Tema</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="theme-name" className="text-xs font-semibold">
                                        Nombre del Tema
                                    </Label>
                                    <Input
                                        id="theme-name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Ej: Verde Esperanza CONAPA"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="theme-color" className="text-xs font-semibold">
                                        Color Representativo (Badge)
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={color}
                                            onChange={(e) => setColor(e.target.value)}
                                            className="size-9 rounded border cursor-pointer p-0.5"
                                        />
                                        <Input
                                            id="theme-color"
                                            value={color}
                                            onChange={(e) => setColor(e.target.value)}
                                            className="font-mono text-xs uppercase"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="theme-desc" className="text-xs font-semibold">
                                    Descripción / Propósito
                                </Label>
                                <Input
                                    id="theme-desc"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Ej: Paleta oficial para rescates y bienestar animal..."
                                />
                            </div>

                            {/* Radio de Esquinas */}
                            <div className="space-y-2 pt-2 border-t">
                                <Label className="text-xs font-semibold">Radio de Esquinas (Border Radius)</Label>
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                    {RADIUS_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setRadius(opt.value)}
                                            className={`p-2 rounded-lg border text-center transition-all ${
                                                radius === opt.value
                                                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                                                    : 'bg-card text-muted-foreground hover:text-foreground'
                                            }`}
                                        >
                                            <div className="text-xs">{opt.label}</div>
                                            <div className="text-[10px] opacity-70">{opt.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 2. Colores Semánticos por Modo Visual */}
                    <Card>
                        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                                <CardTitle className="text-sm font-semibold">
                                    2. Colores Semánticos por Modo Visual
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Ajusta los 9 colores semánticos y superficies para cada modo visual.
                                </CardDescription>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={autoCalibrateFromLight}
                                className="text-xs gap-1.5 shrink-0"
                            >
                                <Wand2 className="size-3.5 text-primary" />
                                Calibrar modos desde Modo Claro
                            </Button>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {/* Selector de Pestañas de Modos */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-lg bg-muted/50 border">
                                {[
                                    { id: 'light' as const, label: '☀️ Claro', icon: Sun },
                                    { id: 'dark' as const, label: '🌙 Oscuro', icon: Moon },
                                    { id: 'eye_care' as const, label: '👓 Protección', icon: Eye },
                                    { id: 'semi_dark' as const, label: '🌌 Semi-Dark', icon: Sparkles },
                                ].map((tab) => {
                                    const isSelected = activeTab === tab.id;
                                    const Icon = tab.icon;

                                    return (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            onClick={() => {
                                                setActiveTab(tab.id);
                                                setPreviewMode(tab.id);
                                            }}
                                            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold transition-all ${
                                                isSelected
                                                    ? 'bg-card text-foreground shadow-xs'
                                                    : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                        >
                                            <Icon className="size-3.5" />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Superficies (Background, Card, Border, Foreground) */}
                            <div className="p-3 rounded-lg bg-muted/40 border space-y-2">
                                <div className="text-xs font-semibold text-foreground">
                                    Superficies y Fondos ({activeTab === 'light' ? 'Modo Claro' : activeTab === 'dark' ? 'Modo Oscuro' : activeTab === 'eye_care' ? 'Protección Vista' : 'Semi-Dark'})
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {[
                                        { key: 'background' as const, label: 'Fondo' },
                                        { key: 'card' as const, label: 'Tarjeta' },
                                        { key: 'border' as const, label: 'Borde' },
                                        { key: 'foreground' as const, label: 'Texto' },
                                    ].map((item) => (
                                        <div key={item.key} className="space-y-1">
                                            <Label className="text-[10px] text-muted-foreground">
                                                {item.label}
                                            </Label>
                                            <div className="flex items-center gap-1.5">
                                                <input
                                                    type="color"
                                                    value={currentModeConfig[item.key] || '#ffffff'}
                                                    onChange={(e) => updateColorInMode(activeTab, item.key, e.target.value)}
                                                    className="size-7 rounded border cursor-pointer p-0"
                                                />
                                                <Input
                                                    value={currentModeConfig[item.key] || ''}
                                                    onChange={(e) => updateColorInMode(activeTab, item.key, e.target.value)}
                                                    className="h-7 text-[11px] font-mono px-1 uppercase"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Los 9 Colores Semánticos */}
                            <div className="space-y-2">
                                <div className="text-xs font-semibold text-foreground">
                                    Los 9 Colores Semánticos
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {SEMANTIC_KEYS.map(({ key, label, desc }) => (
                                        <div key={key} className="p-2.5 rounded-lg border bg-card/60 space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-xs font-semibold">{label}</Label>
                                                <span
                                                    className="size-3.5 rounded-full border shadow-2xs"
                                                    style={{ backgroundColor: currentModeConfig[key] || '#000000' }}
                                                />
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <input
                                                    type="color"
                                                    value={currentModeConfig[key] || '#000000'}
                                                    onChange={(e) => updateColorInMode(activeTab, key, e.target.value)}
                                                    className="size-8 rounded border cursor-pointer p-0"
                                                />
                                                <Input
                                                    value={currentModeConfig[key] || ''}
                                                    onChange={(e) => updateColorInMode(activeTab, key, e.target.value)}
                                                    className="h-8 text-xs font-mono px-2 uppercase"
                                                />
                                            </div>
                                            <p className="text-[10px] text-muted-foreground line-clamp-1">{desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Panel de Live Preview Simulator (5 cols) */}
                <div className="xl:col-span-5 space-y-4">
                    <div className="sticky top-6 space-y-3">
                        <Card className="shadow-lg border-primary/40 overflow-hidden">
                            <CardHeader className="pb-3 border-b bg-muted/30">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CircleDot className="size-4 text-primary animate-pulse" />
                                        <CardTitle className="text-sm font-bold">Simulador en Vivo</CardTitle>
                                    </div>
                                    <Badge variant="default" className="text-[10px] px-2 py-0">
                                        {name || 'Nuevo Tema'}
                                    </Badge>
                                </div>
                                <CardDescription className="text-xs">
                                    Previsualiza cómo interactúan los colores en todos los modos.
                                </CardDescription>

                                {/* Selector de Modo de Previsualización */}
                                <div className="flex items-center gap-1 pt-2">
                                    <span className="text-[11px] text-muted-foreground mr-1">Simular:</span>
                                    {[
                                        { id: 'light' as const, label: '☀️ Claro' },
                                        { id: 'dark' as const, label: '🌙 Oscuro' },
                                        { id: 'eye_care' as const, label: '👓 Vista' },
                                        { id: 'semi_dark' as const, label: '🌌 Dim' },
                                    ].map((m) => (
                                        <button
                                            key={m.id}
                                            type="button"
                                            onClick={() => setPreviewMode(m.id)}
                                            className={`text-[10px] px-2 py-1 rounded transition-colors ${
                                                previewMode === m.id
                                                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                                                    : 'bg-muted/60 text-muted-foreground hover:text-foreground'
                                            }`}
                                        >
                                            {m.label}
                                        </button>
                                    ))}
                                </div>
                            </CardHeader>

                            {/* Canvas del Simulador con estilos inline del modo seleccionado */}
                            <CardContent
                                className="p-4 space-y-4 transition-colors"
                                style={{
                                    backgroundColor: previewColors?.background || '#ffffff',
                                    color: previewColors?.foreground || '#0f172a',
                                    borderRadius: radius,
                                }}
                            >
                                {/* Mock Header */}
                                <div
                                    className="flex items-center justify-between p-2.5 rounded border"
                                    style={{
                                        backgroundColor: previewColors?.card || '#ffffff',
                                        borderColor: previewColors?.border || '#e2e8f0',
                                    }}
                                >
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="size-7 rounded flex items-center justify-center font-bold text-xs"
                                            style={{
                                                backgroundColor: previewColors?.primary || '#059669',
                                                color: previewColors?.primary_foreground || '#ffffff',
                                            }}
                                        >
                                            C
                                        </div>
                                        <div>
                                            <div className="font-bold text-xs leading-none">CONAPA ONG</div>
                                            <div className="text-[10px] opacity-70 mt-0.5">Gestión de Acceso</div>
                                        </div>
                                    </div>
                                    <span
                                        className="text-[10px] px-2 py-0.5 rounded font-semibold"
                                        style={{
                                            backgroundColor: `${previewColors?.success}20`,
                                            color: previewColors?.success,
                                        }}
                                    >
                                        Sistema Activo
                                    </span>
                                </div>

                                {/* Mock Tarjeta Estadística */}
                                <div
                                    className="p-3 rounded border space-y-1"
                                    style={{
                                        backgroundColor: previewColors?.card || '#ffffff',
                                        borderColor: previewColors?.border || '#e2e8f0',
                                    }}
                                >
                                    <div className="flex items-center justify-between text-xs opacity-80">
                                        <span>Rescates Realizados</span>
                                        <Shield className="size-3.5" style={{ color: previewColors?.primary }} />
                                    </div>
                                    <div className="text-xl font-bold">128 Casos</div>
                                    <div
                                        className="text-[10px] font-semibold flex items-center gap-1"
                                        style={{ color: previewColors?.success }}
                                    >
                                        <CheckCircle2 className="size-3" />
                                        +18% de efectividad vs mes anterior
                                    </div>
                                </div>

                                {/* Muestrario de Botones con Colores Semánticos */}
                                <div className="space-y-1.5">
                                    <div className="text-xs font-semibold opacity-80">
                                        Botones de Acción Semántica
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        <button
                                            type="button"
                                            className="px-2.5 py-1 text-xs font-medium rounded shadow-2xs"
                                            style={{
                                                backgroundColor: previewColors?.primary,
                                                color: previewColors?.primary_foreground || '#ffffff',
                                                borderRadius: radius,
                                            }}
                                        >
                                            Primary
                                        </button>
                                        <button
                                            type="button"
                                            className="px-2.5 py-1 text-xs font-medium rounded shadow-2xs"
                                            style={{
                                                backgroundColor: previewColors?.secondary,
                                                color: '#ffffff',
                                                borderRadius: radius,
                                            }}
                                        >
                                            Secondary
                                        </button>
                                        <button
                                            type="button"
                                            className="px-2.5 py-1 text-xs font-medium rounded shadow-2xs"
                                            style={{
                                                backgroundColor: previewColors?.success,
                                                color: '#ffffff',
                                                borderRadius: radius,
                                            }}
                                        >
                                            Success
                                        </button>
                                        <button
                                            type="button"
                                            className="px-2.5 py-1 text-xs font-medium rounded shadow-2xs"
                                            style={{
                                                backgroundColor: previewColors?.warning,
                                                color: '#ffffff',
                                                borderRadius: radius,
                                            }}
                                        >
                                            Warning
                                        </button>
                                        <button
                                            type="button"
                                            className="px-2.5 py-1 text-xs font-medium rounded shadow-2xs"
                                            style={{
                                                backgroundColor: previewColors?.danger,
                                                color: '#ffffff',
                                                borderRadius: radius,
                                            }}
                                        >
                                            Danger
                                        </button>
                                        <button
                                            type="button"
                                            className="px-2.5 py-1 text-xs font-medium rounded shadow-2xs"
                                            style={{
                                                backgroundColor: previewColors?.alert,
                                                color: '#ffffff',
                                                borderRadius: radius,
                                            }}
                                        >
                                            Alert
                                        </button>
                                    </div>
                                </div>

                                {/* Badges Semánticos */}
                                <div className="space-y-1.5">
                                    <div className="text-xs font-semibold opacity-80">
                                        Etiquetas e Insignias de Estado
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        <span
                                            className="px-2 py-0.5 text-[10px] rounded font-semibold"
                                            style={{
                                                backgroundColor: `${previewColors?.primary}25`,
                                                color: previewColors?.primary,
                                            }}
                                        >
                                            Adopción Activa
                                        </span>
                                        <span
                                            className="px-2 py-0.5 text-[10px] rounded font-semibold"
                                            style={{
                                                backgroundColor: `${previewColors?.warning}25`,
                                                color: previewColors?.warning,
                                            }}
                                        >
                                            En Seguimiento
                                        </span>
                                        <span
                                            className="px-2 py-0.5 text-[10px] rounded font-semibold"
                                            style={{
                                                backgroundColor: `${previewColors?.danger}25`,
                                                color: previewColors?.danger,
                                            }}
                                        >
                                            Caso Urgente
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </form>
    );
}
