import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { toast } from 'react-toastify';
import { cartApi } from '../services/api';
import { useAuth } from './useAuth';
import type { Product } from '../types/api';

interface CartItem extends Product {
  quantity: number;
  cartId: number;
}

interface CartContextData {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  updateCartQuantity: (productId: number, type: 'increase' | 'decrease') => Promise<void>;
  cartTotal: number;
  clearCart: () => void;
  loadCart: () => Promise<void>;
}

function hasStoredToken(): boolean {
  return Boolean(localStorage.getItem('@CodeWear:token'));
}

function mapCartItems(cartEntries: Array<{
  id: number;
  quantity: number;
  Product: Product;
}>): CartItem[] {
  return cartEntries.map((item) => ({
    id: item.Product.id,
    cartId: item.id,
    name: item.Product.name,
    price: item.Product.price,
    image_url: item.Product.image_url,
    stock: item.Product.stock,
    quantity: item.quantity
  }));
}

function calculateCartTotal(cart: CartItem[]): number {
  return cart.reduce((accumulator, item) => accumulator + (item.price * item.quantity), 0);
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const getProductTotalInCart = (productId: number) => {
    return cart
      .filter(item => item.id === productId)
      .reduce((acc, item) => acc + item.quantity, 0);
  };

  async function loadCart() {
    try {
      if (!hasStoredToken()) {
        setCart([]);
        return;
      }

      const cartEntries = await cartApi.getAll();
      setCart(mapCartItems(cartEntries));
    } catch (error) {
      console.error('Erro ao carregar carrinho', error);
    }
  }

  useEffect(() => {
    if (!token) {
      setCart([]);
      return;
    }

    loadCart();
  }, [token]);

  function clearCart() { setCart([]); }

  async function addToCart(product: Product, quantity: number = 1) {
    if (isProcessing) return;

    const currentTotalInCart = getProductTotalInCart(product.id);
    if (currentTotalInCart + quantity > product.stock) {
      toast.error(`Limite atingido! Você já tem ${currentTotalInCart} un. no carrinho e o estoque total é ${product.stock}.`, { theme: 'dark' });
      return;
    }

    setIsProcessing(true);
    try {
      await cartApi.addItem({ productId: product.id, quantity });
      await loadCart();
      toast.success(`✅ ${quantity}x ${product.name} adicionado ao carrinho!`, { theme: 'dark' });
    } catch (error) {
      console.error('Erro ao adicionar no carrinho', error);
      toast.error('Erro ao adicionar');
    } finally {
      setIsProcessing(false);
    }
  }

  async function updateCartQuantity(productId: number, type: 'increase' | 'decrease') {
    const item = cart.find(i => i.id === productId);
    if (!item) return;

    const currentTotalInCart = getProductTotalInCart(productId);
    if (type === 'increase' && currentTotalInCart >= item.stock) {
      toast.warn(`Estoque total do produto atingido (${item.stock} un)!`);
      return;
    }

    try {
      if (type === 'decrease' && item.quantity <= 1) return;

      const nextQuantity = type === 'increase' ? item.quantity + 1 : item.quantity - 1;
      await cartApi.updateItem(item.cartId, { quantity: nextQuantity });
      await loadCart();
    } catch (error) {
      console.error('Erro ao atualizar quantidade do carrinho', error);
      toast.error('Erro ao atualizar quantidade');
    }
  }

  async function removeFromCart(productId: number) {
    try {
      const itemsToRemove = cart.filter(i => i.id === productId);
      await Promise.all(itemsToRemove.map(item => cartApi.removeItem(item.cartId)));
      await loadCart();
    } catch (error) {
      console.error('Erro ao remover do carrinho', error);
      toast.error('Erro ao remover');
    }
  }

  const cartTotal = calculateCartTotal(cart);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateCartQuantity, cartTotal, clearCart, loadCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
