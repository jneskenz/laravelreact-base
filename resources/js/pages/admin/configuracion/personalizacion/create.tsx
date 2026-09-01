import { Head } from '@inertiajs/react';
import { ThemeDesignerForm } from './components/theme-designer-form';
import type { DbTheme } from '@/hooks/use-appearance';

interface Props {
    baseTheme?: DbTheme;
}

export default function ThemeCreate({ baseTheme }: Props) {
    return (
        <>
            <Head title="Crear Tema Institucional - Personalización" />
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
            title: 'Nuevo Tema',
            href: '/panel/configuracion/personalizacion/create',
        },
    ],
};
