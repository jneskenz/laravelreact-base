import { Link, usePage } from '@inertiajs/react';
import {
    ChevronDown,
    Menu,
    Search,
    LayoutDashboard,
    FileText,
    Heart,
    Sliders,
    Sparkles,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import AppLogoIcon from '@/components/app-logo-icon';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { NavMain } from '@/components/nav-main';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { UserMenuContent } from '@/components/user-menu-content';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useInitials } from '@/hooks/use-initials';
import { resolveIcon } from '@/lib/icon-map';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import type { BreadcrumbItem, MenuItemData } from '@/types';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
};

export function AppHeader({ breadcrumbs = [] }: Props) {
    const page = usePage();
    const { auth } = page.props as any;
    const menu = (page.props.menu as MenuItemData[]) || [];
    const getInitials = useInitials();
    const { isCurrentUrl } = useCurrentUrl();

    // Quick access shortcuts for the top bar
    const quickAccesses = [
        { label: 'Dashboard', url: '/panel/dashboard', icon: LayoutDashboard },
        { label: 'Usuarios', url: '/panel/usuarios', icon: FileText },
        { label: 'Personalización', url: '/panel/configuracion/personalizacion', icon: Sliders },
    ];

    return (
        <header className="sticky top-0 z-40 w-full">
            {/* 1. Fila Superior: Marca, Buscador Central, Accesos Frecuentes y Perfil */}
            <div className="border-b border-sidebar-border/80 bg-sidebar">
                <div className="mx-auto flex h-16 items-center justify-between gap-4 px-4 max-w-7xl">
                    {/* Izquierda: Drawer Móvil y Logo de la Aplicación */}
                    <div className="flex items-center gap-3">
                        <div className="lg:hidden">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9"
                                    >
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent
                                    side="left"
                                    className="flex h-full w-72 flex-col items-stretch justify-between bg-sidebar p-0"
                                >
                                    <SheetTitle className="sr-only">
                                        Menú de Navegación
                                    </SheetTitle>
                                    <SheetHeader className="flex justify-start text-left p-4 border-b">
                                        <AppLogoIcon className="h-6 w-6 fill-current text-primary" />
                                    </SheetHeader>
                                    <div className="flex-1 overflow-y-auto py-2">
                                        <NavMain items={menu} />
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>

                        <Link
                            href={dashboard()}
                            prefetch
                            className="flex items-center space-x-2 shrink-0"
                        >
                            <AppLogo />
                        </Link>
                    </div>

                    {/* Centro: Barra de Búsqueda y Accesos Directos Más Visitados */}
                    <div className="hidden md:flex items-center flex-1 max-w-xl mx-4 gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Buscar en el sistema, registros, módulos..."
                                className="h-9 pl-9 pr-4 text-xs bg-muted/30 border-sidebar-border focus-visible:bg-background"
                            />
                        </div>

                        {/* Accesos Rápidos más visitados */}
                        <div className="hidden xl:flex items-center gap-1.5 shrink-0">
                            {quickAccesses.map((qa) => {
                                const Icon = qa.icon;
                                const isActive = isCurrentUrl(qa.url);

                                return (
                                    <Button
                                        key={qa.url}
                                        variant="ghost"
                                        size="sm"
                                        asChild
                                        className={cn(
                                            'h-8 px-2.5 text-[11px] gap-1.5 transition-colors',
                                            isActive
                                                ? 'bg-primary/10 text-primary font-semibold'
                                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                        )}
                                    >
                                        <Link href={qa.url}>
                                            <Icon className="size-3.5" />
                                            <span>{qa.label}</span>
                                        </Link>
                                    </Button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Derecha: Menú de Usuario */}
                    <div className="flex items-center gap-2 shrink-0">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="size-9 rounded-full p-0.5 border"
                                >
                                    <Avatar className="size-8 overflow-hidden rounded-full">
                                        <AvatarImage
                                            src={auth?.user?.avatar}
                                            alt={auth?.user?.name}
                                        />
                                        <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white text-xs font-bold">
                                            {getInitials(auth?.user?.name ?? '')}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                {auth?.user && (
                                    <UserMenuContent user={auth.user} />
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* 2. Fila Inferior: Menú de Navegación Modular Horizontal (Debajo del bloque Logo) */}
            <div className="hidden lg:block border-b border-sidebar-border/70 bg-sidebar/95 backdrop-blur-xs shadow-2xs">
                <div className="mx-auto flex h-11 items-center px-4 max-w-7xl overflow-x-auto gap-1">
                    {menu.map((item) => {
                        const ItemIcon = resolveIcon(item.icon);
                        const hasChildren = Boolean(item.children && item.children.length > 0);
                        const isChildActive = hasChildren && item.children?.some(
                            (child) => child.url && isCurrentUrl(child.url)
                        );
                        const isSelfActive = Boolean(item.url && isCurrentUrl(item.url));

                        if (hasChildren) {
                            return (
                                <DropdownMenu key={item.key}>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={cn(
                                                'h-8 px-2.5 text-xs font-medium gap-1.5 transition-all shrink-0',
                                                isChildActive
                                                    ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                                                    : 'text-foreground/80 hover:text-foreground hover:bg-accent'
                                            )}
                                        >
                                            {ItemIcon && <ItemIcon className="size-3.5 shrink-0" />}
                                            <span>{item.label}</span>
                                            <ChevronDown className="size-3 opacity-70 ml-0.5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="min-w-48 p-1">
                                        {item.children?.map((child) => {
                                            const ChildIcon = resolveIcon(child.icon);
                                            const isChildItemActive = Boolean(child.url && isCurrentUrl(child.url));

                                            return (
                                                <DropdownMenuItem key={child.key} asChild>
                                                    <Link
                                                        href={child.url ?? '#'}
                                                        className={cn(
                                                            'flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-md cursor-pointer',
                                                            isChildItemActive
                                                                ? 'bg-primary/10 text-primary font-semibold'
                                                                : 'text-foreground hover:bg-accent'
                                                        )}
                                                    >
                                                        {ChildIcon && <ChildIcon className="size-3.5 shrink-0" />}
                                                        <span>{child.label}</span>
                                                    </Link>
                                                </DropdownMenuItem>
                                            );
                                        })}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            );
                        }

                        return (
                            <Button
                                key={item.key}
                                variant="ghost"
                                size="sm"
                                asChild
                                className={cn(
                                    'h-8 px-2.5 text-xs font-medium gap-1.5 transition-all shrink-0',
                                    isSelfActive
                                        ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                                        : 'text-foreground/80 hover:text-foreground hover:bg-accent'
                                )}
                            >
                                <Link href={item.url ?? '#'}>
                                    {ItemIcon && <ItemIcon className="size-3.5 shrink-0" />}
                                    <span>{item.label}</span>
                                </Link>
                            </Button>
                        );
                    })}
                </div>
            </div>

            {/* 3. Fila de Breadcrumbs */}
            {breadcrumbs.length > 1 && (
                <div className="flex w-full border-b border-sidebar-border/60 bg-muted/20">
                    <div className="mx-auto flex h-9 w-full items-center justify-start px-4 text-xs text-muted-foreground max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </header>
    );
}
