export interface ApiMessageResponse {
    message: string;
}

export interface Product {
    id: number;
    name: string;
    price: number;
    description?: string;
    image_url: string;
    stock: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface ProductCreateInput {
    name: string;
    price: number;
    description: string;
    image_url: string;
    stock: number;
}

export type ProductUpdateInput = Partial<ProductCreateInput>;

export interface ProductsListResponse {
    products: Product[];
    totalPages?: number;
    total?: number;
}

export interface UserProfile {
    id: number;
    name: string;
    email: string;
    role?: 'admin' | 'client';
    cpf?: string;
    phone?: string;
    address?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface UserCreateInput {
    name: string;
    email: string;
    password: string;
    cpf: string;
    phone: string;
    address: string;
}

export type UserUpdateInput = Partial<Pick<UserCreateInput, 'name' | 'phone' | 'address' | 'cpf' | 'password'>>;

export interface UsersListResponse {
    users: UserProfile[];
    totalPages: number;
    totalCount?: number;
    count?: number;
}

export interface CartEntry {
    id: number;
    userId: number;
    productId: number;
    quantity: number;
    Product: Product;
    createdAt?: string;
    updatedAt?: string;
}

export interface CartMutationInput {
    productId: number;
    quantity: number;
}

export interface CartUpdateInput {
    quantity: number;
}

export interface OrderItemSummary {
    id?: number;
    quantity: number;
    priceAtPurchase?: number;
    Product?: Pick<Product, 'id' | 'name' | 'image_url'>;
}

export interface OrderSummary {
    id: number;
    createdAt: string;
    status: string;
    totalValue: number | string;
    address?: string;
    User?: Pick<UserProfile, 'name' | 'email'>;
    OrderItems?: OrderItemSummary[];
    orderItems?: OrderItemSummary[];
}

export interface OrdersListResponse {
    orders: OrderSummary[];
    totalPages: number;
}

export interface OrderUpdateInput {
    status?: string;
    address?: string;
    paymentMethod?: string;
}

export interface CheckoutInput {
    paymentMethod: string;
    address: string;
}

export interface CheckoutResponse extends ApiMessageResponse {
    orderId: number;
}

export interface AuditLogEntry {
    id: number;
    adminId?: number;
    adminName: string;
    action: string;
    details: string;
    createdAt: string;
    updatedAt?: string;
}

export interface AuditLogsResponse {
    logs: AuditLogEntry[];
    totalPages: number;
    currentPage: number;
}

export interface DashboardStats {
    totalRevenue: number;
    monthlyRevenue?: number;
    dailyRevenue?: number;
    totalOrders?: number;
    totalUsers?: number;
    totalClients?: number;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface LoginResponse extends ApiMessageResponse {
    token: string;
    user: UserProfile;
}

export interface ApiErrorResponse {
    message?: string;
    error?: string;
}