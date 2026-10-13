import { setUrlDefaults } from '@/wayfinder';

export type UserArea = 'panel' | 'portal';

/**
 * Fill the {area} parameter of area-prefixed routes (e.g. account settings) with the
 * current user's area, so `edit()` resolves to /panel/settings/... or /portal/settings/....
 * Call it before generating those URLs: in AppLayout and in page layout callbacks.
 */
export function syncUrlArea(area?: UserArea | null): void {
    if (area) {
        setUrlDefaults({ area });
    }
}
