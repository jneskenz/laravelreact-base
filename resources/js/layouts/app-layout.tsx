import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { useAppearance, applyThemeSettingsToStorage } from '@/hooks/use-appearance';
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

    // Sincronizar apariencia de la base de datos EXCLUSIVAMENTE cuando se detecta un nuevo inicio de sesión (nueva sesión de auth)
    useEffect(() => {
        if (typeof window === 'undefined') return;

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
