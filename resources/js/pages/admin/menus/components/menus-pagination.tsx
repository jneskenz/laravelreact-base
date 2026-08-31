import { Link } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { index } from '@/routes/admin/menus';
import type { MenuFilters } from './menus-toolbar';

type PaginationMeta = {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
};

type Props = {
    meta: PaginationMeta;
    filters: MenuFilters;
    selectedCount?: number;
};

function buildPageUrl(page: number, filters: MenuFilters): string {
    const query: Record<string, string | number> = { page };
    if (filters.search) query.search = filters.search;
    if (filters.area && filters.area !== 'all') query.area = filters.area;
    if (filters.module && filters.module !== 'all') query.module = filters.module;
    if (filters.status && filters.status !== 'all') query.status = filters.status;
    if (filters.per_page && filters.per_page !== 20) query.per_page = filters.per_page;
    return index.url({ query });
}

function buildPerPageUrl(perPage: number, filters: MenuFilters): string {
    const query: Record<string, string | number> = { per_page: perPage };
    if (filters.search) query.search = filters.search;
    if (filters.area && filters.area !== 'all') query.area = filters.area;
    if (filters.module && filters.module !== 'all') query.module = filters.module;
    if (filters.status && filters.status !== 'all') query.status = filters.status;
    return index.url({ query });
}

export function MenusPagination({ meta, filters, selectedCount = 0 }: Props) {
    const { current_page: currentPage, last_page: lastPage, total } = meta;
    const isFirstPage = currentPage <= 1;
    const isLastPage = currentPage >= lastPage;

    return (
        <div className="flex flex-col items-center justify-between gap-4 px-2 py-1 sm:flex-row">
            <div className="text-muted-foreground flex-1 text-sm">
                {selectedCount > 0 ? (
                    <span>
                        {selectedCount} de {total} fila(s) seleccionada(s).
                    </span>
                ) : (
                    <span>{total} menú(s) en total.</span>
                )}
            </div>

            <div className="flex items-center gap-6 lg:gap-8">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">Filas por página</p>
                    <Select
                        value={String(filters.per_page)}
                        onValueChange={(value) => {
                            window.location.href = buildPerPageUrl(Number(value), filters);
                        }}
                    >
                        <SelectTrigger id="menus-per-page" className="h-8 w-[70px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {[10, 20, 50, 100].map((size) => (
                                <SelectItem key={size} value={String(size)}>
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex w-[120px] items-center justify-center text-sm font-medium">
                    Página {currentPage} de {Math.max(1, lastPage)}
                </div>

                <div className="flex items-center gap-1">
                    <Button
                        id="menus-pagination-first"
                        variant="outline"
                        size="icon"
                        className="size-8"
                        disabled={isFirstPage}
                        asChild={!isFirstPage}
                    >
                        {isFirstPage ? (
                            <span>
                                <ChevronsLeft className="size-4" />
                            </span>
                        ) : (
                            <Link href={buildPageUrl(1, filters)} preserveState preserveScroll>
                                <ChevronsLeft className="size-4" />
                            </Link>
                        )}
                    </Button>

                    <Button
                        id="menus-pagination-prev"
                        variant="outline"
                        size="icon"
                        className="size-8"
                        disabled={isFirstPage}
                        asChild={!isFirstPage}
                    >
                        {isFirstPage ? (
                            <span>
                                <ChevronLeft className="size-4" />
                            </span>
                        ) : (
                            <Link
                                href={buildPageUrl(currentPage - 1, filters)}
                                preserveState
                                preserveScroll
                            >
                                <ChevronLeft className="size-4" />
                            </Link>
                        )}
                    </Button>

                    <Button
                        id="menus-pagination-next"
                        variant="outline"
                        size="icon"
                        className="size-8"
                        disabled={isLastPage}
                        asChild={!isLastPage}
                    >
                        {isLastPage ? (
                            <span>
                                <ChevronRight className="size-4" />
                            </span>
                        ) : (
                            <Link
                                href={buildPageUrl(currentPage + 1, filters)}
                                preserveState
                                preserveScroll
                            >
                                <ChevronRight className="size-4" />
                            </Link>
                        )}
                    </Button>

                    <Button
                        id="menus-pagination-last"
                        variant="outline"
                        size="icon"
                        className="size-8"
                        disabled={isLastPage}
                        asChild={!isLastPage}
                    >
                        {isLastPage ? (
                            <span>
                                <ChevronsRight className="size-4" />
                            </span>
                        ) : (
                            <Link
                                href={buildPageUrl(lastPage, filters)}
                                preserveState
                                preserveScroll
                            >
                                <ChevronsRight className="size-4" />
                            </Link>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
