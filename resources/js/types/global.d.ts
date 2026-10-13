import type { DbTheme } from '@/hooks/use-appearance';
import type { UserArea } from '@/lib/area';
import type { Auth } from '@/types/auth';
import type { MenuItemData } from '@/types/navigation';

declare module 'react' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            area: UserArea | null;
            menu: MenuItemData[];
            defaultTheme: DbTheme | null;
            [key: string]: unknown;
        };
    }
}
