import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Shield, ShieldAlert, ShieldCheck, Users, Plus, Search, Settings2, Trash2, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { index } from '@/routes/panel/roles';
import { RoleDeleteDialog } from './components/role-delete-dialog';
import { RoleModal, type GroupedModule, type RoleRecord } from './components/role-modal';

type Props = {
    roles: RoleRecord[];
    grouped_permissions: GroupedModule[];
    filters: {
        search: string;
    };
};

export default function RolesIndex({ roles, grouped_permissions, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedRole, setSelectedRole] = useState<RoleRecord | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<RoleRecord | null>(null);

    function handleSearch(value: string) {
        setSearchTerm(value);
        router.get(
            index.url(),
            { search: value },
            { preserveState: true, replace: true }
        );
    }

    function handleOpenCreate() {
        setSelectedRole(null);
        setModalOpen(true);
    }

    function handleOpenEdit(role: RoleRecord) {
        setSelectedRole(role);
        setModalOpen(true);
    }

    function handleOpenDelete(role: RoleRecord) {
        setRoleToDelete(role);
        setDeleteDialogOpen(true);
    }

    const totalPermissionsCount = grouped_permissions.reduce(
        (acc, m) => acc + m.permissions.length,
        0
    );

    return (
        <>
            <Head title="Roles y Permisos" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight">Roles y Permisos</h1>
                            <Badge variant="secondary" className="gap-1 text-xs">
                                <Shield className="size-3 text-primary" />
                                {roles.length} roles definidos
                            </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm">
                            Administra los roles del staff interno y define la matriz de permisos para cada uno.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Button id="roles-create-btn" className="gap-2" onClick={handleOpenCreate}>
                            <Plus className="size-4" />
                            Nuevo Rol
                        </Button>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full max-w-sm">
                        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                        <Input
                            id="roles-search-input"
                            placeholder="Buscar rol por nombre..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>

                {/* Tabla de Roles */}
                <div className="rounded-lg border border-sidebar-border/70 dark:border-sidebar-border overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead>Nombre del Rol</TableHead>
                                <TableHead>Tipo de Rol</TableHead>
                                <TableHead>Usuarios Asignados</TableHead>
                                <TableHead>Permisos Activos</TableHead>
                                <TableHead className="w-[100px] text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {roles.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-muted-foreground h-24 text-center">
                                        No se encontraron roles con el término de búsqueda.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                roles.map((role) => {
                                    return (
                                        <TableRow key={role.id} className="group">
                                            {/* Nombre del Rol */}
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                                                        role.is_system
                                                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                                            : 'bg-primary/10 text-primary'
                                                    }`}>
                                                        {role.is_system ? (
                                                            <ShieldAlert className="size-5" />
                                                        ) : (
                                                            <ShieldCheck className="size-5" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-semibold text-sm leading-none">
                                                                {role.name}
                                                            </p>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {role.is_system
                                                                ? 'Rol base con control y acceso total al sistema'
                                                                : 'Rol operativo personalizado'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Tipo de Rol */}
                                            <TableCell>
                                                {role.is_system ? (
                                                    <Badge className="bg-amber-100/40 text-amber-900 border-amber-300 dark:text-amber-200 text-xs">
                                                        Sistema (Protegido)
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-xs">
                                                        Personalizado
                                                    </Badge>
                                                )}
                                            </TableCell>

                                            {/* Usuarios Asignados */}
                                            <TableCell>
                                                <Badge variant="secondary" className="gap-1.5 font-normal text-xs">
                                                    <Users className="size-3 text-muted-foreground" />
                                                    {role.users_count} {role.users_count === 1 ? 'usuario' : 'usuarios'}
                                                </Badge>
                                            </TableCell>

                                            {/* Permisos */}
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        variant={role.is_system ? 'default' : 'outline'}
                                                        className="font-mono text-xs"
                                                    >
                                                        {role.is_system
                                                            ? 'Todos los permisos'
                                                            : `${role.permissions_count} de ${totalPermissionsCount}`}
                                                    </Badge>
                                                </div>
                                            </TableCell>

                                            {/* Acciones */}
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 px-2 text-xs"
                                                        onClick={() => handleOpenEdit(role)}
                                                    >
                                                        <Settings2 className="mr-1.5 size-3.5" />
                                                        Configurar
                                                    </Button>

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                id={`role-actions-${role.id}`}
                                                                variant="ghost"
                                                                size="icon"
                                                                className="size-8"
                                                            >
                                                                <MoreHorizontal className="size-4" />
                                                                <span className="sr-only">Acciones para {role.name}</span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-[180px]">
                                                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => handleOpenEdit(role)}>
                                                                <Settings2 className="mr-2 size-4" />
                                                                Editar Permisos
                                                            </DropdownMenuItem>
                                                            {!role.is_system && (
                                                                <>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem
                                                                        onClick={() => handleOpenDelete(role)}
                                                                        className="text-destructive focus:text-destructive"
                                                                    >
                                                                        <Trash2 className="mr-2 size-4" />
                                                                        Eliminar Rol
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Modales */}
                <RoleModal
                    role={selectedRole}
                    groupedPermissions={grouped_permissions}
                    open={modalOpen}
                    onOpenChange={setModalOpen}
                />

                <RoleDeleteDialog
                    role={roleToDelete}
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                />
            </div>
        </>
    );
}

RolesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Gestión de acceso',
            href: '#',
        },
        {
            title: 'Roles y permisos',
            href: index.url(),
        },
    ],
};
