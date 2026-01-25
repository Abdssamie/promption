import { Prism as ReactSyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';

interface SyntaxHighlighterProps {
    content: string;
    language?: string;
}

export function SyntaxHighlighter({ content, language = 'markdown' }: SyntaxHighlighterProps) {
    const { theme } = useTheme();
    
    return (
        <ReactSyntaxHighlighter
            language={language}
            style={theme === 'dark' ? oneDark : oneLight}
            className="syntax-highlighter"
            customStyle={{
                background: 'transparent',
                margin: 0,
                padding: 0,
                fontSize: '13px',
                lineHeight: '1.6',
            }}
            codeTagProps={{
                style: {
                    fontFamily: "'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
                    textShadow: theme === 'dark' ? '0 0 1px rgba(255,255,255,0.1)' : 'none',
                },
            }}
        >
            {content}
        </ReactSyntaxHighlighter>
    );
}
