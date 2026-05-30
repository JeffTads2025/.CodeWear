import { FiShoppingCart, FiPlus, FiMinus } from 'react-icons/fi';
import * as S from './styles';

export interface Product {
    id: number;
    name: string;
    price: number;
    description?: string;
    image_url: string;
    stock: number;
}

interface ProductCardProps {
    product: Product;
    qty: number;
    alreadyInCart: number;
    onQtyChange: (type: 'plus' | 'minus') => void;
    onAddToCart: () => void;
    onImageClick: () => void;
}

export const ProductCard = ({
    product,
    qty,
    alreadyInCart,
    onQtyChange,
    onAddToCart,
    onImageClick,
}: ProductCardProps) => {
    const isOutOfStock = product.stock <= 0 || alreadyInCart >= product.stock;

    return (
        <S.ProductCard>
            <div className="image-container">
                <img
                    src={product.image_url}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                    onClick={onImageClick}
                    style={{ cursor: 'zoom-in' }}
                />
            </div>

            <div className="content">
                <h3>{product.name}</h3>
                {product.description && <p className="description">{product.description}</p>}

                <p
                    className="availability"
                    style={{
                        color: isOutOfStock ? '#ef4444' : '#ffffff',
                    }}
                >
                    {isOutOfStock
                        ? product.stock <= 0
                            ? '❌ Esgotado'
                            : '⚠️ No limite'
                        : `✅ Disp: ${product.stock} un (No cart: ${alreadyInCart})`}
                </p>

                <p
                    style={{
                        fontSize: '0.85rem',
                        color: '#999',
                        margin: '8px 0',
                        textAlign: 'left',
                    }}
                >
                    Tamanho único - Unissex
                </p>

                <div className="footer-card">
                    <div
                        className="qty-controls"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: '#0d0d0d',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: '1px solid #333',
                        }}
                    >
                        <button
                            onClick={() => onQtyChange('minus')}
                            disabled={isOutOfStock || qty <= 1}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#fff',
                                cursor: 'pointer',
                                outline: 'none',
                            }}
                        >
                            <FiMinus size={14} />
                        </button>

                        <span
                            style={{
                                color: '#ffcc00',
                                fontWeight: 'bold',
                                minWidth: '15px',
                                textAlign: 'center',
                                fontSize: '14px',
                            }}
                        >
                            {isOutOfStock && alreadyInCart >= product.stock ? 0 : qty}
                        </span>

                        <button
                            onClick={() => onQtyChange('plus')}
                            disabled={isOutOfStock || qty + alreadyInCart >= product.stock}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#fff',
                                cursor: 'pointer',
                                outline: 'none',
                            }}
                        >
                            <FiPlus size={14} />
                        </button>
                    </div>

                    <S.AddButton onClick={onAddToCart} disabled={isOutOfStock}>
                        <FiShoppingCart size={18} />
                        {isOutOfStock ? 'Limite' : 'Comprar'}
                    </S.AddButton>
                </div>

                <div
                    className="price"
                    style={{
                        marginTop: '15px',
                        color: '#fff',
                        fontWeight: '800',
                        fontSize: '1.3rem',
                        borderTop: '1px solid #222',
                        paddingTop: '12px',
                    }}
                >
                    {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                    }).format(product.price)}
                </div>
            </div>
        </S.ProductCard>
    );
};
