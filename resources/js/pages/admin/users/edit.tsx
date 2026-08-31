import { Head } from '@inertiajs/react';
import { edit as editRoute, index, update } from '@/routes/panel/usuarios';
import { RoleItem, ExternalCapability, UserFormData, UserForm } from './components/user-form';

type Props = {
    user: UserFormData;
    roles: RoleItem[];
    external_capabilities: ExternalCapability[];
};

export default function UsersEdit({ user, roles, external_capabilities }: Props) {
    return (
        <>
            <Head title={`Editar — ${user.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Editar Usuario</h1>
                    <p className="text-muted-foreground text-sm">
                        Modifica los datos, tipo de usuario y roles/permisos de <strong>{user.name}</strong>.
                    </p>
                </div>

                <div className="mx-auto w-full max-w-2xl">
                    <UserForm
                        user={user}
                        roles={roles}
                        externalCapabilities={external_capabilities}
                        action={update.url(user.id!)}
                        method="put"
                    />
                </div>
            </div>
        </>
    );
}

UsersEdit.layout = {
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
            title: 'Editar Usuario',
            href: editRoute.url(0),
        },
    ],
};
