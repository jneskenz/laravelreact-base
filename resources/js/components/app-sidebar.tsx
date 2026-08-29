import { Link } from '@inertiajs/react';
import { BookOpen, FolderGit2, LayoutGrid, LayoutList, Users } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { institucional, proyectos, reconocimientos } from '@/routes/cms';
import { index as usersIndex } from '@/routes/admin/users';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'CMS',
        href: '#',
        icon: LayoutList,
        items: [
            {
                title: 'Institucional',
                href: institucional(),
            },
            {
                title: 'Proyectos',
                href: proyectos(),
            },
            {
                title: 'Reconocimientos',
                href: reconocimientos(),
            },
        ],
    },
    {
        title: 'Administracion',
        href: '#',
        icon: Users,
        items: [
            {
                title: 'Usuarios',
                href: usersIndex(),
            },
            {
                title: 'Roles y permisos',
                href: '#',
            },
            {
                title: 'Configuracion',
                href: '#',
            },
        ],
    },
    {
        title: 'Denuncias',
        href: '#',
        icon: LayoutList,
        items: [
            {
                title: 'Bandeja de denuncias',
                href: '#',
            },
            {
                title: 'Derivaciones',
                href: '#',
            },
            {
                title: 'Seguimiento',
                href: '#',
            },
        ],
    }
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repositorio',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentacion',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
