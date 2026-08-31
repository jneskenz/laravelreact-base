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
import { index } from '@/routes/panel/usuarios';

type PaginationMeta = {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
};

type Filters = {
    search: string;
    status: string;
    per_page: number;
};

type Props = {
    meta: PaginationMeta;
    filters: Filters;
    selectedCount?: number;
};

function buildPageUrl(page: number, filters: Filters): string {
    const query: Record<string, string | number> = { page };
    if (filters.search) query.search = filters.search;
    if (filters.status) query.status = filters.status;
    if (filters.per_page && filters.per_page !== 10) query.per_page = filters.per_page;
    return index.url({ query });
}

function buildPerPageUrl(perPage: number, filters: Filters): string {
    const query: Record<string, string | number> = { per_page: perPage };
    if (filters.search) query.search = filters.search;
    if (filters.status) query.status = filters.status;
    return index.url({ query });
}

export function UsersPagination({ meta, filters, selectedCount = 0 }: Props) {
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
                    <span>{total} registro(s) en total.</span>
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
                        <SelectTrigger id="users-per-page" className="h-8 w-[70px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {[10, 20, 50].map((size) => (
                                <SelectItem key={size} value={String(size)}>
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex w-[120px] items-center justify-center text-sm font-medium">
                    Página {currentPage} de {lastPage}
                </div>

                <div className="flex items-center gap-1">
                    <Button
                        id="users-pagination-first"
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
                        id="users-pagination-prev"
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
                        id="users-pagination-next"
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
                        id="users-pagination-last"
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
