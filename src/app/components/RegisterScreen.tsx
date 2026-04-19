import { useForm } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

const LOGO_URL = new URL("../../assets/d3d626f104cd9cb380fbc352e3de2b37088ab3ef.png", import.meta.url).href;

interface RegisterFormData {
  username: string;
  fullName: string;
  phone: string;
  email?: string;
  city: string;
  address: string;
  password: string;
}

interface RegisterScreenProps {
  onBack: () => void;
}

export function RegisterScreen({ onBack }: RegisterScreenProps) {
  const [showPassword, setShowPassword] = useState(false);
  const cities = [
    'Hồ Chí Minh',
    'Hà Nội',
    'Đà Nẵng',
    'Cần Thơ',
    'Hải Phòng',
    'Bình Dương',
  ];
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    mode: 'onSubmit',
  });

  const onSubmit = (data: RegisterFormData) => {
    console.log('Đăng ký thành công:', data);
    // Xử lý đăng ký ở đây
    alert('Đăng ký thành công!');
    onBack(); // Quay về màn hình đăng nhập
  };

  const handleCancel = () => {
    onBack(); // Quay về màn hình đăng nhập
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img 
              src={LOGO_URL} 
              alt="Viénan Logo" 
              className="h-20 w-auto object-contain"
            />
          </div>

          <h1 className="text-center mb-6 text-gray-800">Đăng Ký Tài Khoản</h1>

          {/* Form đăng ký */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Tên đăng nhập */}
            <div>
              <label htmlFor="username" className="block mb-1 text-gray-700">
                Tên đăng nhập <span className="text-red-500">*</span>
              </label>
              <p className="text-gray-500 mb-2">
                Tên đăng nhập sẽ được dùng để đăng nhập vào hệ thống
              </p>
              <input
                id="username"
                type="text"
                autoComplete="username"
                spellCheck={false}
                {...register('username', {
                  required: 'Tên đăng nhập là bắt buộc',
                  pattern: {
                    value: /^[a-zA-Z0-9]{5,15}$/,
                    message: 'Tên đăng nhập phải có 5-15 ký tự (chữ cái và số)',
                  },
                })}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition ${
                  errors.username ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Nhập 5-15 ký tự (chữ và số)"
              />
              {errors.username && (
                <p className="text-red-500 mt-1">{errors.username.message}</p>
              )}
            </div>

            {/* Tên */}
            <div>
              <label htmlFor="fullName" className="block mb-1 text-gray-700">
                Tên <span className="text-red-500">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                {...register('fullName', {
                  required: 'Tên là bắt buộc',
                })}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition ${
                  errors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Nhập tên của bạn"
              />
              {errors.fullName && (
                <p className="text-red-500 mt-1">{errors.fullName.message}</p>
              )}
            </div>

            {/* Số điện thoại */}
            <div>
              <label htmlFor="phone" className="block mb-1 text-gray-700">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                {...register('phone', {
                  required: 'Số điện thoại là bắt buộc',
                })}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition ${
                  errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Nhập số điện thoại"
              />
              {errors.phone && (
                <p className="text-red-500 mt-1">{errors.phone.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block mb-1 text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                spellCheck={false}
                {...register('email')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                placeholder="Nhập email (không bắt buộc)"
              />
            </div>

            {/* Thành phố */}
            <div>
              <label htmlFor="city" className="block mb-1 text-gray-700">
                Thành phố <span className="text-red-500">*</span>
              </label>
              <select
                id="city"
                {...register('city', {
                  required: 'Thành phố là bắt buộc',
                })}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition ${
                  errors.city ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="">Chọn thành phố</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              {errors.city && (
                <p className="text-red-500 mt-1">{errors.city.message}</p>
              )}
            </div>

            {/* Địa chỉ */}
            <div>
              <label htmlFor="address" className="block mb-1 text-gray-700">
                Địa chỉ <span className="text-red-500">*</span>
              </label>
              <textarea
                id="address"
                {...register('address', {
                  required: 'Địa chỉ là bắt buộc',
                })}
                rows={3}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition ${
                  errors.address ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Nhập địa chỉ của bạn"
              />
              {errors.address && (
                <p className="text-red-500 mt-1">{errors.address.message}</p>
              )}
            </div>

            {/* Mật khẩu */}
            <div>
              <label htmlFor="password" className="block mb-1 text-gray-700">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <p className="text-gray-500 mb-2">
                Mật khẩu phải bao gồm chữ cái, số, và ít nhất 1 ký tự viết hoa
              </p>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  {...register('password', {
                    required: 'Mật khẩu là bắt buộc',
                    pattern: {
                      value: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/,
                      message: 'Mật khẩu phải có chữ hoa, chữ thường và số',
                    },
                  })}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition ${
                    errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Nhập mật khẩu"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black rounded"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <Eye className="w-5 h-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors duration-200 shadow-lg focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
              >
                Tạo Tài Khoản
              </button>
              
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-white text-black py-3 rounded-lg border-2 border-black hover:bg-gray-50 transition-colors duration-200"
              >
                Hủy Bỏ
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
