// Centralized API Client for VibeCart

const API_BASE =
  typeof window !== 'undefined'
    ? '/api'
    : process.env.API_INTERNAL_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://127.0.0.1:5000/api';

const getAuthHeaders = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('vibecart_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = async (res: Response) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
};

// 1. Auth API
export const authApi = {
  register: async (payload: any) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },
  login: async (payload: any) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },
  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeaders() },
    });
    return handleResponse(res);
  },
  updateProfile: async (payload: any) => {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },
  addAddress: async (payload: any) => {
    const res = await fetch(`${API_BASE}/auth/addresses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },
  deleteAddress: async (addressId: string) => {
    const res = await fetch(`${API_BASE}/auth/addresses/${addressId}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() },
    });
    return handleResponse(res);
  },
  forgotPassword: async (email: string) => {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return handleResponse(res);
  },
  resetPassword: async (token: string, newPassword: string) => {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });
    return handleResponse(res);
  },
};

// 2. Product API
export const productApi = {
  getProducts: async (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    const res = await fetch(`${API_BASE}/products?${query.toString()}`);
    return handleResponse(res);
  },
  getTrending: async () => {
    const res = await fetch(`${API_BASE}/products/trending`);
    return handleResponse(res);
  },
  getDeals: async () => {
    const res = await fetch(`${API_BASE}/products/deals`);
    return handleResponse(res);
  },
  getBySlugOrId: async (slugOrId: string) => {
    const res = await fetch(`${API_BASE}/products/${slugOrId}`);
    return handleResponse(res);
  },
  createProduct: async (payload: any) => {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },
  updateProduct: async (id: string, payload: any) => {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },
  deleteProduct: async (id: string) => {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() },
    });
    return handleResponse(res);
  },
};

// 3. Category & Brand API
export const categoryApi = {
  getCategories: async () => {
    const res = await fetch(`${API_BASE}/categories`);
    return handleResponse(res);
  },
  getBySlug: async (slug: string) => {
    const res = await fetch(`${API_BASE}/categories/${slug}`);
    return handleResponse(res);
  },
  createCategory: async (payload: any) => {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },
  deleteCategory: async (id: string) => {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() },
    });
    return handleResponse(res);
  },
};

export const brandApi = {
  getBrands: async () => {
    const res = await fetch(`${API_BASE}/brands`);
    return handleResponse(res);
  },
};

// 4. Cart API
export const cartApi = {
  getCart: async () => {
    const res = await fetch(`${API_BASE}/cart`, {
      headers: { ...getAuthHeaders() },
    });
    return handleResponse(res);
  },
  addToCart: async (productId: string, variantId?: string, quantity: number = 1) => {
    const res = await fetch(`${API_BASE}/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ productId, variantId, quantity }),
    });
    return handleResponse(res);
  },
  updateItem: async (itemId: string, quantity: number) => {
    const res = await fetch(`${API_BASE}/cart/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ quantity }),
    });
    return handleResponse(res);
  },
  removeItem: async (itemId: string) => {
    const res = await fetch(`${API_BASE}/cart/${itemId}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() },
    });
    return handleResponse(res);
  },
  applyCoupon: async (code: string) => {
    const res = await fetch(`${API_BASE}/cart/apply-coupon`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ code }),
    });
    return handleResponse(res);
  },
  removeCoupon: async () => {
    const res = await fetch(`${API_BASE}/cart/remove-coupon`, {
      method: 'POST',
      headers: { ...getAuthHeaders() },
    });
    return handleResponse(res);
  },
  clearCart: async () => {
    const res = await fetch(`${API_BASE}/cart`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() },
    });
    return handleResponse(res);
  },
};

// 5. Wishlist API
export const wishlistApi = {
  getWishlist: async () => {
    const res = await fetch(`${API_BASE}/wishlist`, {
      headers: { ...getAuthHeaders() },
    });
    return handleResponse(res);
  },
  add: async (productId: string) => {
    const res = await fetch(`${API_BASE}/wishlist/${productId}`, {
      method: 'POST',
      headers: { ...getAuthHeaders() },
    });
    return handleResponse(res);
  },
  remove: async (productId: string) => {
    const res = await fetch(`${API_BASE}/wishlist/${productId}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() },
    });
    return handleResponse(res);
  },
  moveToCart: async (productId: string) => {
    const res = await fetch(`${API_BASE}/wishlist/${productId}/move-to-cart`, {
      method: 'POST',
      headers: { ...getAuthHeaders() },
    });
    return handleResponse(res);
  },
};

// 6. Orders API
export const orderApi = {
  createOrder: async (payload: any) => {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },
  getCustomerOrders: async () => {
    const res = await fetch(`${API_BASE}/orders`, {
      headers: { ...getAuthHeaders() },
    });
    return handleResponse(res);
  },
  getOrderById: async (id: string) => {
    const res = await fetch(`${API_BASE}/orders/${id}`, {
      headers: { ...getAuthHeaders() },
    });
    return handleResponse(res);
  },
  cancelOrder: async (id: string, reason?: string) => {
    const res = await fetch(`${API_BASE}/orders/${id}/cancel`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ reason }),
    });
    return handleResponse(res);
  },
  getSellerOrders: async () => {
    const res = await fetch(`${API_BASE}/orders/seller/orders`, {
      headers: { ...getAuthHeaders() },
    });
    return handleResponse(res);
  },
  updateOrderStatus: async (id: string, status: string, note?: string) => {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ status, note }),
    });
    return handleResponse(res);
  },
  getAllOrdersAdmin: async (
    params?: string | { status?: string; search?: string; page?: number; limit?: number }
  ) => {
    const query = new URLSearchParams();
    if (typeof params === 'string') {
      if (params) query.append('status', params);
    } else if (params) {
      if (params.status && params.status !== 'ALL') query.append('status', params.status);
      if (params.search && params.search.trim()) query.append('search', params.search.trim());
      if (params.page) query.append('page', String(params.page));
      if (params.limit) query.append('limit', String(params.limit));
    }
    const qs = query.toString();
    const res = await fetch(`${API_BASE}/orders/admin/all${qs ? `?${qs}` : ''}`, {
      headers: { ...getAuthHeaders() },
    });
    return handleResponse(res);
  },
};

// 7. Seller API
export const sellerApi = {
  register: async (payload: any) => {
    const res = await fetch(`${API_BASE}/sellers/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },
  getMyProfile: async () => {
    const res = await fetch(`${API_BASE}/sellers/me`, {
      headers: { ...getAuthHeaders() },
    });
    return handleResponse(res);
  },
  updateMyProfile: async (payload: any) => {
    const res = await fetch(`${API_BASE}/sellers/me`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },
  getDashboardStats: async () => {
    const res = await fetch(`${API_BASE}/sellers/dashboard`, {
      headers: { ...getAuthHeaders() },
    });
    return handleResponse(res);
  },
  getPublicStore: async (idOrSlug: string) => {
    const res = await fetch(`${API_BASE}/sellers/public/${idOrSlug}`);
    return handleResponse(res);
  },
  verifySeller: async (id: string, status: string) => {
    const res = await fetch(`${API_BASE}/sellers/${id}/verify`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },
  getAllSellersAdmin: async (status?: string) => {
    const query = status ? `?status=${status}` : '';
    const res = await fetch(`${API_BASE}/sellers/admin/all${query}`, {
      headers: { ...getAuthHeaders() },
    });
    return handleResponse(res);
  },
};

// 8. Reviews API
export const reviewApi = {
  getProductReviews: async (productId: string) => {
    const res = await fetch(`${API_BASE}/reviews/product/${productId}`);
    return handleResponse(res);
  },
  addReview: async (productId: string, payload: any) => {
    const res = await fetch(`${API_BASE}/reviews/product/${productId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },
};

// 9. Vibe Reels API
export const reelApi = {
  getReels: async () => {
    const res = await fetch(`${API_BASE}/reels`);
    return handleResponse(res);
  },
  likeReel: async (id: string) => {
    const res = await fetch(`${API_BASE}/reels/${id}/like`, { method: 'POST' });
    return handleResponse(res);
  },
  viewReel: async (id: string) => {
    const res = await fetch(`${API_BASE}/reels/${id}/view`, { method: 'POST' });
    return handleResponse(res);
  },
  createReel: async (payload: any) => {
    const res = await fetch(`${API_BASE}/reels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },
  deleteReel: async (id: string) => {
    const res = await fetch(`${API_BASE}/reels/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() },
    });
    return handleResponse(res);
  },
};

// 10. Banners & Coupons
export const bannerApi = {
  getBanners: async (position?: string) => {
    const query = position ? `?position=${position}` : '';
    const res = await fetch(`${API_BASE}/banners${query}`);
    return handleResponse(res);
  },
  createBanner: async (payload: any) => {
    const res = await fetch(`${API_BASE}/banners`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },
  deleteBanner: async (id: string) => {
    const res = await fetch(`${API_BASE}/banners/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() },
    });
    return handleResponse(res);
  },
};

export const couponApi = {
  getActiveCoupons: async () => {
    const res = await fetch(`${API_BASE}/coupons`);
    return handleResponse(res);
  },
  getAllAdmin: async () => {
    const res = await fetch(`${API_BASE}/coupons/admin/all`, {
      headers: { ...getAuthHeaders() },
    });
    return handleResponse(res);
  },
  createCoupon: async (payload: any) => {
    const res = await fetch(`${API_BASE}/coupons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },
  deleteCoupon: async (id: string) => {
    const res = await fetch(`${API_BASE}/coupons/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() },
    });
    return handleResponse(res);
  },
};

// 11. Admin API
export const adminApi = {
  getAnalytics: async () => {
    const res = await fetch(`${API_BASE}/admin/analytics`, {
      headers: { ...getAuthHeaders() },
    });
    return handleResponse(res);
  },
  getProducts: async (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    const res = await fetch(`${API_BASE}/admin/products?${query.toString()}`, {
      headers: { ...getAuthHeaders() },
    });
    return handleResponse(res);
  },
  getUsers: async (role?: string, search?: string, page?: number, limit?: number) => {
    const query = new URLSearchParams();
    if (role && role !== 'ALL') query.append('role', role);
    if (search) query.append('search', search);
    if (page) query.append('page', String(page));
    if (limit) query.append('limit', String(limit));
    const res = await fetch(`${API_BASE}/admin/users?${query.toString()}`, {
      headers: { ...getAuthHeaders() },
    });
    return handleResponse(res);
  },
  updateUserRole: async (userId: string, role: string) => {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ role }),
    });
    return handleResponse(res);
  },
  getAuditLogs: async (page?: number, limit?: number) => {
    const query = new URLSearchParams();
    if (page) query.append('page', String(page));
    if (limit) query.append('limit', String(limit));
    const qs = query.toString();
    const res = await fetch(`${API_BASE}/admin/logs${qs ? `?${qs}` : ''}`, {
      headers: { ...getAuthHeaders() },
    });
    return handleResponse(res);
  },
  moderateProduct: async (id: string, payload: any) => {
    const res = await fetch(`${API_BASE}/admin/products/${id}/moderate`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },
};

// 12. Media Upload
export const mediaApi = {
  uploadFile: async (file: File, folder: string = 'products') => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/media/upload?folder=${folder}`, {
      method: 'POST',
      headers: { ...getAuthHeaders() },
      body: formData,
    });
    return handleResponse(res);
  },
};
