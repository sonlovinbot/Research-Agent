import React, { useEffect, useRef, useState } from 'react';
import { Transformer } from 'markmap-lib';
import { Markmap } from 'markmap-view';
import * as d3 from 'd3';
import { Maximize2, Minimize2, Code, Copy, Check } from 'lucide-react';

interface MindmapRendererProps {
  content: string;
}

export const MindmapRenderer: React.FC<MindmapRendererProps> = ({ content }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const mmRef = useRef<Markmap | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSource, setShowSource] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (showSource) return; // Don't render map if in source mode (optional, but cleaner)

    if (svgRef.current && content) {
      // Clear previous
      if (mmRef.current) {
        mmRef.current.destroy();
      }
      const svg = svgRef.current;
      while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
      }

      const transformer = new Transformer();
      const { root, features } = transformer.transform(content);

      // Create markmap
      mmRef.current = Markmap.create(svg, undefined, root);
    }
    
    return () => {
        if (mmRef.current) {
            mmRef.current.destroy();
            mmRef.current = null;
        }
    }
  }, [content, isFullscreen, showSource]);

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`relative flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900 p-4' : 'w-full'}`}>
      
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-2 bg-gray-100 dark:bg-gray-800 p-2 rounded-t-xl border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 px-2">
            <span className="text-xs font-semibold text-gray-500 uppercase">
                {showSource ? 'Markdown Source' : 'Visual Map'}
            </span>
        </div>
        <div className="flex items-center gap-1">
             <button
                onClick={() => setShowSource(!showSource)}
                className="p-1.5 text-gray-500 hover:text-purple-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                title={showSource ? "Show Visual" : "Show Code"}
             >
                <Code size={18} />
             </button>
             {showSource && (
                <button
                    onClick={handleCopy}
                    className="p-1.5 text-gray-500 hover:text-green-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                    title="Copy Markdown"
                >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
             )}
             <button 
                onClick={toggleFullscreen}
                className="p-1.5 text-gray-500 hover:text-blue-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
             >
                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
             </button>
        </div>
      </div>

      {/* Content Area */}
      <div className={`relative rounded-b-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1e1e] ${isFullscreen ? 'flex-1' : 'h-[400px]'}`}>
        
        {showSource ? (
            <div className="w-full h-full overflow-auto p-4">
                <pre className="text-xs md:text-sm font-mono text-gray-800 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {content}
                </pre>
            </div>
        ) : (
            <svg 
                ref={svgRef} 
                className="w-full h-full block" 
            />
        )}
      </div>
    </div>
  );
};