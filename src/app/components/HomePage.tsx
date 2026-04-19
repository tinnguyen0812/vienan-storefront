import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, ShoppingBag, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion, LayoutGroup } from 'framer-motion';
import { ProductCard } from './ProductCard';
import { Category, Product } from '../../data-models';
import { getProducts } from '../../api/products';
import { getCategories } from '../../api/categories';

const LOGO_URL = new URL('../../assets/d3d626f104cd9cb380fbc352e3de2b37088ab3ef.png', import.meta.url).href;

interface HomePageProps {
  onProductClick: (product: Product) => void;
  onGoToCart: () => void;
  cartItemCount: number;
}

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
};

const fadeVariant = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.3 } },
};

export function HomePage({ onProductClick, onGoToCart, cartItemCount }: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const prefersReduced = useReducedMotion();
  const productsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let mounted = true;

    Promise.all([getProducts({ limit: 50 }), getCategories()])
      .then(([prodRes, catRes]) => {
        if (!mounted) return;
        setProducts(prodRes.items ?? []);
        setCategories(catRes ?? []);
      })
      .catch(() => {
        if (!mounted) return;
        setError('Không tải được dữ liệu sản phẩm. Vui lòng thử lại.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const categoriesForUi = useMemo(() => {
    return ['Tất cả', ...categories.map((c) => c.name)];
  }, [categories]);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categories]);

  const normalizedProducts = useMemo(() => {
    return products.map((product) => ({
      ...product,
      image: product.image ?? product.images?.[0] ?? '',
      category: product.category ?? categoryMap.get(product.categoryId) ?? 'Sản phẩm',
    }));
  }, [products, categoryMap]);

  const filteredProducts = useMemo(() => {
    return normalizedProducts.filter((product) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query || product.name.toLowerCase().includes(query);
      const matchesCategory = selectedCategory === 'Tất cả' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [normalizedProducts, searchQuery, selectedCategory]);

  const scrollToProducts = () =>
    productsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const activeVariants = prefersReduced
    ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
    : undefined;

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
          <img src={LOGO_URL} alt="Viénan" className="h-8 w-auto object-contain flex-shrink-0" />

          <div className="flex-1 max-w-lg">
            {searchOpen ? (
              <label className="flex items-center gap-2 border-b border-neutral-900 pb-1">
                <Search className="w-4 h-4 text-neutral-400 flex-shrink-0" aria-hidden="true" />
                <input
                  id="product-search"
                  type="search"
                  name="q"
                  autoComplete="off"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={() => {
                    if (!searchQuery) setSearchOpen(false);
                  }}
                  placeholder="Tìm kiếm…"
                  className="w-full text-sm bg-transparent outline-none placeholder:text-neutral-400"
                  aria-label="Tìm kiếm sản phẩm"
                />
              </label>
            ) : (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Mở tìm kiếm"
                className="flex items-center gap-2 text-neutral-400 hover:text-neutral-900 transition-colors text-sm"
              >
                <Search className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline tracking-wide">Tìm kiếm</span>
              </button>
            )}
          </div>

          <button
            onClick={onGoToCart}
            aria-label={`Giỏ hàng${cartItemCount > 0 ? ` (${cartItemCount} sản phẩm)` : ''}`}
            className="relative p-2 hover:bg-neutral-100 rounded-full transition-colors flex-shrink-0"
          >
            <ShoppingBag className="w-5 h-5 text-neutral-700" aria-hidden="true" />
            {cartItemCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 bg-neutral-900 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full"
                aria-hidden="true"
              >
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <section className="relative bg-neutral-950 text-white overflow-hidden" style={{ minHeight: '88vh' }} aria-label="Hero">
        <img
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col justify-end" style={{ minHeight: '88vh', paddingBottom: '5rem' }}>
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[11px] tracking-[0.35em] uppercase text-neutral-400 mb-5 block"
          >
            SS '26 Collection — Việt Nam
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-[clamp(3.5rem,10vw,9rem)] font-black uppercase leading-[0.9] tracking-tighter text-white mb-8"
          >
            Define
            <br />
            Your
            <br />
            Form.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="text-neutral-400 text-sm leading-relaxed max-w-sm mb-10 tracking-wide"
          >
            Streetwear crafted in Việt Nam.
            <br />
            Designed for those who move different.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex items-center gap-4"
          >
            <button
              onClick={scrollToProducts}
              className="flex items-center gap-3 px-8 py-3.5 bg-white text-neutral-900 text-[11px] font-bold tracking-[0.25em] uppercase hover:bg-neutral-100 transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
            >
              Shop Now
              <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
            </button>

            <span className="text-neutral-600 text-[11px] tracking-widest uppercase">{products.length} styles</span>
          </motion.div>
        </div>
      </section>

      <nav className="sticky z-40 bg-white border-b border-neutral-200" style={{ top: '64px' }} aria-label="Danh mục sản phẩm">
        <div className="max-w-7xl mx-auto px-4">
          <LayoutGroup>
            <div className="flex overflow-x-auto scrollbar-hide">
              {categoriesForUi.map((category) => {
                const active = selectedCategory === category;
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    aria-pressed={active}
                    className={`relative flex-shrink-0 px-4 py-4 text-[11px] tracking-[0.18em] uppercase whitespace-nowrap transition-colors duration-200 ${
                      active ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-700'
                    }`}
                  >
                    {category}
                    {active && (
                      <motion.div
                        layoutId="cat-underline"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-neutral-900"
                        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </LayoutGroup>
        </div>
      </nav>

      <main id="main" ref={productsRef} className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-baseline justify-between mb-10">
          <h2 className="text-xs tracking-[0.3em] uppercase text-neutral-400">
            {selectedCategory === 'Tất cả' ? 'Tất cả sản phẩm' : selectedCategory}
          </h2>
          <span className="text-xs text-neutral-400">{filteredProducts.length} sản phẩm</span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-neutral-400 text-sm">Đang tải sản phẩm...</div>
        ) : error ? (
          <div className="py-20 text-center text-red-500 text-sm">{error}</div>
        ) : (
          <AnimatePresence mode="wait">
            {filteredProducts.length > 0 ? (
              <motion.div
                key={selectedCategory + searchQuery}
                variants={activeVariants ?? gridVariants}
                initial="hidden"
                animate="show"
                exit="hidden"
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10"
              >
                {filteredProducts.map((product) => (
                  <motion.div key={product.id} variants={activeVariants ?? cardVariants}>
                    <ProductCard product={product} onClick={() => onProductClick(product)} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                variants={activeVariants ?? fadeVariant}
                initial="hidden"
                animate="show"
                className="text-center py-28"
              >
                <p className="text-neutral-400 text-[11px] tracking-[0.3em] uppercase">Không tìm thấy sản phẩm nào</p>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      <footer className="border-t border-neutral-200 py-10">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <img src={LOGO_URL} alt="Viénan" className="h-7 w-auto object-contain opacity-60" />
          <p className="text-[10px] tracking-[0.2em] uppercase text-neutral-400">© 2026 Viénan — Made in Việt Nam</p>
        </div>
      </footer>
    </div>
  );
}
