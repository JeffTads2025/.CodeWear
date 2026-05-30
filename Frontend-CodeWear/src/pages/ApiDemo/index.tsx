import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Button } from '../../components/Button';
import { Pagination } from '../../components/Pagination';
import { useAuth } from '../../hooks/useAuth';
import { productsApi, usersApi, cartApi, ordersApi, auditApi } from '../../services/api';
import { maskCPF, sanitizeCPF, validateCPF } from '../../utils/cpf';
import type {
    ApiErrorResponse,
    AuditLogEntry,
    CartEntry,
    OrderSummary,
    Product,
    ProductsListResponse,
    ProductUpdateInput,
    UserProfile,
    UserUpdateInput,
} from '../../types/api';
import * as S from './styles';

function isProductsListResponse(value: Product[] | ProductsListResponse): value is ProductsListResponse {
    return !Array.isArray(value);
}

type ApiDemoDataItem = Product | UserProfile | CartEntry | OrderSummary | AuditLogEntry;

type ApiErrorCandidate = Error | { response?: { data?: ApiErrorResponse } } | null | undefined;

type ProductFormState = {
    name: string;
    price: string;
    stock: string;
    image_url: string;
};

type CartFormState = {
    productId: string;
    quantity: string;
};

type CartUpdateFormState = {
    cartId: string;
    quantity: string;
};

type UserFormState = {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    cpf: string;
    phone: string;
    address: string;
};

type ProfileFormState = {
    name: string;
    phone: string;
    address: string;
    password: string;
};

const EMPTY_PRODUCT_FORM: ProductFormState = {
    name: '',
    price: '',
    stock: '',
    image_url: ''
};

const EMPTY_CART_FORM: CartFormState = {
    productId: '',
    quantity: ''
};

const EMPTY_CART_UPDATE_FORM: CartUpdateFormState = {
    cartId: '',
    quantity: ''
};

const EMPTY_USER_FORM: UserFormState = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    cpf: '',
    phone: '',
    address: ''
};

const EMPTY_PROFILE_FORM: ProfileFormState = {
    name: '',
    phone: '',
    address: '',
    password: ''
};

function getErrorMessage(error: ApiErrorCandidate, fallback: string): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message || fallback;
    }

    return fallback;
}

function maskPhone(value: string): string {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d{1,4})/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1');
}

function validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function buildProductCreatePayload(productForm: ProductFormState) {
    return {
        name: productForm.name,
        price: parseFloat(productForm.price),
        description: 'Produto criado via API Demo',
        image_url: productForm.image_url || 'https://via.placeholder.com/200',
        stock: parseInt(productForm.stock)
    };
}

function buildProductUpdatePayload(productForm: ProductFormState): ProductUpdateInput {
    const updateData: ProductUpdateInput = {};

    if (productForm.name) updateData.name = productForm.name;
    if (productForm.price) updateData.price = parseFloat(productForm.price);
    if (productForm.stock) updateData.stock = parseInt(productForm.stock);
    if (productForm.image_url) updateData.image_url = productForm.image_url;

    return updateData;
}

function buildUserCreatePayload(userForm: UserFormState) {
    const { confirmPassword: _confirmPassword, ...rest } = userForm;

    return {
        ...rest,
        cpf: sanitizeCPF(userForm.cpf),
        phone: userForm.phone.replace(/\D/g, '')
    };
}

function buildProfileUpdatePayload(profileForm: ProfileFormState): UserUpdateInput {
    const updateData: UserUpdateInput = {};

    if (profileForm.name) updateData.name = profileForm.name;
    if (profileForm.phone) updateData.phone = profileForm.phone.replace(/\D/g, '');
    if (profileForm.address) updateData.address = profileForm.address;
    if (profileForm.password) updateData.password = profileForm.password;

    return updateData;
}

function renderApiDemoData(loading: boolean, data: ApiDemoDataItem[]) {
    if (loading) return <div>Carregando...</div>;
    if (!data.length) return <div>Nenhum dado encontrado. Clique em uma ação para carregar dados.</div>;

    return (
        <div className="json-output">
            <h3>Dados Carregados ({data.length} itens):</h3>
            <pre>
                {JSON.stringify(data, null, 2)}
            </pre>
        </div>
    );
}

export function ApiDemo() {
    const navigate = useNavigate();
    const { signOut, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState<'products' | 'users' | 'cart' | 'orders' | 'audit'>('products');
    const [data, setData] = useState<ApiDemoDataItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [productPage, setProductPage] = useState(1);
    const [productTotalPages, setProductTotalPages] = useState(1);
    const [orderPage, setOrderPage] = useState(1);
    const [orderTotalPages, setOrderTotalPages] = useState(1);
    const [auditPage, setAuditPage] = useState(1);
    const [auditTotalPages, setAuditTotalPages] = useState(1);

    const [productForm, setProductForm] = useState<ProductFormState>(EMPTY_PRODUCT_FORM);
    const [updateProductId, setUpdateProductId] = useState('');
    const [deleteProductId, setDeleteProductId] = useState('');
    const [cartForm, setCartForm] = useState<CartFormState>(EMPTY_CART_FORM);
    const [cartUpdateForm, setCartUpdateForm] = useState<CartUpdateFormState>(EMPTY_CART_UPDATE_FORM);
    const [userForm, setUserForm] = useState<UserFormState>(EMPTY_USER_FORM);
    const [profileForm, setProfileForm] = useState<ProfileFormState>(EMPTY_PROFILE_FORM);

    // ==================== PRODUCTS CRUD DEMO ====================
    const loadProducts = async (page = 1, showToast = true) => {
        setLoading(true);
        try {
            const result = await productsApi.getAll({ page, limit: 5 });

            if (isProductsListResponse(result)) {
                setData(result.products);
                setProductPage(page);
                setProductTotalPages(result.totalPages || 1);
            } else {
                setData(result);
                setProductPage(1);
                setProductTotalPages(1);
            }

            if (showToast) {
                toast.success('✅ Produtos carregados com sucesso!');
            }
        } catch (error) {
            toast.error(`❌ Erro: ${getErrorMessage(error as ApiErrorCandidate, 'Erro ao carregar produtos')}`);
        } finally {
            setLoading(false);
        }
    };

    const createProduct = async () => {
        if (!productForm.name || !productForm.price || !productForm.stock) {
            toast.error('❌ Preencha pelo menos Nome, Preço e Estoque!');
            return;
        }

        try {
            await productsApi.create(buildProductCreatePayload(productForm));
            toast.success('✅ Produto criado com sucesso!');
            void loadProducts(productPage, false);
            setProductForm(EMPTY_PRODUCT_FORM);
        } catch (error) {
            toast.error(`❌ Erro: ${getErrorMessage(error as ApiErrorCandidate, 'Erro ao criar produto')}`);
        }
    };

    const updateProduct = async () => {
        if (!updateProductId) {
            toast.error('❌ Digite o ID do produto a ser atualizado!');
            return;
        }

        try {
            const updateData = buildProductUpdatePayload(productForm);

            if (Object.keys(updateData).length === 0) {
                toast.error('❌ Preencha pelo menos um campo para atualizar!');
                return;
            }

            await productsApi.update(parseInt(updateProductId), updateData);
            toast.success('✅ Produto atualizado com sucesso!');
            void loadProducts(productPage, false);
            setUpdateProductId('');
            setProductForm(EMPTY_PRODUCT_FORM);
        } catch (error) {
            toast.error(`❌ Erro: ${getErrorMessage(error as ApiErrorCandidate, 'Erro ao atualizar produto')}`);
        }
    };

    const deleteProduct = async () => {
        if (!deleteProductId) {
            toast.error('❌ Digite o ID do produto a ser deletado!');
            return;
        }

        if (!confirm('Tem certeza que deseja deletar este produto?')) return;
        try {
            await productsApi.delete(parseInt(deleteProductId));
            toast.success('✅ Produto deletado com sucesso!');
            const nextPage = data.length === 1 && productPage > 1 ? productPage - 1 : productPage;
            void loadProducts(nextPage, false);
            setDeleteProductId('');
        } catch (error) {
            toast.error(`❌ Erro: ${getErrorMessage(error as ApiErrorCandidate, 'Erro ao deletar produto')}`);
        }
    };

    // ==================== USERS CRUD DEMO ====================
    const loadUsers = async () => {
        setLoading(true);
        try {
            const result = await usersApi.getAll({ limit: 5 });
            setData(result.users);
            toast.success('✅ Usuários carregados com sucesso!');
        } catch (error) {
            toast.error(`❌ Erro: ${getErrorMessage(error as ApiErrorCandidate, 'Erro ao carregar usuários')}`);
        } finally {
            setLoading(false);
        }
    };

    const loadProfile = async () => {
        try {
            const result = await usersApi.getProfile();
            setData([result]);
            toast.success('✅ Perfil carregado com sucesso!');
        } catch (error) {
            toast.error(`❌ Erro: ${getErrorMessage(error as ApiErrorCandidate, 'Erro ao carregar perfil')}`);
        }
    };

    const createUser = async () => {
        if (!userForm.name || !userForm.email || !userForm.password || !userForm.cpf || !userForm.phone || !userForm.address) {
            toast.error('❌ Preencha todos os campos obrigatórios!');
            return;
        }

        // Validações
        if (!validateEmail(userForm.email)) {
            toast.error('❌ E-mail inválido!');
            return;
        }

        if (!validateCPF(userForm.cpf)) {
            toast.error('❌ CPF inválido!');
            return;
        }

        if (userForm.password.length < 8) {
            toast.error('❌ Senha deve ter pelo menos 8 caracteres!');
            return;
        }

        if (userForm.password !== userForm.confirmPassword) {
            toast.error('❌ As senhas não coincidem!');
            return;
        }

        try {
            await usersApi.create(buildUserCreatePayload(userForm));
            toast.success('✅ Usuário criado com sucesso!');
            setUserForm(EMPTY_USER_FORM);
        } catch (error) {
            toast.error(`❌ Erro: ${getErrorMessage(error as ApiErrorCandidate, 'Erro ao criar usuário')}`);
        }
    };

    const updateProfile = async () => {
        if (!profileForm.name && !profileForm.phone && !profileForm.address && !profileForm.password) {
            toast.error('❌ Preencha pelo menos um campo para atualizar!');
            return;
        }

        // Validações se campos foram preenchidos
        if (profileForm.phone && profileForm.phone.replace(/\D/g, '').length < 10) {
            toast.error('❌ Telefone deve ter pelo menos 10 dígitos!');
            return;
        }

        if (profileForm.password && profileForm.password.length < 8) {
            toast.error('❌ Nova senha deve ter pelo menos 8 caracteres!');
            return;
        }

        try {
            await usersApi.updateProfile(buildProfileUpdatePayload(profileForm));

            const refreshedUser = await usersApi.getProfile();
            updateUser(refreshedUser);

            toast.success('✅ Perfil atualizado com sucesso!');
            void loadProfile();
            setProfileForm(EMPTY_PROFILE_FORM);
        } catch (error) {
            toast.error(`❌ Erro: ${getErrorMessage(error as ApiErrorCandidate, 'Erro ao atualizar perfil')}`);
        }
    };

    // ==================== CART CRUD DEMO ====================
    const loadCart = async () => {
        setLoading(true);
        try {
            const result = await cartApi.getAll();
            setData(result);
            toast.success('✅ Carrinho carregado com sucesso!');
        } catch (error) {
            toast.error(`❌ Erro: ${getErrorMessage(error as ApiErrorCandidate, 'Erro ao carregar carrinho')}`);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async () => {
        if (!cartForm.productId || !cartForm.quantity) {
            toast.error('❌ Preencha o ID do produto e a quantidade!');
            return;
        }

        try {
            await cartApi.addItem({
                productId: parseInt(cartForm.productId),
                quantity: parseInt(cartForm.quantity)
            });
            toast.success('✅ Item adicionado ao carrinho!');
            void loadCart();
            setCartForm(EMPTY_CART_FORM);
        } catch (error) {
            toast.error(`❌ Erro: ${getErrorMessage(error as ApiErrorCandidate, 'Erro ao adicionar item')}`);
        }
    };

    const updateCartItem = async () => {
        if (!cartUpdateForm.cartId || !cartUpdateForm.quantity) {
            toast.error('❌ Preencha o ID do item do carrinho e a nova quantidade!');
            return;
        }

        if (parseInt(cartUpdateForm.quantity) <= 0) {
            toast.error('❌ A quantidade deve ser maior que zero!');
            return;
        }

        try {
            await cartApi.updateItem(parseInt(cartUpdateForm.cartId), {
                quantity: parseInt(cartUpdateForm.quantity)
            });
            toast.success('✅ Item do carrinho atualizado com sucesso!');
            void loadCart();
            setCartUpdateForm(EMPTY_CART_UPDATE_FORM);
        } catch (error) {
            toast.error(`❌ Erro: ${getErrorMessage(error as ApiErrorCandidate, 'Erro ao atualizar item do carrinho')}`);
        }
    };

    const clearCart = async () => {
        if (!confirm('Tem certeza que deseja limpar o carrinho?')) return;
        try {
            await cartApi.clear();
            toast.success('✅ Carrinho limpo com sucesso!');
            void loadCart();
        } catch (error) {
            toast.error(`❌ Erro: ${getErrorMessage(error as ApiErrorCandidate, 'Erro ao limpar carrinho')}`);
        }
    };

    // ==================== ORDERS CRUD DEMO ====================
    const loadMyOrders = async (page = 1, showToast = true) => {
        setLoading(true);
        try {
            const result = await ordersApi.getMyOrders({ page });
            setData(result.orders);
            setOrderPage(page);
            setOrderTotalPages(result.totalPages || 1);

            if (showToast) {
                toast.success('✅ Pedidos carregados com sucesso!');
            }
        } catch (error) {
            toast.error(`❌ Erro: ${getErrorMessage(error as ApiErrorCandidate, 'Erro ao carregar pedidos')}`);
        } finally {
            setLoading(false);
        }
    };

    // ==================== AUDIT CRUD DEMO ====================
    const loadAuditLogs = async (page = 1, showToast = true) => {
        setLoading(true);
        try {
            const result = await auditApi.getLogs({ page, limit: 5 });
            setData(result.logs);
            setAuditPage(result.currentPage || page);
            setAuditTotalPages(result.totalPages || 1);

            if (showToast) {
                toast.success('✅ Logs de auditoria carregados com sucesso!');
            }
        } catch (error) {
            toast.error(`❌ Erro: ${getErrorMessage(error as ApiErrorCandidate, 'Erro ao carregar logs')}`);
        } finally {
            setLoading(false);
        }
    };

    const cancelMyAccount = async () => {
        const confirmed = window.confirm(
            'Tem certeza que deseja cancelar sua conta? Seus pedidos continuarão registrados, mas seu acesso será encerrado.'
        );

        if (!confirmed) {
            return;
        }

        try {
            await usersApi.cancelMyAccount();
            signOut();
            setData([]);
            toast.success('✅ Conta cancelada com sucesso!');
            navigate('/login');
        } catch (error) {
            toast.error(`❌ Erro: ${getErrorMessage(error as ApiErrorCandidate, 'Erro ao cancelar conta')}`);
        }
    };

    const handleTabChange = (tab: typeof activeTab) => {
        setActiveTab(tab);
        setData([]);
    };

    return (
        <S.Container>
            <S.Header>
                <div className="icon-bg">🔧</div>
                <div>
                    <h2>API CRUD Demo</h2>
                    <p>Demonstração dos CRUDS implementados no service api.ts</p>
                </div>
            </S.Header>

            <S.Content>
                {/* Tabs */}
                <div className="tab-list">
                    {[
                        { key: 'products', label: '📦 Produtos', color: '#ffcc00' },
                        { key: 'users', label: '👥 Usuários', color: '#3b82f6' },
                        { key: 'cart', label: '🛒 Carrinho', color: '#10b981' },
                        { key: 'orders', label: '📋 Pedidos', color: '#f59e0b' },
                        { key: 'audit', label: '📊 Auditoria', color: '#ef4444' }
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => handleTabChange(tab.key as typeof activeTab)}
                            style={{
                                padding: '10px 15px',
                                background: activeTab === tab.key ? tab.color : '#333',
                                color: activeTab === tab.key ? '#000' : '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Actions */}
                <div className="actions-panel">
                    {activeTab === 'products' && (
                        <div>
                            {/* Form para Criar Produto */}
                            <div className="action-card">
                                <h4 style={{ color: '#10b981', marginBottom: '10px' }}>➕ Criar Novo Produto</h4>
                                <div className="fields-grid">
                                    <input
                                        type="text"
                                        placeholder="Nome do produto"
                                        value={productForm.name}
                                        onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #333', background: '#0a0a0a', color: '#fff' }}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Preço (R$)"
                                        value={productForm.price}
                                        onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #333', background: '#0a0a0a', color: '#fff' }}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Estoque"
                                        value={productForm.stock}
                                        onChange={e => setProductForm({ ...productForm, stock: e.target.value })}
                                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #333', background: '#0a0a0a', color: '#fff' }}
                                    />
                                </div>
                                <div className="fields-grid two-columns">
                                    <input
                                        type="text"
                                        placeholder="URL da imagem"
                                        value={productForm.image_url}
                                        onChange={e => setProductForm({ ...productForm, image_url: e.target.value })}
                                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #333', background: '#0a0a0a', color: '#fff' }}
                                    />
                                </div>
                                <Button onClick={createProduct} style={{ background: '#10b981' }}>➕ Criar Produto</Button>
                            </div>

                            {/* Form para Atualizar Produto */}
                            <div className="action-card">
                                <h4 style={{ color: '#f59e0b', marginBottom: '10px' }}>✏️ Atualizar Produto</h4>
                                <div className="inline-fields">
                                    <input
                                        type="number"
                                        placeholder="ID do produto"
                                        value={updateProductId}
                                        onChange={e => setUpdateProductId(e.target.value)}
                                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #333', background: '#0a0a0a', color: '#fff', width: '120px' }}
                                    />
                                    <span style={{ color: '#888' }}>← Digite o ID primeiro</span>
                                </div>
                                <div className="fields-grid">
                                    <input
                                        type="text"
                                        placeholder="Novo nome (opcional)"
                                        value={productForm.name}
                                        onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #333', background: '#0a0a0a', color: '#fff' }}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Novo preço (opcional)"
                                        value={productForm.price}
                                        onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #333', background: '#0a0a0a', color: '#fff' }}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Novo estoque (opcional)"
                                        value={productForm.stock}
                                        onChange={e => setProductForm({ ...productForm, stock: e.target.value })}
                                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #333', background: '#0a0a0a', color: '#fff' }}
                                    />
                                </div>
                                <div className="fields-grid two-columns">
                                    <input
                                        type="text"
                                        placeholder="Nova URL da imagem (opcional)"
                                        value={productForm.image_url}
                                        onChange={e => setProductForm({ ...productForm, image_url: e.target.value })}
                                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #333', background: '#0a0a0a', color: '#fff' }}
                                    />
                                </div>
                                <Button onClick={updateProduct} style={{ background: '#f59e0b' }}>✏️ Atualizar Produto</Button>
                            </div>

                            {/* Form para Deletar Produto */}
                            <div className="action-card">
                                <h4 style={{ color: '#ef4444', marginBottom: '10px' }}>🗑️ Deletar Produto</h4>
                                <div className="inline-fields">
                                    <input
                                        type="number"
                                        placeholder="ID do produto"
                                        value={deleteProductId}
                                        onChange={e => setDeleteProductId(e.target.value)}
                                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #333', background: '#0a0a0a', color: '#fff', width: '120px' }}
                                    />
                                </div>
                                <Button onClick={deleteProduct} style={{ background: '#ef4444' }}>🗑️ Deletar Produto</Button>
                            </div>

                            <div className="button-row">
                                <Button onClick={() => void loadProducts()}>📖 Listar Produtos</Button>
                            </div>

                            <div style={{ marginTop: '16px' }}>
                                <Pagination
                                    currentPage={productPage}
                                    totalPages={productTotalPages}
                                    onPageChange={(page) => void loadProducts(page, false)}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div>
                            {/* Form para Cadastrar Usuário */}
                            <div className="action-card">
                                <h4 style={{ color: '#10b981', marginBottom: '10px' }}>➕ Cadastrar Novo Usuário</h4>
                                <div className="fields-grid">
                                    <input
                                        type="text"
                                        placeholder="Nome completo"
                                        value={userForm.name}
                                        onChange={e => setUserForm({ ...userForm, name: e.target.value })}
                                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #333', background: '#0a0a0a', color: '#fff' }}
                                    />
                                    <input
                                        type="email"
                                        placeholder="E-mail"
                                        value={userForm.email}
                                        onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #333', background: '#0a0a0a', color: '#fff' }}
                                    />
                                    <input
                                        type="password"
                                        placeholder="Senha"
                                        value={userForm.password}
                                        onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #333', background: '#0a0a0a', color: '#fff' }}
                                    />
                                    <input
                                        type="password"
                                        placeholder="Confirmar senha"
                                        value={userForm.confirmPassword}
                                        onChange={e => setUserForm({ ...userForm, confirmPassword: e.target.value })}
                                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #333', background: '#0a0a0a', color: '#fff' }}
                                    />
                                    <input
                                        type="text"
                                        placeholder="CPF (000.000.000-00)"
                                        value={userForm.cpf}
                                        onChange={e => setUserForm({ ...userForm, cpf: maskCPF(e.target.value) })}
                                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #333', background: '#0a0a0a', color: '#fff' }}
                                    />
                                </div>
                                <div className="fields-grid two-columns">
                                    <input
                                        type="text"
                                        placeholder="Telefone ((00) 00000-0000)"
                                        value={userForm.phone}
                                        onChange={e => setUserForm({ ...userForm, phone: maskPhone(e.target.value) })}
                                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #333', background: '#0a0a0a', color: '#fff' }}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Endereço completo"
                                        value={userForm.address}
                                        onChange={e => setUserForm({ ...userForm, address: e.target.value })}
                                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #333', background: '#0a0a0a', color: '#fff' }}
                                    />
                                </div>
                                <Button onClick={createUser} style={{ background: '#10b981' }}>➕ Cadastrar Usuário</Button>
                            </div>

                            {/* Form para Atualizar Perfil */}
                            <div className="action-card">
                                <h4 style={{ color: '#f59e0b', marginBottom: '10px' }}>✏️ Atualizar Meu Perfil</h4>
                                <div className="fields-grid">
                                    <input
                                        type="text"
                                        placeholder="Novo nome (opcional)"
                                        value={profileForm.name}
                                        onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #333', background: '#0a0a0a', color: '#fff' }}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Novo telefone (opcional) ((00) 00000-0000)"
                                        value={profileForm.phone}
                                        onChange={e => setProfileForm({ ...profileForm, phone: maskPhone(e.target.value) })}
                                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #333', background: '#0a0a0a', color: '#fff' }}
                                    />
                                    <input
                                        type="password"
                                        placeholder="Nova senha (opcional)"
                                        value={profileForm.password}
                                        onChange={e => setProfileForm({ ...profileForm, password: e.target.value })}
                                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #333', background: '#0a0a0a', color: '#fff' }}
                                    />
                                </div>
                                <div style={{ marginBottom: '10px' }}>
                                    <textarea
                                        placeholder="Novo endereço (opcional)"
                                        value={profileForm.address}
                                        onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
                                        rows={2}
                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #333', background: '#0a0a0a', color: '#fff', resize: 'vertical' }}
                                    />
                                </div>
                                <Button onClick={updateProfile} style={{ background: '#f59e0b' }}>✏️ Atualizar Perfil</Button>
                            </div>

                            <div className="action-card">
                                <h4 style={{ color: '#ef4444', marginBottom: '10px' }}>🗑️ Cancelar Minha Conta</h4>
                                <p style={{ color: '#a3a3a3', marginBottom: '12px', lineHeight: 1.5 }}>
                                    Replica a ação existente na página de perfil: encerra o acesso da conta atual, preservando os pedidos já registrados.
                                </p>
                                <Button onClick={cancelMyAccount} style={{ background: '#ef4444' }}>🗑️ Cancelar Conta</Button>
                            </div>

                            <div className="button-row">
                                <Button onClick={loadUsers}>📖 Listar Usuários</Button>
                                <Button onClick={loadProfile} style={{ background: '#3b82f6' }}>👤 Meu Perfil</Button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'cart' && (
                        <div>
                            {/* Form para Adicionar ao Carrinho */}
                            <div className="action-card">
                                <h4 style={{ color: '#10b981', marginBottom: '10px' }}>➕ Adicionar Item ao Carrinho</h4>
                                <div className="inline-fields">
                                    <input
                                        type="number"
                                        placeholder="ID do produto"
                                        value={cartForm.productId}
                                        onChange={e => setCartForm({ ...cartForm, productId: e.target.value })}
                                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #333', background: '#0a0a0a', color: '#fff', width: '120px' }}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Quantidade"
                                        value={cartForm.quantity}
                                        onChange={e => setCartForm({ ...cartForm, quantity: e.target.value })}
                                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #333', background: '#0a0a0a', color: '#fff', width: '100px' }}
                                    />
                                </div>
                                <Button onClick={addToCart} style={{ background: '#10b981' }}>➕ Adicionar Item</Button>
                            </div>

                            <div className="action-card">
                                <h4 style={{ color: '#f59e0b', marginBottom: '10px' }}>✏️ Atualizar Item do Carrinho</h4>
                                <div className="inline-fields">
                                    <input
                                        type="number"
                                        placeholder="ID do item no carrinho"
                                        value={cartUpdateForm.cartId}
                                        onChange={e => setCartUpdateForm({ ...cartUpdateForm, cartId: e.target.value })}
                                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #333', background: '#0a0a0a', color: '#fff', width: '160px' }}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Nova quantidade"
                                        value={cartUpdateForm.quantity}
                                        onChange={e => setCartUpdateForm({ ...cartUpdateForm, quantity: e.target.value })}
                                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #333', background: '#0a0a0a', color: '#fff', width: '130px' }}
                                    />
                                </div>
                                <Button onClick={updateCartItem} style={{ background: '#f59e0b' }}>✏️ Atualizar Item</Button>
                            </div>

                            <div className="button-row">
                                <Button onClick={loadCart}>📖 Ver Carrinho</Button>
                                <Button onClick={clearCart} style={{ background: '#ef4444' }}>🗑️ Limpar Carrinho</Button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div>
                            <div className="button-row">
                                <Button onClick={() => void loadMyOrders()}>📖 Meus Pedidos</Button>
                            </div>

                            <div style={{ marginTop: '16px' }}>
                                <Pagination
                                    currentPage={orderPage}
                                    totalPages={orderTotalPages}
                                    onPageChange={(page) => void loadMyOrders(page, false)}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'audit' && (
                        <div>
                            <div className="button-row">
                                <Button onClick={() => void loadAuditLogs()}>📊 Ver Logs</Button>
                            </div>

                            <div style={{ marginTop: '16px' }}>
                                <Pagination
                                    currentPage={auditPage}
                                    totalPages={auditTotalPages}
                                    onPageChange={(page) => void loadAuditLogs(page, false)}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Data Display */}
                {renderApiDemoData(loading, data)}
            </S.Content>
        </S.Container>
    );
}