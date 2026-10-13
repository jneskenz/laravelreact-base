import { Head, Link, router } from '@inertiajs/react';
import {
    Copy,
    Info,
    Palette,
    Pencil,
    Plus,
    Shield,
    Star,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { DbTheme } from '@/hooks/use-appearance';
import { dashboard } from '@/routes/panel';
import {
    create,
    defaultMethod,
    destroy,
    edit,
    index,
} from '@/routes/panel/configuracion/personalizacion';
import { ThemePreview } from './components/theme-preview';
import { THEME_MODES } from './components/theme-utils';

interface Props {
    themes: DbTheme[];
}

export default function ThemeManagementIndex({ themes }: Props) {
    const [themeToDelete, setThemeToDelete] = useState<DbTheme | null>(null);
    const [themeToMakeDefault, setThemeToMakeDefault] =
        useState<DbTheme | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    function confirmSetDefault() {
        if (!themeToMakeDefault) {
            return;
        }

        router.visit(defaultMethod(themeToMakeDefault.id), {
            preserveScroll: true,
            onStart: () => setIsProcessing(true),
            onFinish: () => {
                setIsProcessing(false);
                setThemeToMakeDefault(null);
            },
        });
    }

    function confirmDelete() {
        if (!themeToDelete) {
            return;
        }

        router.visit(destroy(themeToDelete.id), {
            preserveScroll: true,
            onStart: () => setIsProcessing(true),
            onFinish: () => {
                setIsProcessing(false);
                setThemeToDelete(null);
            },
        });
    }

    return (
        <>
            <Head title="Personalización" />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Heading
                        title="Personalización"
                        description="Temas de color de la organización. Elige cuál se usa por defecto o crea uno nuevo."
                    />

                    <Button asChild className="shrink-0 gap-2">
                        <Link href={create()}>
                            <Plus className="size-4" />
                            Nuevo tema
                        </Link>
                    </Button>
                </div>

                <div className="flex items-start gap-2 rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
                    <Info className="mt-0.5 size-4 shrink-0" />
                    <p>
                        El tema{' '}
                        <strong className="text-foreground">por defecto</strong>{' '}
                        se aplica a todos los usuarios que no hayan elegido uno
                        propio en <em>Ajustes › Apariencia</em>. Cada tema
                        incluye cuatro modos:{' '}
                        {THEME_MODES.map((mode) =>
                            mode.label.toLowerCase(),
                        ).join(', ')}
                        .
                    </p>
                </div>

                {themes.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center">
                        <Palette className="size-8 text-muted-foreground" />
                        <div>
                            <p className="font-medium">Todavía no hay temas</p>
                            <p className="text-sm text-muted-foreground">
                                Crea el primero o ejecuta{' '}
                                <code>
                                    php artisan db:seed --class=ThemeSeeder
                                </code>
                                .
                            </p>
                        </div>
                        <Button asChild size="sm">
                            <Link href={create()}>Crear tema</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {themes.map((theme) => (
                            <ThemeCard
                                key={theme.id}
                                theme={theme}
                                onMakeDefault={() =>
                                    setThemeToMakeDefault(theme)
                                }
                                onDelete={() => setThemeToDelete(theme)}
                            />
                        ))}
                    </div>
                )}
            </div>

            <Dialog
                open={!!themeToMakeDefault}
                onOpenChange={(open) => !open && setThemeToMakeDefault(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            ¿Usar "{themeToMakeDefault?.name}" por defecto?
                        </DialogTitle>
                        <DialogDescription>
                            Todos los usuarios que no hayan elegido un tema
                            propio verán este tema en su próxima navegación.
                            Quienes ya eligieron uno lo conservan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setThemeToMakeDefault(null)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={confirmSetDefault}
                            disabled={isProcessing}
                        >
                            Usar por defecto
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={!!themeToDelete}
                onOpenChange={(open) => !open && setThemeToDelete(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            ¿Eliminar "{themeToDelete?.name}"?
                        </DialogTitle>
                        <DialogDescription>
                            Esta acción no se puede deshacer. Los usuarios que
                            lo tenían elegido pasarán a usar el tema por
                            defecto.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setThemeToDelete(null)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={isProcessing}
                        >
                            Eliminar tema
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

interface ThemeCardProps {
    theme: DbTheme;
    onMakeDefault: () => void;
    onDelete: () => void;
}

function ThemeCard({ theme, onMakeDefault, onDelete }: ThemeCardProps) {
    const canDelete = !theme.is_system && !theme.is_default;

    return (
        <Card
            className={`flex flex-col ${theme.is_default ? 'border-primary ring-1 ring-primary/30' : ''}`}
        >
            <CardHeader className="space-y-2 pb-3">
                <div className="flex items-center gap-2">
                    <span
                        className="size-3.5 shrink-0 rounded-full border"
                        style={{ backgroundColor: theme.color }}
                    />
                    <CardTitle className="truncate text-base">
                        {theme.name}
                    </CardTitle>
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {theme.is_default && (
                        <Badge className="gap-1">
                            <Star className="size-3 fill-current" />
                            Por defecto
                        </Badge>
                    )}
                    {theme.is_system ? (
                        <Badge variant="secondary" className="gap-1">
                            <Shield className="size-3" />
                            Sistema
                        </Badge>
                    ) : (
                        <Badge variant="outline">Personalizado</Badge>
                    )}
                </div>
                <CardDescription className="line-clamp-2 text-xs">
                    {theme.description || 'Sin descripción.'}
                </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                    <ThemePreview
                        colors={theme.modes_config.light}
                        radius={theme.radius}
                        title={theme.name}
                        compact
                    />
                    <ThemePreview
                        colors={theme.modes_config.dark}
                        radius={theme.radius}
                        title={theme.name}
                        compact
                    />
                </div>
                <p className="text-center text-[11px] text-muted-foreground">
                    Modo claro · Modo oscuro
                </p>
            </CardContent>

            <CardFooter className="flex flex-wrap items-center gap-2 border-t pt-4">
                <Button size="sm" variant="outline" asChild className="gap-1.5">
                    <Link href={edit(theme.id)}>
                        <Pencil className="size-3.5" />
                        Editar
                    </Link>
                </Button>

                {!theme.is_default && (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onMakeDefault}
                        className="gap-1.5"
                    >
                        <Star className="size-3.5 text-amber-500" />
                        Por defecto
                    </Button>
                )}

                <Button size="sm" variant="ghost" asChild className="gap-1.5">
                    <Link
                        href={create({ query: { base: theme.id } })}
                        title="Crear un tema nuevo a partir de este"
                    >
                        <Copy className="size-3.5" />
                        Duplicar
                    </Link>
                </Button>

                {canDelete && (
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={onDelete}
                        title="Eliminar"
                        aria-label={`Eliminar ${theme.name}`}
                        className="ml-auto size-8 text-destructive hover:text-destructive"
                    >
                        <Trash2 className="size-4" />
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}

ThemeManagementIndex.layout = {
    breadcrumbs: [
        { title: 'Panel', href: dashboard().url },
        { title: 'Configuración', href: '#' },
        { title: 'Personalización', href: index().url },
    ],
};
