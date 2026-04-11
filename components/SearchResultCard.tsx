import React from 'react';
import { SearchResult } from '../types';
import { ExternalLink, Globe } from 'lucide-react';

interface SearchResultCardProps {
  result: SearchResult;
  index: number;
}

export const SearchResultCard: React.FC<SearchResultCardProps> = ({ result, index }) => {
  // Extract hostname for cleaner display
  let hostname = '';
  try {
    hostname = new URL(result.link).hostname.replace('www.', '');
  } catch (e) {
    hostname = result.link;
  }

  return (
    <a 
      href={result.link} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block group min-w-[260px] max-w-[260px] bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all duration-200 snap-start"
    >
      <div className="flex items-center gap-2 mb-2">
         <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 text-xs font-bold text-blue-600 dark:text-blue-400">
            {index + 1}
         </div>
         <div className="flex-1 overflow-hidden">
             <div className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                <Globe size={10} />
                {hostname}
             </div>
         </div>
      </div>
      
      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 mb-2 group-hover:text-blue-500 transition-colors">
        {result.title}
      </h4>
      
      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
        {result.snippet}
      </p>
    </a>
  );
};
