import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Check, Shield, Lock, Save, Loader2 } from 'lucide-react';
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
import { resolveIcon } from '@/lib/icon-map';
import { update, updateRoles } from '@/routes/admin/menus';

export type MenuItemRecord = {
    id: number;
    key: string;
    label: string;
    icon: string | null;
    route: string | null;
    url: string | null;
    resolved_url: string | null;
    permission_required: string | null;
    module: string | null;
    area: 'panel' | 'portal';
    parent_id: number | null;
    parent_label?: string | null;
    order: number;
    is_active: boolean;
    roles_with_access: string[];
};

export type RoleRecord = {
    id: number;
    name: string;
};

type Props = {
    menu: MenuItemRecord | null;
    roles: RoleRecord[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function MenuEditDialog({ menu, roles, open, onOpenChange }: Props) {
    const [label, setLabel] = useState('');
    const [icon, setIcon] = useState('');
    const [order, setOrder] = useState(0);
    const [isActive, setIsActive] = useState(true);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (menu) {
            setLabel(menu.label);
            setIcon(menu.icon ?? '');
            setOrder(menu.order);
            setIsActive(menu.is_active);
            setSelectedRoles(menu.roles_with_access ?? []);
        }
    }, [menu]);

    if (!menu) {
        return null;
    }

    const ItemIcon = resolveIcon(icon || menu.icon);

    function toggleRole(roleName: string, checked: boolean) {
        if (roleName === 'super-admin') return; // Super admin always has access

        setSelectedRoles((prev) => {
            if (checked) {
                return [...prev, roleName];
            }
            return prev.filter((r) => r !== roleName);
        });
    }

    function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (!menu) return;

        setIsSaving(true);

        // 1. Update basic details
        router.put(
            update.url(menu.id),
            {
                label,
                icon: icon || null,
                order: Number(order),
                is_active: isActive,
                permission_required: menu.permission_required,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    // 2. If it has permission_required, also sync roles
                    if (menu.permission_required) {
                        router.put(
                            updateRoles.url(menu.id),
                            {
                                roles: selectedRoles,
                            },
                            {
                                preserveScroll: true,
                                onSuccess: () => {
                                    setIsSaving(false);
                                    onOpenChange(false);
                                },
                                onError: () => setIsSaving(false),
                            }
                        );
                    } else {
                        setIsSaving(false);
                        onOpenChange(false);
                    }
                },
                onError: () => setIsSaving(false),
            }
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px]">
                <form onSubmit={handleSave}>
                    <DialogHeader>
                        <div className="flex items-center gap-2">
                            {ItemIcon && (
                                <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-md">
                                    <ItemIcon className="size-4" />
                                </div>
                            )}
                            <div>
                                <DialogTitle>Configurar Menú: {menu.label}</DialogTitle>
                                <DialogDescription className="text-xs">
                                    Clave: <code className="text-primary font-mono">{menu.key}</code>
                                    {menu.parent_label && ` • Submenú de: ${menu.parent_label}`}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* Datos Básicos */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-1.5 col-span-2 sm:col-span-1">
                                <Label htmlFor="menu-label">Nombre del menú</Label>
                                <Input
                                    id="menu-label"
                                    value={label}
                                    onChange={(e) => setLabel(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="grid gap-1.5 col-span-2 sm:col-span-1">
                                <Label htmlFor="menu-icon">Icono Lucide</Label>
                                <Input
                                    id="menu-icon"
                                    value={icon}
                                    onChange={(e) => setIcon(e.target.value)}
                                    placeholder="Ej: LayoutGrid, Users..."
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-1.5">
                                <Label htmlFor="menu-order">Orden de aparición</Label>
                                <Input
                                    id="menu-order"
                                    type="number"
                                    min="0"
                                    value={order}
                                    onChange={(e) => setOrder(Number(e.target.value))}
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-6">
                                <Checkbox
                                    id="menu-is-active"
                                    checked={isActive}
                                    onCheckedChange={(checked) => setIsActive(!!checked)}
                                />
                                <Label htmlFor="menu-is-active" className="cursor-pointer">
                                    Menú activo y visible
                                </Label>
                            </div>
                        </div>

                        {/* Información del Permiso */}
                        <div className="rounded-lg border bg-muted/40 p-3 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
                                    <Lock className="size-3.5" />
                                    Permiso Requerido:
                                </span>
                                {menu.permission_required ? (
                                    <Badge variant="outline" className="font-mono bg-background">
                                        {menu.permission_required}
                                    </Badge>
                                ) : (
                                    <span className="text-muted-foreground italic">
                                        Público para todos los usuarios autenticados
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Asignación de Roles */}
                        {menu.permission_required ? (
                            <div className="space-y-2.5">
                                <Label className="flex items-center gap-1.5 font-semibold text-sm">
                                    <Shield className="size-4 text-primary" />
                                    Roles con acceso a este menú
                                </Label>
                                <p className="text-muted-foreground text-xs">
                                    Marca los roles a los que deseas otorgar acceso a este módulo:
                                </p>

                                <div className="grid gap-2 rounded-lg border p-3">
                                    {roles.map((role) => {
                                        const isSuperAdmin = role.name === 'super-admin';
                                        const isChecked = isSuperAdmin || selectedRoles.includes(role.name);

                                        return (
                                            <div
                                                key={role.id}
                                                className="flex items-center justify-between rounded-md p-1.5 hover:bg-muted/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <Checkbox
                                                        id={`role-check-${role.id}`}
                                                        checked={isChecked}
                                                        disabled={isSuperAdmin}
                                                        onCheckedChange={(checked) =>
                                                            toggleRole(role.name, !!checked)
                                                        }
                                                    />
                                                    <Label
                                                        htmlFor={`role-check-${role.id}`}
                                                        className={`cursor-pointer font-medium text-sm ${
                                                            isSuperAdmin ? 'text-muted-foreground' : ''
                                                        }`}
                                                    >
                                                        {role.name}
                                                    </Label>
                                                </div>
                                                {isSuperAdmin ? (
                                                    <Badge variant="secondary" className="text-[10px]">
                                                        Acceso Total
                                                    </Badge>
                                                ) : isChecked ? (
                                                    <span className="text-xs text-teal-600 dark:text-teal-400 font-medium flex items-center gap-1">
                                                        <Check className="size-3.5" /> Concedido
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">
                                                        Sin acceso
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="text-xs text-muted-foreground bg-amber-500/10 text-amber-900 dark:text-amber-200 border border-amber-500/20 rounded-md p-2.5">
                                Este elemento no requiere un permiso específico; está disponible para cualquier usuario con acceso al área correspondientes ({menu.area}).
                            </div>
                        )}
                    </div>

                    <DialogFooter>
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
                                    Guardar Cambios
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
