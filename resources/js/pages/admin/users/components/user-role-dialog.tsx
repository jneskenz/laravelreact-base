import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Shield, ShieldAlert, Users, Loader2, Save, UserCheck } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { updateRoles } from '@/routes/panel/usuarios';

export type RoleOption = {
    id: number;
    name: string;
};

export type ExternalCapability = {
    name: string;
    label: string;
    description: string;
};

export type UserForRole = {
    id: number;
    name: string;
    email: string;
    tipo_usuario: 'interno' | 'externo';
    roles?: { id: number; name: string }[];
    permissions?: { id: number; name: string }[];
};

type Props = {
    user: UserForRole | null;
    roles: RoleOption[];
    externalCapabilities: ExternalCapability[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((word) => word[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

export function UserRoleDialog({
    user,
    roles,
    externalCapabilities,
    open,
    onOpenChange,
}: Props) {
    const [tipoUsuario, setTipoUsuario] = useState<'interno' | 'externo'>('interno');
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (user) {
            setTipoUsuario(user.tipo_usuario);
            setSelectedRoles(user.roles ? user.roles.map((r) => r.name) : []);
            setSelectedPermissions(user.permissions ? user.permissions.map((p) => p.name) : []);
        }
        setErrors({});
    }, [user, open]);

    if (!user) return null;

    function toggleRole(roleName: string, checked: boolean) {
        setSelectedRoles((prev) => {
            if (checked) {
                return [...prev, roleName];
            }
            return prev.filter((r) => r !== roleName);
        });
    }

    function togglePermission(permName: string, checked: boolean) {
        setSelectedPermissions((prev) => {
            if (checked) {
                return [...prev, permName];
            }
            return prev.filter((p) => p !== permName);
        });
    }

    function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (!user) return;
        setIsSaving(true);
        setErrors({});

        router.put(
            updateRoles.url(user.id),
            {
                tipo_usuario: tipoUsuario,
                roles: tipoUsuario === 'interno' ? selectedRoles : [],
                permissions: tipoUsuario === 'externo' ? selectedPermissions : [],
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[560px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
                    {/* Header */}
                    <DialogHeader className="p-6 pb-4 border-b">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-full font-semibold text-sm">
                                {getInitials(user.name)}
                            </div>
                            <div className="min-w-0 flex-1">
                                <DialogTitle className="text-base truncate flex items-center gap-2">
                                    <span>Asignar Rol y Acceso</span>
                                </DialogTitle>
                                <DialogDescription className="text-xs truncate">
                                    {user.name} ({user.email})
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    {/* Contenido con scroll */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-5">
                        {/* Selector de Clasificación */}
                        <div className="grid gap-2">
                            <Label htmlFor="dialog-tipo-usuario" className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                                Clasificación de Usuario
                            </Label>
                            <Select
                                value={tipoUsuario}
                                onValueChange={(val: 'interno' | 'externo') => setTipoUsuario(val)}
                            >
                                <SelectTrigger id="dialog-tipo-usuario">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="interno">
                                        Staff Interno (Acceso al Panel /panel)
                                    </SelectItem>
                                    <SelectItem value="externo">
                                        Usuario Externo (Portal /portal: Donante, Voluntario, etc.)
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.tipo_usuario && (
                                <p className="text-xs text-destructive">{errors.tipo_usuario}</p>
                            )}
                        </div>

                        {/* Bloque Roles para Staff Interno */}
                        {tipoUsuario === 'interno' && (
                            <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Shield className="size-4 text-primary" />
                                        <span className="font-semibold text-sm">
                                            Roles Operativos Asignados
                                        </span>
                                    </div>
                                    <Badge variant="secondary" className="text-xs">
                                        {selectedRoles.length} seleccionados
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Selecciona uno o más roles que definirán el acceso a los módulos y menús del panel interno.
                                </p>

                                <div className="grid grid-cols-1 gap-2 pt-1">
                                    {roles.map((role) => {
                                        const isChecked = selectedRoles.includes(role.name);
                                        return (
                                            <div
                                                key={role.id}
                                                className={`flex items-center justify-between rounded border p-2.5 bg-background transition-colors hover:bg-muted/30 ${
                                                    isChecked ? 'border-primary/50 bg-primary/5' : ''
                                                }`}
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <Checkbox
                                                        id={`modal-role-${role.id}`}
                                                        checked={isChecked}
                                                        onCheckedChange={(checked) =>
                                                            toggleRole(role.name, !!checked)
                                                        }
                                                    />
                                                    <Label
                                                        htmlFor={`modal-role-${role.id}`}
                                                        className="cursor-pointer text-xs font-semibold"
                                                    >
                                                        {role.name}
                                                    </Label>
                                                </div>
                                                {role.name === 'super-admin' && (
                                                    <Badge className="bg-amber-100/50 text-amber-900 border-amber-300 dark:text-amber-200 text-[10px] h-4 px-1.5">
                                                        Control Total
                                                    </Badge>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                {errors.roles && (
                                    <p className="text-xs text-destructive">{errors.roles}</p>
                                )}
                            </div>
                        )}

                        {/* Bloque Capacidades para Usuario Externo */}
                        {tipoUsuario === 'externo' && (
                            <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Users className="size-4 text-purple-600 dark:text-purple-400" />
                                        <span className="font-semibold text-sm">
                                            Capacidades y Perfiles en el Portal
                                        </span>
                                    </div>
                                    <Badge variant="secondary" className="text-xs">
                                        {selectedPermissions.length} activas
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    El usuario puede acumular múltiples perfiles dentro del portal de la ONG.
                                </p>

                                <div className="grid grid-cols-1 gap-2 pt-1">
                                    {externalCapabilities.map((cap) => {
                                        const isChecked = selectedPermissions.includes(cap.name);
                                        return (
                                            <div
                                                key={cap.name}
                                                className={`flex items-start gap-2.5 rounded border p-2.5 bg-background transition-colors hover:bg-muted/30 ${
                                                    isChecked ? 'border-purple-500/40 bg-purple-500/5' : ''
                                                }`}
                                            >
                                                <Checkbox
                                                    id={`modal-cap-${cap.name}`}
                                                    checked={isChecked}
                                                    onCheckedChange={(checked) =>
                                                        togglePermission(cap.name, !!checked)
                                                    }
                                                    className="mt-0.5"
                                                />
                                                <div>
                                                    <Label
                                                        htmlFor={`modal-cap-${cap.name}`}
                                                        className="cursor-pointer text-xs font-semibold"
                                                    >
                                                        {cap.label}
                                                    </Label>
                                                    <p className="text-[11px] text-muted-foreground">
                                                        {cap.description}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                {errors.permissions && (
                                    <p className="text-xs text-destructive">{errors.permissions}</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
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
                                    Guardar Asignación
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
