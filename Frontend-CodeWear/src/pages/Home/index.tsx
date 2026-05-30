import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { ProductCard } from '../../components/ProductCard';
import type { Product } from '../../components/ProductCard';
import * as S from './styles';

function getProductsFromResponse(data: Product[] | { products?: Product[] }): Product[] {
  if (Array.isArray(data)) {
    return data;
  }

  return Array.isArray(data.products) ? data.products : [];
}

function getCartQuantityByProductId(cart: Array<{ id: number; quantity: number }>, productId: number): number {
  return cart
    .filter((item) => item.id === productId)
    .reduce((accumulator, item) => accumulator + item.quantity, 0);
}

function getSelectedQuantity(qtySelected: Record<number, number>, productId: number): number {
  return qtySelected[productId] || 1;
}

function exceedsAvailableStock(product: Product, alreadyInCart: number, quantityToAdd: number): boolean {
  return alreadyInCart + quantityToAdd > product.stock;
}

export function Home() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [qtySelected, setQtySelected] = useState<Record<number, number>>({});

  const { addToCart, cart } = useCart();

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/products', { params: { page: 1, limit: 50 } });
      setProducts(getProductsFromResponse(response.data));
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const getQtyInCart = (productId: number) => {
    return getCartQuantityByProductId(cart, productId);
  };

  const handleQtyChange = (productId: number, type: 'plus' | 'minus') => {
    const currentQty = getSelectedQuantity(qtySelected, productId);
    const alreadyInCart = getQtyInCart(productId);
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (type === 'plus') {
      if (currentQty + alreadyInCart >= product.stock) {
        toast.error(`Limite atingido! Você já tem ${alreadyInCart} un. no carrinho e o estoque é ${product.stock}.`, { theme: 'dark' });
        return;
      }
      setQtySelected(prev => ({ ...prev, [productId]: currentQty + 1 }));
    } else if (type === 'minus' && currentQty > 1) {
      setQtySelected(prev => ({ ...prev, [productId]: currentQty - 1 }));
    }
  };

  const handleBuy = (product: Product) => {
    if (!token) {
      toast.warn('Faça login para adicionar produtos ao carrinho.');
      navigate('/login');
      return;
    }

    const qtyToAdd = getSelectedQuantity(qtySelected, product.id);
    const alreadyInCart = getQtyInCart(product.id);

    if (exceedsAvailableStock(product, alreadyInCart, qtyToAdd)) {
      toast.error(`Impossível adicionar! Estoque: ${product.stock}. Você já possui ${alreadyInCart} un. no carrinho.`, { theme: 'dark' });
      return;
    }

    void addToCart(product, qtyToAdd);
    setQtySelected(prev => ({ ...prev, [product.id]: 1 }));
  };

  return (
    <>
      <S.ImageModalOverlay $active={!!selectedImage} onClick={() => setSelectedImage(null)}>
        {selectedImage && <img src={selectedImage} alt="Zoom" />}
      </S.ImageModalOverlay>

      <S.Container>
        {loading ? (
          <S.EmptyState>Carregando produtos...</S.EmptyState>
        ) : products.length === 0 ? (
          <S.EmptyState>Nenhum produto encontrado.</S.EmptyState>
        ) : (
          <S.ProductGrid>
            {products.map(product => {
              const qty = getSelectedQuantity(qtySelected, product.id);
              const alreadyInCart = getQtyInCart(product.id);

              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  qty={qty}
                  alreadyInCart={alreadyInCart}
                  onQtyChange={(type: 'plus' | 'minus') => handleQtyChange(product.id, type)}
                  onAddToCart={() => handleBuy(product)}
                  onImageClick={() => setSelectedImage(product.image_url)}
                />
              );
            })}
          </S.ProductGrid>
        )}
      </S.Container>
    </>
  );
}
