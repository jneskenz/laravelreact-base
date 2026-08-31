import { router } from '@inertiajs/react';
import { MoreHorizontal, Settings2, Power, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { destroy, toggle } from '@/routes/panel/menus';
import type { MenuItemRecord } from './menu-edit-dialog';

type Props = {
    menu: MenuItemRecord;
    onEdit: (menu: MenuItemRecord) => void;
};

export function MenuActionDropdown({ menu, onEdit }: Props) {
    function handleToggleActive() {
        router.patch(toggle.url(menu.id), {}, { preserveScroll: true });
    }

    function handleDelete() {
        if (confirm(`¿Estás seguro de eliminar el menú "${menu.label}"? Esta acción también eliminará sus submenús si los tiene.`)) {
            router.delete(destroy.url(menu.id), { preserveScroll: true });
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    id={`menu-actions-${menu.id}`}
                    variant="ghost"
                    size="icon"
                    className="size-8"
                >
                    <MoreHorizontal className="size-4" />
                    <span className="sr-only">Acciones para {menu.label}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px]">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onEdit(menu)}>
                    <Settings2 className="mr-2 size-4" />
                    Configurar Roles
                </DropdownMenuItem>
                {menu.resolved_url && (
                    <DropdownMenuItem asChild>
                        <a href={menu.resolved_url} target="_blank" rel="noreferrer">
                            <Eye className="mr-2 size-4" />
                            Abrir enlace
                        </a>
                    </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={handleToggleActive}
                    className={menu.is_active ? 'text-amber-600 dark:text-amber-400' : 'text-teal-600 dark:text-teal-400'}
                >
                    <Power className="mr-2 size-4" />
                    {menu.is_active ? 'Desactivar menú' : 'Activar menú'}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-destructive focus:text-destructive"
                >
                    <Trash2 className="mr-2 size-4" />
                    Eliminar menú
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

