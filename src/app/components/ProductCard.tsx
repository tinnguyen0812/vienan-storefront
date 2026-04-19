import { Product } from '../../data-models';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const primaryImage = product.image ?? product.images?.[0] ?? '';
  const secondaryImage = product.images?.[1] ?? primaryImage;

  const handleStoreClick = (e: React.MouseEvent, url?: string) => {
    e.stopPropagation();
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <article
      className="group relative cursor-pointer"
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(); } }}
      tabIndex={0}
      role="button"
      aria-label={`Xem ${product.name}`}
    >
      {/* Image container — 3:4 aspect ratio */}
      <div
        className="relative overflow-hidden bg-neutral-100"
        style={{ aspectRatio: '3 / 4' }}
      >
        {/* Primary image */}
        <img
          src={primaryImage}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out group-hover:opacity-0"
        />
        {/* Secondary image — revealed on hover */}
        <img
          src={secondaryImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100"
        />
        {/* Subtle dark scrim on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

        {/* Shopee CTA — slides up from bottom on hover */}
        <div
          className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"
          aria-hidden="true"
        >
          <button
            type="button"
            onClick={(e) => handleStoreClick(e, product.shopeeUrl ?? product.shopee_link ?? 'https://shopee.vn/thoitrang_vienan')}
            className="w-full py-3 text-[10px] font-bold tracking-[0.25em] uppercase text-white bg-neutral-900 hover:bg-neutral-700 transition-colors"
          >
            MUA QUA SHOPEE
          </button>
        </div>
      </div>

      {/* Text info */}
      <div className="pt-3 pb-1">
        <p className="text-[10px] tracking-[0.2em] uppercase text-neutral-400 mb-1">
          {product.category ?? 'Sản phẩm'}
        </p>
        <h3 className="text-sm font-medium text-neutral-900 line-clamp-1 leading-snug">
          {product.name}
        </h3>
        <p className="mt-1.5 text-sm font-bold text-neutral-900">
          ₫{product.price.toLocaleString('vi-VN')}
        </p>
      </div>
    </article>
  );
}
