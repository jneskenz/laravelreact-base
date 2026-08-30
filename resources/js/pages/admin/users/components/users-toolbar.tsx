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
import { index } from '@/routes/admin/users';

type Filters = {
    search: string;
    status: string;
    per_page: number;
};

type Props = {
    filters: Filters;
};

export function UsersToolbar({ filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const visitWithFilters = useCallback(
        (overrides: Partial<Filters>) => {
            const params: Record<string, string | number> = {};
            const merged = { ...filters, ...overrides };

            if (merged.search) params.search = merged.search;
            if (merged.status) params.status = merged.status;
            if (merged.per_page && merged.per_page !== 10) params.per_page = merged.per_page;

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

    const hasActiveFilters = filters.search || filters.status;

    function handleResetFilters() {
        setSearch('');
        router.get(index.url(), {}, { preserveState: true, preserveScroll: true, replace: true });
    }

    return (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-2">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                    <Input
                        id="users-search"
                        placeholder="Buscar usuarios..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>

                <Select
                    value={filters.status || 'all'}
                    onValueChange={(value) => visitWithFilters({ status: value === 'all' ? '' : value })}
                >
                    <SelectTrigger id="users-status-filter" className="w-[160px]">
                        <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
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
                    >
                        Limpiar
                        <X className="ml-1 size-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}
