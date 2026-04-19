import { useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { lookupOrders } from '../../api/orders';
import { Order } from '../../data-models';

interface OrdersPageProps {
  onBack: () => void;
}

interface LocationState {
  successOrder?: Order;
  phone?: string;
}

export function OrdersPage({ onBack }: OrdersPageProps) {
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState;

  const [phone, setPhone] = useState(state.phone ?? '');
  const [orders, setOrders] = useState<Order[]>(state.successOrder ? [state.successOrder] : []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasSuccessOrder = Boolean(state.successOrder);

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      const aDate = new Date(a.createdAt).getTime();
      const bDate = new Date(b.createdAt).getTime();
      return bDate - aDate;
    });
  }, [orders]);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phone.trim()) {
      setError('Vui lòng nhập số điện thoại để tra cứu đơn hàng.');
      return;
    }

    try {
      setLoading(true);
      const data = await lookupOrders(phone.trim());
      setOrders(data);
    } catch {
      setError('Không thể tra cứu đơn hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={onBack}
            aria-label="Quay lại"
            className="flex items-center gap-2 text-gray-700 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            <span>Quay lại</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-gray-900 mb-6">Đơn hàng của tôi</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Nhập số điện thoại đặt hàng"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-black"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Đang tra cứu...' : 'Tra cứu'}
            </button>
          </form>
          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
          {hasSuccessOrder && <p className="text-green-600 text-sm mt-3">Đặt đơn thành công. Bạn có thể tra cứu lại theo số điện thoại.</p>}
        </div>

        {sortedOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 mb-4">Bạn chưa có đơn hàng nào hoặc chưa tra cứu.</p>
            <button
              onClick={onBack}
              className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4 pb-4 border-b">
                  <div>
                    <div className="text-gray-900 mb-1">Đơn hàng #{order.id}</div>
                    <div className="text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-600 mb-1">Tổng tiền</div>
                    <div className="text-red-600">₫{order.totalPrice.toLocaleString('vi-VN')}</div>
                  </div>
                </div>

                {order.items?.[0] && (
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-20 h-20 flex-shrink-0">
                      <img
                        src={order.items[0].productImage}
                        alt={order.items[0].productName}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-gray-900 mb-1 line-clamp-2">{order.items[0].productName}</h3>
                      <div className="text-gray-600">
                        {order.items.length > 1 ? (
                          <span>
                            Số lượng: {order.items[0].quantity} (và {order.items.length - 1} sản phẩm khác)
                          </span>
                        ) : (
                          <span>Số lượng: {order.items[0].quantity}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="space-y-2 text-gray-700">
                    <div className="flex justify-between">
                      <span>Tiền hàng:</span>
                      <span>₫{order.subtotal.toLocaleString('vi-VN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phí vận chuyển:</span>
                      <span>₫{order.shippingFee.toLocaleString('vi-VN')}</span>
                    </div>
                    <div className="flex justify-between text-gray-900 pt-2 border-t">
                      <span>Tổng cộng:</span>
                      <span className="text-red-600">₫{order.totalPrice.toLocaleString('vi-VN')}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Thanh toán:</span>
                      <span>{order.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Trạng thái:</span>
                      <span className="uppercase">{order.status}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="text-gray-900 mb-2">Thông tin nhận hàng</div>
                  <div className="text-gray-700 space-y-1">
                    <div>
                      {order.customerInfo.name} - {order.customerInfo.phone}
                    </div>
                    <div>{order.customerInfo.fullAddress}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
