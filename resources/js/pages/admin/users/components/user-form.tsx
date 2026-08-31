import { useState } from 'react';
import { router, Link } from '@inertiajs/react';
import { ArrowLeft, Shield, Users, Loader2, Save } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { index } from '@/routes/panel/usuarios';

export type RoleItem = {
    id: number;
    name: string;
};

export type ExternalCapability = {
    name: string;
    label: string;
    description: string;
};

export type UserFormData = {
    id?: number;
    name: string;
    email: string;
    tipo_usuario: 'interno' | 'externo';
    roles?: string[];
    permissions?: string[];
};

type Props = {
    user?: UserFormData;
    roles: RoleItem[];
    externalCapabilities: ExternalCapability[];
    action: string;
    method: 'post' | 'put';
};

export function UserForm({ user, roles, externalCapabilities, action, method }: Props) {
    const isEditing = !!user;

    const [name, setName] = useState(user?.name ?? '');
    const [email, setEmail] = useState(user?.email ?? '');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [tipoUsuario, setTipoUsuario] = useState<'interno' | 'externo'>(
        user?.tipo_usuario ?? 'interno'
    );
    const [selectedRoles, setSelectedRoles] = useState<string[]>(user?.roles ?? ['admin']);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
        user?.permissions ?? []
    );
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

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

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsSaving(true);
        setErrors({});

        const payload: Record<string, any> = {
            name,
            email,
            tipo_usuario: tipoUsuario,
            roles: tipoUsuario === 'interno' ? selectedRoles : [],
            permissions: tipoUsuario === 'externo' ? selectedPermissions : [],
        };

        if (password) {
            payload.password = password;
            payload.password_confirmation = passwordConfirmation;
        }

        if (method === 'put') {
            router.put(action, payload, {
                preserveScroll: true,
                onSuccess: () => setIsSaving(false),
                onError: (errs) => {
                    setErrors(errs);
                    setIsSaving(false);
                },
            });
        } else {
            router.post(action, payload, {
                preserveScroll: true,
                onSuccess: () => setIsSaving(false),
                onError: (errs) => {
                    setErrors(errs);
                    setIsSaving(false);
                },
            });
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{isEditing ? 'Información del Usuario' : 'Datos del Nuevo Usuario'}</CardTitle>
                    <CardDescription>
                        {isEditing
                            ? 'Actualiza el nombre, email, tipo de usuario y permisos asignados.'
                            : 'Completa los datos para registrar y asignar roles al nuevo usuario.'}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-5">
                    {/* Nombre */}
                    <div className="grid gap-2">
                        <Label htmlFor="user-name">
                            Nombre completo <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="user-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            autoComplete="name"
                            placeholder="Ej: Ana Lucía Morales"
                        />
                        <InputError message={errors.name} />
                    </div>

                    {/* Email */}
                    <div className="grid gap-2">
                        <Label htmlFor="user-email">
                            Correo electrónico <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="user-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                            placeholder="correo@ejemplo.com"
                        />
                        <InputError message={errors.email} />
                    </div>

                    {/* Selector de Tipo de Usuario */}
                    <div className="grid gap-2">
                        <Label htmlFor="tipo-usuario">
                            Clasificación de Usuario <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={tipoUsuario}
                            onValueChange={(val: 'interno' | 'externo') => setTipoUsuario(val)}
                        >
                            <SelectTrigger id="tipo-usuario">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="interno">
                                    Personal Interno / Staff (Acceso al Panel /panel)
                                </SelectItem>
                                <SelectItem value="externo">
                                    Usuario Externo (Portal /portal: Voluntario, Donante, etc.)
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.tipo_usuario} />
                    </div>

                    {/* Bloque Staff Interno: Selección de Roles */}
                    {tipoUsuario === 'interno' && (
                        <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
                            <div className="flex items-center gap-2">
                                <Shield className="size-4 text-primary" />
                                <Label className="font-semibold text-sm">
                                    Roles Asignados (Staff Interno)
                                </Label>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Selecciona los roles operativos que determinarán el menú y permisos en el Panel Interno.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                                {roles.map((role) => {
                                    const isChecked = selectedRoles.includes(role.name);
                                    return (
                                        <div
                                            key={role.id}
                                            className="flex items-center gap-2.5 rounded border p-2.5 bg-background hover:bg-muted/30"
                                        >
                                            <Checkbox
                                                id={`role-${role.id}`}
                                                checked={isChecked}
                                                onCheckedChange={(checked) =>
                                                    toggleRole(role.name, !!checked)
                                                }
                                            />
                                            <Label
                                                htmlFor={`role-${role.id}`}
                                                className="cursor-pointer text-xs font-medium"
                                            >
                                                {role.name}
                                                {role.name === 'super-admin' && ' (Control Total)'}
                                            </Label>
                                        </div>
                                    );
                                })}
                            </div>
                            <InputError message={errors.roles} />
                        </div>
                    )}

                    {/* Bloque Usuario Externo: Capacidades y Perfiles Directos */}
                    {tipoUsuario === 'externo' && (
                        <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
                            <div className="flex items-center gap-2">
                                <Users className="size-4 text-purple-600 dark:text-purple-400" />
                                <Label className="font-semibold text-sm">
                                    Perfiles y Capacidades en el Portal
                                </Label>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Los usuarios externos pueden tener múltiples capacidades acumuladas (ej: ser donador y voluntario al mismo tiempo).
                            </p>

                            <div className="grid grid-cols-1 gap-2 pt-1">
                                {externalCapabilities.map((cap) => {
                                    const isChecked = selectedPermissions.includes(cap.name);
                                    return (
                                        <div
                                            key={cap.name}
                                            className="flex items-start gap-2.5 rounded border p-2.5 bg-background hover:bg-muted/30"
                                        >
                                            <Checkbox
                                                id={`cap-${cap.name}`}
                                                checked={isChecked}
                                                onCheckedChange={(checked) =>
                                                    togglePermission(cap.name, !!checked)
                                                }
                                                className="mt-0.5"
                                            />
                                            <div>
                                                <Label
                                                    htmlFor={`cap-${cap.name}`}
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
                            <InputError message={errors.permissions} />
                        </div>
                    )}

                    {/* Contraseñas */}
                    <div className="grid gap-2">
                        <Label htmlFor="user-password">
                            Contraseña
                            {isEditing && (
                                <span className="text-muted-foreground ml-1 text-xs">
                                    (dejar vacío para mantener la actual)
                                </span>
                            )}
                            {!isEditing && <span className="text-destructive"> *</span>}
                        </Label>
                        <PasswordInput
                            id="user-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="new-password"
                            placeholder={isEditing ? '••••••••' : 'Mínimo 8 caracteres'}
                            required={!isEditing}
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="user-password-confirmation">
                            Confirmar Contraseña
                            {!isEditing && <span className="text-destructive"> *</span>}
                        </Label>
                        <PasswordInput
                            id="user-password-confirmation"
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            autoComplete="new-password"
                            placeholder="Repite la contraseña"
                            required={!isEditing}
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>
                </CardContent>

                <CardFooter className="flex justify-between">
                    <Button variant="outline" asChild disabled={isSaving}>
                        <Link href={index.url()}>
                            <ArrowLeft className="mr-2 size-4" />
                            Cancelar
                        </Link>
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
                                {isEditing ? 'Actualizar Usuario' : 'Crear Usuario'}
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}
