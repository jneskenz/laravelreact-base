import { Head, Link, router } from '@inertiajs/react';
import {
    Plus,
    Star,
    MoreHorizontal,
    Pencil,
    Trash2,
    Shield,
} from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { DbTheme } from '@/hooks/use-appearance';

interface Props {
    themes: DbTheme[];
}

export default function ThemeManagementIndex({ themes }: Props) {
    const [themeToDelete, setThemeToDelete] = useState<DbTheme | null>(null);

    function handleSetDefault(theme: DbTheme) {
        router.patch(`/panel/configuracion/personalizacion/${theme.id}/default`, {}, {
            preserveScroll: true,
        });
    }

    function handleDeleteConfirm() {
        if (!themeToDelete) return;
        router.delete(`/panel/configuracion/personalizacion/${themeToDelete.id}`, {
            preserveScroll: true,
            onFinish: () => setThemeToDelete(null),
        });
    }

    return (
        <>
            <Head title="Personalización y Apariencia - Panel" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <Heading
                            title="Personalización y Apariencia"
                            description="Administra los temas oficiales, paletas de colores semánticos y estilos visuales de la organización."
                        />
                    </div>

                    <Button asChild className="gap-2 shrink-0">
                        <Link href="/panel/configuracion/personalizacion/create">
                            <Plus className="size-4" />
                            Nuevo Tema Institucional
                        </Link>
                    </Button>
                </div>

                {/* Grid de Temas */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {themes.map((theme) => {
                        const lightColors = theme.modes_config?.light;
                        const darkColors = theme.modes_config?.dark;
                        const eyeCareColors = theme.modes_config?.eye_care;
                        const semiDarkColors = theme.modes_config?.semi_dark;

                        return (
                            <Card
                                key={theme.id}
                                className={`relative flex flex-col justify-between transition-all hover:shadow-md ${
                                    theme.is_default
                                        ? 'border-primary shadow-xs ring-1 ring-primary/30'
                                        : 'hover:border-border'
                                }`}
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span
                                                    className="size-3.5 rounded-full border shadow-2xs shrink-0"
                                                    style={{ backgroundColor: theme.color }}
                                                />
                                                <CardTitle className="text-base font-bold">
                                                    {theme.name}
                                                </CardTitle>
                                            </div>
                                            <CardDescription className="text-xs line-clamp-2">
                                                {theme.description || 'Sin descripción personalizada.'}
                                            </CardDescription>
                                        </div>

                                        {/* Dropdown de Acciones */}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="size-8 shrink-0">
                                                    <MoreHorizontal className="size-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                {!theme.is_default && (
                                                    <DropdownMenuItem onClick={() => handleSetDefault(theme)}>
                                                        <Star className="mr-2 size-4 text-amber-500" />
                                                        Hacer por defecto
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/panel/configuracion/personalizacion/${theme.id}/edit`}>
                                                        <Pencil className="mr-2 size-4" />
                                                        Editar Tema
                                                    </Link>
                                                </DropdownMenuItem>
                                                {!theme.is_system && !theme.is_default && (
                                                    <>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => setThemeToDelete(theme)}
                                                            className="text-destructive focus:text-destructive"
                                                        >
                                                            <Trash2 className="mr-2 size-4" />
                                                            Eliminar
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    {/* Badges de Estado */}
                                    <div className="flex items-center gap-1.5 pt-2 flex-wrap">
                                        {theme.is_default && (
                                            <Badge variant="default" className="text-[10px] gap-1 px-2 py-0">
                                                <Star className="size-2.5 fill-current" />
                                                Por Defecto
                                            </Badge>
                                        )}
                                        {theme.is_system ? (
                                            <Badge variant="secondary" className="text-[10px] gap-1 px-2 py-0">
                                                <Shield className="size-2.5" />
                                                Sistema
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-[10px] px-2 py-0">
                                                Personalizado
                                            </Badge>
                                        )}
                                        <Badge variant="outline" className="text-[10px] font-mono px-2 py-0">
                                            Radio: {theme.radius || '0.625rem'}
                                        </Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-3 pt-0">
                                    {/* Muestrario de los 9 Colores Semánticos (Modo Claro) */}
                                    <div className="space-y-1.5 rounded-lg bg-muted/40 p-2.5 border">
                                        <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
                                            <span>Paleta Semántica (Modo Claro)</span>
                                            <span className="text-[10px] opacity-70">9 Colores</span>
                                        </div>
                                        <div className="grid grid-cols-9 gap-1 pt-1">
                                            {[
                                                { label: 'Primary', color: lightColors?.primary || theme.color },
                                                { label: 'Secondary', color: lightColors?.secondary || '#64748b' },
                                                { label: 'Success', color: lightColors?.success || '#10b981' },
                                                { label: 'Warning', color: lightColors?.warning || '#f59e0b' },
                                                { label: 'Danger', color: lightColors?.danger || '#ef4444' },
                                                { label: 'Alert', color: lightColors?.alert || '#f97316' },
                                                { label: 'Muted', color: lightColors?.muted || '#64748b' },
                                                { label: 'Light', color: lightColors?.light || '#ffffff' },
                                                { label: 'Dark', color: lightColors?.dark || '#0f172a' },
                                            ].map((swatch, idx) => (
                                                <div key={idx} className="flex flex-col items-center gap-0.5">
                                                    <span
                                                        className="size-5 rounded border shadow-2xs"
                                                        style={{ backgroundColor: swatch.color }}
                                                        title={`${swatch.label}: ${swatch.color}`}
                                                    />
                                                    <span className="text-[8px] text-muted-foreground truncate w-full text-center">
                                                        {swatch.label.slice(0, 3)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Mini Previews de los 4 Modos Visuales */}
                                    <div className="flex items-center justify-between gap-1 text-[10px] text-muted-foreground pt-1">
                                        <div className="flex items-center gap-1.5">
                                            <span className="size-2 rounded-full" style={{ backgroundColor: lightColors?.primary || theme.color }} />
                                            <span>☀️ Claro</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="size-2 rounded-full" style={{ backgroundColor: darkColors?.primary || theme.color }} />
                                            <span>🌙 Oscuro</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="size-2 rounded-full" style={{ backgroundColor: eyeCareColors?.primary || theme.color }} />
                                            <span>👓 Vista</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="size-2 rounded-full" style={{ backgroundColor: semiDarkColors?.primary || theme.color }} />
                                            <span>🌌 Dim</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Modal de Confirmación de Eliminación */}
            <Dialog open={!!themeToDelete} onOpenChange={(open: boolean) => !open && setThemeToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>¿Eliminar tema institucional?</DialogTitle>
                        <DialogDescription>
                            Esta acción eliminará el tema &quot;{themeToDelete?.name}&quot; permanentemente.
                            Los usuarios que lo tenían asignado volverán al tema por defecto del sistema.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setThemeToDelete(null)}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteConfirm}>
                            Eliminar Tema
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

ThemeManagementIndex.layout = {
    breadcrumbs: [
        {
            title: 'Panel',
            href: '/panel/dashboard',
        },
        {
            title: 'Configuración',
            href: '#',
        },
        {
            title: 'Personalización y Apariencia',
            href: '/panel/configuracion/personalizacion',
        },
    ],
};
