import { Form, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { index } from '@/routes/panel/usuarios';

type User = {
    id: number;
    name: string;
    email: string;
};

type Props = {
    user?: User;
    action: string;
    method: 'post' | 'put' | 'patch';
};

export function UserForm({ user, action, method }: Props) {
    const isEditing = !!user;

    return (
        <Form action={action} method={method} className="space-y-6">
            {({ errors, processing }) => (
                <Card>
                    <CardHeader>
                        <CardTitle>{isEditing ? 'Información del Usuario' : 'Datos del Nuevo Usuario'}</CardTitle>
                        <CardDescription>
                            {isEditing
                                ? 'Actualiza el nombre, email o contraseña del usuario.'
                                : 'Completa los datos para registrar un nuevo usuario.'}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="user-name">Nombre</Label>
                            <Input
                                id="user-name"
                                name="name"
                                defaultValue={user?.name ?? ''}
                                required
                                autoComplete="name"
                                placeholder="Nombre completo"
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="user-email">Email</Label>
                            <Input
                                id="user-email"
                                type="email"
                                name="email"
                                defaultValue={user?.email ?? ''}
                                required
                                autoComplete="email"
                                placeholder="correo@ejemplo.com"
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="user-password">
                                Contraseña{isEditing && <span className="text-muted-foreground ml-1 text-xs">(dejar vacío para mantener)</span>}
                            </Label>
                            <PasswordInput
                                id="user-password"
                                name="password"
                                autoComplete="new-password"
                                placeholder={isEditing ? '••••••••' : 'Mínimo 8 caracteres'}
                                required={!isEditing}
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="user-password-confirmation">Confirmar Contraseña</Label>
                            <PasswordInput
                                id="user-password-confirmation"
                                name="password_confirmation"
                                autoComplete="new-password"
                                placeholder="Repite la contraseña"
                                required={!isEditing}
                            />
                            <InputError message={errors.password_confirmation} />
                        </div>
                    </CardContent>

                    <CardFooter className="flex justify-between">
                        <Button variant="outline" asChild>
                            <Link href={index.url()}>
                                <ArrowLeft className="mr-2 size-4" />
                                Cancelar
                            </Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing
                                ? 'Guardando...'
                                : isEditing
                                  ? 'Actualizar Usuario'
                                  : 'Crear Usuario'}
                        </Button>
                    </CardFooter>
                </Card>
            )}
        </Form>
    );
}
