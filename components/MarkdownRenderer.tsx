import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SearchResult } from '../types';

interface MarkdownRendererProps {
  content: string;
  sources?: SearchResult[];
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, sources = [] }) => {
  
  // Pre-process content to turn [1] into [[1]](url)
  const processedContent = useMemo(() => {
    return content.replace(/\[(\d+)\]/g, (match, id) => {
        const index = parseInt(id, 10) - 1;
        const source = sources[index];
        // Only link if source exists
        if (source) {
            return `[[${id}]](${source.link})`;
        }
        return match;
    });
  }, [content, sources]);

  return (
    <div className="prose prose-slate dark:prose-invert max-w-none 
      prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-gray-100
      prose-h1:text-3xl prose-h1:mb-6 prose-h1:text-emerald-600 dark:prose-h1:text-emerald-400
      prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-b prose-h2:border-gray-200 dark:prose-h2:border-gray-700 prose-h2:pb-2
      prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
      prose-p:text-base prose-p:leading-relaxed prose-p:mb-4 prose-p:text-gray-700 dark:prose-p:text-gray-300
      prose-li:text-gray-700 dark:prose-li:text-gray-300
      prose-blockquote:border-l-4 prose-blockquote:border-emerald-500 prose-blockquote:bg-gray-50 dark:prose-blockquote:bg-gray-800/50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
    ">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
            a: ({node, href, children, ...props}) => {
                // Check if it's a citation link (digits in brackets)
                const isCitation = /^\[\d+\]$/.test(String(children));
                
                if (isCitation) {
                    return (
                        <a 
                            href={href} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center justify-center align-super text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-400 rounded-full min-w-[18px] h-[18px] px-1 ml-0.5 -mt-2 hover:bg-emerald-200 dark:hover:bg-emerald-800 transition-colors no-underline"
                            title={`Go to source: ${href}`}
                            {...props}
                        >
                            {String(children).replace('[','').replace(']','')}
                        </a>
                    );
                }
                
                return (
                    <a {...props} href={href} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-medium break-words">
                        {children}
                    </a>
                )
            },
            code: ({node, className, children, ...props}) => (
                <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm text-pink-500 font-mono" {...props}>
                  {children}
                </code>
            )
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};