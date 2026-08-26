import { Head } from '@inertiajs/react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { reconocimientos } from '@/routes/cms';

export default function Reconocimientos() {
    return (
        <>
            <Head title="Reconocimientos" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>
            </div>
        </>
    );
}

Reconocimientos.layout = {
    breadcrumbs: [
        {
            title: 'CMS',
            href: '#',
        },
        {
            title: 'Reconocimientos',
            href: reconocimientos(),
        },
    ],
};
