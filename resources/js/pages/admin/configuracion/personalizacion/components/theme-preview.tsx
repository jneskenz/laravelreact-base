import { CheckCircle2, PawPrint } from 'lucide-react';
import type { SemanticColors } from '@/hooks/use-appearance';

interface Props {
    colors: SemanticColors;
    radius: string;
    title?: string;
    compact?: boolean;
}

/**
 * Mock of a panel screen painted with a theme's colors, so the result can be judged at a glance.
 */
export function ThemePreview({
    colors,
    radius,
    title = 'CONAPA',
    compact = false,
}: Props) {
    const surface = {
        backgroundColor: colors.card,
        borderColor: colors.border,
        borderRadius: radius,
    };

    const badges = [
        { label: 'Aprobado', color: colors.success },
        { label: 'Pendiente', color: colors.warning },
        { label: 'Urgente', color: colors.danger },
    ];

    return (
        <div
            className={`space-y-2 border ${compact ? 'p-2.5' : 'space-y-3 p-4'}`}
            style={{
                backgroundColor: colors.background,
                color: colors.foreground,
                borderColor: colors.border,
                borderRadius: radius,
            }}
        >
            <div
                className="flex items-center justify-between gap-2 border p-2"
                style={surface}
            >
                <div className="flex min-w-0 items-center gap-2">
                    <span
                        className="flex size-6 shrink-0 items-center justify-center"
                        style={{
                            backgroundColor: colors.primary,
                            color: colors.primary_foreground,
                            borderRadius: radius,
                        }}
                    >
                        <PawPrint className="size-3.5" />
                    </span>
                    <span className="truncate text-xs font-semibold">
                        {title}
                    </span>
                </div>
                <span className="text-[10px]" style={{ color: colors.muted }}>
                    Panel
                </span>
            </div>

            {!compact && (
                <div className="space-y-1 border p-3" style={surface}>
                    <div className="text-xs" style={{ color: colors.muted }}>
                        Rescates del mes
                    </div>
                    <div className="text-xl font-bold">128</div>
                    <div
                        className="flex items-center gap-1 text-[11px] font-medium"
                        style={{ color: colors.success }}
                    >
                        <CheckCircle2 className="size-3" />
                        +18% vs. mes anterior
                    </div>
                </div>
            )}

            <div className="flex flex-wrap items-center gap-1.5">
                <span
                    className="px-2.5 py-1 text-[11px] font-medium"
                    style={{
                        backgroundColor: colors.primary,
                        color: colors.primary_foreground,
                        borderRadius: radius,
                    }}
                >
                    Guardar
                </span>
                <span
                    className="border px-2.5 py-1 text-[11px] font-medium"
                    style={{ borderColor: colors.border, borderRadius: radius }}
                >
                    Cancelar
                </span>
                {!compact && (
                    <span
                        className="px-2.5 py-1 text-[11px] font-medium text-white"
                        style={{
                            backgroundColor: colors.danger,
                            borderRadius: radius,
                        }}
                    >
                        Eliminar
                    </span>
                )}
            </div>

            <div className="flex flex-wrap gap-1">
                {badges.map((badge) => (
                    <span
                        key={badge.label}
                        className="px-1.5 py-0.5 text-[10px] font-semibold"
                        style={{
                            backgroundColor: `${badge.color}22`,
                            color: badge.color,
                            borderRadius: radius,
                        }}
                    >
                        {badge.label}
                    </span>
                ))}
            </div>
        </div>
    );
}
