import { useState, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { index } from '@/routes/panel/usuarios';

export type UserFilters = {
    search: string;
    status: string;
    tipo_usuario: string;
    role: string;
    per_page: number;
};

type RoleOption = {
    id: number;
    name: string;
};

type Props = {
    filters: UserFilters;
    roles: RoleOption[];
};

export function UsersToolbar({ filters, roles }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const visitWithFilters = useCallback(
        (overrides: Partial<UserFilters>) => {
            const params: Record<string, string | number> = {};
            const merged = { ...filters, ...overrides };

            if (merged.search) params.search = merged.search;
            if (merged.status) params.status = merged.status;
            if (merged.tipo_usuario && merged.tipo_usuario !== 'all') params.tipo_usuario = merged.tipo_usuario;
            if (merged.role && merged.role !== 'all') params.role = merged.role;
            if (merged.per_page && merged.per_page !== 10) params.per_page = merged.per_page;

            router.get(index.url(), params, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        },
        [filters]
    );

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (search !== (filters.search ?? '')) {
                visitWithFilters({ search });
            }
        }, 300);

        return () => clearTimeout(timeout);
    }, [search, filters.search, visitWithFilters]);

    const hasActiveFilters =
        filters.search ||
        filters.status ||
        (filters.tipo_usuario && filters.tipo_usuario !== 'all') ||
        (filters.role && filters.role !== 'all');

    function handleResetFilters() {
        setSearch('');
        router.get(index.url(), {}, { preserveState: true, preserveScroll: true, replace: true });
    }

    return (
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between flex-wrap">
            <div className="flex flex-1 items-center gap-2 flex-wrap">
                {/* Buscador */}
                <div className="relative w-full sm:max-w-xs">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                    <Input
                        id="users-search"
                        placeholder="Buscar por nombre o email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>

                {/* Filtro Tipo de Usuario */}
                <Select
                    value={filters.tipo_usuario || 'all'}
                    onValueChange={(value) => visitWithFilters({ tipo_usuario: value })}
                >
                    <SelectTrigger id="users-tipo-filter" className="w-[150px]">
                        <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los tipos</SelectItem>
                        <SelectItem value="interno">Staff Interno</SelectItem>
                        <SelectItem value="externo">Usuario Externo</SelectItem>
                    </SelectContent>
                </Select>

                {/* Filtro Rol */}
                <Select
                    value={filters.role || 'all'}
                    onValueChange={(value) => visitWithFilters({ role: value })}
                >
                    <SelectTrigger id="users-role-filter" className="w-[150px]">
                        <SelectValue placeholder="Rol" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los roles</SelectItem>
                        {roles.map((r) => (
                            <SelectItem key={r.id} value={r.name}>
                                {r.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Filtro Estado */}
                <Select
                    value={filters.status || 'all'}
                    onValueChange={(value) => visitWithFilters({ status: value === 'all' ? '' : value })}
                >
                    <SelectTrigger id="users-status-filter" className="w-[140px]">
                        <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los estados</SelectItem>
                        <SelectItem value="verified">Verificado</SelectItem>
                        <SelectItem value="pending">Pendiente</SelectItem>
                    </SelectContent>
                </Select>

                {hasActiveFilters && (
                    <Button
                        id="users-reset-filters"
                        variant="ghost"
                        size="sm"
                        onClick={handleResetFilters}
                        className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                        Limpiar filtros
                        <X className="ml-1 size-3.5" />
                    </Button>
                )}
            </div>
        </div>
    );
}
