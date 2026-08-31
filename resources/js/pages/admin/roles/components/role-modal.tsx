import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Shield, ShieldAlert, CheckSquare, Square, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { store, update } from '@/routes/panel/roles';

export type PermissionItem = {
    id: number;
    name: string;
};

export type GroupedModule = {
    key: string;
    title: string;
    permissions: PermissionItem[];
};

export type RoleRecord = {
    id: number;
    name: string;
    is_system: boolean;
    users_count: number;
    permissions_count: number;
    permissions: string[];
};

type Props = {
    role: RoleRecord | null;
    groupedPermissions: GroupedModule[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function RoleModal({ role, groupedPermissions, open, onOpenChange }: Props) {
    const isEditing = !!role;
    const [name, setName] = useState('');
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (role) {
            setName(role.name);
            setSelectedPermissions(role.permissions || []);
        } else {
            setName('');
            setSelectedPermissions([]);
        }
        setErrors({});
    }, [role, open]);

    function togglePermission(permName: string, checked: boolean) {
        if (role?.is_system) return;

        setSelectedPermissions((prev) => {
            if (checked) {
                return [...prev, permName];
            }
            return prev.filter((p) => p !== permName);
        });
    }

    function toggleModuleAll(module: GroupedModule) {
        if (role?.is_system) return;

        const modulePermNames = module.permissions.map((p) => p.name);
        const allModuleSelected = modulePermNames.every((p) => selectedPermissions.includes(p));

        setSelectedPermissions((prev) => {
            if (allModuleSelected) {
                return prev.filter((p) => !modulePermNames.includes(p));
            } else {
                const combined = new Set([...prev, ...modulePermNames]);
                return Array.from(combined);
            }
        });
    }

    function handleSelectAll() {
        if (role?.is_system) return;
        const all = groupedPermissions.flatMap((m) => m.permissions.map((p) => p.name));
        setSelectedPermissions(all);
    }

    function handleDeselectAll() {
        if (role?.is_system) return;
        setSelectedPermissions([]);
    }

    function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setIsSaving(true);
        setErrors({});

        if (isEditing) {
            router.put(
                update.url(role.id),
                {
                    name,
                    permissions: selectedPermissions,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setIsSaving(false);
                        onOpenChange(false);
                    },
                    onError: (errs) => {
                        setErrors(errs);
                        setIsSaving(false);
                    },
                }
            );
        } else {
            router.post(
                store.url(),
                {
                    name,
                    permissions: selectedPermissions,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setIsSaving(false);
                        onOpenChange(false);
                    },
                    onError: (errs) => {
                        setErrors(errs);
                        setIsSaving(false);
                    },
                }
            );
        }
    }

    const totalPermissionsCount = groupedPermissions.reduce(
        (acc, m) => acc + m.permissions.length,
        0
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[760px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
                    <DialogHeader className="p-6 pb-4 border-b">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2.5">
                                <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
                                    <Shield className="size-5" />
                                </div>
                                <div>
                                    <DialogTitle className="text-lg">
                                        {isEditing ? `Configurar Rol: ${role.name}` : 'Crear Nuevo Rol'}
                                    </DialogTitle>
                                    <DialogDescription className="text-xs">
                                        Define las facultades y permisos operativos para los usuarios asignados a este rol.
                                    </DialogDescription>
                                </div>
                            </div>
                            {role?.is_system && (
                                <Badge variant="secondary" className="gap-1 border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10">
                                    <ShieldAlert className="size-3" />
                                    Rol de Sistema
                                </Badge>
                            )}
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Campo Nombre */}
                        <div className="grid gap-2">
                            <Label htmlFor="role-name" className="font-semibold text-sm">
                                Nombre del Rol <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="role-name"
                                placeholder="Ej: veterinario, coordinador-rescates, encargado-albergue"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={role?.is_system}
                                required
                            />
                            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                            <p className="text-xs text-muted-foreground">
                                Identificador único para el staff interno (se recomienda usar minúsculas y guiones).
                            </p>
                        </div>

                        {/* Matriz de Permisos */}
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b pb-2">
                                <div>
                                    <h4 className="font-semibold text-sm">Matriz de Permisos Operativos</h4>
                                    <p className="text-xs text-muted-foreground">
                                        {selectedPermissions.length} de {totalPermissionsCount} permisos seleccionados
                                    </p>
                                </div>

                                {!role?.is_system && (
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleSelectAll}
                                            className="h-7 text-xs px-2"
                                        >
                                            <CheckSquare className="mr-1 size-3.5" />
                                            Marcar todos
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleDeselectAll}
                                            className="h-7 text-xs px-2 text-muted-foreground"
                                        >
                                            <Square className="mr-1 size-3.5" />
                                            Desmarcar todos
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Módulos */}
                            <div className="grid gap-4">
                                {groupedPermissions.map((module) => {
                                    const modulePermNames = module.permissions.map((p) => p.name);
                                    const selectedInModule = modulePermNames.filter((p) =>
                                        selectedPermissions.includes(p)
                                    ).length;
                                    const allSelected = selectedInModule === modulePermNames.length;

                                    return (
                                        <div
                                            key={module.key}
                                            className="rounded-lg border bg-card/60 p-3.5 space-y-3 transition-colors hover:border-primary/40"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-sm text-foreground">
                                                        {module.title}
                                                    </span>
                                                    <Badge
                                                        variant={selectedInModule > 0 ? 'default' : 'outline'}
                                                        className="text-[10px] px-1.5 py-0 h-4"
                                                    >
                                                        {selectedInModule} / {module.permissions.length}
                                                    </Badge>
                                                </div>

                                                {!role?.is_system && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => toggleModuleAll(module)}
                                                        className="h-6 text-[11px] px-2 text-primary"
                                                    >
                                                        {allSelected ? 'Desmarcar módulo' : 'Marcar módulo'}
                                                    </Button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-border/50">
                                                {module.permissions.map((perm) => {
                                                    const isChecked = selectedPermissions.includes(perm.name);
                                                    return (
                                                        <div
                                                            key={perm.id}
                                                            className="flex items-start gap-2 rounded p-1 hover:bg-muted/40"
                                                        >
                                                            <Checkbox
                                                                id={`perm-${perm.id}`}
                                                                checked={isChecked}
                                                                disabled={role?.is_system}
                                                                onCheckedChange={(checked) =>
                                                                    togglePermission(perm.name, !!checked)
                                                                }
                                                                className="mt-0.5"
                                                            />
                                                            <Label
                                                                htmlFor={`perm-${perm.id}`}
                                                                className="cursor-pointer text-xs leading-tight font-mono text-muted-foreground hover:text-foreground"
                                                            >
                                                                {perm.name}
                                                            </Label>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-4 border-t bg-muted/20 sm:justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSaving}
                        >
                            Cancelar
                        </Button>

                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 size-4" />
                                    {isEditing ? 'Guardar Cambios' : 'Crear Rol'}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
