import { Head } from '@inertiajs/react';
import { create as createRoute, index, store } from '@/routes/panel/usuarios';
import { RoleItem, ExternalCapability, UserForm } from './components/user-form';

type Props = {
    roles: RoleItem[];
    external_capabilities: ExternalCapability[];
};

export default function UsersCreate({ roles, external_capabilities }: Props) {
    return (
        <>
            <Head title="Nuevo Usuario" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Nuevo Usuario</h1>
                    <p className="text-muted-foreground text-sm">
                        Completa el formulario para crear un nuevo usuario y asignar su rol o permisos.
                    </p>
                </div>

                <div className="mx-auto w-full max-w-2xl">
                    <UserForm
                        roles={roles}
                        externalCapabilities={external_capabilities}
                        action={store.url()}
                        method="post"
                    />
                </div>
            </div>
        </>
    );
}

UsersCreate.layout = {
    breadcrumbs: [
        {
            title: 'Gestión de acceso',
            href: '#',
        },
        {
            title: 'Usuarios',
            href: index.url(),
        },
        {
            title: 'Nuevo Usuario',
            href: createRoute.url(),
        },
    ],
};
