import { useCallback, useEffect, useState } from 'react';
import {
  FiPackage,
  FiCheckCircle,
  FiClock,
  FiShoppingBag,
} from 'react-icons/fi';
import api from '../../services/api';
import { Pagination } from '../../components/Pagination';
import type { OrderItemSummary, OrdersListResponse, OrderSummary } from '../../types/api';
import * as S from './styles';

interface OrderCardItem {
  name: string;
  image: string;
}

interface OrderCardData {
  id: number;
  createdAt: string;
  status: string;
  total: number;
  items: OrderCardItem[];
}

function getRawOrders(dataFromServer: OrdersListResponse | OrderSummary[]): OrderSummary[] {
  return Array.isArray(dataFromServer)
    ? dataFromServer
    : (dataFromServer.orders || []);
}

function getOrdersTotalPages(dataFromServer: OrdersListResponse | OrderSummary[]): number {
  return Array.isArray(dataFromServer) ? 1 : (dataFromServer.totalPages || 1);
}

function mapOrderItems(items: OrderItemSummary[] | undefined): OrderCardItem[] {
  return (items ?? []).map((item) => ({
    name: item.Product?.name || 'Produto indisponível',
    image: item.Product?.image_url || 'https://via.placeholder.com/150',
  }));
}

function mapOrderCard(order: OrderSummary): OrderCardData {
  return {
    id: order.id,
    createdAt: order.createdAt,
    status: order.status,
    total: Number(order.totalValue),
    items: mapOrderItems(order.OrderItems || order.orderItems),
  };
}

function formatOrderDate(createdAt: string): string {
  return new Date(createdAt).toLocaleDateString('pt-BR');
}

function formatOrderTotal(total: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(total);
}

function isPaidOrder(status: string): boolean {
  return status === 'pago';
}

export function Orders() {
  const [orders, setOrders] = useState<OrderCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get<OrdersListResponse>(`/orders?page=${page}`);
      const dataFromServer = response.data;
      const rawOrders = getRawOrders(dataFromServer);
      setTotalPages(getOrdersTotalPages(dataFromServer));
      const formatted = rawOrders.map(mapOrderCard);

      setOrders(formatted);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  // Recarrega sempre que a página mudar
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return (
    <S.Container>
      <S.Header>
        <div className="icon-bg"><FiPackage /></div>
        <div>
          <h2>Meus Pedidos</h2>
          <p>Exibindo página {page} de {totalPages}</p>
        </div>
      </S.Header>

      <S.OrderList>
        {loading ? (
          <p style={{ textAlign: 'center', padding: '20px' }}>Carregando seus pedidos...</p>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <FiShoppingBag size={50} color="#333" />
            <p style={{ marginTop: '10px', color: '#666' }}>Você ainda não realizou nenhum pedido.</p>
          </div>
        ) : (
          orders.map(order => (
            <S.OrderCard key={order.id}>
              {/* Mostra a imagem do primeiro item do pedido */}
              <img
                src={order.items[0]?.image}
                alt={order.items[0]?.name}
                loading="lazy"
                decoding="async"
                onError={(event) => { event.currentTarget.src = 'https://via.placeholder.com/150'; }}
              />

              <div className="info">
                <span>Pedido #{order.id}</span>
                <h3>
                  {order.items[0]?.name}
                  {order.items.length > 1 && ` (+${order.items.length - 1} itens)`}
                </h3>
                <div className="status">
                  {isPaidOrder(order.status) ? (
                    <FiCheckCircle color="#10b981" />
                  ) : (
                    <FiClock color="#f59e0b" />
                  )}
                  <span>
                    {order.status.toUpperCase()} • {formatOrderDate(order.createdAt)}
                  </span>
                </div>
              </div>

              <div className="price">
                {formatOrderTotal(order.total)}
              </div>
            </S.OrderCard>
          ))
        )}
      </S.OrderList>

      {/* Só mostra a paginação se houver mais de uma página */}
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </S.Container>
  );
}