import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { MailPlus, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { index } from '@/routes/admin/users';
import { UsersActionDropdown } from './components/users-action-dropdown';
import { UsersPagination } from './components/users-pagination';
import { UsersToolbar } from './components/users-toolbar';

type User = {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
};

type PaginatedUsers = {
    data: User[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
};

type Filters = {
    search: string;
    status: string;
    per_page: number;
};

type Props = {
    users: PaginatedUsers;
    filters: Filters;
};

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((word) => word[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

export default function UsersIndex({ users, filters }: Props) {
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    const allOnPageSelected = users.data.length > 0 && users.data.every((u) => selectedIds.has(u.id));
    const someOnPageSelected = users.data.some((u) => selectedIds.has(u.id));

    function toggleAll(checked: boolean) {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            for (const user of users.data) {
                if (checked) {
                    next.add(user.id);
                } else {
                    next.delete(user.id);
                }
            }
            return next;
        });
    }

    function toggleRow(userId: number, checked: boolean) {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (checked) {
                next.add(userId);
            } else {
                next.delete(userId);
            }
            return next;
        });
    }

    return (
        <>
            <Head title="Usuarios" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header: título + subtítulo + botones */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Usuarios</h1>
                        <p className="text-muted-foreground text-sm">
                            Aquí tienes la lista de todos los usuarios del sistema.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button id="users-invite-btn" variant="outline">
                            <MailPlus className="mr-2 size-4" />
                            Invitar Usuario
                        </Button>
                        <Button id="users-add-btn">
                            <UserPlus className="mr-2 size-4" />
                            Nuevo Usuario
                        </Button>
                    </div>
                </div>

                {/* Toolbar: búsqueda + filtros */}
                <UsersToolbar filters={filters} />

                {/* Tabla */}
                <div className="rounded-lg border border-sidebar-border/70 dark:border-sidebar-border">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[40px]">
                                    <Checkbox
                                        id="users-select-all"
                                        checked={
                                            allOnPageSelected || (someOnPageSelected && 'indeterminate')
                                        }
                                        onCheckedChange={(checked) => toggleAll(!!checked)}
                                        aria-label="Seleccionar todos"
                                        className="translate-y-0.5"
                                    />
                                </TableHead>
                                <TableHead>Usuario</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="hidden md:table-cell">Creado</TableHead>
                                <TableHead className="w-[50px]" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-muted-foreground h-24 text-center">
                                        No se encontraron usuarios.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.data.map((user) => (
                                    <TableRow
                                        key={user.id}
                                        data-state={selectedIds.has(user.id) ? 'selected' : undefined}
                                    >
                                        <TableCell>
                                            <Checkbox
                                                id={`users-select-${user.id}`}
                                                checked={selectedIds.has(user.id)}
                                                onCheckedChange={(checked) =>
                                                    toggleRow(user.id, !!checked)
                                                }
                                                aria-label={`Seleccionar ${user.name}`}
                                                className="translate-y-0.5"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                                                    {getInitials(user.name)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="truncate font-medium leading-none">
                                                        {user.name}
                                                    </p>
                                                    <p className="text-muted-foreground mt-1 truncate text-xs">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {user.email_verified_at ? (
                                                <Badge className="bg-teal-100/30 text-teal-900 border-teal-200 dark:text-teal-200">
                                                    Verificado
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-amber-100/30 text-amber-900 border-amber-200 dark:text-amber-200">
                                                    Pendiente
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground hidden md:table-cell">
                                            {new Date(user.created_at).toLocaleDateString('es-PE', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </TableCell>
                                        <TableCell>
                                            <UsersActionDropdown userId={user.id} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Paginación */}
                <UsersPagination
                    meta={{
                        current_page: users.current_page,
                        last_page: users.last_page,
                        per_page: users.per_page,
                        total: users.total,
                        from: users.from ?? null,
                        to: users.to ?? null,
                    }}
                    filters={filters}
                    selectedCount={selectedIds.size}
                />
            </div>
        </>
    );
}

UsersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Administracion',
            href: '#',
        },
        {
            title: 'Usuarios',
            href: index.url(),
        },
    ],
};
