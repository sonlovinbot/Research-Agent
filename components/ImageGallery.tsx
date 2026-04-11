import React, { useState } from 'react';
import { ImageResult } from '../types';
import { X, ExternalLink, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

interface ImageGalleryProps {
  images: ImageResult[];
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  const openLightbox = (index: number) => setSelectedImageIndex(index);
  const closeLightbox = () => setSelectedImageIndex(null);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImageIndex !== null) {
        setSelectedImageIndex((selectedImageIndex + 1) % images.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImageIndex !== null) {
        setSelectedImageIndex((selectedImageIndex - 1 + images.length) % images.length);
    }
  };

  return (
    <>
      {/* Horizontal Scroll Strip */}
      <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide snap-x">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => openLightbox(idx)}
            className="group relative flex-shrink-0 w-40 h-28 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 snap-start transition-all hover:ring-2 hover:ring-primary focus:outline-none"
          >
            <img 
              src={img.thumbnailUrl} 
              alt={img.title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <Maximize2 className="text-white opacity-0 group-hover:opacity-100 w-6 h-6 drop-shadow-lg transform scale-75 group-hover:scale-100 transition-all" />
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedImageIndex !== null && (
        <div 
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-fade-in"
            onClick={closeLightbox}
        >
          {/* Close Button */}
          <button 
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-20"
          >
            <X size={24} />
          </button>

          {/* Navigation */}
          <button 
             onClick={prevImage}
             className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors hidden md:block z-20"
          >
            <ChevronLeft size={32} />
          </button>
          
          <button 
             onClick={nextImage}
             className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors hidden md:block z-20"
          >
            <ChevronRight size={32} />
          </button>

          {/* Main Content */}
          <div 
            className="max-w-5xl w-full max-h-full flex flex-col items-center" 
            onClick={(e) => e.stopPropagation()} 
          >
             <div className="relative w-full h-full flex justify-center overflow-hidden rounded-lg">
                <img 
                    src={images[selectedImageIndex].imageUrl} 
                    alt={images[selectedImageIndex].title}
                    className="max-w-full max-h-[80vh] object-contain rounded-md shadow-2xl" 
                />
             </div>
             
             <div className="mt-6 text-center max-w-2xl">
                <h3 className="text-white text-lg font-semibold mb-2 line-clamp-2">
                    {images[selectedImageIndex].title}
                </h3>
                <div className="flex items-center justify-center gap-2 text-gray-400 text-sm mb-4">
                    <span>{images[selectedImageIndex].source}</span>
                </div>
                <a 
                    href={images[selectedImageIndex].link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-full font-medium transition-all"
                >
                    <ExternalLink size={16} />
                    Visit Website
                </a>
             </div>
          </div>
        </div>
      )}
    </>
  );
};