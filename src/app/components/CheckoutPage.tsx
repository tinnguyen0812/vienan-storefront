import { useMemo, useState } from 'react';
import { ArrowLeft, X, ChevronDown, MapPin } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { getProvinces, getDistrictsByProvinceCode, getWardsByDistrictCode } from 'sub-vn';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { CreateOrderDto, PaymentMethod } from '../../data-models';
import { createOrder } from '../../api/orders';

export interface ShippingInfo {
  phone: string;
  name: string;
  province: string;
  provinceCode: string;
  district: string;
  districtCode: string;
  ward: string;
  wardCode: string;
  addressDetail: string;
  fullAddress: string;
}

interface FormState {
  phone: string;
  name: string;
  provinceCode: string;
  districtCode: string;
  wardCode: string;
  addressDetail: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const HCM_CODE = '79';
const ALL_PROVINCES = getProvinces();

function buildFullAddress(detail: string, wardName: string, districtName: string, provinceName: string): string {
  return [detail, wardName, districtName, provinceName].filter(Boolean).join(', ');
}

function MinimalSelect({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  required,
  error,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[10px] tracking-[0.22em] uppercase text-neutral-500 mb-2">
        {label}
        {required && <span className="text-neutral-900 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`w-full appearance-none bg-white border px-4 py-3 pr-10 text-sm transition-colors duration-150 focus:outline-none
            ${error ? 'border-red-400' : 'border-neutral-200 focus:border-neutral-900'}
            ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
            ${!value ? 'text-neutral-400' : 'text-neutral-900'}`}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none"
          aria-hidden="true"
        />
      </div>
      {error && <p className="mt-1 text-[10px] text-red-500 tracking-wide">{error}</p>}
    </div>
  );
}

function InputField({
  id,
  label,
  type = 'text',
  autoComplete,
  inputMode,
  value,
  onChange,
  placeholder,
  required,
  error,
}: {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[10px] tracking-[0.22em] uppercase text-neutral-500 mb-2">
        {label}
        {required && <span className="text-neutral-900 ml-0.5">*</span>}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-white border px-4 py-3 text-sm text-neutral-900 transition-colors duration-150 focus:outline-none
          ${error ? 'border-red-400' : 'border-neutral-200 focus:border-neutral-900'}`}
      />
      {error && <p className="mt-1 text-[10px] text-red-500 tracking-wide">{error}</p>}
    </div>
  );
}

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: 'cod', label: 'Thanh toán khi nhận hàng (COD)' },
  { value: 'bank_transfer', label: 'Chuyển khoản ngân hàng' },
  { value: 'shopee_pay', label: 'Thanh toán qua Shopee' },
];

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items: cartItems, clearCart } = useCart();

  const [showModal, setShowModal] = useState(false);
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    phone: '',
    name: '',
    provinceCode: '',
    districtCode: '',
    wardCode: '',
    addressDetail: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const isHCM = form.provinceCode === HCM_CODE;

  const selectedProvince = useMemo(
    () => ALL_PROVINCES.find((p) => p.code === form.provinceCode) ?? null,
    [form.provinceCode]
  );
  const districts = useMemo(
    () => (form.provinceCode ? getDistrictsByProvinceCode(form.provinceCode) : []),
    [form.provinceCode]
  );
  const selectedDistrict = useMemo(
    () => districts.find((d) => d.code === form.districtCode) ?? null,
    [districts, form.districtCode]
  );
  const wards = useMemo(
    () => (form.districtCode ? getWardsByDistrictCode(form.districtCode) : []),
    [form.districtCode]
  );
  const selectedWard = useMemo(
    () => wards.find((w) => w.code === form.wardCode) ?? null,
    [wards, form.wardCode]
  );

  const provinceOptions = useMemo(() => ALL_PROVINCES.map((p) => ({ value: p.code, label: p.name })), []);
  const districtOptions = useMemo(() => districts.map((d) => ({ value: d.code, label: d.name })), [districts]);
  const wardOptions = useMemo(() => wards.map((w) => ({ value: w.code, label: w.name })), [wards]);

  const subtotal = cartItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const shippingFee = shippingInfo ? (shippingInfo.provinceCode === HCM_CODE ? 30000 : 50000) : 0;
  const total = subtotal + shippingFee;

  const patch = (p: Partial<FormState>) => setForm((f) => ({ ...f, ...p }));

  const handleProvinceChange = (code: string) => {
    patch({ provinceCode: code, districtCode: '', wardCode: '' });
    setErrors((e) => ({ ...e, provinceCode: undefined }));
  };

  const handleDistrictChange = (code: string) => {
    patch({ districtCode: code, wardCode: '' });
    setErrors((e) => ({ ...e, districtCode: undefined }));
  };

  const handleWardChange = (code: string) => {
    patch({ wardCode: code });
    setErrors((e) => ({ ...e, wardCode: undefined }));
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.phone.trim()) next.phone = 'Vui lòng nhập số điện thoại';
    else if (!/^(0|\+84)[0-9]{8,10}$/.test(form.phone.trim())) next.phone = 'Số điện thoại không hợp lệ';

    if (!form.name.trim()) next.name = 'Vui lòng nhập tên người nhận';
    if (!form.provinceCode) next.provinceCode = 'Vui lòng chọn Tỉnh/Thành phố';
    if (isHCM && !form.districtCode) next.districtCode = 'Vui lòng chọn Quận/Huyện';
    if (isHCM && !form.wardCode) next.wardCode = 'Vui lòng chọn Phường/Xã';
    if (!form.addressDetail.trim()) next.addressDetail = 'Vui lòng nhập địa chỉ chi tiết';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmitShipping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const info: ShippingInfo = {
      phone: form.phone.trim(),
      name: form.name.trim(),
      province: selectedProvince?.name ?? '',
      provinceCode: form.provinceCode,
      district: selectedDistrict?.name ?? '',
      districtCode: form.districtCode,
      ward: selectedWard?.name ?? '',
      wardCode: form.wardCode,
      addressDetail: form.addressDetail.trim(),
      fullAddress: buildFullAddress(
        form.addressDetail.trim(),
        selectedWard?.name ?? '',
        selectedDistrict?.name ?? '',
        selectedProvince?.name ?? ''
      ),
    };

    setShippingInfo(info);
    setShowModal(false);
  };

  const openModal = () => {
    if (shippingInfo) {
      setForm({
        phone: shippingInfo.phone,
        name: shippingInfo.name,
        provinceCode: shippingInfo.provinceCode,
        districtCode: shippingInfo.districtCode,
        wardCode: shippingInfo.wardCode,
        addressDetail: shippingInfo.addressDetail,
      });
    }
    setErrors({});
    setShowModal(true);
  };

  const handlePlaceOrder = async () => {
    setSubmitError(null);

    if (cartItems.length === 0) {
      setSubmitError('Giỏ hàng đang trống.');
      return;
    }

    if (!shippingInfo) {
      setSubmitError('Vui lòng thêm thông tin vận chuyển.');
      return;
    }

    const payload: CreateOrderDto = {
      items: cartItems.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      })),
      customerInfo: {
        phone: shippingInfo.phone,
        name: shippingInfo.name,
        province: shippingInfo.province,
        provinceCode: shippingInfo.provinceCode,
        district: shippingInfo.district,
        districtCode: shippingInfo.districtCode,
        ward: shippingInfo.ward,
        wardCode: shippingInfo.wardCode,
        addressDetail: shippingInfo.addressDetail,
        fullAddress: shippingInfo.fullAddress,
      },
      paymentMethod,
    };

    try {
      setSubmitting(true);
      const order = await createOrder(payload);
      clearCart();
      navigate('/orders', { state: { successOrder: order, phone: shippingInfo.phone } });
    } catch {
      setSubmitError('Không thể tạo đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#F9F9F9]">
        <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-6 h-16 flex items-center">
            <button
              onClick={() => navigate('/cart')}
              aria-label="Quay lại"
              className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Quay lại</span>
            </button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-10 text-center">
          <h1 className="text-xl font-black uppercase tracking-tighter text-neutral-900 mb-4">Đặt đơn hàng</h1>
          <p className="text-neutral-500 mb-6">Giỏ hàng của bạn đang trống.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-neutral-900 text-white py-3 px-6 text-[11px] font-bold tracking-[0.28em] uppercase"
          >
            Tiếp tục mua sắm
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center">
          <button
            onClick={() => navigate('/cart')}
            aria-label="Quay lại"
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Quay lại</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-xl font-black uppercase tracking-tighter text-neutral-900 mb-8">Đặt đơn hàng</h1>

        <div className="bg-white border border-neutral-200 p-6 mb-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-neutral-400" aria-hidden="true" />
              <h2 className="text-[11px] tracking-[0.28em] uppercase font-semibold text-neutral-900">Thông tin vận chuyển</h2>
            </div>
            <button
              onClick={openModal}
              className="text-[10px] tracking-[0.2em] uppercase font-bold text-neutral-900 underline underline-offset-2 hover:text-neutral-500 transition-colors flex-shrink-0"
            >
              {shippingInfo ? 'Chỉnh sửa' : 'Thêm thông tin'}
            </button>
          </div>
          {shippingInfo ? (
            <div className="space-y-1.5 text-sm text-neutral-700">
              <p>
                <span className="text-neutral-400 text-[10px] tracking-widest uppercase mr-2">Người nhận</span>
                {shippingInfo.name}
              </p>
              <p>
                <span className="text-neutral-400 text-[10px] tracking-widest uppercase mr-2">Điện thoại</span>
                {shippingInfo.phone}
              </p>
              <p className="mt-2 text-neutral-600 leading-relaxed">{shippingInfo.fullAddress}</p>
            </div>
          ) : (
            <p className="text-sm text-neutral-400">Chưa có thông tin vận chuyển.</p>
          )}
        </div>

        <div className="bg-white border border-neutral-200 p-6 mb-5">
          <h2 className="text-[11px] tracking-[0.28em] uppercase font-semibold text-neutral-900 mb-5">Sản phẩm đã chọn</h2>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.variantId}
                className="flex items-center gap-4 pb-4 border-b border-neutral-100 last:border-0 last:pb-0"
              >
                <div className="w-16 h-16 flex-shrink-0 bg-neutral-100 overflow-hidden">
                  <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 line-clamp-2 mb-1">{item.productName}</p>
                  <p className="text-xs text-neutral-400 mb-1">{item.color} / {item.size}</p>
                  <p className="text-xs text-neutral-400">SL: {item.quantity}</p>
                </div>
                <p className="text-sm font-bold text-neutral-900 flex-shrink-0">
                  ₫{(item.unitPrice * item.quantity).toLocaleString('vi-VN')}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-neutral-200 p-6 mb-5">
          <h2 className="text-[11px] tracking-[0.28em] uppercase font-semibold text-neutral-900 mb-5">Phương thức thanh toán</h2>
          <div className="space-y-3">
            {PAYMENT_OPTIONS.map((option) => (
              <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value={option.value}
                  checked={paymentMethod === option.value}
                  onChange={() => setPaymentMethod(option.value)}
                />
                <span className="text-sm text-neutral-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white border border-neutral-200 p-6 mb-8">
          <h2 className="text-[11px] tracking-[0.28em] uppercase font-semibold text-neutral-900 mb-5">Tổng cộng</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-neutral-600">
              <span>Tạm tính ({cartItems.length} sản phẩm)</span>
              <span>₫{subtotal.toLocaleString('vi-VN')}</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Phí vận chuyển</span>
              <span>{shippingInfo ? `₫${shippingFee.toLocaleString('vi-VN')}` : '—'}</span>
            </div>
            <div className="flex justify-between font-bold text-neutral-900 pt-3 border-t border-neutral-100">
              <span>Tổng tiền</span>
              <span>₫{total.toLocaleString('vi-VN')}</span>
            </div>
          </div>
        </div>

        {submitError && <p className="mb-4 text-sm text-red-500">{submitError}</p>}

        <button
          onClick={handlePlaceOrder}
          disabled={!shippingInfo || submitting}
          className="w-full bg-neutral-900 text-white py-4 text-[11px] font-bold tracking-[0.28em] uppercase hover:bg-neutral-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {submitting ? 'Đang xử lý...' : 'Đặt đơn'}
        </button>
      </main>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="shipping-modal-title">
            <motion.div
              key="bd"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
              aria-hidden="true"
            />

            <motion.div
              key="panel"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative bg-white w-full max-w-lg max-h-[93vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-neutral-100 flex items-center justify-between px-8 py-5 z-10">
                <h3 id="shipping-modal-title" className="text-[11px] tracking-[0.35em] uppercase font-bold text-neutral-900">
                  Thông tin vận chuyển
                </h3>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  aria-label="Đóng"
                  className="p-1.5 hover:bg-neutral-100 transition-colors"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              <form onSubmit={handleSubmitShipping} noValidate className="px-8 py-7 space-y-6">
                <InputField
                  id="s-phone"
                  label="Số điện thoại"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  value={form.phone}
                  onChange={(v) => {
                    patch({ phone: v });
                    setErrors((e) => ({ ...e, phone: undefined }));
                  }}
                  placeholder="0912 345 678"
                  required
                  error={errors.phone}
                />

                <InputField
                  id="s-name"
                  label="Tên người nhận"
                  autoComplete="name"
                  value={form.name}
                  onChange={(v) => {
                    patch({ name: v });
                    setErrors((e) => ({ ...e, name: undefined }));
                  }}
                  placeholder="Nhập họ và tên"
                  required
                  error={errors.name}
                />

                <MinimalSelect
                  id="s-province"
                  label="Tỉnh / Thành phố"
                  value={form.provinceCode}
                  onChange={handleProvinceChange}
                  options={provinceOptions}
                  placeholder="Chọn Tỉnh/Thành phố..."
                  required
                  error={errors.provinceCode}
                />

                <AnimatePresence initial={false}>
                  {form.provinceCode && (
                    <motion.div
                      key="dw"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.22, ease: 'easeInOut' }}
                      className="overflow-hidden space-y-6"
                    >
                      <MinimalSelect
                        id="s-district"
                        label={isHCM ? 'Quận / Huyện' : 'Quận / Huyện (tuỳ chọn)'}
                        value={form.districtCode}
                        onChange={handleDistrictChange}
                        options={districtOptions}
                        placeholder="Chọn Quận/Huyện..."
                        required={isHCM}
                        error={errors.districtCode}
                      />

                      <AnimatePresence initial={false}>
                        {form.districtCode && (
                          <motion.div
                            key="ward"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            <MinimalSelect
                              id="s-ward"
                              label={isHCM ? 'Phường / Xã' : 'Phường / Xã (tuỳ chọn)'}
                              value={form.wardCode}
                              onChange={handleWardChange}
                              options={wardOptions}
                              placeholder="Chọn Phường/Xã..."
                              required={isHCM}
                              error={errors.wardCode}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label htmlFor="s-detail" className="block text-[10px] tracking-[0.22em] uppercase text-neutral-500 mb-2">
                    Địa chỉ chi tiết<span className="text-neutral-900 ml-0.5">*</span>
                  </label>
                  <textarea
                    id="s-detail"
                    name="addressDetail"
                    autoComplete="street-address"
                    value={form.addressDetail}
                    rows={3}
                    onChange={(e) => {
                      patch({ addressDetail: e.target.value });
                      setErrors((err) => ({ ...err, addressDetail: undefined }));
                    }}
                    placeholder="Nhập số nhà, tên đường, toà nhà..."
                    className={`w-full bg-white border px-4 py-3 text-sm text-neutral-900 resize-none transition-colors duration-150 focus:outline-none
                      ${errors.addressDetail ? 'border-red-400' : 'border-neutral-200 focus:border-neutral-900'}`}
                  />
                  {errors.addressDetail && <p className="mt-1 text-[10px] text-red-500 tracking-wide">{errors.addressDetail}</p>}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 border border-neutral-200 text-neutral-700 py-3.5 text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-neutral-50 transition-colors"
                  >
                    Huỷ
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-neutral-900 text-white py-3.5 text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-neutral-700 transition-colors"
                  >
                    Xác nhận
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
