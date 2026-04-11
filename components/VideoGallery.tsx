import React from 'react';
import { VideoResult } from '../types';
import { PlayCircle, Clock, ExternalLink } from 'lucide-react';

interface VideoGalleryProps {
  videos: VideoResult[];
}

export const VideoGallery: React.FC<VideoGalleryProps> = ({ videos }) => {
  if (!videos || videos.length === 0) return null;

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide snap-x">
      {videos.map((video, idx) => (
        <a
          key={idx}
          href={video.link}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex-shrink-0 w-60 bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 snap-start transition-all hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg flex flex-col"
        >
          {/* Thumbnail */}
          <div className="relative h-32 w-full bg-gray-200 dark:bg-gray-900 overflow-hidden">
            <img 
              src={video.imageUrl} 
              alt={video.title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <PlayCircle className="text-white opacity-80 group-hover:opacity-100 w-10 h-10 drop-shadow-md transform scale-90 group-hover:scale-110 transition-all" />
            </div>
            {video.duration && (
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                <Clock size={10} />
                {video.duration}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-3 flex flex-col flex-1 justify-between">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 mb-1 group-hover:text-blue-500 transition-colors">
                {video.title}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {video.source} {video.date ? `• ${video.date}` : ''}
              </p>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
};