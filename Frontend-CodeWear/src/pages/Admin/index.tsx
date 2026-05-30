import { useEffect, useState, useCallback } from 'react';
import {
  FiPackage, FiPlus, FiTrash2, FiDollarSign,
  FiUsers, FiShoppingBag, FiActivity, FiLink
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import axios from 'axios';
import { adminApi, productsApi } from '../../services/api';
import { ButtonV2 } from '../../components/ButtonV2';
import type { ApiErrorResponse, DashboardStats, Product, ProductUpdateInput } from '../../types/api';
import * as S from './styles';

type EditableProductField = 'name' | 'price' | 'stock' | 'image_url';

function isProductsListResponse(value: Product[] | { products: Product[] }): value is { products: Product[] } {
  return !Array.isArray(value);
}

function formatDashboardCurrency(value: number | undefined): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
}

function parseProductFieldValue(field: EditableProductField, value: string): string | number {
  return field === 'price' || field === 'stock' ? Number(value) : value;
}

function replaceProduct(currentProducts: Product[], nextProduct: Product): Product[] {
  return currentProducts.map((product) => (
    product.id === nextProduct.id ? nextProduct : product
  ));
}

function removeProduct(currentProducts: Product[], productId: number): Product[] {
  return currentProducts.filter((product) => product.id !== productId);
}

function prependProduct(currentProducts: Product[], nextProduct: Product): Product[] {
  return [nextProduct, ...currentProducts];
}

export function Admin() {
  const [stats, setStats] = useState<DashboardStats>({ totalRevenue: 0, totalOrders: 0, totalUsers: 0 });
  const [products, setProducts] = useState<Product[]>([]);

  // States para criação
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState('');

  function resetProductForm() {
    setName('');
    setPrice('');
    setStock('');
    setImage('');
  }

  const loadAdminData = useCallback(async () => {
    try {
      const [statsRes, productsRes] = await Promise.all([
        adminApi.getDashboard(),
        productsApi.getAll({ page: 1, limit: 50 })
      ]);
      setStats(statsRes);
      const pData = isProductsListResponse(productsRes) ? productsRes.products : productsRes;
      setProducts(Array.isArray(pData) ? pData : []);
    } catch {
      toast.error("Erro ao carregar dados do servidor.");
    }
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  // FUNÇÃO DE EDIÇÃO (ENTER)
  async function handleUpdateProduct(id: number, updatedData: ProductUpdateInput) {
    try {
      const response = await productsApi.update(id, updatedData);
      setProducts((currentProducts) => replaceProduct(currentProducts, response.product));
      toast.success('Alteração salva! ✅', { autoClose: 1000 });
    } catch {
      toast.error('Erro ao atualizar dados do produto.');
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, id: number, field: EditableProductField) => {
    if (e.key === 'Enter') {
      const value = e.currentTarget.value;
      const formattedValue = parseProductFieldValue(field, value);
      handleUpdateProduct(id, { [field]: formattedValue });
      e.currentTarget.blur(); // Tira o foco após salvar
    }
  };

  // FUNÇÃO DE EXCLUSÃO COM MENSAGEM DETALHADA
  async function handleDeleteProduct(id: number) {
    if (window.confirm('Deseja realmente excluir este produto?')) {
      try {
        await productsApi.delete(id);
        setProducts((currentProducts) => removeProduct(currentProducts, id));
        toast.success('Produto removido! 🗑️');
      } catch (error) {
        const errorMessage = axios.isAxiosError<ApiErrorResponse>(error)
          ? error.response?.data?.error || error.response?.data?.message || 'Erro ao excluir produto.'
          : 'Erro ao excluir produto.';
        toast.error(`Não foi possível excluir: ${errorMessage}`, {
          autoClose: 5000
        });
      }
    }
  }

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    try {
      const response = await productsApi.create({
        name,
        price: Number(price),
        stock: Number(stock),
        image_url: image,
        description: "Produto adicionado via painel admin"
      });
      setProducts((currentProducts) => prependProduct(currentProducts, response.product));
      resetProductForm();
      toast.success('Produto cadastrado com sucesso!');
    } catch {
      toast.error('Erro ao cadastrar produto.');
    }
  }

  return (
    <S.Container>
      <S.TopBar>
        <S.TitleGroup>
          <h2>
            <FiActivity color="#00ff88" /> Painel de Gestão
            <S.PageBadge>visão geral</S.PageBadge>
          </h2>
        </S.TitleGroup>
      </S.TopBar>

      <S.StatsGrid>
        <S.StatCard>
          <div className="icon-box" style={{ background: '#252101', color: '#ffcc00' }}><FiDollarSign /></div>
          <div><span>Faturamento</span><h3>{formatDashboardCurrency(stats.totalRevenue)}</h3></div>
        </S.StatCard>
        <S.StatCard>
          <div className="icon-box" style={{ background: '#1a1a00', color: '#d4af37' }}><FiUsers /></div>
          <div><span>Clientes</span><h3>{stats.totalUsers || 0}</h3></div>
        </S.StatCard>
        <S.StatCard>
          <div className="icon-box" style={{ background: '#0a1a1a', color: '#00ccff' }}><FiShoppingBag /></div>
          <div><span>Pedidos</span><h3>{stats.totalOrders || 0}</h3></div>
        </S.StatCard>
      </S.StatsGrid>

      <S.Grid>
        <S.Card>
          <h3><FiPlus /> Novo Produto</h3>
          <S.Form onSubmit={handleAddProduct}>
            <div className="field-group">
              <label style={{ color: '#ccc', fontSize: '0.9rem' }}>Nome do Produto</label>
              <input value={name} onChange={e => setName(e.target.value)} required />
            </div>

            <div className="two-column-grid">
              <div className="field-group">
                <label style={{ color: '#ccc', fontSize: '0.9rem' }}>Preço (R$)</label>
                <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required />
              </div>
              <div className="field-group">
                <label style={{ color: '#ccc', fontSize: '0.9rem' }}>Qtd em Estoque</label>
                <input type="number" value={stock} onChange={e => setStock(e.target.value)} required />
              </div>
            </div>

            <div className="field-group">
              <label style={{ color: '#ccc', fontSize: '0.9rem' }}>URL da Imagem</label>
              <input value={image} onChange={e => setImage(e.target.value)} required />
            </div>

            <div>
              <ButtonV2 type="submit" label="Cadastrar no Estoque" variant="highlight" />
            </div>
          </S.Form>
        </S.Card>

        <S.Card>
          <h3 style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiPackage /> Itens em Estoque
            </span>
            <span style={{ fontSize: '0.78rem', color: '#00ff88', fontWeight: 700, letterSpacing: '0.05em' }}>
              PRODUTOS CADASTRADOS: {products.length}
            </span>
          </h3>
          <S.ProductList>
            {products.map(product => (
              <div key={product.id} className="product-item">
                <img src={product.image_url} alt="" loading="lazy" decoding="async" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />

                <div className="product-content">
                  <input
                    style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.9rem', fontWeight: 'bold', borderBottom: '1px solid #333', outline: 'none' }}
                    defaultValue={product.name}
                    onKeyDown={(e) => handleKeyDown(e, product.id, 'name')}
                  />

                  {/* EDIÇÃO DE IMAGEM VIA LINK */}
                  <div className="image-link-row">
                    <FiLink size={12} color="#666" />
                    <input
                      style={{ background: '#000', border: '1px solid #222', color: '#888', fontSize: '0.7rem', width: '100%', padding: '3px 8px', borderRadius: '4px', outline: 'none' }}
                      defaultValue={product.image_url}
                      onKeyDown={(e) => handleKeyDown(e, product.id, 'image_url')}
                    />
                  </div>

                  {/* EDIÇÃO DE PREÇO E QTD VIA ENTER */}
                  <div className="metric-input-row">
                    <div style={{ display: 'flex', alignItems: 'center', background: '#000', padding: '2px 8px', borderRadius: '4px', border: '1px solid #333' }}>
                      <span style={{ fontSize: '0.7rem', color: '#ffcc00', marginRight: '4px' }}>R$</span>
                      <input
                        type="number" step="0.01"
                        style={{ background: 'transparent', border: 'none', color: '#ffcc00', width: '60px', fontSize: '0.8rem', outline: 'none' }}
                        defaultValue={product.price}
                        onKeyDown={(e) => handleKeyDown(e, product.id, 'price')}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', background: '#000', padding: '2px 8px', borderRadius: '4px', border: '1px solid #333' }}>
                      <span style={{ fontSize: '0.7rem', color: '#00ff88', marginRight: '4px' }}>QTD</span>
                      <input
                        type="number"
                        style={{ background: 'transparent', border: 'none', color: '#00ff88', width: '40px', fontSize: '0.8rem', outline: 'none' }}
                        defaultValue={product.stock}
                        onKeyDown={(e) => handleKeyDown(e, product.id, 'stock')}
                      />
                    </div>
                  </div>
                </div>

                <button onClick={() => handleDeleteProduct(product.id)} className="delete-button">
                  <FiTrash2 size={18} color="#ff4444" />
                </button>
              </div>
            ))}
          </S.ProductList>
        </S.Card>
      </S.Grid>
    </S.Container>
  );
}