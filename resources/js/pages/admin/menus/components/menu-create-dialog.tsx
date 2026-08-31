import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Plus, Shield, Loader2 } from 'lucide-react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { resolveIcon } from '@/lib/icon-map';
import { store } from '@/routes/panel/menus';
import type { RoleRecord } from './menu-edit-dialog';

export type ParentMenuRecord = {
    id: number;
    key: string;
    label: string;
    area: string;
};

type Props = {
    roles: RoleRecord[];
    modules: string[];
    parentMenus: ParentMenuRecord[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function MenuCreateDialog({ roles, modules, parentMenus, open, onOpenChange }: Props) {
    const [label, setLabel] = useState('');
    const [key, setKey] = useState('');
    const [icon, setIcon] = useState('LayoutGrid');
    const [area, setArea] = useState<'panel' | 'portal'>('panel');
    const [parentId, setParentId] = useState<string>('none');
    const [module, setModule] = useState<string>('none');
    const [url, setUrl] = useState('');
    const [permissionRequired, setPermissionRequired] = useState('');
    const [order, setOrder] = useState(1);
    const [isActive, setIsActive] = useState(true);
    const [selectedRoles, setSelectedRoles] = useState<string[]>(['admin']);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const ItemIcon = resolveIcon(icon);

    function handleLabelChange(value: string) {
        setLabel(value);
        if (!key || key.startsWith('custom.')) {
            const slug = value
                .toLowerCase()
                .trim()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '.')
                .replace(/^\.+|\.+$/g, '');
            if (slug) {
                setKey(slug);
            }
        }
    }

    function toggleRole(roleName: string, checked: boolean) {
        if (roleName === 'super-admin') return;

        setSelectedRoles((prev) => {
            if (checked) {
                return [...prev, roleName];
            }
            return prev.filter((r) => r !== roleName);
        });
    }

    function resetForm() {
        setLabel('');
        setKey('');
        setIcon('LayoutGrid');
        setArea('panel');
        setParentId('none');
        setModule('none');
        setUrl('');
        setPermissionRequired('');
        setOrder(1);
        setIsActive(true);
        setSelectedRoles(['admin']);
        setErrors({});
    }

    function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setIsSaving(true);
        setErrors({});

        router.post(
            store.url(),
            {
                label,
                key,
                icon: icon || null,
                area,
                parent_id: parentId === 'none' ? null : Number(parentId),
                module: module === 'none' ? null : module,
                url: url || null,
                permission_required: permissionRequired || null,
                order: Number(order),
                is_active: isActive,
                roles: permissionRequired ? selectedRoles : [],
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSaving(false);
                    resetForm();
                    onOpenChange(false);
                },
                onError: (errs) => {
                    setErrors(errs);
                    setIsSaving(false);
                },
            }
        );
    }

    // Filter parent menus for selected area
    const availableParents = parentMenus.filter((p) => p.area === area);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSave}>
                    <DialogHeader>
                        <div className="flex items-center gap-2">
                            <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-md">
                                <Plus className="size-4" />
                            </div>
                            <div>
                                <DialogTitle>Crear Nuevo Menú</DialogTitle>
                                <DialogDescription className="text-xs">
                                    Agrega un nuevo elemento de navegación o submenú al árbol del sistema.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* Fila 1: Label y Clave */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-1.5 col-span-2 sm:col-span-1">
                                <Label htmlFor="create-menu-label">
                                    Nombre del menú <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="create-menu-label"
                                    placeholder="Ej: Reportes Especiales"
                                    value={label}
                                    onChange={(e) => handleLabelChange(e.target.value)}
                                    required
                                />
                                {errors.label && <p className="text-xs text-destructive">{errors.label}</p>}
                            </div>

                            <div className="grid gap-1.5 col-span-2 sm:col-span-1">
                                <Label htmlFor="create-menu-key">
                                    Clave identificadora única <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="create-menu-key"
                                    placeholder="Ej: reportes.especiales"
                                    value={key}
                                    onChange={(e) => setKey(e.target.value)}
                                    required
                                />
                                {errors.key && <p className="text-xs text-destructive">{errors.key}</p>}
                            </div>
                        </div>

                        {/* Fila 2: Área y Menú Padre */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-1.5 col-span-2 sm:col-span-1">
                                <Label htmlFor="create-menu-area">Área del sistema</Label>
                                <Select
                                    value={area}
                                    onValueChange={(val: 'panel' | 'portal') => {
                                        setArea(val);
                                        setParentId('none');
                                    }}
                                >
                                    <SelectTrigger id="create-menu-area">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="panel">Panel Interno (/panel)</SelectItem>
                                        <SelectItem value="portal">Portal Externo (/portal)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-1.5 col-span-2 sm:col-span-1">
                                <Label htmlFor="create-menu-parent">Menú Padre (opcional)</Label>
                                <Select value={parentId} onValueChange={setParentId}>
                                    <SelectTrigger id="create-menu-parent">
                                        <SelectValue placeholder="Ninguno (Menú principal)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Ninguno (Es menú principal)</SelectItem>
                                        {availableParents.map((p) => (
                                            <SelectItem key={p.id} value={String(p.id)}>
                                                {p.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Fila 3: Icono y Módulo */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-1.5 col-span-2 sm:col-span-1">
                                <Label htmlFor="create-menu-icon">Icono Lucide</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="create-menu-icon"
                                        placeholder="Ej: LayoutGrid, Shield..."
                                        value={icon}
                                        onChange={(e) => setIcon(e.target.value)}
                                    />
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted/40">
                                        {ItemIcon ? <ItemIcon className="size-4 text-primary" /> : <span className="text-xs">#</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-1.5 col-span-2 sm:col-span-1">
                                <Label htmlFor="create-menu-module">Módulo asociado</Label>
                                <Select value={module} onValueChange={setModule}>
                                    <SelectTrigger id="create-menu-module">
                                        <SelectValue placeholder="Ninguno" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Ninguno (General)</SelectItem>
                                        {modules.map((mod) => (
                                            <SelectItem key={mod} value={mod}>
                                                {mod.charAt(0).toUpperCase() + mod.slice(1)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Fila 4: URL y Permiso */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-1.5 col-span-2 sm:col-span-1">
                                <Label htmlFor="create-menu-url">Ruta o URL</Label>
                                <Input
                                    id="create-menu-url"
                                    placeholder="Ej: /panel/reportes/especiales"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                />
                            </div>

                            <div className="grid gap-1.5 col-span-2 sm:col-span-1">
                                <Label htmlFor="create-menu-perm">Permiso Requerido</Label>
                                <Input
                                    id="create-menu-perm"
                                    placeholder="Ej: reportes.ver"
                                    value={permissionRequired}
                                    onChange={(e) => setPermissionRequired(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Fila 5: Orden y Activo */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-1.5">
                                <Label htmlFor="create-menu-order">Orden de aparición</Label>
                                <Input
                                    id="create-menu-order"
                                    type="number"
                                    min="0"
                                    value={order}
                                    onChange={(e) => setOrder(Number(e.target.value))}
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-6">
                                <Checkbox
                                    id="create-menu-active"
                                    checked={isActive}
                                    onCheckedChange={(checked) => setIsActive(!!checked)}
                                />
                                <Label htmlFor="create-menu-active" className="cursor-pointer">
                                    Activo inmediatamente
                                </Label>
                            </div>
                        </div>

                        {/* Asignación inicial de roles si se especifica permiso */}
                        {permissionRequired && (
                            <div className="space-y-2.5 rounded-lg border p-3 bg-muted/20">
                                <Label className="flex items-center gap-1.5 font-semibold text-xs">
                                    <Shield className="size-3.5 text-primary" />
                                    Asignar permiso &quot;{permissionRequired}&quot; a roles:
                                </Label>

                                <div className="grid grid-cols-2 gap-2">
                                    {roles.map((role) => {
                                        const isSuperAdmin = role.name === 'super-admin';
                                        const isChecked = isSuperAdmin || selectedRoles.includes(role.name);

                                        return (
                                            <div key={role.id} className="flex items-center gap-2">
                                                <Checkbox
                                                    id={`create-role-${role.id}`}
                                                    checked={isChecked}
                                                    disabled={isSuperAdmin}
                                                    onCheckedChange={(checked) => toggleRole(role.name, !!checked)}
                                                />
                                                <Label htmlFor={`create-role-${role.id}`} className="cursor-pointer text-xs">
                                                    {role.name} {isSuperAdmin && '(Total)'}
                                                </Label>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                resetForm();
                                onOpenChange(false);
                            }}
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
                                    <Plus className="mr-2 size-4" />
                                    Crear Menú
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
