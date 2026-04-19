import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { HomePage } from './components/HomePage';
import { ProductDetailPage } from './components/ProductDetailPage';
import { CartPage } from './components/CartPage';
import { CheckoutPage } from './components/CheckoutPage';
import { OrdersPage } from './components/OrdersPage';
import { Product } from '../data-models';
import { CartProvider, useCart } from '../context/CartContext';
import { getProduct, getProducts } from '../api/products';

function HomePageWrapper() {
  const navigate = useNavigate();
  const { items } = useCart();

  return (
    <HomePage
      onProductClick={(p: Product) => navigate(`/product/${p.id}`)}
      onGoToCart={() => navigate('/cart')}
      cartItemCount={items.length}
    />
  );
}

function ProductDetailWrapper() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { items, addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    if (!id) {
      setLoading(false);
      setError('Không tìm thấy sản phẩm');
      return;
    }

    Promise.all([getProduct(id), getProducts({ limit: 50 })])
      .then(([detail, list]) => {
        if (!mounted) return;
        setProduct(detail);
        setAllProducts(list.items ?? []);
      })
      .catch(() => {
        if (!mounted) return;
        setError('Không tải được chi tiết sản phẩm.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) return <div className="text-center mt-20">Đang tải sản phẩm...</div>;
  if (error || !product) return <div className="text-center mt-20">Product not found</div>;

  return (
    <ProductDetailPage
      product={product}
      allProducts={allProducts}
      onBack={() => navigate('/')}
      onProductClick={(p: Product) => navigate(`/product/${p.id}`)}
      onAddToCart={(item, quantity) => addToCart(item, quantity)}
      onGoToCart={() => navigate('/cart')}
      cartItemCount={items.length}
    />
  );
}

function CartWrapper() {
  const navigate = useNavigate();
  const { items, updateQuantity } = useCart();

  return (
    <CartPage
      cartItems={items}
      onBack={() => navigate('/')}
      onUpdateQuantity={updateQuantity}
      onPlaceOrder={() => navigate('/checkout')}
    />
  );
}

function AppContent() {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route path="/" element={<HomePageWrapper />} />
      <Route path="/product/:id" element={<ProductDetailWrapper />} />
      <Route path="/cart" element={<CartWrapper />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/orders" element={<OrdersPage onBack={() => navigate('/')} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </BrowserRouter>
  );
}
