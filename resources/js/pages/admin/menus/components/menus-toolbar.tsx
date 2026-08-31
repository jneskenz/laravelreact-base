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
import { index } from '@/routes/admin/menus';

export type MenuFilters = {
    search: string;
    area: string;
    module: string;
    status: string;
    per_page: number;
};

type Props = {
    filters: MenuFilters;
    modules: string[];
};

export function MenusToolbar({ filters, modules }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const visitWithFilters = useCallback(
        (overrides: Partial<MenuFilters>) => {
            const params: Record<string, string | number> = {};
            const merged = { ...filters, ...overrides };

            if (merged.search) params.search = merged.search;
            if (merged.area && merged.area !== 'all') params.area = merged.area;
            if (merged.module && merged.module !== 'all') params.module = merged.module;
            if (merged.status && merged.status !== 'all') params.status = merged.status;
            if (merged.per_page && merged.per_page !== 20) params.per_page = merged.per_page;

            router.get(index.url(), params, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        },
        [filters],
    );

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (search !== (filters.search ?? '')) {
                visitWithFilters({ search });
            }
        }, 300);

        return () => clearTimeout(timeout);
    }, [search, filters.search, visitWithFilters]);

    const hasActiveFilters = Boolean(
        filters.search ||
        (filters.area && filters.area !== 'all') ||
        (filters.module && filters.module !== 'all') ||
        (filters.status && filters.status !== 'all')
    );

    function handleResetFilters() {
        setSearch('');
        router.get(index.url(), {}, { preserveState: true, preserveScroll: true, replace: true });
    }

    return (
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-wrap items-center gap-2">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                    <Input
                        id="menus-search"
                        placeholder="Buscar menú, clave o permiso..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>

                <Select
                    value={filters.area || 'all'}
                    onValueChange={(value) => visitWithFilters({ area: value })}
                >
                    <SelectTrigger id="menus-area-filter" className="w-[150px]">
                        <SelectValue placeholder="Área" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas las áreas</SelectItem>
                        <SelectItem value="panel">Panel Interno</SelectItem>
                        <SelectItem value="portal">Portal Externo</SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    value={filters.module || 'all'}
                    onValueChange={(value) => visitWithFilters({ module: value })}
                >
                    <SelectTrigger id="menus-module-filter" className="w-[160px]">
                        <SelectValue placeholder="Módulo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los módulos</SelectItem>
                        {modules.map((mod) => (
                            <SelectItem key={mod} value={mod}>
                                {mod.charAt(0).toUpperCase() + mod.slice(1)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={filters.status || 'all'}
                    onValueChange={(value) => visitWithFilters({ status: value })}
                >
                    <SelectTrigger id="menus-status-filter" className="w-[140px]">
                        <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los estados</SelectItem>
                        <SelectItem value="active">Activos</SelectItem>
                        <SelectItem value="inactive">Inactivos</SelectItem>
                    </SelectContent>
                </Select>

                {hasActiveFilters && (
                    <Button
                        id="menus-reset-filters"
                        variant="ghost"
                        size="sm"
                        onClick={handleResetFilters}
                    >
                        Limpiar
                        <X className="ml-1 size-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}
