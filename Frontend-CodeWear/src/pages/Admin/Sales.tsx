import { useCallback, useEffect, useState } from 'react';
import {
    FiCalendar,
    FiDownload,
    FiShoppingBag,
    FiTrash2,
} from 'react-icons/fi';
import api, { ordersApi } from '../../services/api';
import { ButtonV2 } from '../../components/ButtonV2';
import { InfoCard } from '../../components/InfoCard';
import { InputV2 } from '../../components/InputV2';
import { Pagination } from '../../components/Pagination';
import { toast } from 'react-toastify';
import type { DashboardStats, OrderSummary, OrdersListResponse } from '../../types/api';
import * as S from './styles';

type SalesExportRow = {
    'Cliente': string;
    'Endereço': string;
    'Produtos': string;
    'Data': string;
    'Total (R$)': string;
};

function formatOrderItems(orderItems: OrderSummary['OrderItems']): string {
    return orderItems?.map((item) => `${item.quantity}x ${item.Product?.name}`).join(', ') || 'N/A';
}

function getInitialSelectedDate(): string {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().split('T')[0];
}

function getSelectedMonthAndYear(selectedDate: string): { year: string; month: string } {
    const [year, month] = selectedDate.split('-');
    return { year, month };
}

function formatCurrency(value: number | string | undefined): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(Number(value) || 0);
}

function formatSelectedDate(date: string): string {
    if (!date) {
        return '';
    }

    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
}

function formatOrderDate(createdAt: string): string {
    return new Date(createdAt).toLocaleDateString('pt-BR');
}

function calculateDailyRevenue(orders: OrderSummary[]): number {
    return orders.reduce((accumulator, order) => accumulator + Number(order.totalValue || 0), 0);
}

function buildSalesExportRows(exportData: OrderSummary[]): SalesExportRow[] {
    const rows = exportData.map((order) => ({
        'Cliente': order.User?.name || 'N/A',
        'Endereço': order.address || 'N/A',
        'Produtos': formatOrderItems(order.OrderItems),
        'Data': formatOrderDate(order.createdAt),
        'Total (R$)': Number(order.totalValue || 0).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })
    }));

    const totalSoma = exportData.reduce((accumulator, current) => accumulator + Number(current.totalValue || 0), 0);

    rows.push({
        'Cliente': '---',
        'Endereço': '---',
        'Produtos': '---',
        'Data': 'SOMA TOTAL:',
        'Total (R$)': totalSoma.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
    });

    return rows;
}

function mergeUpdatedOrder(currentOrder: OrderSummary, updatedOrder: OrderSummary): OrderSummary {
    return {
        ...currentOrder,
        ...updatedOrder,
        User: updatedOrder.User ?? currentOrder.User,
        OrderItems: updatedOrder.OrderItems ?? currentOrder.OrderItems,
        orderItems: updatedOrder.orderItems ?? currentOrder.orderItems,
    };
}

export function AdminSales() {
    const [orders, setOrders] = useState<OrderSummary[]>([]);
    const [stats, setStats] = useState<DashboardStats>({
        totalRevenue: 0,
        monthlyRevenue: 0
    });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [selectedDate, setSelectedDate] = useState(getInitialSelectedDate);

    const loadSales = useCallback(async () => {
        try {
            const { year, month } = getSelectedMonthAndYear(selectedDate);

            const [ordersRes, statsRes] = await Promise.all([
                api.get<OrdersListResponse>(`/admin/all-orders?page=${page}&date=${selectedDate}`),
                api.get<DashboardStats>(`/admin/dashboard?month=${month}&year=${year}`)
            ]);

            setOrders(ordersRes.data.orders || []);
            setTotalPages(ordersRes.data.totalPages || 1);

            setStats({
                totalRevenue: Number(statsRes.data?.totalRevenue || 0),
                monthlyRevenue: Number(statsRes.data?.monthlyRevenue || 0)
            });
        } catch {
            console.error('Erro ao carregar vendas');
        }
    }, [page, selectedDate]);

    async function handleUpdateOrder(orderId: number, status: string) {
        try {
            const response = await ordersApi.update(orderId, { status });
            setOrders((currentOrders) => currentOrders.map((order) => (
                order.id === orderId ? mergeUpdatedOrder(order, response.order) : order
            )));
            toast.success('Pedido atualizado com sucesso.');
        } catch (error) {
            console.error('Erro ao atualizar pedido', error);
            toast.error('Erro ao atualizar pedido.');
        }
    }

    async function handleDeleteOrder(orderId: number) {
        const confirmed = window.confirm('Deseja remover este pedido?');

        if (!confirmed) {
            return;
        }

        try {
            await ordersApi.delete(orderId);
            const shouldGoToPreviousPage = orders.length === 1 && page > 1;

            if (shouldGoToPreviousPage) {
                setPage((currentPage) => Math.max(currentPage - 1, 1));
            } else {
                await loadSales();
            }

            toast.success('Pedido removido com sucesso.');
        } catch (error) {
            console.error('Erro ao remover pedido', error);
            toast.error('Erro ao remover pedido.');
        }
    }

    useEffect(() => {
        loadSales();
    }, [loadSales]);

    const handleExportExcel = async (mode: 'day' | 'month') => {
        try {
            const XLSX = await import('xlsx');
            let exportData: OrderSummary[] = [];
            const { year, month } = getSelectedMonthAndYear(selectedDate);

            if (mode === 'day') {
                exportData = orders;
            } else {
                const res = await api.get<OrdersListResponse>(`/admin/all-orders?month=${month}&year=${year}&limit=9999`);
                exportData = res.data.orders || [];
            }

            if (exportData.length === 0) {
                toast.warn('Sem vendas para exportar.');
                return;
            }

            const rows = buildSalesExportRows(exportData);

            const ws = XLSX.utils.json_to_sheet(rows);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Vendas');
            XLSX.writeFile(wb, `Relatorio_${mode === 'day' ? 'Dia' : 'Mes'}.xlsx`);
        } catch {
            alert('Erro no Excel.');
        }
    };

    return (
        <S.Container>
            <S.TopBar>
                <S.TitleGroup>
                    <h2>
                        <FiShoppingBag color="#00ff88" /> Relatório de Vendas e Entregas
                        <S.PageBadge>{formatSelectedDate(selectedDate)}</S.PageBadge>
                    </h2>
                </S.TitleGroup>

                <S.ControlsGroup>
                    <ButtonV2
                        label="Exportar Dia"
                        icon={<FiDownload size={16} />}
                        onClick={() => handleExportExcel('day')}
                    />
                    <ButtonV2
                        label="Exportar Mês"
                        icon={<FiDownload size={16} />}
                        variant="neutral"
                        onClick={() => handleExportExcel('month')}
                    />
                    <S.ControlField $width="190px">
                        <InputV2
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            icon={<FiCalendar size={16} />}
                            fullWidth
                        />
                    </S.ControlField>
                </S.ControlsGroup>
            </S.TopBar>

            <S.MetricsRow>
                <S.MetricCard>
                    <span>FATURAMENTO GERAL</span>
                    <h2>{formatCurrency(stats.totalRevenue)}</h2>
                </S.MetricCard>

                <S.MetricCard>
                    <span>VENDAS NO MÊS</span>
                    <h2>{formatCurrency(stats.monthlyRevenue)}</h2>
                </S.MetricCard>

                <S.MetricCard>
                    <span>FATURAMENTO DO DIA</span>
                    <h2>
                        {formatCurrency(calculateDailyRevenue(orders))}
                    </h2>
                </S.MetricCard>
            </S.MetricsRow>

            <S.DesktopTableWrapper>
                <S.AuditTable>
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th>Endereço de Entrega</th>
                            <th>Produtos</th>
                            <th>Status</th>
                            <th>Total</th>
                            <th>Data</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length > 0 ? (
                            orders.map((order) => (
                                <tr key={order.id}>
                                    <td>
                                        <InfoCard value={order.User?.name || 'N/A'} />
                                    </td>
                                    <td>
                                        <InfoCard value={order.address || 'N/A'} />
                                    </td>
                                    <td>
                                        <InfoCard value={formatOrderItems(order.OrderItems)} />
                                    </td>
                                    <td>
                                        <select
                                            value={order.status}
                                            onChange={(event) => void handleUpdateOrder(order.id, event.target.value)}
                                            style={{
                                                background: '#161616',
                                                color: '#fff',
                                                border: '1px solid #333',
                                                borderRadius: '6px',
                                                padding: '8px'
                                            }}
                                        >
                                            <option value="pendente">Pendente</option>
                                            <option value="pago">Pago</option>
                                            <option value="enviado">Enviado</option>
                                            <option value="cancelado">Cancelado</option>
                                        </select>
                                    </td>
                                    <td><strong>{formatCurrency(order.totalValue)}</strong></td>
                                    <td>{formatOrderDate(order.createdAt)}</td>
                                    <td>
                                        <button
                                            type="button"
                                            onClick={() => void handleDeleteOrder(order.id)}
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                background: '#2a0f12',
                                                color: '#ff7b86',
                                                border: '1px solid #5b1b24',
                                                borderRadius: '8px',
                                                padding: '8px 10px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <FiTrash2 size={14} /> Remover
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>Sem vendas registradas hoje.</td></tr>
                        )}
                    </tbody>
                </S.AuditTable>
            </S.DesktopTableWrapper>

            <S.MobileCards>
                {orders.length > 0 ? (
                    orders.map((order) => (
                        <S.MobileCard key={order.id}>
                            <S.MobileCardHeader>
                                <div>
                                    <strong>{order.User?.name || 'N/A'}</strong>
                                    <span>{formatOrderDate(order.createdAt)}</span>
                                </div>
                                <S.MobileBadge>{formatCurrency(order.totalValue)}</S.MobileBadge>
                            </S.MobileCardHeader>

                            <S.MobileFieldList>
                                <S.MobileField>
                                    <small>Entrega</small>
                                    <span>{order.address || 'N/A'}</span>
                                </S.MobileField>
                                <S.MobileField>
                                    <small>Produtos</small>
                                    <span>{formatOrderItems(order.OrderItems)}</span>
                                </S.MobileField>
                                <S.MobileField>
                                    <small>Status</small>
                                    <span>{order.status}</span>
                                </S.MobileField>
                            </S.MobileFieldList>

                            <S.MobileActions>
                                <select
                                    value={order.status}
                                    onChange={(event) => void handleUpdateOrder(order.id, event.target.value)}
                                    style={{
                                        background: '#161616',
                                        color: '#fff',
                                        border: '1px solid #333',
                                        borderRadius: '6px',
                                        padding: '10px 12px'
                                    }}
                                >
                                    <option value="pendente">Pendente</option>
                                    <option value="pago">Pago</option>
                                    <option value="enviado">Enviado</option>
                                    <option value="cancelado">Cancelado</option>
                                </select>

                                <button
                                    type="button"
                                    onClick={() => void handleDeleteOrder(order.id)}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                        background: '#2a0f12',
                                        color: '#ff7b86',
                                        border: '1px solid #5b1b24',
                                        borderRadius: '8px',
                                        padding: '10px 12px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <FiTrash2 size={14} /> Remover
                                </button>
                            </S.MobileActions>
                        </S.MobileCard>
                    ))
                ) : (
                    <S.EmptyStateCard>Sem vendas registradas hoje.</S.EmptyStateCard>
                )}
            </S.MobileCards>

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
