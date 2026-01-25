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

    const iconColor = color || `#${icon.hex}`;

    return (
        <div
            className={className}
            style={{ width: size, height: size, flexShrink: 0 }}
            dangerouslySetInnerHTML={{
                __html: icon.svg.replace('<svg', `<svg fill="${iconColor}" width="${size}" height="${size}"`),
            }}
        />
    );
}
