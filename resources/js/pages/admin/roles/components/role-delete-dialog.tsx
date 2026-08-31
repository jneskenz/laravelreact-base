import { useState } from 'react';
import { router } from '@inertiajs/react';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { destroy } from '@/routes/panel/roles';
import type { RoleRecord } from './role-modal';

type Props = {
    role: RoleRecord | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function RoleDeleteDialog({ role, open, onOpenChange }: Props) {
    const [isDeleting, setIsDeleting] = useState(false);

    if (!role) return null;

    function handleDelete() {
        if (!role) return;
        setIsDeleting(true);

        router.delete(destroy.url(role.id), {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleting(false);
                onOpenChange(false);
            },
            onError: () => {
                setIsDeleting(false);
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[440px]">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="bg-destructive/10 text-destructive flex size-10 shrink-0 items-center justify-center rounded-full">
                            <AlertTriangle className="size-5" />
                        </div>
                        <div>
                            <DialogTitle>Eliminar Rol</DialogTitle>
                            <DialogDescription className="text-xs">
                                Esta acción eliminará el rol de la organización.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="py-3 text-sm text-muted-foreground space-y-2">
                    <p>
                        ¿Estás seguro de que deseas eliminar permanentemente el rol{' '}
                        <strong className="text-foreground">{role.name}</strong>?
                    </p>
                    {role.users_count > 0 && (
                        <p className="text-destructive font-medium text-xs bg-destructive/10 p-2 rounded">
                            Advertencia: Este rol tiene {role.users_count} usuario(s) asignado(s). Debes reasignar a esos usuarios antes de poder eliminarlo.
                        </p>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isDeleting}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting || role.is_system || role.users_count > 0}
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="mr-2 size-4 animate-spin" />
                                Eliminando...
                            </>
                        ) : (
                            <>
                                <Trash2 className="mr-2 size-4" />
                                Eliminar Rol
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
