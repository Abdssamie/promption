import * as SimpleIcons from 'simple-icons';

export interface Technology {
    name: string;
    color: string;
    category: 'language' | 'framework' | 'tool' | 'platform';
    iconSlug: string; // simple-icons slug
}

export const POPULAR_TECHNOLOGIES: Technology[] = [
    { name: 'TypeScript', color: `#${SimpleIcons.siTypescript.hex}`, category: 'language', iconSlug: 'typescript' },
    { name: 'JavaScript', color: `#${SimpleIcons.siJavascript.hex}`, category: 'language', iconSlug: 'javascript' },
    { name: 'Python', color: `#${SimpleIcons.siPython.hex}`, category: 'language', iconSlug: 'python' },
    { name: 'React', color: `#${SimpleIcons.siReact.hex}`, category: 'framework', iconSlug: 'react' },
    { name: 'Next.js', color: `#${SimpleIcons.siNextdotjs.hex}`, category: 'framework', iconSlug: 'nextdotjs' },
    { name: 'Vue.js', color: `#${SimpleIcons.siVuedotjs.hex}`, category: 'framework', iconSlug: 'vuedotjs' },
    { name: 'Node.js', color: `#${SimpleIcons.siNodedotjs.hex}`, category: 'platform', iconSlug: 'nodedotjs' },
    { name: 'Express', color: `#${SimpleIcons.siExpress.hex}`, category: 'framework', iconSlug: 'express' },
    { name: 'Tailwind CSS', color: `#${SimpleIcons.siTailwindcss.hex}`, category: 'framework', iconSlug: 'tailwindcss' },
    { name: 'Docker', color: `#${SimpleIcons.siDocker.hex}`, category: 'tool', iconSlug: 'docker' },
    { name: 'Git', color: `#${SimpleIcons.siGit.hex}`, category: 'tool', iconSlug: 'git' },
    { name: 'PostgreSQL', color: `#${SimpleIcons.siPostgresql.hex}`, category: 'tool', iconSlug: 'postgresql' },
    { name: 'MongoDB', color: `#${SimpleIcons.siMongodb.hex}`, category: 'tool', iconSlug: 'mongodb' },
    { name: 'Redis', color: `#${SimpleIcons.siRedis.hex}`, category: 'tool', iconSlug: 'redis' },
    { name: 'AWS', color: '#FF9900', category: 'platform', iconSlug: 'amazonaws' },
    { name: 'GraphQL', color: `#${SimpleIcons.siGraphql.hex}`, category: 'tool', iconSlug: 'graphql' },
    { name: 'Rust', color: `#${SimpleIcons.siRust.hex}`, category: 'language', iconSlug: 'rust' },
    { name: 'Go', color: `#${SimpleIcons.siGo.hex}`, category: 'language', iconSlug: 'go' },
    { name: 'Java', color: `#${SimpleIcons.siOpenjdk.hex}`, category: 'language', iconSlug: 'openjdk' },
    { name: 'Kubernetes', color: `#${SimpleIcons.siKubernetes.hex}`, category: 'tool', iconSlug: 'kubernetes' },
];
