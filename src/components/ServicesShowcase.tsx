import React from 'react';
import { Printer, PenTool, BookOpen, Frame, Camera, Video, ArrowUpRight } from 'lucide-react';

export interface ServiceItem {
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  gallery: string[];
}

interface Props {
  services: ServiceItem[];
  fallbackImages: Record<string, string>;
}

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  imprenta: Printer,
  'maquetacion-y-diseno-grafico': PenTool,
  'produccion-editorial': BookOpen,
  'gran-formato': Frame,
  fotografia: Camera,
  'video-profesional': Video,
};

const TAGS: Record<string, string> = {
  imprenta: 'Imprenta Offset & Digital',
  'maquetacion-y-diseno-grafico': 'Diseño & Identidad',
  'produccion-editorial': 'Edición de Libros',
  'gran-formato': 'Expositores & Vinilos',
  fotografia: 'Fotografía & Dron',
  'video-profesional': 'Audiovisual 4K',
};

export default function ServicesShowcase({ services, fallbackImages }: Props) {
  const getCover = (srv: ServiceItem) =>
    srv.gallery?.[0] || fallbackImages[srv.slug] || '/prueba/images/hero/slide-imprenta.jpg';

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {services.map((srv, idx) => {
        const Icon = ICONS[srv.slug] || Camera;
        const num = String(idx + 1).padStart(2, '0');
        return (
          <a
            key={srv.slug}
            href={`/prueba/servicios/${srv.slug}`}
            className="group relative flex min-h-[360px] flex-col justify-between overflow-hidden rounded-3xl bg-stone-900 p-6 text-white shadow-md transition-all hover:-translate-y-1 hover:shadow-xl"
          >
            <img
              src={getCover(srv)}
              alt={srv.title}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/35 to-stone-950/15 transition-opacity group-hover:from-stone-950/95" />

            <div className="relative flex items-center justify-between">
              <span className="font-['Instrument_Serif',serif] text-2xl italic text-amber-300 drop-shadow">
                {num}
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-stone-950/45 backdrop-blur-xs text-white transition-colors group-hover:border-amber-400 group-hover:bg-amber-500 group-hover:text-stone-950">
                <Icon className="h-4 w-4" />
              </span>
            </div>

            <div className="relative space-y-2">
              <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-amber-300">
                {TAGS[srv.slug] || 'Servicio'}
              </span>
              <h3 className="font-['Instrument_Serif',serif] text-3xl leading-tight text-white">
                {srv.title}
              </h3>
              <p className="line-clamp-2 text-xs leading-relaxed text-stone-200">
                {srv.summary || srv.subtitle}
              </p>
              <div className="pt-2 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300 group-hover:translate-x-1 transition-transform">
                <span>Explorar trabajos</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
}
