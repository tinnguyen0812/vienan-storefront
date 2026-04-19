import { CreateOrderDto, Order } from '../data-models';
import { apiClient } from './client';

export async function createOrder(dto: CreateOrderDto): Promise<Order> {
  const res = await apiClient.post('/orders', dto);
  const root = res?.data ?? res;
  return (root?.order ?? root) as Order;
}

export async function lookupOrders(phone: string): Promise<Order[]> {
  const res = await apiClient.get('/orders/lookup', { params: { phone } });
  const root = res?.data ?? res;

  if (Array.isArray(root)) return root;
  if (Array.isArray(root?.items)) return root.items;
  if (Array.isArray(root?.orders)) return root.orders;
  if (Array.isArray(root?.data)) return root.data;

  return [];
}
