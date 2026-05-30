import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';
import type {
  AuditLogsResponse,
  CartEntry,
  CartMutationInput,
  CartUpdateInput,
  CheckoutInput,
  CheckoutResponse,
  DashboardStats,
  LoginInput,
  LoginResponse,
  Product,
  ProductCreateInput,
  ProductUpdateInput,
  ProductsListResponse,
  OrderSummary,
  OrderUpdateInput,
  UserCreateInput,
  UserProfile,
  UsersListResponse,
  UserUpdateInput,
  ApiMessageResponse,
  OrdersListResponse,
} from '../types/api';

const api = axios.create({
  
  baseURL: 'http://localhost:3000',
});

const savedToken = localStorage.getItem('@CodeWear:token');
if (savedToken && api.defaults.headers) {
  api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('@CodeWear:token');
  if (token) {
    config.headers = config.headers ?? new AxiosHeaders();
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

// ==================== PRODUCTS CRUD ====================
export const productsApi = {
  // READ - Listar produtos
  async getAll(params?: { page?: number; limit?: number; search?: string }): Promise<Product[] | ProductsListResponse> {
    const response = await api.get<Product[] | ProductsListResponse>('/products', { params });
    return response.data;
  },

  // CREATE - Criar produto (Admin)
  async create(productData: ProductCreateInput): Promise<{ message: string; product: Product }> {
    const response = await api.post<{ message: string; product: Product }>('/products', productData);
    return response.data;
  },

  // UPDATE - Atualizar produto (Admin)
  async update(id: number, productData: ProductUpdateInput): Promise<{ message: string; product: Product }> {
    const response = await api.put<{ message: string; product: Product }>(`/products/${id}`, productData);
    return response.data;
  },

  // DELETE - Deletar produto (Admin)
  async delete(id: number): Promise<ApiMessageResponse> {
    const response = await api.delete<ApiMessageResponse>(`/products/${id}`);
    return response.data;
  }
};

// ==================== USERS CRUD ====================
export const usersApi = {
  // CREATE - Cadastrar usuário
  async create(userData: UserCreateInput): Promise<{ message: string; id: number }> {
    const response = await api.post<{ message: string; id: number }>('/users', userData);
    return response.data;
  },

  // READ - Buscar perfil do usuário logado
  async getProfile(): Promise<UserProfile> {
    const response = await api.get<UserProfile>('/me');
    return response.data;
  },

  // UPDATE - Atualizar perfil
  async updateProfile(userData: UserUpdateInput): Promise<ApiMessageResponse> {
    const response = await api.put<ApiMessageResponse>('/users/profile', userData);
    return response.data;
  },

  // DELETE - Cancelar a própria conta
  async cancelMyAccount(): Promise<ApiMessageResponse> {
    const response = await api.delete<ApiMessageResponse>('/users/me');
    return response.data;
  },

  // READ - Listar usuários (Admin)
  async getAll(params?: { page?: number; limit?: number; search?: string }): Promise<UsersListResponse> {
    const response = await api.get<UsersListResponse>('/admin/users', { params });
    return response.data;
  }
};

// ==================== CART CRUD ====================
export const cartApi = {
  // READ - Listar itens do carrinho
  async getAll(): Promise<CartEntry[]> {
    const response = await api.get<CartEntry[]>('/cart');
    return response.data;
  },

  // CREATE - Adicionar item ao carrinho
  async addItem(cartData: CartMutationInput): Promise<CartEntry> {
    const response = await api.post<CartEntry>('/cart', cartData);
    return response.data;
  },

  // UPDATE - Atualizar quantidade (usando add com quantidade negativa)
  async updateQuantity(cartData: CartMutationInput): Promise<CartEntry> {
    const response = await api.post<CartEntry>('/cart', cartData);
    return response.data;
  },

  async updateItem(cartId: number, cartData: CartUpdateInput): Promise<CartEntry> {
    const response = await api.put<CartEntry>(`/cart/${cartId}`, cartData);
    return response.data;
  },

  // DELETE - Remover item do carrinho
  async removeItem(cartId: number): Promise<ApiMessageResponse> {
    const response = await api.delete<ApiMessageResponse>(`/cart/${cartId}`);
    return response.data;
  },

  // DELETE - Limpar carrinho completo
  async clear(): Promise<ApiMessageResponse> {
    const cartItems = await this.getAll();
    const deletePromises = cartItems.map((item) =>
      api.delete(`/cart/${item.id}`)
    );
    await Promise.all(deletePromises);
    return { message: 'Carrinho limpo com sucesso' };
  }
};

// ==================== ORDERS CRUD ====================
export const ordersApi = {
  // READ - Listar pedidos do usuário
  async getMyOrders(params?: { page?: number }): Promise<OrdersListResponse> {
    const response = await api.get<OrdersListResponse>('/orders', { params });
    return response.data;
  },

  // CREATE - Finalizar pedido (checkout)
  async create(orderData: CheckoutInput): Promise<CheckoutResponse> {
    const response = await api.post<CheckoutResponse>('/checkout', orderData);
    return response.data;
  },

  // READ - Listar todos os pedidos (Admin)
  async getAll(params?: { page?: number; limit?: number; date?: string; month?: string; year?: string }): Promise<OrdersListResponse> {
    const response = await api.get<OrdersListResponse>('/admin/all-orders', { params });
    return response.data;
  },

  async update(id: number, orderData: OrderUpdateInput): Promise<{ message: string; order: OrderSummary }> {
    const response = await api.put<{ message: string; order: OrderSummary }>(`/orders/${id}`, orderData);
    return response.data;
  },

  async delete(id: number): Promise<ApiMessageResponse> {
    const response = await api.delete<ApiMessageResponse>(`/orders/${id}`);
    return response.data;
  }
};

// ==================== AUDIT LOGS CRUD ====================
export const auditApi = {
  // READ - Listar logs de auditoria (Admin)
  async getLogs(params?: { page?: number; limit?: number; search?: string }): Promise<AuditLogsResponse> {
    const response = await api.get<AuditLogsResponse>('/admin/logs', { params });
    return response.data;
  }
};

export const adminApi = {
  async getDashboard(params?: { month?: string; year?: string }): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>('/admin/dashboard', { params });
    return response.data;
  }
};

// ==================== AUTH CRUD ====================
export const authApi = {
  // CREATE - Login
  async login(credentials: LoginInput): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/login', credentials);
    return response.data;
  },

  // DELETE - Logout (remover token localmente)
  logout() {
    localStorage.removeItem('@CodeWear:token');
    delete api.defaults.headers.common['Authorization'];
    return { message: 'Logout realizado com sucesso' };
  }
};

export default api;