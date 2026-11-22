import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Settings,
  Newspaper,
  Plus,
  Save,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  Pencil,
  Trash2,
  X,
  SlidersHorizontal,
  Package,
  Search,
  Download,
} from 'lucide-react';
import type { Product } from './BookStore';
import type { Slide } from './HeroSlider';

export interface OrderRecord {
  id: number;
  number: string;
  origin: 'wordpress' | 'nueva-web';
  status: string;
  date: string;
  total: number;
  shipping: number;
  paymentMethod: string;
  customerName: string;
  customerCity: string;
  customerEmail: string;
  items: { name: string; qty: number; total: string }[];
}

export interface NewsItem {
  id: number;
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  image: string;
  url?: string;
  type?: 'Prensa' | 'Último trabajo' | 'Vídeo';
}

interface Props {
  initialProducts: Product[];
  initialNews: NewsItem[];
  initialSlides: Slide[];
  initialOrders: OrderRecord[];
  initialShipping: number;
}

function resizeImageFile(file: File, maxW = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new window.Image();
      img.onload = () => {
        const scale = img.width > maxW ? maxW / img.width : 1;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/webp', 0.85));
        } else {
          reject(new Error('Canvas error'));
        }
      };
      img.onerror = reject;
      if (typeof ev.target?.result === 'string') {
        img.src = ev.target.result;
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AdminPanel({ initialProducts, initialNews, initialSlides, initialOrders, initialShipping }: Props) {
  const [tab, setTab] = useState<'orders' | 'books' | 'news' | 'slider' | 'settings'>('orders');
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [newsList, setNewsList] = useState<NewsItem[]>(initialNews);
  const [slidesList, setSlidesList] = useState<Slide[]>(initialSlides);
  const [ordersList, setOrdersList] = useState<OrderRecord[]>(initialOrders);
  const [orderOriginFilter, setOrderOriginFilter] = useState<'all' | 'nueva-web' | 'wordpress'>('nueva-web');
  const [orderQuery, setOrderQuery] = useState('');
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [shippingCost, setShippingCost] = useState<string>(String(initialShipping));
  const [savedMsg, setSavedMsg] = useState('');

  // Book form state (create & edit)
  const [editingBookId, setEditingBookId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('22.00');
  const [category, setCategory] = useState('Libros');
  const [stockStatus, setStockStatus] = useState<'instock' | 'outofstock'>('instock');
  const [desc, setDesc] = useState('');
  const [coverPreview, setCoverPreview] = useState('');
  const [coverName, setCoverName] = useState('');
  const bookFileRef = useRef<HTMLInputElement | null>(null);

  // Slider form state
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [slideBadge, setSlideBadge] = useState('');
  const [slideTitle, setSlideTitle] = useState('');
  const [slideHighlight, setSlideHighlight] = useState('');
  const [slideDesc, setSlideDesc] = useState('');
  const [slideCtaLabel, setSlideCtaLabel] = useState('Ver en Tienda');
  const [slideCtaHref, setSlideCtaHref] = useState('/prueba/tienda');
  const [slideImgPreview, setSlideImgPreview] = useState('');
  const [slideImgName, setSlideImgName] = useState('');
  const slideFileRef = useRef<HTMLInputElement | null>(null);

  // News / Press form state (create & edit)
  const [editingNewsId, setEditingNewsId] = useState<number | null>(null);
  const [newsTitle, setNewsTitle] = useState('');
  const [newsDate, setNewsDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [newsType, setNewsType] = useState<'Prensa' | 'Último trabajo' | 'Vídeo'>('Prensa');
  const [newsUrl, setNewsUrl] = useState('');
  const [newsExcerpt, setNewsExcerpt] = useState('');
  const [newsImgPreview, setNewsImgPreview] = useState('');
  const [newsImgName, setNewsImgName] = useState('');
  const newsFileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      const savedProds = localStorage.getItem('edb_custom_products');
      if (savedProds) setProducts(JSON.parse(savedProds));
      const savedNews = localStorage.getItem('edb_custom_news');
      if (savedNews) setNewsList(JSON.parse(savedNews));
      const savedSlides = localStorage.getItem('edb_custom_slides');
      if (savedSlides) setSlidesList(JSON.parse(savedSlides));
      const savedNewOrders = localStorage.getItem('edb_new_orders');
      if (savedNewOrders) {
        const parsedNew: OrderRecord[] = JSON.parse(savedNewOrders);
        if (Array.isArray(parsedNew) && parsedNew.length > 0) {
          setOrdersList([...parsedNew, ...initialOrders]);
        }
      }
      const savedShip = localStorage.getItem('edb_shipping_cost');
      if (savedShip) setShippingCost(savedShip);
    } catch {}
  }, []);

  const flash = (msg: string) => {
    setSavedMsg(msg);
    setTimeout(() => setSavedMsg(''), 4000);
  };

  const resetBookForm = () => {
    setEditingBookId(null);
    setName('');
    setPrice('22.00');
    setCategory('Libros');
    setStockStatus('instock');
    setDesc('');
    setCoverPreview('');
    setCoverName('');
    if (bookFileRef.current) bookFileRef.current.value = '';
  };

  const resetSlideForm = () => {
    setEditingSlideId(null);
    setSlideBadge('');
    setSlideTitle('');
    setSlideHighlight('');
    setSlideDesc('');
    setSlideCtaLabel('Ver en Tienda');
    setSlideCtaHref('/prueba/tienda');
    setSlideImgPreview('');
    setSlideImgName('');
    if (slideFileRef.current) slideFileRef.current.value = '';
  };

  const resetNewsForm = () => {
    setEditingNewsId(null);
    setNewsTitle('');
    setNewsDate(new Date().toISOString().slice(0, 10));
    setNewsType('Prensa');
    setNewsUrl('');
    setNewsExcerpt('');
    setNewsImgPreview('');
    setNewsImgName('');
    if (newsFileRef.current) newsFileRef.current.value = '';
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverName(file.name);
    try {
      const dataUrl = await resizeImageFile(file, 700);
      setCoverPreview(dataUrl);
    } catch {}
  };

  const handleNewsImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewsImgName(file.name);
    try {
      const dataUrl = await resizeImageFile(file, 900);
      setNewsImgPreview(dataUrl);
    } catch {}
  };

  const handleSaveBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const parsedPrice = parseFloat(price.replace(',', '.')) || 0;

    let updated: Product[];
    if (editingBookId !== null) {
      updated = products.map((p) =>
        p.id === editingBookId
          ? {
              ...p,
              name: name.trim(),
              price: parsedPrice,
              category,
              stock_status: stockStatus,
              short_description: desc.trim(),
              description: desc.trim(),
              image: coverPreview || p.image,
            }
          : p
      );
      flash(`Libro "${name.trim()}" actualizado correctamente.`);
    } else {
      const newBook: Product = {
        id: Date.now(),
        name: name.trim(),
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        price: parsedPrice,
        stock_status: stockStatus,
        category,
        short_description: desc.trim(),
        description: desc.trim(),
        image: coverPreview || products[0]?.image || '/prueba/images/brand/logo.jpg',
      };
      updated = [newBook, ...products];
      flash(`Libro "${newBook.name}" publicado en la tienda al instante.`);
    }

    setProducts(updated);
    try {
      localStorage.setItem('edb_custom_products', JSON.stringify(updated));
    } catch {}
    resetBookForm();
  };

  const startEditBook = (p: Product) => {
    setEditingBookId(p.id);
    setName(p.name);
    setPrice(String(p.price.toFixed(2)));
    setCategory(p.category);
    setStockStatus(p.stock_status === 'outofstock' ? 'outofstock' : 'instock');
    setDesc(p.short_description || p.description || '');
    setCoverPreview(p.image);
    setCoverName('Portada actual');
  };

  const handleSlideImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSlideImgName(file.name);
    try {
      const dataUrl = await resizeImageFile(file, 1280);
      setSlideImgPreview(dataUrl);
    } catch {}
  };

  const handleSaveSlide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slideTitle.trim()) return;
    let updated: Slide[];
    if (editingSlideId) {
      updated = slidesList.map((s) =>
        s.id === editingSlideId
          ? {
              ...s,
              badge: slideBadge.trim(),
              title: slideTitle.trim(),
              highlight: slideHighlight.trim(),
              description: slideDesc.trim(),
              ctaLabel: slideCtaLabel.trim() || 'Ver más',
              ctaHref: slideCtaHref.trim() || '/prueba/tienda',
              image: slideImgPreview || s.image,
            }
          : s
      );
      flash(`Diapositiva "${slideTitle.trim()}" actualizada en el slider de portada.`);
    } else {
      const newSlide: Slide = {
        id: `slide-${Date.now()}`,
        badge: slideBadge.trim() || 'Destacado',
        title: slideTitle.trim(),
        highlight: slideHighlight.trim(),
        description: slideDesc.trim(),
        ctaLabel: slideCtaLabel.trim() || 'Ver en Tienda',
        ctaHref: slideCtaHref.trim() || '/prueba/tienda',
        secondaryLabel: 'Solicitar presupuesto',
        secondaryHref: '/prueba/contacto',
        image: slideImgPreview || '/prueba/images/hero/slide-mester.jpg',
      };
      updated = [...slidesList, newSlide];
      flash(`Nueva diapositiva "${newSlide.title}" añadida al slider.`);
    }
    setSlidesList(updated);
    try {
      localStorage.setItem('edb_custom_slides', JSON.stringify(updated));
    } catch {}
    resetSlideForm();
  };

  const startEditSlide = (s: Slide) => {
    setEditingSlideId(s.id);
    setSlideBadge(s.badge);
    setSlideTitle(s.title);
    setSlideHighlight(s.highlight);
    setSlideDesc(s.description);
    setSlideCtaLabel(s.ctaLabel);
    setSlideCtaHref(s.ctaHref);
    setSlideImgPreview(s.image);
    setSlideImgName('Imagen actual del slider');
  };

  const deleteSlide = (id: string) => {
    if (slidesList.length <= 1) {
      flash('Debe quedar al menos una diapositiva activa en la portada.');
      return;
    }
    const updated = slidesList.filter((s) => s.id !== id);
    setSlidesList(updated);
    try {
      localStorage.setItem('edb_custom_slides', JSON.stringify(updated));
    } catch {}
    flash('Diapositiva eliminada del slider.');
  };

  const toggleStock = (id: number) => {
    const updated = products.map((p) =>
      p.id === id
        ? { ...p, stock_status: p.stock_status === 'instock' ? 'outofstock' : 'instock' }
        : p
    );
    setProducts(updated);
    try {
      localStorage.setItem('edb_custom_products', JSON.stringify(updated));
    } catch {}
    flash('Estado de stock actualizado.');
  };

  const handleSaveNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle.trim()) return;

    let updated: NewsItem[];
    if (editingNewsId !== null) {
      updated = newsList.map((n) =>
        n.id === editingNewsId
          ? {
              ...n,
              title: newsTitle.trim(),
              date: newsDate,
              type: newsType,
              url: newsUrl.trim(),
              excerpt: newsExcerpt.trim(),
              image: newsImgPreview || n.image,
            }
          : n
      );
      flash(`Entrada "${newsTitle.trim()}" actualizada.`);
    } else {
      const newItem: NewsItem = {
        id: Date.now(),
        title: newsTitle.trim(),
        slug: newsTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        date: newsDate,
        type: newsType,
        url: newsUrl.trim(),
        excerpt: newsExcerpt.trim(),
        image: newsImgPreview || '',
      };
      updated = [newItem, ...newsList];
      flash(`Nueva publicación "${newItem.title}" añadida a Prensa y Trabajos.`);
    }

    setNewsList(updated);
    try {
      localStorage.setItem('edb_custom_news', JSON.stringify(updated));
    } catch {}
    resetNewsForm();
  };

  const startEditNews = (item: NewsItem) => {
    setEditingNewsId(item.id);
    setNewsTitle(item.title);
    setNewsDate(item.date || new Date().toISOString().slice(0, 10));
    setNewsType(item.type || 'Prensa');
    setNewsUrl(item.url || '');
    setNewsExcerpt(item.excerpt || '');
    setNewsImgPreview(item.image || '');
    setNewsImgName(item.image ? 'Imagen actual' : '');
  };

  const deleteNews = (id: number) => {
    const updated = newsList.filter((n) => n.id !== id);
    setNewsList(updated);
    try {
      localStorage.setItem('edb_custom_news', JSON.stringify(updated));
    } catch {}
    flash('Entrada eliminada.');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const numeric = parseFloat(shippingCost.replace(',', '.'));
    if (!isNaN(numeric)) {
      localStorage.setItem('edb_shipping_cost', String(numeric));
      flash(`Gastos de envío actualizados a ${numeric.toFixed(2).replace('.', ',')} € en toda la tienda.`);
    }
  };

  return (
    <div className="space-y-6">
      {savedMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{savedMsg}</span>
        </div>
      )}

      {/* 5 Mobile-Friendly Tabs */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        <button
          onClick={() => setTab('orders')}
          className={`flex items-center gap-2.5 rounded-2xl border p-3 sm:p-4 text-left transition-all ${
            tab === 'orders'
              ? 'border-stone-900 bg-stone-900 text-white shadow-md'
              : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
          }`}
        >
          <Package className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
          <div className="min-w-0">
            <div className="truncate font-bold text-xs sm:text-sm">1. Pedidos ({ordersList.length})</div>
            <div className="truncate text-[11px] opacity-75">Nuevos + WP</div>
          </div>
        </button>

        <button
          onClick={() => setTab('books')}
          className={`flex items-center gap-2.5 rounded-2xl border p-3 sm:p-4 text-left transition-all ${
            tab === 'books'
              ? 'border-stone-900 bg-stone-900 text-white shadow-md'
              : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
          }`}
        >
          <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
          <div className="min-w-0">
            <div className="truncate font-bold text-xs sm:text-sm">2. Libros ({products.length})</div>
            <div className="truncate text-[11px] opacity-75">Precios y stock</div>
          </div>
        </button>

        <button
          onClick={() => setTab('news')}
          className={`flex items-center gap-2.5 rounded-2xl border p-3 sm:p-4 text-left transition-all ${
            tab === 'news'
              ? 'border-stone-900 bg-stone-900 text-white shadow-md'
              : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
          }`}
        >
          <Newspaper className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
          <div className="min-w-0">
            <div className="truncate font-bold text-xs sm:text-sm">3. Prensa ({newsList.length})</div>
            <div className="truncate text-[11px] opacity-75">Noticias</div>
          </div>
        </button>

        <button
          onClick={() => setTab('slider')}
          className={`flex items-center gap-2.5 rounded-2xl border p-3 sm:p-4 text-left transition-all ${
            tab === 'slider'
              ? 'border-stone-900 bg-stone-900 text-white shadow-md'
              : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
          <div className="min-w-0">
            <div className="truncate font-bold text-xs sm:text-sm">4. Slider ({slidesList.length})</div>
            <div className="truncate text-[11px] opacity-75">Portada</div>
          </div>
        </button>

        <button
          onClick={() => setTab('settings')}
          className={`col-span-2 sm:col-span-1 flex items-center gap-2.5 rounded-2xl border p-3 sm:p-4 text-left transition-all ${
            tab === 'settings'
              ? 'border-stone-900 bg-stone-900 text-white shadow-md'
              : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
          }`}
        >
          <Settings className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
          <div className="min-w-0">
            <div className="truncate font-bold text-xs sm:text-sm">5. Ajustes</div>
            <div className="truncate text-[11px] opacity-75">Envíos</div>
          </div>
        </button>
      </div>

      {/* Tab 0: Orders (Historical WordPress + New Web Orders) */}
      {tab === 'orders' && (() => {
        const filteredOrders = ordersList.filter((o) => {
          const matchOrigin = orderOriginFilter === 'all' || o.origin === orderOriginFilter;
          const q = orderQuery.trim().toLowerCase();
          const matchQ =
            !q ||
            o.number.toLowerCase().includes(q) ||
            o.customerName.toLowerCase().includes(q) ||
            o.customerCity.toLowerCase().includes(q) ||
            o.items.some((i) => i.name.toLowerCase().includes(q));
          return matchOrigin && matchQ;
        });
        const wpCount = ordersList.filter((o) => o.origin === 'wordpress').length;
        const newCount = ordersList.filter((o) => o.origin === 'nueva-web').length;

        const validFiltered = filteredOrders.filter(
          (o) => !['cancelled', 'failed', 'refunded'].includes(o.status)
        );
        const filteredRevenue = validFiltered.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
        const totalAllRevenue = ordersList
          .filter((o) => !['cancelled', 'failed', 'refunded'].includes(o.status))
          .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

        const displayedOrders = showAllOrders ? filteredOrders : filteredOrders.slice(0, 100);

        const exportOrdersCsv = () => {
          const headers = ['Numero', 'Origen', 'Fecha', 'Estado', 'Cliente', 'Ciudad', 'Email', 'Articulos', 'Envio_EUR', 'Total_EUR', 'Metodo_Pago'];
          const escapeCell = (val: string | number) => `"${String(val ?? '').replace(/"/g, '""')}"`;
          const rows = filteredOrders.map((o) => [
            o.number,
            o.origin === 'wordpress' ? 'Historico WordPress' : 'Nueva Web',
            o.date,
            o.status,
            o.customerName,
            o.customerCity,
            o.customerEmail,
            o.items.map((i) => `${i.qty}x ${i.name}`).join(' | '),
            o.shipping.toFixed(2).replace('.', ','),
            o.total.toFixed(2).replace('.', ','),
            o.paymentMethod,
          ]);
          const csv = '\uFEFF' + [headers, ...rows].map((r) => r.map(escapeCell).join(';')).join('\n');
          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `pedidos-enrique-del-barrio-${orderOriginFilter}-${new Date().toISOString().slice(0, 10)}.csv`;
          a.click();
          URL.revokeObjectURL(url);
          flash(`Exportados ${filteredOrders.length} pedidos a CSV correctamente.`);
        };

        const statusBadge = (st: string) => {
          if (st === 'completed') return 'bg-emerald-50 text-emerald-700';
          if (st === 'processing') return 'bg-amber-50 text-amber-800';
          if (st === 'cancelled' || st === 'failed' || st === 'refunded') return 'bg-red-50 text-red-700';
          return 'bg-stone-100 text-stone-600';
        };
        const statusLabel: Record<string, string> = {
          completed: 'Completado',
          processing: 'En proceso',
          'on-hold': 'En espera',
          pending: 'Pendiente pago',
          cancelled: 'Cancelado',
          refunded: 'Reembolsado',
          failed: 'Fallido',
        };

        return (
          <div className="space-y-5">
            {/* Resumen de Ventas (KPIs) */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Pedidos en esta vista
                </p>
                <p className="mt-2 text-3xl font-bold text-stone-950">
                  {filteredOrders.length}
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  {validFiltered.length} válidos (excluyendo cancelados/fallidos)
                </p>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">
                  Importe en esta vista
                </p>
                <p className="mt-2 text-3xl font-bold text-stone-950">
                  {filteredRevenue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                </p>
                <p className="mt-1 text-xs text-amber-800/80">
                  Suma de pedidos válidos filtrados
                </p>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-stone-900 p-5 text-white shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                  Volumen histórico acumulado
                </p>
                <p className="mt-2 text-3xl font-bold text-amber-400">
                  {totalAllRevenue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                </p>
                <p className="mt-1 text-xs text-stone-300">
                  {ordersList.length} pedidos totales ({newCount} nuevos + {wpCount} WordPress)
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setOrderOriginFilter('nueva-web'); setShowAllOrders(false); }}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold ${
                    orderOriginFilter === 'nueva-web' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  ✨ Nueva Web ({newCount})
                </button>
                <button
                  type="button"
                  onClick={() => { setOrderOriginFilter('wordpress'); setShowAllOrders(false); }}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold ${
                    orderOriginFilter === 'wordpress' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
                  }`}
                >
                  📦 Histórico WordPress ({wpCount})
                </button>
                <button
                  type="button"
                  onClick={() => { setOrderOriginFilter('all'); setShowAllOrders(false); }}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold ${
                    orderOriginFilter === 'all' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  Todos ({ordersList.length})
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-full sm:w-64">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <input
                    type="search"
                    value={orderQuery}
                    onChange={(e) => setOrderQuery(e.target.value)}
                    placeholder="Buscar nº pedido, cliente o libro..."
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2 pl-9 pr-3 text-xs outline-none focus:border-amber-600 focus:bg-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={exportOrdersCsv}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-amber-700 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Descargar CSV ({filteredOrders.length})</span>
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-stone-50 text-[11px] uppercase tracking-wider text-stone-500 border-b border-stone-200">
                    <tr>
                      <th className="px-4 py-3">Pedido / Origen</th>
                      <th className="px-4 py-3">Fecha</th>
                      <th className="px-4 py-3">Cliente</th>
                      <th className="px-4 py-3">Artículos</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-sm text-stone-500">
                          Todavía no hay pedidos registrados en <strong>Nueva Web</strong>. Haz una compra de prueba en la tienda o pulsa en <strong>Histórico WordPress ({wpCount})</strong> para consultar los anteriores.
                        </td>
                      </tr>
                    ) : (
                      displayedOrders.map((o) => (
                      <tr key={`${o.origin}-${o.id}`} className="hover:bg-stone-50/70">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-bold text-stone-900">#{o.number}</div>
                          {o.origin === 'wordpress' ? (
                            <span className="mt-1 inline-block rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                              Histórico WordPress
                            </span>
                          ) : (
                            <span className="mt-1 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                              Nueva Web
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-stone-500">{o.date}</td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-stone-900">{o.customerName}</div>
                          <div className="text-[11px] text-stone-500">{o.customerCity || o.customerEmail}</div>
                        </td>
                        <td className="px-4 py-3 max-w-xs">
                          {o.items.map((it, idx) => (
                            <div key={idx} className="truncate text-stone-700">
                              {it.qty}× {it.name}
                            </div>
                          ))}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusBadge(o.status)}`}>
                            {statusLabel[o.status] || o.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap font-bold text-stone-950">
                          {o.total.toFixed(2).replace('.', ',')} €
                          <div className="text-[10px] font-normal text-stone-400">{o.paymentMethod}</div>
                        </td>
                      </tr>
                    )))}
                  </tbody>
                </table>
              </div>
              {filteredOrders.length > 100 && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-stone-100 bg-stone-50 px-4 py-3 text-xs text-stone-600">
                  <span>
                    Mostrando <strong>{displayedOrders.length}</strong> de <strong>{filteredOrders.length}</strong> pedidos.
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAllOrders((v) => !v)}
                    className="rounded-full bg-stone-900 px-4 py-1.5 text-xs font-bold text-white hover:bg-amber-700 transition-colors"
                  >
                    {showAllOrders ? 'Mostrar solo 100 últimos' : `Ver todos (${filteredOrders.length})`}
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Tab 1: Books */}
      {tab === 'books' && (
        <div className="grid gap-8 lg:grid-cols-12">
          <form
            onSubmit={handleSaveBook}
            className="lg:col-span-5 space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm h-fit"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-stone-950">
                {editingBookId ? 'Editar libro' : 'Publicar nuevo libro'}
              </h2>
              {editingBookId && (
                <button
                  type="button"
                  onClick={resetBookForm}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-stone-500 hover:text-stone-900"
                >
                  <X className="h-3.5 w-3.5" /> Cancelar
                </button>
              )}
            </div>
            <p className="text-xs text-stone-500">
              Sube la portada, pon el título y precio, y aparecerá automáticamente en la tienda.
            </p>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Título del libro</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Segovia Callada — Edición Especial"
                className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm outline-none focus:border-amber-600"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Precio (€)</label>
                <input
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-amber-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Categoría</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-amber-600 bg-white"
                >
                  <option>Libros</option>
                  <option>Fotografía</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Estado / Stock</label>
                <select
                  value={stockStatus}
                  onChange={(e) => setStockStatus(e.target.value as 'instock' | 'outofstock')}
                  className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-amber-600 bg-white"
                >
                  <option value="instock">🟢 Disponible</option>
                  <option value="outofstock">🔴 Agotado</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Portada del libro (JPG, PNG o WebP)</label>
              <label className="flex cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed border-stone-200 bg-stone-50 p-3.5 hover:border-amber-500 hover:bg-amber-50/30 transition-colors">
                {coverPreview ? (
                  <img src={coverPreview} alt="Vista previa de portada" className="h-16 w-12 rounded-lg object-cover shadow-sm" />
                ) : (
                  <div className="flex h-16 w-12 items-center justify-center rounded-lg bg-stone-200 text-stone-500">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-800">
                    <Upload className="h-3.5 w-3.5 text-amber-600" />
                    {coverPreview ? 'Cambiar imagen de portada' : 'Seleccionar portada desde tu equipo'}
                  </span>
                  <p className="mt-0.5 truncate text-[11px] text-stone-500">
                    {coverName || 'Se optimiza automáticamente a WebP al subirla'}
                  </p>
                </div>
                <input
                  ref={bookFileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Sinopsis breve</label>
              <textarea
                rows={3}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Descripción de páginas, encuadernación y temática..."
                className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm outline-none focus:border-amber-600"
              />
            </div>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 py-3 text-sm font-bold text-white hover:bg-amber-700 transition-colors"
            >
              {editingBookId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              <span>{editingBookId ? 'Guardar cambios del libro' : 'Publicar en la tienda'}</span>
            </button>
          </form>

          <div className="lg:col-span-7 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-stone-950">Catálogo actual ({products.length})</h2>
              <a href="/prueba/tienda" className="text-xs font-semibold text-amber-700 hover:underline">
                Ver tienda pública →
              </a>
            </div>
            <div className="divide-y divide-stone-100 max-h-[560px] overflow-y-auto pr-2">
              {products.map((p) => (
                <div key={p.id} className="flex items-center gap-3 py-3">
                  <img src={p.image} alt={p.name} className="h-12 w-10 rounded object-cover bg-stone-100 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-semibold text-stone-900">{p.name}</p>
                    <p className="text-xs text-stone-500">{p.price.toFixed(2).replace('.', ',')} € · {p.category}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => startEditBook(p)}
                    title="Editar libro"
                    className="rounded-lg border border-stone-200 p-1.5 text-stone-600 hover:bg-stone-100"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleStock(p.id)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      p.stock_status === 'instock'
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                    }`}
                  >
                    {p.stock_status === 'instock' ? 'Disponible' : 'Agotado'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: News & Press (Full Create + Edit + Image Upload) */}
      {tab === 'news' && (
        <div className="grid gap-8 lg:grid-cols-12">
          <form
            onSubmit={handleSaveNews}
            className="lg:col-span-5 space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm h-fit"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-stone-950">
                {editingNewsId ? 'Editar publicación' : 'Añadir prensa o último trabajo'}
              </h2>
              {editingNewsId && (
                <button
                  type="button"
                  onClick={resetNewsForm}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-stone-500 hover:text-stone-900"
                >
                  <X className="h-3.5 w-3.5" /> Cancelar
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Titular</label>
              <input
                required
                value={newsTitle}
                onChange={(e) => setNewsTitle(e.target.value)}
                placeholder="Ej. Entrevista en El Adelantado sobre el nuevo libro..."
                className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm outline-none focus:border-amber-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Sección</label>
                <select
                  value={newsType}
                  onChange={(e) => setNewsType(e.target.value as 'Prensa' | 'Último trabajo' | 'Vídeo')}
                  className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm outline-none focus:border-amber-600 bg-white"
                >
                  <option value="Prensa">Prensa y medios</option>
                  <option value="Último trabajo">Último trabajo</option>
                  <option value="Vídeo">Vídeo / YouTube</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Fecha</label>
                <input
                  type="date"
                  value={newsDate}
                  onChange={(e) => setNewsDate(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm outline-none focus:border-amber-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Enlace externo o YouTube (opcional)</label>
              <input
                type="url"
                value={newsUrl}
                onChange={(e) => setNewsUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Imagen destacada</label>
              <label className="flex cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed border-stone-200 bg-stone-50 p-3.5 hover:border-amber-500 hover:bg-amber-50/30 transition-colors">
                {newsImgPreview ? (
                  <img src={newsImgPreview} alt="Vista previa" className="h-14 w-20 rounded-lg object-cover shadow-sm" />
                ) : (
                  <div className="flex h-14 w-20 items-center justify-center rounded-lg bg-stone-200 text-stone-500">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-800">
                    <Upload className="h-3.5 w-3.5 text-amber-600" />
                    {newsImgPreview ? 'Cambiar foto' : 'Subir fotografía'}
                  </span>
                  <p className="mt-0.5 truncate text-[11px] text-stone-500">
                    {newsImgName || 'JPG, PNG o WebP (optimización automática)'}
                  </p>
                </div>
                <input
                  ref={newsFileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleNewsImageChange}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Resumen breve</label>
              <textarea
                rows={3}
                value={newsExcerpt}
                onChange={(e) => setNewsExcerpt(e.target.value)}
                placeholder="Breve descripción del trabajo o aparición en medios..."
                className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm outline-none focus:border-amber-600"
              />
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 py-3 text-sm font-bold text-white hover:bg-amber-700 transition-colors"
            >
              {editingNewsId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              <span>{editingNewsId ? 'Guardar cambios' : 'Publicar entrada'}</span>
            </button>
          </form>

          <div className="lg:col-span-7 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-stone-950">Entradas publicadas ({newsList.length})</h2>
              <a href="/prueba/#prensa" className="text-xs font-semibold text-amber-700 hover:underline">
                Ver en portada →
              </a>
            </div>
            <div className="divide-y divide-stone-100 max-h-[560px] overflow-y-auto pr-2">
              {newsList.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-3">
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="h-12 w-16 rounded object-cover bg-stone-100 shrink-0" />
                  ) : (
                    <div className="flex h-12 w-16 items-center justify-center rounded bg-stone-100 text-stone-400 shrink-0">
                      <Newspaper className="h-4 w-4" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-semibold text-stone-900">{item.title}</p>
                    <p className="text-xs text-stone-500">
                      {item.date} {item.type ? `· ${item.type}` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => startEditNews(item)}
                    title="Editar entrada"
                    className="rounded-lg border border-stone-200 p-1.5 text-stone-600 hover:bg-stone-100"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteNews(item.id)}
                    title="Eliminar entrada"
                    className="rounded-lg border border-stone-200 p-1.5 text-stone-400 hover:border-red-200 hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Slider Portada */}
      {tab === 'slider' && (
        <div className="grid gap-8 lg:grid-cols-12">
          <form
            onSubmit={handleSaveSlide}
            className="lg:col-span-5 space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm h-fit"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-stone-950">
                {editingSlideId ? 'Editar diapositiva' : 'Añadir diapositiva al slider'}
              </h2>
              {editingSlideId && (
                <button
                  type="button"
                  onClick={resetSlideForm}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-stone-500 hover:text-stone-900"
                >
                  <X className="h-3.5 w-3.5" /> Cancelar
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Etiqueta superior (badge)</label>
              <input
                value={slideBadge}
                onChange={(e) => setSlideBadge(e.target.value)}
                placeholder="Ej. Novedad Editorial · 23,00 €"
                className="w-full rounded-xl border border-stone-200 px-3.5 py-2 text-sm outline-none focus:border-amber-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Título principal</label>
                <input
                  required
                  value={slideTitle}
                  onChange={(e) => setSlideTitle(e.target.value)}
                  placeholder="Ej. El Mester de"
                  className="w-full rounded-xl border border-stone-200 px-3.5 py-2 text-sm outline-none focus:border-amber-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Texto destacado (ámbar)</label>
                <input
                  value={slideHighlight}
                  onChange={(e) => setSlideHighlight(e.target.value)}
                  placeholder="Ej. Nuestra Vida"
                  className="w-full rounded-xl border border-stone-200 px-3.5 py-2 text-sm outline-none focus:border-amber-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Texto del botón</label>
                <input
                  value={slideCtaLabel}
                  onChange={(e) => setSlideCtaLabel(e.target.value)}
                  placeholder="Ej. Ver en Tienda"
                  className="w-full rounded-xl border border-stone-200 px-3.5 py-2 text-sm outline-none focus:border-amber-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Enlace destino</label>
                <select
                  value={slideCtaHref}
                  onChange={(e) => setSlideCtaHref(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-600 bg-white"
                >
                  <option value="/prueba/tienda">/prueba/tienda (Tienda Editorial)</option>
                  <option value="/prueba/servicios/imprenta">/prueba/servicios/imprenta</option>
                  <option value="/prueba/servicios/produccion-editorial">/prueba/servicios/produccion-editorial</option>
                  <option value="/prueba/servicios/fotografia">/prueba/servicios/fotografia</option>
                  <option value="/prueba/servicios/video-profesional">/prueba/servicios/video-profesional</option>
                  <option value="/prueba/servicios/gran-formato">/prueba/servicios/gran-formato</option>
                  <option value="/prueba/contacto">/prueba/contacto (Presupuestos)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Imagen de fondo a pantalla completa
              </label>
              <p className="mb-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-[11px] text-amber-900 leading-relaxed">
                <strong>📐 Tamaño mínimo recomendado:</strong> <strong>1920 × 1080 px</strong> (formato horizontal 16:9). Como el texto va a la izquierda, intenta dejar el motivo principal de la fotografía hacia el centro o la derecha.
              </p>
              <label className="flex cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed border-stone-200 bg-stone-50 p-3 hover:border-amber-500 transition-colors">
                {slideImgPreview ? (
                  <img src={slideImgPreview} alt="Vista previa slider" className="h-14 w-24 rounded-lg object-cover shadow-sm" />
                ) : (
                  <div className="flex h-14 w-24 items-center justify-center rounded-lg bg-stone-200 text-stone-500">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-800">
                    <Upload className="h-3.5 w-3.5 text-amber-600" />
                    {slideImgPreview ? 'Cambiar foto' : 'Subir foto panorámica'}
                  </span>
                  <p className="mt-0.5 truncate text-[11px] text-stone-500">
                    {slideImgName || 'Recomendado formato horizontal 16:9'}
                  </p>
                </div>
                <input
                  ref={slideFileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleSlideImageChange}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Descripción breve</label>
              <textarea
                rows={3}
                value={slideDesc}
                onChange={(e) => setSlideDesc(e.target.value)}
                className="w-full rounded-xl border border-stone-200 px-3.5 py-2 text-sm outline-none focus:border-amber-600"
              />
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 py-3 text-sm font-bold text-white hover:bg-amber-700 transition-colors"
            >
              {editingSlideId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              <span>{editingSlideId ? 'Guardar cambios del slider' : 'Añadir diapositiva'}</span>
            </button>
          </form>

          <div className="lg:col-span-7 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-stone-950">Diapositivas activas ({slidesList.length})</h2>
              <a href="/prueba/" className="text-xs font-semibold text-amber-700 hover:underline">
                Ver portada →
              </a>
            </div>
            <div className="divide-y divide-stone-100">
              {slidesList.map((s) => (
                <div key={s.id} className="flex items-center gap-4 py-3.5">
                  <img src={s.image} alt={s.title} className="h-14 w-24 rounded-lg object-cover bg-stone-100 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-amber-700">{s.badge}</p>
                    <p className="truncate text-sm font-bold text-stone-900">
                      {s.title} {s.highlight}
                    </p>
                    <p className="truncate text-xs text-stone-500">Botón: {s.ctaLabel} → {s.ctaHref}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => startEditSlide(s)}
                    title="Editar diapositiva"
                    className="rounded-lg border border-stone-200 p-1.5 text-stone-600 hover:bg-stone-100"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteSlide(s.id)}
                    title="Eliminar diapositiva"
                    className="rounded-lg border border-stone-200 p-1.5 text-stone-400 hover:border-red-200 hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Settings (Shipping Cost!) */}
      {tab === 'settings' && (
        <form
          onSubmit={handleSaveSettings}
          className="max-w-xl rounded-2xl border border-stone-200 bg-white p-6 shadow-sm space-y-5"
        >
          <div>
            <h2 className="text-lg font-bold text-stone-950">Gastos de envío y configuración básica</h2>
            <p className="mt-1 text-xs text-stone-500">
              Cambia aquí el importe de envío por Correos y se actualizará automáticamente en el carrito de la tienda sin tocar ningún plugin.
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Tarifa plana de envío nacional (€)
            </label>
            <input
              type="text"
              value={shippingCost}
              onChange={(e) => setShippingCost(e.target.value)}
              className="w-40 rounded-xl border border-stone-200 px-3.5 py-2.5 text-base font-bold text-stone-900 outline-none focus:border-amber-600"
            />
            <p className="mt-1.5 text-xs text-stone-400">Valor actual en tu web anterior: 2,94 €</p>
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Guardar cambios</span>
          </button>
        </form>
      )}
    </div>
  );
}
