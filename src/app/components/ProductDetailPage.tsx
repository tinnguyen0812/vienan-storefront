import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ShoppingBag, X, ChevronDown, MessageCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Product, ProductVariant } from '../../data-models';
import { getProductVariants } from '../../api/products';

const SHOPEE_GLOBAL = 'https://shopee.vn/thoitrang_vienan';
const ZALO_LINK = 'https://zalo.me/vienan';
const SIZE_ORDER = ['S', 'M', 'L', 'XL', '2XL', '3XL'];

const SIZE_GUIDE_DATA = [
  { size: 'S', chest: '88-92', shoulder: '42', length: '66' },
  { size: 'M', chest: '92-96', shoulder: '44', length: '68' },
  { size: 'L', chest: '96-100', shoulder: '46', length: '70' },
  { size: 'XL', chest: '100-104', shoulder: '48', length: '72' },
];

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-neutral-200">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
      >
        <span className="text-[11px] tracking-[0.22em] uppercase font-semibold text-neutral-900">{title}</span>
        <ChevronDown
          className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pb-6 text-sm text-neutral-600 leading-relaxed">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SizeGuideModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="size-guide-title"
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative bg-white w-full max-w-md max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-8 pt-8 pb-5 border-b border-neutral-100">
          <h2 id="size-guide-title" className="text-[11px] tracking-[0.35em] uppercase font-bold text-neutral-900">
            Bảng size
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng bảng size"
            className="p-1.5 hover:bg-neutral-100 transition-colors focus-visible:ring-2 focus-visible:ring-neutral-900"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="px-8 py-6">
          <table className="w-full text-sm">
            <thead>
              <tr>
                {['Size', 'Ngực (cm)', 'Vai (cm)', 'Dài (cm)'].map((h) => (
                  <th key={h} className="text-left pb-3 text-[10px] tracking-[0.15em] uppercase text-neutral-400 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SIZE_GUIDE_DATA.map((row) => (
                <tr key={row.size} className="border-t border-neutral-100">
                  <td className="py-3 font-bold tracking-wider text-neutral-900">{row.size}</td>
                  <td className="py-3 text-neutral-600">{row.chest}</td>
                  <td className="py-3 text-neutral-600">{row.shoulder}</td>
                  <td className="py-3 text-neutral-600">{row.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-5 text-[11px] text-neutral-400 leading-relaxed">
            Số đo trên là kích thước của áo. Nếu bạn không chắc, liên hệ Zalo để được tư vấn.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

interface ProductDetailPageProps {
  product: Product;
  allProducts: Product[];
  onBack: () => void;
  onProductClick: (product: Product) => void;
  onAddToCart: (
    item: {
      variantId: string;
      productId: string;
      productName: string;
      productImage: string;
      size: string;
      color: string;
      colorCode?: string;
      sku: string;
      unitPrice: number;
    },
    quantity?: number
  ) => void;
  onGoToCart: () => void;
  cartItemCount: number;
}

export function ProductDetailPage({
  product,
  allProducts,
  onBack,
  onProductClick,
  onAddToCart,
  onGoToCart,
  cartItemCount,
}: ProductDetailPageProps) {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    getProductVariants(product.id)
      .then((data) => {
        if (!mounted) return;
        setVariants(data);
      })
      .catch(() => {
        if (!mounted) return;
        setVariants([]);
      });

    return () => {
      mounted = false;
    };
  }, [product.id]);

  const relatedProducts = allProducts.filter((p) => p.id !== product.id).slice(0, 4);
  const shopeeUrl = product.shopeeUrl ?? product.shopee_link ?? SHOPEE_GLOBAL;

  const colorOptions = useMemo(() => {
    const byColor = new Map<string, { color: string; colorCode?: string; imageUrl?: string; inStock: boolean }>();
    variants.forEach((variant) => {
      const existing = byColor.get(variant.color);
      const inStock = variant.stock > 0;
      if (!existing) {
        byColor.set(variant.color, {
          color: variant.color,
          colorCode: variant.colorCode,
          imageUrl: variant.imageUrl ?? undefined,
          inStock,
        });
      } else {
        byColor.set(variant.color, {
          ...existing,
          // Ưu tiên lấy imageUrl nếu chưa có
          imageUrl: existing.imageUrl ?? variant.imageUrl ?? undefined,
          inStock: existing.inStock || inStock,
        });
      }
    });
    return Array.from(byColor.values());
  }, [variants]);

  /** Ảnh hiển thị: ảnh variant của màu đang chọn (nếu có) + gallery gốc */
  const displayImages = useMemo(() => {
    if (!selectedColor) return product.images;
    const colorDef = colorOptions.find((c) => c.color === selectedColor);
    const variantImg = colorDef?.imageUrl;
    if (!variantImg) return product.images;
    // Đặt ảnh variant lên đầu, bỏ duplicate nếu trùng với product.images[0]
    const rest = product.images.filter((src) => src !== variantImg);
    return [variantImg, ...rest];
  }, [selectedColor, colorOptions, product.images]);

  const sizesForSelectedColor = useMemo(() => {
    if (!selectedColor) return new Set<string>();
    return new Set(
      variants
        .filter((variant) => variant.color === selectedColor && variant.stock > 0)
        .map((variant) => variant.size)
    );
  }, [selectedColor, variants]);

  const selectedVariant = useMemo(() => {
    if (!selectedColor || !selectedSize) return null;
    return (
      variants.find((variant) => variant.color === selectedColor && variant.size === selectedSize) ?? null
    );
  }, [selectedColor, selectedSize, variants]);

  const displayPrice = selectedVariant?.price ?? product.price;

  const handleColorSelect = (color: string, inStock: boolean) => {
    if (!inStock) return;
    setSelectedColor(color);
    if (selectedSize && !variants.some((v) => v.color === color && v.size === selectedSize && v.stock > 0)) {
      setSelectedSize(null);
    }
  };

  const handleAddToCart = () => {
    if (!selectedVariant || selectedVariant.stock <= 0) return;

    onAddToCart(
      {
        variantId: selectedVariant.id,
        productId: product.id,
        productName: product.name,
        productImage: selectedVariant.imageUrl ?? product.image ?? product.images?.[0] ?? '',
        size: selectedVariant.size,
        color: selectedVariant.color,
        colorCode: selectedVariant.colorCode,
        sku: selectedVariant.sku,
        unitPrice: selectedVariant.price ?? product.price,
      },
      quantity
    );
  };

  const maxQuantity = selectedVariant?.stock ?? 1;

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={onBack}
            aria-label="Quay lại"
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors text-sm tracking-wide"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Quay lại</span>
          </button>

          <button
            onClick={onGoToCart}
            aria-label={`Giỏ hàng${cartItemCount > 0 ? ` (${cartItemCount} sản phẩm)` : ''}`}
            className="relative p-2 hover:bg-neutral-100 rounded-full transition-colors"
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

      <div className="max-w-7xl mx-auto lg:grid lg:grid-cols-[3fr_2fr]">
        <div className="bg-neutral-100 space-y-px">
          {displayImages.map((src, i) => (
            <div key={`${src}-${i}`} style={{ aspectRatio: '3 / 4' }}>
              <img
                src={src}
                alt={i === 0 ? product.name : `${product.name} goc ${i + 1}`}
                className="w-full h-full object-cover"
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            </div>
          ))}
        </div>

        <div className="lg:sticky lg:top-16 lg:self-start lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto">
          <div className="px-8 py-10 space-y-8">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-neutral-400 mb-3">
                {typeof product.category === 'object' && product.category !== null
                  ? (product.category as { name: string }).name
                  : (product.category as string) ?? 'Sản phẩm'}
              </p>
              <h1 className="text-2xl font-black uppercase tracking-tighter text-neutral-900 leading-tight mb-4">
                {product.name}
              </h1>
              <p className="text-xl font-bold text-neutral-900">₫{displayPrice.toLocaleString('vi-VN')}</p>
            </div>

            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-neutral-500 mb-3">
                Mau sac{selectedColor ? ` - ${selectedColor}` : ''}
              </p>
              <div className="flex gap-2 flex-wrap">
                {colorOptions.map((c) => (
                  <button
                    key={c.color}
                    type="button"
                    onClick={() => handleColorSelect(c.color, c.inStock)}
                    aria-label={`Mau ${c.color}`}
                    aria-pressed={selectedColor === c.color}
                    title={c.color}
                    disabled={!c.inStock}
                    className={`w-8 h-8 rounded-full border-2 relative transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 ${
                      selectedColor === c.color ? 'border-neutral-900 scale-110' : 'border-neutral-200'
                    } ${!c.inStock ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                    style={{ backgroundColor: c.colorCode || '#d4d4d4' }}
                  >
                    {!c.inStock && <span className="absolute inset-0 flex items-center justify-center text-red-500">x</span>}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] tracking-[0.2em] uppercase text-neutral-500">
                  Kich thuoc{selectedSize ? ` - ${selectedSize}` : ''}
                </p>
                <button
                  type="button"
                  onClick={() => setSizeGuideOpen(true)}
                  className="text-[10px] tracking-[0.15em] uppercase text-neutral-500 underline underline-offset-2 hover:text-neutral-900 transition-colors"
                >
                  Bang size
                </button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {SIZE_ORDER.map((size) => {
                  const enabled = selectedColor ? sizesForSelectedColor.has(size) : false;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => enabled && setSelectedSize(size)}
                      disabled={!enabled}
                      aria-pressed={selectedSize === size}
                      className={`w-12 h-12 border text-sm font-semibold tracking-wider transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 ${
                        selectedSize === size
                          ? 'bg-neutral-900 text-white border-neutral-900'
                          : 'bg-white text-neutral-900 border-neutral-200 hover:border-neutral-900'
                      } ${!enabled ? 'opacity-40 line-through cursor-not-allowed' : ''}`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-neutral-500 mb-3">So luong</p>
              <div className="flex items-center border border-neutral-200 w-fit bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(q - 1, 1))}
                  aria-label="Giam so luong"
                  className="w-11 h-11 flex items-center justify-center hover:bg-neutral-50 transition-colors text-neutral-900 text-lg"
                >
                  -
                </button>
                <span className="w-12 text-center text-sm font-semibold tabular-nums text-neutral-900 select-none">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(q + 1, Math.max(maxQuantity, 1)))}
                  aria-label="Tang so luong"
                  className="w-11 h-11 flex items-center justify-center hover:bg-neutral-50 transition-colors text-neutral-900 text-lg"
                  disabled={!selectedVariant}
                >
                  +
                </button>
              </div>
              {selectedVariant && (
                <p className="text-xs text-neutral-400 mt-2">Ton kho: {selectedVariant.stock}</p>
              )}
            </div>

            <div className="space-y-3 pt-1">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!selectedVariant || selectedVariant.stock <= 0}
                className="w-full bg-neutral-900 text-white py-4 text-[11px] font-bold tracking-[0.28em] uppercase hover:bg-neutral-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {!selectedColor
                  ? 'CHON MAU SAC'
                  : !selectedSize
                    ? 'CHON KICH THUOC'
                    : selectedVariant?.stock === 0
                      ? 'HET HANG'
                      : 'THEM VAO GIO HANG'}
              </button>

              <a
                href={shopeeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full border border-neutral-900 text-neutral-900 py-4 text-[11px] font-bold tracking-[0.28em] uppercase hover:bg-neutral-900 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 flex items-center justify-center"
              >
                MUA QUA SHOPEE
              </a>
            </div>

            <div className="pt-2">
              <Accordion title="Mo ta san pham">
                <p>{product.description}</p>
              </Accordion>

              <Accordion title="Chat lieu & Bao quan">
                <div className="space-y-2">
                  <p>
                    <span className="font-semibold text-neutral-800">Chat lieu: </span>
                    {product.material_info ?? product.material}
                  </p>
                  <p>
                    <span className="font-semibold text-neutral-800">Kieu dang: </span>
                    {product.style ?? 'Unisex'}
                  </p>
                  <p>
                    <span className="font-semibold text-neutral-800">Xuat xu: </span>
                    {product.origin ?? 'Viet Nam'}
                  </p>
                </div>
              </Accordion>
            </div>

            <p className="text-[10px] tracking-[0.18em] uppercase text-neutral-400 pb-6 border-t border-neutral-100 pt-6">
              San xuat tai Viet Nam - Vien An SS '26
            </p>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-16 border-t border-neutral-200">
          <h2 className="text-[11px] tracking-[0.3em] uppercase text-neutral-400 mb-10">San pham lien quan</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {relatedProducts.map((p) => (
              <article
                key={p.id}
                className="group cursor-pointer"
                onClick={() => onProductClick(p)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onProductClick(p);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`Xem ${p.name}`}
              >
                <div className="overflow-hidden bg-neutral-100" style={{ aspectRatio: '3 / 4' }}>
                  <img
                    src={p.image ?? p.images?.[0] ?? ''}
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="pt-3">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-neutral-400 mb-1">
                    {typeof p.category === 'object' && p.category !== null
                      ? (p.category as { name: string }).name
                      : (p.category as string) ?? 'Sản phẩm'}
                  </p>
                  <h3 className="text-sm font-medium text-neutral-900 line-clamp-1">{p.name}</h3>
                  <p className="mt-1.5 text-sm font-bold text-neutral-900">₫{(p.price ?? 0).toLocaleString('vi-VN')}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <a
        href={ZALO_LINK}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Lien he ho tro qua Zalo"
        title="Tu van qua Zalo"
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-[#0068FF] text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0068FF]"
      >
        <MessageCircle className="w-5 h-5" aria-hidden="true" />
      </a>

      <AnimatePresence>{sizeGuideOpen && <SizeGuideModal onClose={() => setSizeGuideOpen(false)} />}</AnimatePresence>
    </div>
  );
}
