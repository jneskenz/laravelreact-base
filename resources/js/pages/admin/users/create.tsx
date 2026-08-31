import { Head } from '@inertiajs/react';
import { create as createRoute, index, store } from '@/routes/panel/usuarios';
import { UserForm } from './components/user-form';

export default function UsersCreate() {
    return (
        <>
            <Head title="Nuevo Usuario" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Nuevo Usuario</h1>
                    <p className="text-muted-foreground text-sm">
                        Completa el formulario para crear un nuevo usuario en el sistema.
                    </p>
                </div>

                <div className="mx-auto w-full max-w-2xl">
                    <UserForm action={store.url()} method="post" />
                </div>
            </div>
        </>
    );
}

UsersCreate.layout = {
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
            title: 'Nuevo Usuario',
            href: createRoute.url(),
        },
    ],
};
