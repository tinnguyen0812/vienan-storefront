import { Product, ProductVariant } from '../data-models';
import { apiClient } from './client';

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
}

export interface ProductListResult {
  items: Product[];
  meta?: Record<string, unknown>;
}

export async function getProducts(filters?: ProductFilters): Promise<ProductListResult> {
  const res = await apiClient.get('/products', { params: filters });
  // apiClient interceptor returns res.data (Axios layer)
  // ResponseInterceptor wraps in { success, data } — unwrap below
  const payload = res?.data ?? res;   // { success, data: items[] | { items, meta } }
  const root = payload ?? res;

  // Direct array
  if (Array.isArray(root)) return { items: root };

  // { success, data: [...] }
  if (Array.isArray(root?.data)) return { items: root.data };

  // { success, data: { items, meta } }
  if (Array.isArray(root?.data?.items)) return { items: root.data.items, meta: root.data.meta };

  // Already unwrapped { items, meta }
  if (Array.isArray(root?.items)) return { items: root.items, meta: root.meta };

  return { items: [] };
}

export async function getProduct(id: string | number): Promise<Product | null> {
  const res = await apiClient.get(`/products/${id}`);
  const payload = res?.data ?? res;
  const root = payload ?? res;
  if (!root) return null;
  // { success, data: product }
  if (root?.data && typeof root.data === 'object' && root.data.id) return root.data as Product;
  if (root?.item) return root.item as Product;
  if (root?.id) return root as Product;
  return null;
}

export async function getProductVariants(productId: string | number): Promise<ProductVariant[]> {
  const res = await apiClient.get(`/products/${productId}/variants`);
  const root = res?.data ?? res;

  if (Array.isArray(root)) return root as ProductVariant[];
  if (Array.isArray(root?.items)) return root.items as ProductVariant[];
  if (Array.isArray(root?.data)) return root.data as ProductVariant[];

  return [];
}
