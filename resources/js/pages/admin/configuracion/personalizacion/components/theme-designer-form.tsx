import { Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    ChevronDown,
    Info,
    Loader2,
    RotateCcw,
    Save,
    SlidersHorizontal,
    Star,
} from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type {
    DbTheme,
    SemanticColors,
    ThemeModeConfigs,
} from '@/hooks/use-appearance';
import {
    index,
    store,
    update,
} from '@/routes/panel/configuracion/personalizacion';
import { ColorField } from './color-field';
import { ThemePreview } from './theme-preview';
import {
    applyPrimaryToModes,
    FALLBACK_MODES,
    RADIUS_OPTIONS,
    SEMANTIC_KEYS,
    SURFACE_KEYS,
    THEME_MODES,
} from './theme-utils';
import type { ThemeMode } from './theme-utils';

interface Props {
    /** Theme being edited, or the theme used as a starting point when creating. */
    theme?: DbTheme;
    isEditing?: boolean;
    /** Number of users who selected this theme (edit only). */
    usersCount?: number;
}

type ThemeFormData = {
    name: string;
    description: string;
    color: string;
    radius: string;
    is_default: boolean;
    modes_config: ThemeModeConfigs;
};

export function ThemeDesignerForm({
    theme,
    isEditing = false,
    usersCount = 0,
}: Props) {
    const initialModes = theme?.modes_config ?? FALLBACK_MODES;

    const form = useForm<ThemeFormData>({
        name: isEditing ? (theme?.name ?? '') : '',
        description: isEditing ? (theme?.description ?? '') : '',
        color: theme?.color ?? FALLBACK_MODES.light.primary,
        radius: theme?.radius ?? '0.625rem',
        is_default: isEditing ? !!theme?.is_default : false,
        modes_config: initialModes,
    });

    const [mode, setMode] = useState<ThemeMode>('light');
    const [advancedOpen, setAdvancedOpen] = useState(false);

    const modeColors = form.data.modes_config[mode];
    const colorErrors = Object.entries(form.errors)
        .filter(([key]) => key.startsWith('modes_config'))
        .map(([, message]) => message);

    function changeMainColor(hex: string) {
        form.setData((data) => ({
            ...data,
            color: hex,
            modes_config: applyPrimaryToModes(data.modes_config, hex),
        }));
    }

    function changeModeColor(key: keyof SemanticColors, hex: string) {
        form.setData((data) => ({
            ...data,
            color: mode === 'light' && key === 'primary' ? hex : data.color,
            modes_config: {
                ...data.modes_config,
                [mode]: { ...data.modes_config[mode], [key]: hex },
            },
        }));
    }

    function resetMode() {
        form.setData('modes_config', {
            ...form.data.modes_config,
            [mode]: initialModes[mode],
        });
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        form.submit(isEditing && theme ? update(theme.id) : store(), {
            preserveScroll: true,
        });
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <Link
                        href={index()}
                        className="p-1 text-muted-foreground transition-colors hover:text-foreground"
                        aria-label="Volver al listado"
                    >
                        <ArrowLeft className="size-4" />
                    </Link>
                    <Heading
                        title={
                            isEditing
                                ? `Editar tema: ${theme?.name}`
                                : 'Nuevo tema'
                        }
                        description={
                            isEditing
                                ? 'Ajusta el color principal y el estilo. Los cambios se ven en la vista previa antes de guardar.'
                                : `Partiendo de "${theme?.name ?? 'paleta base'}". Ponle un nombre, elige el color principal y guarda.`
                        }
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={index()}>Cancelar</Link>
                    </Button>
                    <Button
                        type="submit"
                        size="sm"
                        disabled={form.processing}
                        className="gap-2"
                    >
                        {form.processing ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <Save className="size-4" />
                        )}
                        {isEditing ? 'Guardar cambios' : 'Crear tema'}
                    </Button>
                </div>
            </div>

            {isEditing && (theme?.is_system || usersCount > 0) && (
                <Alert>
                    <Info className="size-4" />
                    <AlertTitle>Antes de editar</AlertTitle>
                    <AlertDescription>
                        <ul className="list-disc space-y-0.5 pl-4">
                            {theme?.is_system && (
                                <li>
                                    Es un tema del sistema: puedes editarlo,
                                    pero no eliminarlo. Si quieres conservar el
                                    original, usa <strong>Duplicar</strong>{' '}
                                    desde el listado.
                                </li>
                            )}
                            {usersCount > 0 && (
                                <li>
                                    {usersCount}{' '}
                                    {usersCount === 1
                                        ? 'usuario lo tiene'
                                        : 'usuarios lo tienen'}{' '}
                                    elegido; verán los cambios en su próximo
                                    inicio de sesión.
                                </li>
                            )}
                        </ul>
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                <div className="space-y-6 xl:col-span-7">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold">
                                1. Datos básicos
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="theme-name">Nombre *</Label>
                                <Input
                                    id="theme-name"
                                    value={form.data.name}
                                    onChange={(e) =>
                                        form.setData('name', e.target.value)
                                    }
                                    placeholder="Ej: Verde campaña 2026"
                                    maxLength={100}
                                    required
                                    autoFocus={!isEditing}
                                />
                                <InputError message={form.errors.name} />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="theme-desc">
                                    Descripción (opcional)
                                </Label>
                                <Input
                                    id="theme-desc"
                                    value={form.data.description}
                                    onChange={(e) =>
                                        form.setData(
                                            'description',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="¿Para qué se usa este tema?"
                                    maxLength={255}
                                />
                                <InputError message={form.errors.description} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold">
                                2. Color y estilo
                            </CardTitle>
                            <CardDescription className="text-xs">
                                El color principal se adapta solo a los cuatro
                                modos (claro, oscuro, descanso visual y
                                semi-oscuro).
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="max-w-xs">
                                <ColorField
                                    id="theme-color"
                                    label="Color principal *"
                                    value={form.data.color}
                                    onChange={changeMainColor}
                                    hint="Botones, enlaces y elementos destacados."
                                    size="md"
                                />
                                <InputError message={form.errors.color} />
                            </div>

                            <div className="space-y-2">
                                <Label>Esquinas</Label>
                                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                                    {RADIUS_OPTIONS.map((option) => {
                                        const isSelected =
                                            form.data.radius === option.value;

                                        return (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() =>
                                                    form.setData(
                                                        'radius',
                                                        option.value,
                                                    )
                                                }
                                                aria-pressed={isSelected}
                                                className={`flex flex-col items-center gap-1.5 rounded-lg border p-2 text-xs transition-all ${
                                                    isSelected
                                                        ? 'border-primary bg-primary/10 font-semibold text-primary ring-1 ring-primary'
                                                        : 'text-muted-foreground hover:text-foreground'
                                                }`}
                                            >
                                                <span
                                                    className="h-5 w-9 border-2 border-current"
                                                    style={{
                                                        borderRadius:
                                                            option.value,
                                                    }}
                                                />
                                                {option.label}
                                            </button>
                                        );
                                    })}
                                </div>
                                <InputError message={form.errors.radius} />
                            </div>

                            <div className="border-t pt-4">
                                {isEditing && theme?.is_default ? (
                                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Star className="size-3.5 fill-amber-500 text-amber-500" />
                                        Este es el tema por defecto. Para
                                        cambiarlo, marca otro tema como
                                        predeterminado desde el listado.
                                    </p>
                                ) : (
                                    <div className="flex items-start gap-2">
                                        <Checkbox
                                            id="is_default"
                                            checked={form.data.is_default}
                                            onCheckedChange={(checked) =>
                                                form.setData(
                                                    'is_default',
                                                    checked === true,
                                                )
                                            }
                                        />
                                        <div className="space-y-0.5">
                                            <Label
                                                htmlFor="is_default"
                                                className="cursor-pointer"
                                            >
                                                Usar como tema por defecto
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                Se aplica a todos los usuarios
                                                que no hayan elegido un tema
                                                propio.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Collapsible
                        open={advancedOpen || colorErrors.length > 0}
                        onOpenChange={setAdvancedOpen}
                    >
                        <Card>
                            <CollapsibleTrigger asChild>
                                <button
                                    type="button"
                                    className="w-full text-left"
                                >
                                    <CardHeader className="flex flex-row items-center justify-between gap-2">
                                        <div className="space-y-1">
                                            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                                <SlidersHorizontal className="size-4" />
                                                3. Ajustes avanzados (opcional)
                                            </CardTitle>
                                            <CardDescription className="text-xs">
                                                Ajusta cada color por modo. Solo
                                                si el resultado automático no te
                                                convence.
                                            </CardDescription>
                                        </div>
                                        <ChevronDown
                                            className={`size-4 shrink-0 transition-transform ${advancedOpen ? 'rotate-180' : ''}`}
                                        />
                                    </CardHeader>
                                </button>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                                <CardContent className="space-y-5">
                                    {colorErrors.length > 0 && (
                                        <InputError message={colorErrors[0]} />
                                    )}

                                    <ModeTabs value={mode} onChange={setMode} />

                                    <div className="space-y-2">
                                        <div className="text-xs font-semibold">
                                            Fondos y texto
                                        </div>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            {SURFACE_KEYS.map(
                                                ({ key, label }) => (
                                                    <ColorField
                                                        key={`${mode}-${key}`}
                                                        id={`${mode}-${key}`}
                                                        label={label}
                                                        value={
                                                            modeColors[key] ??
                                                            ''
                                                        }
                                                        onChange={(hex) =>
                                                            changeModeColor(
                                                                key,
                                                                hex,
                                                            )
                                                        }
                                                    />
                                                ),
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="text-xs font-semibold">
                                            Colores de estado y acciones
                                        </div>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            {SEMANTIC_KEYS.map(
                                                ({ key, label, hint }) => (
                                                    <ColorField
                                                        key={`${mode}-${key}`}
                                                        id={`${mode}-${key}`}
                                                        label={label}
                                                        hint={hint}
                                                        value={
                                                            modeColors[key] ??
                                                            ''
                                                        }
                                                        onChange={(hex) =>
                                                            changeModeColor(
                                                                key,
                                                                hex,
                                                            )
                                                        }
                                                    />
                                                ),
                                            )}
                                        </div>
                                    </div>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={resetMode}
                                        className="gap-2"
                                    >
                                        <RotateCcw className="size-3.5" />
                                        Restaurar colores de este modo
                                    </Button>
                                </CardContent>
                            </CollapsibleContent>
                        </Card>
                    </Collapsible>
                </div>

                <div className="xl:col-span-5">
                    <Card className="overflow-hidden xl:sticky xl:top-6">
                        <CardHeader className="space-y-3 border-b bg-muted/30 pb-3">
                            <div>
                                <CardTitle className="text-sm font-semibold">
                                    Vista previa
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Así se verá el panel con este tema.
                                </CardDescription>
                            </div>
                            <ModeTabs value={mode} onChange={setMode} />
                        </CardHeader>
                        <CardContent className="p-4">
                            <ThemePreview
                                colors={modeColors}
                                radius={form.data.radius}
                                title={form.data.name || 'Nuevo tema'}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    );
}

function ModeTabs({
    value,
    onChange,
}: {
    value: ThemeMode;
    onChange: (mode: ThemeMode) => void;
}) {
    return (
        <div
            className="grid grid-cols-2 gap-1 rounded-lg border bg-muted/50 p-1 sm:grid-cols-4"
            role="tablist"
        >
            {THEME_MODES.map((option) => (
                <button
                    key={option.id}
                    type="button"
                    role="tab"
                    aria-selected={value === option.id}
                    onClick={() => onChange(option.id)}
                    className={`rounded-md px-2 py-1.5 text-xs font-medium transition-all ${
                        value === option.id
                            ? 'bg-card text-foreground shadow-xs'
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    {option.emoji} {option.label}
                </button>
            ))}
        </div>
    );
}
