import React, { useState } from 'react';
import { Play } from 'lucide-react';

interface Props {
  videoIds: string[];
}

export default function VideoGrid({ videoIds }: Props) {
  const [playing, setPlaying] = useState<Record<string, boolean>>({});

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {videoIds.map((id, idx) => {
        const isPlaying = Boolean(playing[id]);
        return (
          <div
            key={id}
            className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-950 shadow-sm"
          >
            <div className="relative aspect-video w-full">
              {isPlaying ? (
                <iframe
                  src={`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`}
                  title={`Producción audiovisual ${idx + 1} — Enrique del Barrio`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full border-0"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setPlaying((prev) => ({ ...prev, [id]: true }))}
                  className="group relative h-full w-full text-left"
                  aria-label={`Reproducir vídeo ${idx + 1}`}
                >
                  <img
                    src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
                    alt={`Miniatura vídeo ${idx + 1}`}
                    loading="lazy"
                    className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-stone-950/30 transition-colors group-hover:bg-stone-950/15">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500 text-stone-950 shadow-xl transition-transform group-hover:scale-110">
                      <Play className="h-6 w-6 fill-current ml-0.5" />
                    </span>
                  </div>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
