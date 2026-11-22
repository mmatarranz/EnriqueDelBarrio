import React, { useState, useMemo } from 'react';
import { Search, X, ExternalLink, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

export interface NewsEntry {
  id: number;
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  body?: string;
  image: string;
  externalUrl?: string;
  url?: string;
  youtubeId?: string;
  type?: string;
}

interface Props {
  initialNews: NewsEntry[];
}

const PAGE_SIZE = 6;

export default function NewsShowcase({ initialNews }: Props) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [active, setActive] = useState<NewsEntry | null>(null);

  const items = useMemo(() => {
    if (typeof window === 'undefined') return initialNews;
    try {
      const saved = localStorage.getItem('edb_custom_news');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialNews;
  }, [initialNews]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        (n.excerpt || '').toLowerCase().includes(q) ||
        (n.body || '').toLowerCase().includes(q)
    );
  }, [items, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Header + Search */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
            Actualidad y Archivo ({filtered.length} publicaciones)
          </span>
          <h3 className="mt-1 font-['Instrument_Serif',serif] text-3xl sm:text-4xl text-stone-950">
            Últimos trabajos y apariciones en prensa
          </h3>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar trabajo o medio..."
            className="w-full rounded-full border border-stone-200 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-amber-600 shadow-xs"
          />
        </div>
      </div>

      {/* Cards Grid */}
      {visible.length === 0 ? (
        <p className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-sm text-stone-500">
          No se encontraron publicaciones para «{query}».
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActive(item)}
              className="group flex flex-col rounded-2xl border border-stone-200 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md"
            >
              {item.image && (
                <div className="mb-3 h-44 w-full overflow-hidden rounded-xl bg-stone-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-400">
                <Calendar className="h-3.5 w-3.5" />
                <span>{item.date}</span>
                {item.type && (
                  <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] text-stone-600">
                    {item.type}
                  </span>
                )}
              </div>
              <h4 className="mt-2 font-bold text-stone-900 leading-snug group-hover:text-amber-700 transition-colors">
                {item.title}
              </h4>
              {(item.excerpt || item.body) && (
                <p className="mt-2 text-xs leading-relaxed text-stone-600 line-clamp-3">
                  {item.excerpt || item.body}
                </p>
              )}
              <span className="mt-auto pt-4 text-xs font-bold text-amber-700">
                Leer completo →
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 disabled:opacity-40"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Anterior
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setPage(num)}
              className={`h-8 w-8 rounded-full text-xs font-bold transition-colors ${
                num === safePage
                  ? 'bg-stone-900 text-white'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
              }`}
            >
              {num}
            </button>
          ))}

          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 disabled:opacity-40"
          >
            Siguiente <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Full Article Modal */}
      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 p-4 backdrop-blur-sm"
          onClick={() => setActive(null)}
        >
          <article
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setActive(null)}
              aria-label="Cerrar publicación"
              className="sticky float-right right-4 top-4 z-10 m-4 rounded-full bg-white/90 p-2 text-stone-700 shadow hover:bg-stone-100"
            >
              <X className="h-5 w-5" />
            </button>

            {active.image && (
              <img
                src={active.image}
                alt={active.title}
                className="max-h-80 w-full object-cover bg-stone-100"
              />
            )}

            <div className="p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-700">
                <Calendar className="h-3.5 w-3.5" />
                <span>{active.date}</span>
                {active.type && <span>· {active.type}</span>}
              </div>

              <h3 className="font-['Instrument_Serif',serif] text-3xl sm:text-4xl text-stone-950 leading-tight">
                {active.title}
              </h3>

              {active.youtubeId && (
                <div className="aspect-video w-full overflow-hidden rounded-2xl bg-stone-950">
                  <iframe
                    src={`https://www.youtube.com/embed/${active.youtubeId}?rel=0`}
                    title={active.title}
                    allowFullScreen
                    className="h-full w-full border-0"
                  />
                </div>
              )}

              <div className="space-y-3 text-sm leading-relaxed text-stone-700">
                {(active.body || active.excerpt || 'Publicación del archivo de trabajos y prensa de Enrique del Barrio.')
                  .split(/\n\n+/)
                  .map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
              </div>

              {(active.externalUrl || active.url) && (
                <div className="pt-4 border-t border-stone-100">
                  <a
                    href={active.externalUrl || active.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-amber-700 transition-colors"
                  >
                    <span>Ver publicación original</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}
            </div>
          </article>
        </div>
      )}
    </div>
  );
}
