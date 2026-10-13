import { Head } from '@inertiajs/react';
import type { DbTheme } from '@/hooks/use-appearance';
import { ThemeDesignerForm } from './components/theme-designer-form';

interface Props {
    baseTheme?: DbTheme;
}

export default function ThemeCreate({ baseTheme }: Props) {
    return (
        <>
            <Head title="Nuevo tema" />
            <ThemeDesignerForm theme={baseTheme} isEditing={false} />
        </>
    );
}

ThemeCreate.layout = {
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
            title: 'Personalización',
            href: '/panel/configuracion/personalizacion',
        },
        {
            title: 'Nuevo tema',
            href: '/panel/configuracion/personalizacion/create',
        },
    ],
};
