import React, { useState, useMemo } from 'react';
import { ShoppingBag, Search, Plus, Minus, Trash2, CheckCircle2, Truck, CreditCard, X } from 'lucide-react';

export interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  stock_status: string;
  category: string;
  short_description: string;
  description: string;
  image: string;
}

interface Props {
  initialProducts: Product[];
  shippingCost: number;
  shippingLabel: string;
  whatsapp: string;
}

interface CartItem {
  product: Product;
  qty: number;
}

export default function BookStore({ initialProducts, shippingCost, shippingLabel, whatsapp }: Props) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [checkoutDone, setCheckoutDone] = useState(false);

  // Merge any books added via the local /prueba/admin demo panel in localStorage
  const products = useMemo(() => {
    if (typeof window === 'undefined') return initialProducts;
    try {
      const saved = localStorage.getItem('edb_custom_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialProducts;
  }, [initialProducts]);

  const effectiveShipping = useMemo(() => {
    if (typeof window === 'undefined') return shippingCost;
    try {
      const saved = localStorage.getItem('edb_shipping_cost');
      if (saved !== null && !isNaN(Number(saved))) return Number(saved);
    } catch {}
    return shippingCost;
  }, [shippingCost]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category)));
    return ['Todos', ...cats];
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === 'Todos' || p.category === selectedCategory;
      const matchQ =
        !query.trim() ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.short_description.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchQ;
    });
  }, [products, selectedCategory, query]);

  const addToCart = (product: Product) => {
    setCheckoutDone(false);
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { product, qty: 1 }];
    });
    setCartOpen(true);
  };

  const updateQty = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => (item.product.id === id ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0)
    );
  };

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.qty, 0);
  const totalCount = cart.reduce((acc, item) => acc + item.qty, 0);
  const total = cart.length > 0 ? subtotal + effectiveShipping : 0;

  return (
    <div className="space-y-8">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar libro, colección o tema (ej. Segovia Callada)..."
            className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-amber-600 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                selectedCategory === cat
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}

          <button
            onClick={() => setCartOpen(true)}
            className="ml-auto inline-flex items-center gap-2 rounded-full bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-700 transition-colors"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Carrito ({totalCount})</span>
            {subtotal > 0 && <span>· {subtotal.toFixed(2).replace('.', ',')} €</span>}
          </button>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((product) => {
          const outOfStock = product.stock_status !== 'instock';
          return (
            <article
              key={product.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <button
                type="button"
                onClick={() => setActiveProduct(product)}
                className="relative aspect-[3/4] w-full overflow-hidden bg-stone-100 p-4 flex items-center justify-center text-left"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  className="h-full w-full object-contain drop-shadow-md transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-stone-800 backdrop-blur-sm">
                  {product.category}
                </span>
                {outOfStock && (
                  <span className="absolute right-3 top-3 rounded-full bg-stone-900/85 px-2.5 py-1 text-[11px] font-semibold text-white">
                    Agotado
                  </span>
                )}
              </button>

              <div className="flex flex-1 flex-col p-5">
                <a
                  href={`/prueba/tienda/${product.slug}`}
                  className="line-clamp-2 text-base font-bold text-stone-900 leading-snug hover:text-amber-700 transition-colors"
                >
                  {product.name}
                </a>
                {product.short_description && (
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-stone-500">
                    {product.short_description}
                  </p>
                )}

                <div className="mt-auto flex items-center justify-between pt-5 border-t border-stone-100">
                  <div>
                    <span className="text-xl font-bold text-stone-950">
                      {product.price.toFixed(2).replace('.', ',')} €
                    </span>
                    <span className="block text-[11px] text-stone-400">IVA incluido</span>
                  </div>

                  <button
                    type="button"
                    disabled={outOfStock}
                    onClick={() => addToCart(product)}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors ${
                      outOfStock
                        ? 'cursor-not-allowed bg-stone-100 text-stone-400'
                        : 'bg-stone-900 text-white hover:bg-amber-700'
                    }`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>{outOfStock ? 'Sin stock' : 'Añadir'}</span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Product Detail Modal */}
      {activeProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-sm">
          <div className="relative grid max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl md:grid-cols-2">
            <button
              onClick={() => setActiveProduct(null)}
              aria-label="Cerrar ficha"
              className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-stone-700 hover:bg-stone-100"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="bg-stone-100 p-6 flex items-center justify-center">
              <img
                src={activeProduct.image}
                alt={activeProduct.name}
                className="max-h-96 rounded-xl object-contain shadow-md"
              />
            </div>
            <div className="flex flex-col p-6 md:p-8">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                {activeProduct.category}
              </span>
              <h2 className="mt-2 font-['Instrument_Serif',serif] text-3xl text-stone-950">
                {activeProduct.name}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-stone-600">
                {activeProduct.description || activeProduct.short_description || 'Edición oficial publicada por Enrique del Barrio en Segovia.'}
              </p>
              <div className="mt-auto pt-6 space-y-4">
                <div className="flex items-baseline justify-between border-t border-stone-100 pt-4">
                  <span className="text-2xl font-bold text-stone-950">
                    {activeProduct.price.toFixed(2).replace('.', ',')} €
                  </span>
                  <span className="text-xs text-stone-500">
                    + {effectiveShipping.toFixed(2).replace('.', ',')} € envío Correos
                  </span>
                </div>
                <button
                  disabled={activeProduct.stock_status !== 'instock'}
                  onClick={() => {
                    addToCart(activeProduct);
                    setActiveProduct(null);
                  }}
                  className="w-full rounded-xl bg-stone-900 py-3 text-sm font-semibold text-white hover:bg-amber-700 disabled:bg-stone-200 disabled:text-stone-400 transition-colors"
                >
                  {activeProduct.stock_status === 'instock' ? 'Añadir al carrito' : 'Temporalmente agotado'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slide-over Cart */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-stone-950/50 backdrop-blur-xs">
          <div className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
              <h2 className="flex items-center gap-2 text-lg font-bold text-stone-950">
                <ShoppingBag className="h-5 w-5 text-amber-700" />
                Tu pedido ({totalCount})
              </h2>
              <button
                onClick={() => setCartOpen(false)}
                className="rounded-full p-2 text-stone-500 hover:bg-stone-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {checkoutDone ? (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                  <CheckCircle2 className="h-14 w-14 text-emerald-600" />
                  <h3 className="text-xl font-bold text-stone-950">Pasarela lista para Stripe / Bizum</h3>
                  <p className="text-sm text-stone-600">
                    En producción, este botón redirige directamente al checkout oficial de Stripe (Tarjeta, Apple Pay, Google Pay, Bizum o PayPal) sin errores 500 de WooCommerce.
                  </p>
                  <button
                    onClick={() => {
                      setCart([]);
                      setCheckoutDone(false);
                      setCartOpen(false);
                    }}
                    className="rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white"
                  >
                    Seguir explorando
                  </button>
                </div>
              ) : cart.length === 0 ? (
                <p className="py-12 text-center text-sm text-stone-500">
                  Tu carrito está vacío. Selecciona cualquier libro del catálogo.
                </p>
              ) : (
                <ul className="space-y-4">
                  {cart.map(({ product, qty }) => (
                    <li key={product.id} className="flex gap-4 rounded-xl border border-stone-100 p-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-20 w-16 rounded-lg object-cover bg-stone-100"
                      />
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-stone-900 line-clamp-2">{product.name}</h4>
                        <p className="mt-1 text-sm font-bold text-amber-700">
                          {(product.price * qty).toFixed(2).replace('.', ',')} €
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            onClick={() => updateQty(product.id, -1)}
                            className="rounded border border-stone-200 p-1 hover:bg-stone-100"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-xs font-semibold w-5 text-center">{qty}</span>
                          <button
                            onClick={() => updateQty(product.id, 1)}
                            className="rounded border border-stone-200 p-1 hover:bg-stone-100"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => updateQty(product.id, -qty)}
                            className="ml-auto text-stone-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {cart.length > 0 && !checkoutDone && (
              <div className="border-t border-stone-200 bg-stone-50 p-6 space-y-3">
                <div className="flex justify-between text-sm text-stone-600">
                  <span>Subtotal</span>
                  <span>{subtotal.toFixed(2).replace('.', ',')} €</span>
                </div>
                <div className="flex items-center justify-between text-sm text-stone-600">
                  <span className="inline-flex items-center gap-1.5">
                    <Truck className="h-4 w-4 text-stone-400" />
                    {shippingLabel}
                  </span>
                  <span>{effectiveShipping.toFixed(2).replace('.', ',')} €</span>
                </div>
                <div className="flex justify-between border-t border-stone-200 pt-3 text-base font-bold text-stone-950">
                  <span>Total</span>
                  <span>{total.toFixed(2).replace('.', ',')} €</span>
                </div>

                <button
                  onClick={() => {
                    try {
                      const saved = localStorage.getItem('edb_new_orders');
                      const existing = saved ? JSON.parse(saved) : [];
                      const newOrder = {
                        id: Date.now(),
                        number: `NUEVO-${String(existing.length + 1).padStart(4, '0')}`,
                        origin: 'nueva-web',
                        status: 'processing',
                        date: new Date().toISOString().slice(0, 10),
                        total: Number(total.toFixed(2)),
                        shipping: Number(effectiveShipping.toFixed(2)),
                        paymentMethod: 'Stripe / Bizum (Nueva Web)',
                        customerName: 'Pedido de prueba en tienda',
                        customerCity: 'Segovia',
                        customerEmail: 'cliente@ejemplo.es',
                        items: cart.map((c) => ({
                          name: c.product.name,
                          qty: c.qty,
                          total: (c.product.price * c.qty).toFixed(2),
                        })),
                      };
                      localStorage.setItem('edb_new_orders', JSON.stringify([newOrder, ...existing]));
                    } catch {}
                    setCheckoutDone(true);
                  }}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 py-3.5 text-sm font-semibold text-white hover:bg-amber-700 transition-colors"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Pagar ahora (Tarjeta / Bizum / PayPal)</span>
                </button>
                <a
                  href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
                    `Hola Enrique, quiero pedir desde la web: ${cart
                      .map((c) => `${c.qty}x ${c.product.name}`)
                      .join(', ')} (Total con envío: ${total.toFixed(2)} €).`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full rounded-xl border border-stone-300 bg-white py-2.5 text-center text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
                >
                  O tramitar pedido directo por WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
