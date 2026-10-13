import { Head } from '@inertiajs/react';
import type { DbTheme } from '@/hooks/use-appearance';
import { ThemeDesignerForm } from './components/theme-designer-form';

interface Props {
    theme: DbTheme;
    usersCount: number;
}

export default function ThemeEdit({ theme, usersCount }: Props) {
    return (
        <>
            <Head title={`Editar tema: ${theme.name}`} />
            <ThemeDesignerForm
                theme={theme}
                isEditing
                usersCount={usersCount}
            />
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
            title: 'Editar tema',
            href: '#',
        },
    ],
};
