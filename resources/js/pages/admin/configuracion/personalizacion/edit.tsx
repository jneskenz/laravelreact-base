import { Head } from '@inertiajs/react';
import { ThemeDesignerForm } from './components/theme-designer-form';
import type { DbTheme } from '@/hooks/use-appearance';

interface Props {
    theme: DbTheme;
}

export default function ThemeEdit({ theme }: Props) {
    return (
        <>
            <Head title={`Editar Tema: ${theme.name} - Personalización`} />
            <ThemeDesignerForm theme={theme} isEditing={true} />
        </>
    );
}

ThemeEdit.layout = {
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
            title: 'Editar Tema',
            href: '#',
        },
    ],
};
