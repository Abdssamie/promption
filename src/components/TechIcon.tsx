import * as SimpleIcons from 'simple-icons';

interface TechIconProps {
    slug: string;
    size?: number;
    color?: string;
    className?: string;
}

export function TechIcon({ slug, size = 16, color, className = '' }: TechIconProps) {
    // Get the icon from simple-icons
    const iconKey = `si${slug.charAt(0).toUpperCase()}${slug.slice(1)}` as keyof typeof SimpleIcons;
    const icon = SimpleIcons[iconKey] as { svg: string; hex: string } | undefined;

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
