import {
    siTypescript, siJavascript, siPython, siReact, siNextdotjs,
    siVuedotjs, siNodedotjs, siExpress, siTailwindcss, siDocker,
    siGit, siPostgresql, siMongodb, siRedis,
    siGraphql, siRust, siGo, siOpenjdk, siKubernetes
} from 'simple-icons';

// Create a map of icons we actually use
export const TECHNOLOGY_ICONS: Record<string, { hex: string; svg: string }> = {
    typescript: siTypescript,
    javascript: siJavascript,
    python: siPython,
    react: siReact,
    nextdotjs: siNextdotjs,
    vuedotjs: siVuedotjs,
    nodedotjs: siNodedotjs,
    express: siExpress,
    tailwindcss: siTailwindcss,
    docker: siDocker,
    git: siGit,
    postgresql: siPostgresql,
    mongodb: siMongodb,
    redis: siRedis,
    graphql: siGraphql,
    rust: siRust,
    go: siGo,
    openjdk: siOpenjdk,
    kubernetes: siKubernetes,
};

export interface Technology {
    name: string;
    color: string;
    category: 'language' | 'framework' | 'tool' | 'platform';
    iconSlug: string; // simple-icons slug
}

export const POPULAR_TECHNOLOGIES: Technology[] = [
    { name: 'TypeScript', color: `#${siTypescript.hex}`, category: 'language', iconSlug: 'typescript' },
    { name: 'JavaScript', color: `#${siJavascript.hex}`, category: 'language', iconSlug: 'javascript' },
    { name: 'Python', color: `#${siPython.hex}`, category: 'language', iconSlug: 'python' },
    { name: 'React', color: `#${siReact.hex}`, category: 'framework', iconSlug: 'react' },
    { name: 'Next.js', color: `#${siNextdotjs.hex}`, category: 'framework', iconSlug: 'nextdotjs' },
    { name: 'Vue.js', color: `#${siVuedotjs.hex}`, category: 'framework', iconSlug: 'vuedotjs' },
    { name: 'Node.js', color: `#${siNodedotjs.hex}`, category: 'platform', iconSlug: 'nodedotjs' },
    { name: 'Express', color: `#${siExpress.hex}`, category: 'framework', iconSlug: 'express' },
    { name: 'Tailwind CSS', color: `#${siTailwindcss.hex}`, category: 'framework', iconSlug: 'tailwindcss' },
    { name: 'Docker', color: `#${siDocker.hex}`, category: 'tool', iconSlug: 'docker' },
    { name: 'Git', color: `#${siGit.hex}`, category: 'tool', iconSlug: 'git' },
    { name: 'PostgreSQL', color: `#${siPostgresql.hex}`, category: 'tool', iconSlug: 'postgresql' },
    { name: 'MongoDB', color: `#${siMongodb.hex}`, category: 'tool', iconSlug: 'mongodb' },
    { name: 'Redis', color: `#${siRedis.hex}`, category: 'tool', iconSlug: 'redis' },
    { name: 'GraphQL', color: `#${siGraphql.hex}`, category: 'tool', iconSlug: 'graphql' },
    { name: 'Rust', color: `#${siRust.hex}`, category: 'language', iconSlug: 'rust' },
    { name: 'Go', color: `#${siGo.hex}`, category: 'language', iconSlug: 'go' },
    { name: 'Java', color: `#${siOpenjdk.hex}`, category: 'language', iconSlug: 'openjdk' },
    { name: 'Kubernetes', color: `#${siKubernetes.hex}`, category: 'tool', iconSlug: 'kubernetes' },
];
