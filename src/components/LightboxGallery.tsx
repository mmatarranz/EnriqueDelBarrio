import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface Props {
  images: string[];
  title: string;
}

export default function LightboxGallery({ images, title }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  const prev = () =>
    setActiveIndex((i) => (i === null ? 0 : (i - 1 + images.length) % images.length));
  const next = () =>
    setActiveIndex((i) => (i === null ? 0 : (i + 1) % images.length));

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((src, idx) => (
          <button
            key={src}
            type="button"
            onClick={() => setActiveIndex(idx)}
            className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 text-left shadow-sm"
          >
            <img
              src={src}
              alt={`${title} — muestra ${idx + 1}`}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-stone-950/0 transition-colors group-hover:bg-stone-950/35">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-stone-900 opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                <ZoomIn className="h-4 w-4" />
              </span>
            </div>
          </button>
        ))}
      </div>

      {activeIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/90 p-4 backdrop-blur-sm"
          onClick={() => setActiveIndex(null)}
        >
          <button
            type="button"
            onClick={() => setActiveIndex(null)}
            aria-label="Cerrar imagen"
            className="absolute right-5 top-5 rounded-full bg-white/15 p-2.5 text-white hover:bg-white/25"
          >
            <X className="h-6 w-6" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            aria-label="Anterior"
            className="absolute left-4 rounded-full bg-white/15 p-3 text-white hover:bg-white/25"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <img
            src={images[activeIndex]}
            alt={`${title} — vista ampliada`}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
          />

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            aria-label="Siguiente"
            className="absolute right-4 rounded-full bg-white/15 p-3 text-white hover:bg-white/25"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <span className="absolute bottom-5 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold text-white">
            {activeIndex + 1} / {images.length}
          </span>
        </div>
      )}
    </div>
  );
}
