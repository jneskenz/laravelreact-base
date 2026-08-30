import { Head } from '@inertiajs/react';
import { edit as editRoute, index, update } from '@/routes/admin/users';
import { UserForm } from './components/user-form';

type User = {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
};

type Props = {
    user: User;
};

export default function UsersEdit({ user }: Props) {
    return (
        <>
            <Head title={`Editar — ${user.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Editar Usuario</h1>
                    <p className="text-muted-foreground text-sm">
                        Modifica los datos de <strong>{user.name}</strong>.
                    </p>
                </div>

                <div className="mx-auto w-full max-w-2xl">
                    <UserForm
                        user={user}
                        action={update.url(user.id)}
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
            title: 'Administracion',
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
