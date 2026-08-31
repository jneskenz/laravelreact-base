import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { resolveIcon } from '@/lib/icon-map';
import type { MenuItemData } from '@/types';

export function NavMain({ items = [] }: { items: MenuItemData[] }) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarMenu>
                {items.map((item) => {
                    const ItemIcon = resolveIcon(item.icon);
                    const hasChildren = Boolean(item.children && item.children.length > 0);
                    const isChildActive = hasChildren && item.children?.some(
                        (child) => child.url && isCurrentUrl(child.url)
                    );
                    const isSelfActive = Boolean(item.url && isCurrentUrl(item.url));

                    if (hasChildren) {
                        return (
                            <Collapsible
                                key={item.key}
                                asChild
                                defaultOpen={isChildActive}
                            >
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton
                                            tooltip={{ children: item.label }}
                                            isActive={isChildActive}
                                        >
                                            {ItemIcon && <ItemIcon />}
                                            <span>{item.label}</span>
                                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {item.children?.map((child) => {
                                                const ChildIcon = resolveIcon(child.icon);
                                                const isChildItemActive = Boolean(child.url && isCurrentUrl(child.url));

                                                return (
                                                    <SidebarMenuSubItem key={child.key}>
                                                        <SidebarMenuSubButton
                                                            asChild
                                                            isActive={isChildItemActive}
                                                        >
                                                            <Link href={child.url ?? '#'} prefetch>
                                                                {ChildIcon && <ChildIcon />}
                                                                <span>{child.label}</span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                );
                                            })}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        );
                    }

                    return (
                        <SidebarMenuItem key={item.key}>
                            <SidebarMenuButton
                                asChild
                                isActive={isSelfActive}
                                tooltip={{ children: item.label }}
                            >
                                <Link href={item.url ?? '#'} prefetch>
                                    {ItemIcon && <ItemIcon />}
                                    <span>{item.label}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
