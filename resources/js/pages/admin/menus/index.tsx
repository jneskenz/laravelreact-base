import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Plus, ShieldCheck, Sparkles } from 'lucide-react';
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
import { resolveIcon } from '@/lib/icon-map';
import { index } from '@/routes/panel/menus';
import { MenuActionDropdown } from './components/menu-action-dropdown';
import { MenuCreateDialog, type ParentMenuRecord } from './components/menu-create-dialog';
import { MenuEditDialog, type MenuItemRecord, type RoleRecord } from './components/menu-edit-dialog';
import { MenusPagination } from './components/menus-pagination';
import { MenusToolbar, type MenuFilters } from './components/menus-toolbar';

type PaginatedMenus = {
    data: MenuItemRecord[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
};

type Props = {
    menus: PaginatedMenus;
    roles: RoleRecord[];
    modules: string[];
    parent_menus: ParentMenuRecord[];
    filters: MenuFilters;
};

export default function MenusIndex({ menus, roles, modules, parent_menus = [], filters }: Props) {
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [editingMenu, setEditingMenu] = useState<MenuItemRecord | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    const allOnPageSelected = menus.data.length > 0 && menus.data.every((m) => selectedIds.has(m.id));
    const someOnPageSelected = menus.data.some((m) => selectedIds.has(m.id));

    function toggleAll(checked: boolean) {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            for (const menu of menus.data) {
                if (checked) {
                    next.add(menu.id);
                } else {
                    next.delete(menu.id);
                }
            }
            return next;
        });
    }

    function toggleRow(menuId: number, checked: boolean) {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (checked) {
                next.add(menuId);
            } else {
                next.delete(menuId);
            }
            return next;
        });
    }

    function handleOpenEdit(menu: MenuItemRecord) {
        setEditingMenu(menu);
        setDialogOpen(true);
    }

    return (
        <>
            <Head title="Asignación de Menús" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight">Asignación de Menús</h1>
                            <Badge variant="secondary" className="gap-1 text-xs">
                                <Sparkles className="size-3 text-primary" />
                                {menus.total} ítems
                            </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm">
                            Administra el árbol maestro de navegación, visibilidad por módulo y matriz de roles con acceso.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            id="menus-create-btn"
                            className="gap-2"
                            onClick={() => setCreateDialogOpen(true)}
                        >
                            <Plus className="size-4" />
                            Nuevo Menú
                        </Button>
                    </div>
                </div>

                {/* Toolbar */}
                <MenusToolbar filters={filters} modules={modules} />

                {/* Tabla de Menús */}
                <div className="rounded-lg border border-sidebar-border/70 dark:border-sidebar-border overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[40px]">
                                    <Checkbox
                                        id="menus-select-all"
                                        checked={allOnPageSelected || (someOnPageSelected && 'indeterminate')}
                                        onCheckedChange={(checked) => toggleAll(!!checked)}
                                        aria-label="Seleccionar todos"
                                        className="translate-y-0.5"
                                    />
                                </TableHead>
                                <TableHead>Menú / Módulo</TableHead>
                                <TableHead>Área</TableHead>
                                <TableHead>Permiso Requerido</TableHead>
                                <TableHead>Roles con Acceso</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="w-[80px] text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {menus.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-muted-foreground h-24 text-center">
                                        No se encontraron menús con los filtros seleccionados.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                menus.data.map((menu) => {
                                    const ItemIcon = resolveIcon(menu.icon);
                                    const isPanel = menu.area === 'panel';

                                    return (
                                        <TableRow
                                            key={menu.id}
                                            data-state={selectedIds.has(menu.id) ? 'selected' : undefined}
                                            className="group"
                                        >
                                            <TableCell>
                                                <Checkbox
                                                    id={`menus-select-${menu.id}`}
                                                    checked={selectedIds.has(menu.id)}
                                                    onCheckedChange={(checked) => toggleRow(menu.id, !!checked)}
                                                    aria-label={`Seleccionar ${menu.label}`}
                                                    className="translate-y-0.5"
                                                />
                                            </TableCell>

                                            {/* Menú y clave */}
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                                                        menu.is_active 
                                                            ? 'bg-primary/10 text-primary' 
                                                            : 'bg-muted text-muted-foreground opacity-60'
                                                    }`}>
                                                        {ItemIcon ? (
                                                            <ItemIcon className="size-4" />
                                                        ) : (
                                                            <span className="text-xs font-bold">#</span>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-1.5">
                                                            <p className="font-semibold text-sm leading-none truncate">
                                                                {menu.label}
                                                            </p>
                                                            {menu.parent_label && (
                                                                <span className="text-[11px] text-muted-foreground">
                                                                    (en {menu.parent_label})
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <code className="text-muted-foreground text-[11px] font-mono">
                                                                {menu.key}
                                                            </code>
                                                            {menu.module && (
                                                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 uppercase">
                                                                    {menu.module}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Área */}
                                            <TableCell>
                                                {isPanel ? (
                                                    <Badge className="bg-sky-100/40 text-sky-900 border-sky-200 dark:text-sky-200 text-xs">
                                                        Panel Interno
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-purple-100/40 text-purple-900 border-purple-200 dark:text-purple-200 text-xs">
                                                        Portal Externo
                                                    </Badge>
                                                )}
                                            </TableCell>

                                            {/* Permiso Requerido */}
                                            <TableCell>
                                                {menu.permission_required ? (
                                                    <Badge variant="outline" className="font-mono text-xs bg-muted/30">
                                                        {menu.permission_required}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs italic">
                                                        Acceso público
                                                    </span>
                                                )}
                                            </TableCell>

                                            {/* Roles con Acceso */}
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1 max-w-[280px]">
                                                    {menu.roles_with_access && menu.roles_with_access.length > 0 ? (
                                                        menu.roles_with_access.map((roleName) => (
                                                            <Badge
                                                                key={roleName}
                                                                variant="secondary"
                                                                className={`text-[11px] font-normal ${
                                                                    roleName === 'super-admin'
                                                                        ? 'border-primary/30 text-primary'
                                                                        : ''
                                                                }`}
                                                            >
                                                                <ShieldCheck className="mr-1 size-3" />
                                                                {roleName}
                                                            </Badge>
                                                        ))
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs italic">
                                                            Sin roles asignados
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>

                                            {/* Estado */}
                                            <TableCell>
                                                {menu.is_active ? (
                                                    <Badge className="bg-teal-100/30 text-teal-900 border-teal-200 dark:text-teal-200 cursor-pointer hover:opacity-80">
                                                        Activo
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-zinc-200/50 text-zinc-700 border-zinc-300 dark:text-zinc-300 cursor-pointer hover:opacity-80">
                                                        Inactivo
                                                    </Badge>
                                                )}
                                            </TableCell>

                                            {/* Acciones */}
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 px-2 text-xs"
                                                        onClick={() => handleOpenEdit(menu)}
                                                    >
                                                        Configurar
                                                    </Button>
                                                    <MenuActionDropdown menu={menu} onEdit={handleOpenEdit} />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Paginación */}
                <MenusPagination
                    meta={{
                        current_page: menus.current_page,
                        last_page: menus.last_page,
                        per_page: menus.per_page,
                        total: menus.total,
                        from: menus.from ?? null,
                        to: menus.to ?? null,
                    }}
                    filters={filters}
                    selectedCount={selectedIds.size}
                />

                {/* Diálogo de Edición y Asignación de Roles */}
                <MenuEditDialog
                    menu={editingMenu}
                    roles={roles}
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                />

                {/* Diálogo de Creación de Nuevo Menú */}
                <MenuCreateDialog
                    roles={roles}
                    modules={modules}
                    parentMenus={parent_menus}
                    open={createDialogOpen}
                    onOpenChange={setCreateDialogOpen}
                />
            </div>
        </>
    );
}

MenusIndex.layout = {
    breadcrumbs: [
        {
            title: 'Gestión de acceso',
            href: '#',
        },
        {
            title: 'Asignación de menús',
            href: index.url(),
        },
    ],
};
