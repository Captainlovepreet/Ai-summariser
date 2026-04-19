import React from 'react';
import ReactMarkdown from 'react-markdown';
import { CodeBlock } from './CodeBlock';
import { cn } from '../lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn('prose prose-sm max-w-none overflow-hidden break-words', className)}>
      <ReactMarkdown
        components={{
          h1: ({ node, ...props }: any) => (
            <h1
              className="text-2xl font-bold tracking-tight text-foreground mt-8 mb-4 first:mt-0 break-words"
              {...props}
            />
          ),
          h2: ({ node, ...props }: any) => (
            <h2
              className="text-xl font-bold tracking-tight text-foreground mt-6 mb-3 break-words"
              {...props}
            />
          ),
          h3: ({ node, ...props }: any) => (
            <h3
              className="text-lg font-semibold tracking-tight text-foreground mt-5 mb-2 break-words"
              {...props}
            />
          ),
          h4: ({ node, ...props }: any) => (
            <h4
              className="text-base font-semibold text-foreground mt-4 mb-2 break-words"
              {...props}
            />
          ),
          h5: ({ node, ...props }: any) => (
            <h5
              className="text-sm font-semibold text-foreground mt-3 mb-1 break-words"
              {...props}
            />
          ),
          h6: ({ node, ...props }: any) => (
            <h6
              className="text-sm font-medium text-muted-foreground mt-3 mb-1 break-words"
              {...props}
            />
          ),
          p: ({ node, ...props }: any) => (
            <p
              className="text-sm leading-7 text-foreground mb-4 last:mb-0 break-words"
              {...props}
            />
          ),
          ul: ({ node, ...props }: any) => (
            <ul
              className="my-6 ml-6 list-disc space-y-2 text-sm text-foreground"
              {...props}
            />
          ),
          ol: ({ node, ...props }: any) => (
            <ol
              className="my-6 ml-6 list-decimal space-y-2 text-sm text-foreground"
              {...props}
            />
          ),
          li: ({ node, ...props }: any) => (
            <li className="text-sm text-foreground break-words" {...props} />
          ),
          blockquote: ({ node, ...props }: any) => (
            <blockquote
              className="my-6 border-l-4 border-primary/30 bg-muted/50 px-4 py-2 text-sm italic text-muted-foreground break-words"
              {...props}
            />
          ),
          code: ({ node, inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : 'bash';
            const code = String(children).replace(/\n$/, '');

            if (inline) {
              return (
                <code
                  className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-foreground break-all"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return <CodeBlock code={code} language={language} />;
          },
          a: ({ node, ...props }: any) => (
            <a
              className="font-medium text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          hr: ({ node, ...props }: any) => (
            <hr className="my-8 border-t border-border" {...props} />
          ),
          strong: ({ node, ...props }: any) => (
            <strong className="font-semibold text-foreground" {...props} />
          ),
          em: ({ node, ...props }: any) => (
            <em className="italic text-foreground" {...props} />
          ),
          table: ({ node, ...props }: any) => (
            <div className="my-6 overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm" {...props} />
            </div>
          ),
          thead: ({ node, ...props }: any) => (
            <thead className="border-b border-border bg-muted/50" {...props} />
          ),
          tbody: ({ node, ...props }: any) => (
            <tbody className="divide-y divide-border" {...props} />
          ),
          tr: ({ node, ...props }: any) => (
            <tr className="hover:bg-muted/30 transition-colors" {...props} />
          ),
          td: ({ node, ...props }: any) => (
            <td className="px-4 py-2 text-sm text-foreground" {...props} />
          ),
          th: ({ node, ...props }: any) => (
            <th className="px-4 py-2 text-sm font-semibold text-foreground text-left" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
