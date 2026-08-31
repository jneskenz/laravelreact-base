import type { LucideIcon } from 'lucide-react';
import {
    BarChart3,
    BookOpen,
    Building2,
    Eye,
    FileQuestion,
    FileText,
    FolderGit2,
    GraduationCap,
    Handshake,
    Heart,
    Home,
    Landmark,
    LayoutGrid,
    LayoutList,
    PawPrint,
    Scale,
    Settings,
    Shield,
    Siren,
    Stethoscope,
    Truck,
    Users,
} from 'lucide-react';

export const iconMap: Record<string, LucideIcon> = {
    BarChart3,
    BookOpen,
    Building2,
    Eye,
    FileQuestion,
    FileText,
    FolderGit2,
    GraduationCap,
    Handshake,
    Heart,
    Home,
    Landmark,
    LayoutGrid,
    LayoutList,
    PawPrint,
    Scale,
    Settings,
    Shield,
    Siren,
    Stethoscope,
    Truck,
    Users,
};

export function resolveIcon(name: string | null | undefined): LucideIcon | null {
    if (!name) {
        return null;
    }

    return iconMap[name] ?? null;
}
