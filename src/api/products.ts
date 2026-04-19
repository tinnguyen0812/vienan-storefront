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
  const root = res?.data ?? res;

  if (Array.isArray(root)) {
    return { items: root };
  }

  if (Array.isArray(root?.items)) {
    return { items: root.items, meta: root.meta };
  }

  if (Array.isArray(root?.data)) {
    return { items: root.data };
  }

  if (Array.isArray(root?.data?.items)) {
    return { items: root.data.items, meta: root.data.meta };
  }

  return { items: [] };
}

export async function getProduct(id: string | number): Promise<Product | null> {
  const res = await apiClient.get(`/products/${id}`);
  const root = res?.data ?? res;

  if (!root) return null;
  if (root?.item) return root.item as Product;
  return root as Product;
}

export async function getProductVariants(productId: string | number): Promise<ProductVariant[]> {
  const res = await apiClient.get(`/products/${productId}/variants`);
  const root = res?.data ?? res;

  if (Array.isArray(root)) return root as ProductVariant[];
  if (Array.isArray(root?.items)) return root.items as ProductVariant[];
  if (Array.isArray(root?.data)) return root.data as ProductVariant[];

  return [];
}
