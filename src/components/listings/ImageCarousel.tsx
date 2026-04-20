import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface ImageCarouselProps {
  images: string[];
  alt?: string;
}

export function ImageCarousel({ images, alt = 'Listing image' }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl bg-muted text-muted-foreground">
        No images available
      </div>
    );
  }

  const goTo = (index: number) => {
    setCurrentIndex(index);
  };

  const goPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt={`${alt} ${currentIndex + 1}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full w-full object-contain"
          />
        </AnimatePresence>

        {/* Arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full opacity-0 transition-opacity group-hover:opacity-100 hover:opacity-100 bg-background/80 backdrop-blur-sm"
              style={{ opacity: 1 }}
              onClick={goPrev}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full opacity-0 transition-opacity group-hover:opacity-100 hover:opacity-100 bg-background/80 backdrop-blur-sm"
              style={{ opacity: 1 }}
              onClick={goNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Dot indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-2 w-2 rounded-full transition-all ${
                  i === currentIndex
                    ? 'w-6 bg-primary'
                    : 'bg-white/60 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                i === currentIndex
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={img}
                alt={`Thumbnail ${i + 1}`}
                className="h-16 w-16 object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
