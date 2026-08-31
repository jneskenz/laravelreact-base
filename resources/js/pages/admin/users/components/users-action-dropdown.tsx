import { Link, router } from '@inertiajs/react';
import { Ellipsis, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { destroy, edit } from '@/routes/panel/usuarios';

type Props = {
    userId: number;
};

export function UsersActionDropdown({ userId }: Props) {
    function handleDelete() {
        if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
            router.delete(destroy.url(userId), {
                preserveScroll: true,
            });
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    id={`users-action-${userId}`}
                    variant="ghost"
                    size="icon"
                    className="data-[state=open]:bg-muted size-8"
                >
                    <Ellipsis className="size-4" />
                    <span className="sr-only">Abrir menú</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuItem asChild>
                    <Link href={edit.url(userId)}>
                        <Pencil className="mr-2 size-4" />
                        Editar
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleDelete}>
                    <Trash2 className="mr-2 size-4" />
                    Eliminar
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
