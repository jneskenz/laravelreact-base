import { Head, Link } from '@inertiajs/react';
import {
    Sun,
    Moon,
    Monitor,
    Eye,
    Sparkles,
    Check,
    Palette,
    ArrowRight,
    Type,
    Layout,
    PanelLeft,
    PanelTop,
    Shield,
} from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    useAppearance
    
    
    
    
} from '@/hooks/use-appearance';
import type {AppearanceMode, FontSize, LayoutType, DbTheme} from '@/hooks/use-appearance';
import type { UserArea } from '@/lib/area';
import { syncUrlArea } from '@/lib/area';
import { edit as editAppearance } from '@/routes/appearance';
import personalizacion from '@/routes/panel/configuracion/personalizacion';

interface Props {
    themes?: DbTheme[];
    defaultThemeId?: number;
    canManageThemes?: boolean;
}

const VISUAL_MODES: {
    id: AppearanceMode;
    label: string;
    description: string;
    icon: typeof Sun;
    badge?: string;
}[] = [
    {
        id: 'light',
        label: 'Claro (Light)',
        description: 'Fondo blanco puro y alto contraste para ambientes iluminados.',
        icon: Sun,
    },
    {
        id: 'dark',
        label: 'Oscuro (Dark)',
        description: 'Fondo carbón profundo con descanso visual nocturno.',
        icon: Moon,
    },
    {
        id: 'system',
        label: 'Sistema (Automático)',
        description: 'Sincroniza dinámicamente con las preferencias de tu sistema operativo.',
        icon: Monitor,
    },
    {
        id: 'eye-care',
        label: 'Protección de Vista (Eye Care)',
        description: 'Tono sepia cálido con reducción de luz azul para jornadas largas.',
        icon: Eye,
        badge: 'Anti-Fatiga',
    },
    {
        id: 'semi-dark',
        label: 'Semi-Dark (Medianoche)',
        description: 'Azul pizarra suave y elegante sin negros absolutos (estilo Dim).',
        icon: Sparkles,
        badge: 'Recomendado',
    },
];

const FONT_SIZES: { id: FontSize; label: string; desc: string; sample: string }[] = [
    { id: 'compact', label: 'Compacto', desc: '14px', sample: 'Ideal para tablas y reportes densos' },
    { id: 'normal', label: 'Normal', desc: '16px', sample: 'Equilibrio estándar de lectura' },
    { id: 'large', label: 'Grande', desc: '18px', sample: 'Mayor legibilidad y confort visual' },
];

const LAYOUT_OPTIONS: { id: LayoutType; label: string; desc: string; icon: typeof PanelLeft }[] = [
    { id: 'sidebar', label: 'Barra Vertical', desc: 'Menú lateral izquierdo colapsable', icon: PanelLeft },
    { id: 'header', label: 'Barra Horizontal', desc: 'Barra superior con navegación continua', icon: PanelTop },
];

export default function Appearance({ themes = [], defaultThemeId, canManageThemes = false }: Props) {
    const {
        appearance,
        fontSize,
        layoutType,
        activeThemeId,
        updateAppearance,
        updateFontSize,
        updateLayout,
        selectTheme,
    } = useAppearance();

    return (
        <>
            <Head title="Configuración de Apariencia" />

            <h1 className="sr-only">Configuración de Apariencia</h1>

            <div className="space-y-10">
                {/* 1. Modo Visual */}
                <div className="space-y-4">
                    <Heading
                        variant="small"
                        title="Modo de Visualización"
                        description="Selecciona tu modo preferido. Cada modo calibra automáticamente los 9 colores semánticos para un óptimo confort y contraste."
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                        {VISUAL_MODES.map((mode) => {
                            const isSelected = appearance === mode.id;
                            const Icon = mode.icon;

                            return (
                                <button
                                    key={mode.id}
                                    type="button"
                                    onClick={() => updateAppearance(mode.id)}
                                    className={`flex flex-col items-start gap-2 p-3.5 rounded-xl border text-left transition-all hover:border-primary/50 ${
                                        isSelected
                                            ? 'border-primary bg-primary/5 shadow-xs ring-1 ring-primary'
                                            : 'bg-card/60 hover:bg-card'
                                    }`}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center gap-2">
                                            <Icon className={`size-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                                            <span className="font-semibold text-xs text-foreground">
                                                {mode.label}
                                            </span>
                                        </div>
                                        {mode.badge && (
                                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4">
                                                {mode.badge}
                                            </Badge>
                                        )}
                                        {isSelected && (
                                            <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4">
                                                Activo
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                                        {mode.description}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 2. Temas de Color Institucionales */}
                <div className="space-y-4 pt-6 border-t">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                            <Heading
                                variant="small"
                                title="Temas y Paletas de Color"
                                description="Elige la paleta cromática activa para tu sesión. Los colores semánticos se adaptarán a tu modo visual."
                            />
                        </div>

                        {canManageThemes && (
                            <Button size="sm" variant="outline" asChild className="gap-1.5 shrink-0 text-xs">
                                <Link href={personalizacion.index()}>
                                    <Palette className="size-3.5" />
                                    Administrar Temas
                                </Link>
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                        {themes.map((t) => {
                            const isSelected = activeThemeId ? activeThemeId === t.id : t.id === defaultThemeId;
                            const lightColors = t.modes_config?.light;

                            return (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => selectTheme(t)}
                                    className={`flex flex-col items-start gap-2 p-3.5 rounded-xl border text-left transition-all hover:border-primary/50 ${
                                        isSelected
                                            ? 'border-primary bg-primary/5 shadow-xs ring-1 ring-primary'
                                            : 'bg-card/60 hover:bg-card'
                                    }`}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="size-4 rounded-full border shadow-2xs shrink-0"
                                                style={{ backgroundColor: t.color }}
                                            />
                                            <span className="font-semibold text-xs text-foreground">
                                                {t.name}
                                            </span>
                                        </div>
                                        {isSelected && (
                                            <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4">
                                                Activo
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                                        {t.description || 'Paleta institucional'}
                                    </p>

                                    {/* Muestrario Rápido de 5 Colores */}
                                    <div className="flex items-center gap-1 pt-1">
                                        {[
                                            lightColors?.primary || t.color,
                                            lightColors?.secondary || '#64748b',
                                            lightColors?.success || '#10b981',
                                            lightColors?.warning || '#f59e0b',
                                            lightColors?.danger || '#ef4444',
                                        ].map((c, idx) => (
                                            <span
                                                key={idx}
                                                className="size-3 rounded-full border shadow-2xs"
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 3. Escala Tipográfica (Tamaño de Fuente) */}
                <div className="space-y-4 pt-6 border-t">
                    <Heading
                        variant="small"
                        title="Escala Tipográfica (Tamaño de Fuente)"
                        description="Ajusta el tamaño base de la tipografía para adaptar la densidad de información en pantalla."
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {FONT_SIZES.map((f) => {
                            const isSelected = fontSize === f.id;

                            return (
                                <button
                                    key={f.id}
                                    type="button"
                                    onClick={() => updateFontSize(f.id)}
                                    className={`flex flex-col items-start gap-1 p-3.5 rounded-xl border text-left transition-all ${
                                        isSelected
                                            ? 'border-primary bg-primary/5 shadow-xs ring-1 ring-primary'
                                            : 'bg-card/60 hover:bg-card'
                                    }`}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center gap-2">
                                            <Type className="size-4 text-primary" />
                                            <span className="font-semibold text-xs text-foreground">{f.label}</span>
                                        </div>
                                        <Badge variant="outline" className="text-[10px] font-mono">
                                            {f.desc}
                                        </Badge>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">{f.sample}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 4. Disposición de Navegación */}
                <div className="space-y-4 pt-6 border-t">
                    <Heading
                        variant="small"
                        title="Disposición de la Barra de Navegación"
                        description="Selecciona entre la barra vertical lateral (Sidebar) o la barra horizontal superior (Header)."
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {LAYOUT_OPTIONS.map((layout) => {
                            const isSelected = layoutType === layout.id;
                            const Icon = layout.icon;

                            return (
                                <button
                                    key={layout.id}
                                    type="button"
                                    onClick={() => updateLayout(layout.id)}
                                    className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
                                        isSelected
                                            ? 'border-primary bg-primary/5 shadow-xs ring-1 ring-primary'
                                            : 'bg-card/60 hover:bg-card'
                                    }`}
                                >
                                    <Icon className={`size-5 shrink-0 mt-0.5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                                    <div className="space-y-0.5 flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-xs text-foreground">{layout.label}</span>
                                            {isSelected && (
                                                <Badge variant="default" className="text-[10px] px-1.5 py-0">
                                                    Activo
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-muted-foreground">{layout.desc}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}

Appearance.layout = ({ area }: { area: UserArea | null }) => {
    syncUrlArea(area);

    return {
        breadcrumbs: [
            {
                title: 'Configuración',
                href: '#',
            },
            {
                title: 'Apariencia',
                href: editAppearance(),
            },
        ],
    };
};
