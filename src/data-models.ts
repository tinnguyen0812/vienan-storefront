/**
 * data-models.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for all shared data structures between the Viên An
 * frontend and the NestJS backend.
 *
 * Naming conventions
 *   • Interfaces use PascalCase.
 *   • Optional fields that exist only on the frontend (UI helpers) are marked
 *     with a comment so the backend can safely ignore them.
 *   • Fields intended for backend persistence are marked // persisted.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. CATEGORY
// ─────────────────────────────────────────────────────────────────────────────

export interface Category {
  /** UUID / numeric string — matches backend primary key. */
  id: string;                     // persisted

  /** Display name, e.g. "Unisex Boxy". */
  name: string;                   // persisted

  /**
   * URL-safe identifier, e.g. "unisex-boxy".
   * Used for filtering routes: /category/:slug
   */
  slug: string;                   // persisted
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. PRODUCT
// ─────────────────────────────────────────────────────────────────────────────

export interface Product {
  /** UUID / numeric string — matches backend primary key. */
  id: string;                     // persisted

  /** Full product name. */
  name: string;                   // persisted

  /** Retail price in VND (integer). */
  price: number;                  // persisted

  /**
   * Ordered list of image URLs.
   * Index 0 = primary image shown in the product card.
   * Index 1 = secondary image shown on hover in the product card.
   * Subsequent images = additional angles / detail shots shown in the
   *   vertically-stacked gallery on the Product Detail page.
   */
  images: string[];               // persisted

  /** Short marketing description shown in the accordion "Mô tả sản phẩm". */
  description: string;            // persisted

  /**
   * Detailed material & care information shown in the accordion
   * "Chất liệu & Bảo quản".
   * Falls back to the legacy `material` field when absent.
   */
  material_info: string;          // persisted

  /**
   * URL to an external or hosted size-guide image / page.
   * Linked from the "Bảng size" button on the Product Detail page.
   * When absent the frontend renders the built-in size-guide table modal.
   */
  size_guide_url?: string;        // persisted (optional)

  /**
   * Direct deep-link to this product's Shopee listing.
   * Falls back to the global store URL https://shopee.vn/thoitrang_vienan.
   */
  shopee_link?: string;           // persisted (optional)

  /**
   * Units available for purchase.
   * 0 = out of stock; the frontend may disable the "THÊM VÀO GIỎ HÀNG" button.
   */
  stock: number;                  // persisted

  /** Foreign key referencing Category.id. */
  categoryId: string;             // persisted

  // ── Legacy / UI-only fields (frontend only) ──────────────────────────────

  /** Convenience single image for list views — equals images[0]. @frontend */
  image?: string;

  /** Brand logo URL overlaid on the card. @frontend */
  brandLogo?: string;

  /** Aggregate star rating (0–5). @frontend (should come from a reviews service) */
  rating?: number;

  /** Resolved category name string — denormalised for card display. @frontend */
  category?: string;

  /** Legacy material label. Use material_info for new code. @deprecated */
  material?: string;

  /** Style descriptor, e.g. "Boxy Form, Streetwear". @frontend */
  style?: string;

  /** Manufacturing origin, e.g. "Việt Nam". @frontend */
  origin?: string;

  /** Shopee listed price if different from retail price. @deprecated */
  shopeePrice?: number;

  /** TikTok Shop listed price. @deprecated */
  tiktokPrice?: number;

  /**
   * Platform badges shown in the card overlay.
   * Kept for legacy compatibility — derive from shopee_link on new code.
   * @deprecated
   */
  stores?: ('Shopee' | 'TikTok Shop')[];

  /** @deprecated — use shopee_link */
  shopeeUrl?: string;

  /** @deprecated */
  tiktokUrl?: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  size: string;
  color: string;
  colorCode?: string;
  sku: string;
  stock: number;
  price?: number;
  imageUrl?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. CART ITEM
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lightweight cart item stored in the backend (e.g. in a session or DB).
 * The frontend CartItem (CartContext) embeds the full Product object for
 * display; this interface carries only the IDs sent to the server.
 */
export interface CartItemPayload {
  /** References ProductVariant.id. */
  variantId: string;              // persisted

  quantity: number;               // persisted
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. CUSTOMER / SHIPPING INFORMATION
//    Mirrors the ShippingInfo interface in CheckoutPage.tsx and the inline
//    type used by OrdersPage.tsx.
// ─────────────────────────────────────────────────────────────────────────────

export interface CustomerInfo {
  /** Recipient phone number. Must match /^(0|\+84)[0-9]{8,10}$/. */
  phone: string;                  // persisted

  /** Full name of the recipient. */
  name: string;                   // persisted

  /**
   * Full display name of the province / city, e.g. "Thành phố Hồ Chí Minh".
   * Sourced from the `sub-vn` library's Province.name field.
   */
  province: string;               // persisted

  /**
   * Province code from the `sub-vn` library (e.g. "79" for HCM).
   * Use this for programmatic comparisons, NOT the display name.
   */
  provinceCode: string;           // persisted

  /**
   * District display name, e.g. "Quận 1".
   * Required when provinceCode === '79' (TP. Hồ Chí Minh).
   */
  district?: string;              // persisted (required for HCM)

  /**
   * District code from `sub-vn`.
   * Required when provinceCode === '79'.
   */
  districtCode?: string;          // persisted (required for HCM)

  /**
   * Ward / commune display name, e.g. "Phường Bến Nghé".
   * Required when provinceCode === '79'.
   */
  ward?: string;                  // persisted (required for HCM)

  /**
   * Ward code from `sub-vn`.
   * Required when provinceCode === '79'.
   */
  wardCode?: string;              // persisted (required for HCM)

  /**
   * Free-text street address: house number, street name, building, etc.
   * Always required regardless of province.
   */
  addressDetail: string;          // persisted

  /**
   * Concatenated full delivery address.
   * Built by: `${addressDetail}, ${ward}, ${district}, ${province}`
   * (empty segments filtered out).
   * Stored as a convenience field for display and shipping labels.
   */
  fullAddress: string;            // persisted
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. ORDER
// ─────────────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending'       // placed, awaiting confirmation
  | 'confirmed'     // confirmed by the store
  | 'shipping'      // handed to courier
  | 'delivered'     // delivered to customer
  | 'cancelled'     // cancelled by customer or store
  | 'refunded';     // refund processed

export type PaymentMethod =
  | 'cod'           // Cash on delivery
  | 'bank_transfer' // Manual bank transfer
  | 'shopee_pay'    // Paid through Shopee
  | 'momo'          // MoMo e-wallet
  | 'zalopay';      // ZaloPay e-wallet

export interface OrderItem {
  /** References Product.id. */
  productId: string;              // persisted

  /** Snapshot of the product name at time of order (denormalised). */
  productName: string;            // persisted

  /** Snapshot of the primary image URL at time of order. */
  productImage: string;           // persisted

  quantity: number;               // persisted

  /** Unit price at time of order (snapshot — price may change later). */
  price: number;                  // persisted

  selectedSize?: string;          // persisted (optional)
  selectedColor?: string;         // persisted (optional)
}

export interface Order {
  /** UUID generated by the backend. */
  id: string;                     // persisted

  /** ISO 8601 timestamp of when the order was placed. */
  createdAt: string;              // persisted

  /** Customer & delivery information. */
  customerInfo: CustomerInfo;     // persisted

  /** Line items as stored at time of order. */
  items: OrderItem[];             // persisted

  /** Sum of (item.price × item.quantity) for all items. */
  subtotal: number;               // persisted

  /**
   * Shipping fee in VND.
   * ₫30,000 for TP. Hồ Chí Minh (provinceCode === '79').
   * ₫50,000 for all other provinces.
   */
  shippingFee: number;            // persisted

  /** subtotal + shippingFee. */
  totalPrice: number;             // persisted

  status: OrderStatus;            // persisted

  paymentMethod: PaymentMethod;   // persisted

  /**
   * Shopee order reference number, if the customer completed purchase
   * through the "MUA QUA SHOPEE" flow.
   */
  shopeeOrderId?: string;         // persisted (optional)

  /** ISO 8601 timestamp of the last status update. */
  updatedAt?: string;             // persisted (optional)
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. CREATE-ORDER REQUEST PAYLOAD
//    Sent from the frontend to POST /orders.
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateOrderDto {
  customerInfo: CustomerInfo;
  items: CartItemPayload[];
  paymentMethod: PaymentMethod;

  /**
   * Optional: pass the Shopee order ID immediately if the customer
   * purchased through Shopee before hitting the internal checkout.
   */
  shopeeOrderId?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. API RESPONSE WRAPPERS (generic helpers for the backend agent)
// ─────────────────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>; // field-level validation errors
}
