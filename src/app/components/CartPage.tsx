import { ArrowLeft, Plus, Minus } from 'lucide-react';
import { CartItem } from '../../context/CartContext';

interface CartPageProps {
  cartItems: CartItem[];
  onBack: () => void;
  onUpdateQuantity: (variantId: string, quantity: number) => void;
  onPlaceOrder: () => void;
}

export function CartPage({
  cartItems,
  onBack,
  onUpdateQuantity,
  onPlaceOrder,
}: CartPageProps) {
  const totalPrice = cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

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
        <h1 className="text-gray-900 mb-6">Giỏ hàng của tôi</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 mb-4">Giỏ hàng của bạn đang trống</p>
            <button
              onClick={onBack}
              className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div
                  key={item.variantId}
                  className="bg-white rounded-lg shadow-md p-4 flex items-center gap-4"
                >
                  <div className="w-24 h-24 flex-shrink-0">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-gray-900 mb-2 line-clamp-2">{item.productName}</h3>
                    <p className="text-xs text-gray-500 mb-1">
                      {item.color} / {item.size}
                      {item.colorCode && (
                        <span
                          className="ml-2 inline-block w-3 h-3 rounded-full border border-gray-300 align-middle"
                          style={{ backgroundColor: item.colorCode }}
                        />
                      )}
                    </p>
                    <p className="text-xs text-gray-400 mb-1">SKU: {item.sku}</p>
                    <div className="text-red-600">₫{(item.unitPrice * item.quantity).toLocaleString('vi-VN')}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onUpdateQuantity(item.variantId, item.quantity - 1)}
                      aria-label="Giảm số lượng"
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <span className="w-12 text-center text-gray-900" aria-live="polite">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.variantId, item.quantity + 1)}
                      aria-label="Tăng số lượng"
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                    >
                      <Plus className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 sticky bottom-0">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-gray-600 mb-1">Tổng thanh toán ({cartItems.length} sản phẩm)</div>
                  <div className="text-red-600">₫{totalPrice.toLocaleString('vi-VN')}</div>
                </div>
                <button
                  onClick={onPlaceOrder}
                  disabled={cartItems.length === 0}
                  className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Đặt đơn hàng
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
