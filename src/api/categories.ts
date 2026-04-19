import { Category } from '../data-models';
import { apiClient } from './client';

export async function getCategories(): Promise<Category[]> {
  const res = await apiClient.get('/categories');
  const root = res?.data ?? res;

  if (Array.isArray(root)) return root;
  if (Array.isArray(root?.items)) return root.items;
  if (Array.isArray(root?.data)) return root.data;

  return [];
}
