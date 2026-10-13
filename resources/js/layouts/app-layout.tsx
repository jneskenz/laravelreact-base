import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { useAppearance, applyDefaultTheme, applyThemeSettingsToStorage } from '@/hooks/use-appearance';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { syncUrlArea } from '@/lib/area';
import type { BreadcrumbItem } from '@/types';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    const page = usePage();
    const { layoutType } = useAppearance();

    // Rutas con prefijo {area} (p. ej. ajustes): /panel/... para internos, /portal/... para externos
    syncUrlArea(page.props.area);

    // Sincronizar apariencia de la base de datos EXCLUSIVAMENTE cuando se detecta un nuevo inicio de sesión (nueva sesión de auth)
    useEffect(() => {
        if (typeof window === 'undefined') {
return;
}

        const auth = (page.props.auth as any);
        const authUser = auth?.user;
        const sessionId = auth?.session_id;

        if (authUser && sessionId) {
            const lastSyncedSession = sessionStorage.getItem('synced_auth_session');

            if (lastSyncedSession !== sessionId) {
                // Nuevo inicio de sesión detectado en este navegador
                sessionStorage.setItem('synced_auth_session', sessionId);

                if (authUser.theme_settings) {
                    applyThemeSettingsToStorage(authUser.theme_settings);
                }
            }
        }
    }, [page.props.auth]);

    // Tema por defecto de la organización: se usa mientras el usuario no haya elegido uno propio
    useEffect(() => {
        applyDefaultTheme(page.props.defaultTheme);
    }, [page.props.defaultTheme]);

    if (layoutType === 'header') {
        return (
            <AppHeaderLayout breadcrumbs={breadcrumbs}>
                {children}
            </AppHeaderLayout>
        );
    }

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            {children}
        </AppSidebarLayout>
    );
}
