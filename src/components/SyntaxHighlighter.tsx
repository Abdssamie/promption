import { Prism as ReactSyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface SyntaxHighlighterProps {
    content: string;
    language?: string;
}

export function SyntaxHighlighter({ content, language = 'markdown' }: SyntaxHighlighterProps) {
    return (
        <ReactSyntaxHighlighter
            language={language}
            style={oneDark}
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
                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                },
            }}
        >
            {content}
        </ReactSyntaxHighlighter>
    );
}
