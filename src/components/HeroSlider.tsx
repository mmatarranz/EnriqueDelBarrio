import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

export interface Slide {
  id: string;
  badge: string;
  title: string;
  highlight: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  image: string;
}

interface Props {
  initialSlides: Slide[];
}

export default function HeroSlider({ initialSlides }: Props) {
  const [slides, setSlides] = useState<Slide[]>(initialSlides);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('edb_custom_slides');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) setSlides(parsed);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [paused, slides.length]);

  const safeIndex = index % Math.max(1, slides.length);
  const current = slides[safeIndex] || initialSlides[0];
  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);
  const next = () => setIndex((i) => (i + 1) % slides.length);

  return (
    <section
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative overflow-hidden border-b border-stone-200 bg-stone-950 text-white"
      aria-label="Destacados de Enrique del Barrio"
    >
      {/* Full-bleed original image (no dark overlay) */}
      <div className="absolute inset-0">
        {slides.map((s, idx) => (
          <img
            key={s.id}
            src={s.image}
            alt=""
            aria-hidden="true"
            className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ${
              idx === safeIndex ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
      </div>

      <div className="relative mx-auto flex min-h-[440px] sm:min-h-[540px] max-w-7xl flex-col justify-center px-4 py-14 sm:px-6 lg:px-8 lg:py-28">
        <div className="max-w-2xl space-y-5 sm:space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/50 bg-stone-950/60 px-3.5 py-1 text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-amber-300 backdrop-blur-xs">
            {current.badge}
          </span>

          <h1 className="font-['Instrument_Serif',serif] text-4xl leading-[1.06] tracking-tight sm:text-6xl lg:text-7xl drop-shadow-md">
            {current.title}{' '}
            <span className="italic text-amber-300">{current.highlight}</span>
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-stone-100 sm:text-lg drop-shadow-xs">
            {current.description}
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href={current.ctaHref}
              className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-6 py-3.5 text-sm font-bold text-stone-950 shadow-lg hover:bg-amber-400 transition-colors"
            >
              <span>{current.ctaLabel}</span>
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href={current.secondaryHref}
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-stone-950/60 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-xs hover:border-white transition-colors"
            >
              {current.secondaryLabel}
            </a>
          </div>

          {/* Controls & indicators */}
          <div className="flex items-center gap-4 pt-6">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prev}
                aria-label="Diapositiva anterior"
                className="rounded-full border border-white/25 bg-stone-950/60 p-2 text-white backdrop-blur-xs hover:border-amber-400 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Siguiente diapositiva"
                className="rounded-full border border-white/25 bg-stone-950/60 p-2 text-white backdrop-blur-xs hover:border-amber-400 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              {slides.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setIndex(idx)}
                  aria-label={`Ir a ${s.title} ${s.highlight}`}
                  className={`h-2 rounded-full transition-all ${
                    idx === safeIndex ? 'w-8 bg-amber-400' : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>

            <span className="ml-2 text-xs font-semibold text-stone-300">
              {safeIndex + 1} / {slides.length}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
