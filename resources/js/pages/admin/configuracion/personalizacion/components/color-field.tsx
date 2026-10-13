import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isHexColor } from './theme-utils';

interface Props {
    id: string;
    label: string;
    value: string;
    onChange: (hex: string) => void;
    hint?: string;
    size?: 'sm' | 'md';
}

/**
 * Color picker plus a #RRGGBB text box. The text box only reports valid colors,
 * so a half-typed value never reaches the form.
 */
export function ColorField({
    id,
    label,
    value,
    onChange,
    hint,
    size = 'sm',
}: Props) {
    const [text, setText] = useState(value);
    const [syncedValue, setSyncedValue] = useState(value);

    // Follow changes made outside this field (e.g. the main color updating every mode)
    if (value !== syncedValue) {
        setSyncedValue(value);
        setText(value);
    }

    const isValid = isHexColor(text);
    const swatchSize = size === 'md' ? 'size-10' : 'size-8';

    function handleText(next: string) {
        const normalized = next.startsWith('#') ? next : `#${next}`;
        setText(normalized);

        if (isHexColor(normalized)) {
            onChange(normalized.toLowerCase());
        }
    }

    return (
        <div className="space-y-1">
            <Label htmlFor={id} className="text-xs font-medium">
                {label}
            </Label>
            <div className="flex items-center gap-2">
                <input
                    type="color"
                    aria-label={`Elegir ${label}`}
                    value={isHexColor(value) ? value : '#000000'}
                    onChange={(e) => onChange(e.target.value)}
                    className={`${swatchSize} shrink-0 cursor-pointer rounded-md border bg-transparent p-0.5`}
                />
                <Input
                    id={id}
                    value={text}
                    maxLength={7}
                    onChange={(e) => handleText(e.target.value.trim())}
                    onBlur={() => !isValid && setText(value)}
                    aria-invalid={!isValid}
                    className={`font-mono text-xs uppercase ${size === 'md' ? 'h-10' : 'h-8'}`}
                />
            </div>
            {hint && (
                <p className="text-[11px] text-muted-foreground">{hint}</p>
            )}
        </div>
    );
}
