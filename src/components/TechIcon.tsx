import { TECHNOLOGY_ICONS } from '../constants/technologies';

interface TechIconProps {
    slug: string;
    size?: number;
    color?: string;
    className?: string;
}

export function TechIcon({ slug, size = 16, color, className = '' }: TechIconProps) {
    // Get the icon from our map
    const icon = TECHNOLOGY_ICONS[slug];

    if (!icon) {
        return null;
    }

    // Sanitize color to prevent XSS via style injection
    // Only allow valid hex colors (#RRGGBB format)
    const sanitizedColor = color && /^#[0-9A-Fa-f]{6}$/.test(color) 
        ? color 
        : `#${icon.hex}`;

    return (
        <div
            className={className}
            style={{ width: size, height: size, flexShrink: 0 }}
            dangerouslySetInnerHTML={{
                __html: icon.svg.replace('<svg', `<svg fill="${sanitizedColor}" width="${size}" height="${size}"`),
            }}
        />
    );
}
