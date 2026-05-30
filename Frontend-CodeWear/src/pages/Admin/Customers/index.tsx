import { useEffect, useState, useCallback, useRef } from 'react';
import { FiUsers, FiSearch, FiDownload } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { Pagination } from '../../../components/Pagination';
import { ButtonV2 } from '../../../components/ButtonV2';
import { InfoCard } from '../../../components/InfoCard';
import { InputV2 } from '../../../components/InputV2';
import { usersApi } from '../../../services/api';
import type { UserProfile } from '../../../types/api';
import * as S from '../styles';

type CustomersCacheEntry = {
    users: UserProfile[];
    totalPages: number;
    totalItems: number;
};

const CSV_SEPARATOR = ' ; ';

function getCustomersCacheKey(page: number, searchTerm: string): string {
    return `${page}:${searchTerm.trim().toLowerCase()}`;
}

function formatCustomerCreatedAt(createdAt?: string): string {
    return createdAt ? new Date(createdAt).toLocaleDateString('pt-BR') : '---';
}

function downloadCsvFile(content: string, fileName: string): void {
    const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const fileUrl = URL.createObjectURL(blob);

    link.href = fileUrl;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(fileUrl);
}

function buildAllCustomersCsv(users: UserProfile[]): string {
    const header = `NOME${' '.repeat(20)}${CSV_SEPARATOR}CPF${' '.repeat(15)}${CSV_SEPARATOR}EMAIL${' '.repeat(25)}${CSV_SEPARATOR}TELEFONE${CSV_SEPARATOR}CADASTRO\n`;

    const rows = users.map((user) => {
        const nome = (user.name || '').toUpperCase().padEnd(25, ' ');
        const cpf = (user.cpf || '---').padEnd(18, ' ');
        const email = (user.email || '').padEnd(30, ' ');
        const fone = (user.phone || '---').padEnd(15, ' ');
        const data = formatCustomerCreatedAt(user.createdAt);

        return `${nome}${CSV_SEPARATOR}${cpf}${CSV_SEPARATOR}${email}${CSV_SEPARATOR}${fone}${CSV_SEPARATOR}${data}`;
    }).join('\n');

    return header + rows;
}

function buildCurrentPageCustomersCsv(users: UserProfile[]): string {
    const header = `NOME${' '.repeat(15)}${CSV_SEPARATOR}CPF${' '.repeat(10)}${CSV_SEPARATOR}EMAIL${' '.repeat(20)}${CSV_SEPARATOR}CONTATO\n`;

    const rows = users.map((user) => (
        `${(user.name || '').padEnd(20, ' ')}${CSV_SEPARATOR}${(user.cpf || '').padEnd(15, ' ')}${CSV_SEPARATOR}${(user.email || '').padEnd(25, ' ')}${CSV_SEPARATOR}${user.phone || ''}`
    )).join('\n');

    return header + rows;
}

export function AdminCustomers() {
    const usersCacheRef = useRef<Record<string, CustomersCacheEntry>>({});
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [search, setSearch] = useState('');

    const loadUsers = useCallback(async (page = 1, searchTerm = '') => {
        const cacheKey = getCustomersCacheKey(page, searchTerm);

        const cachedResponse = usersCacheRef.current[cacheKey];
        if (cachedResponse) {
            setUsers(cachedResponse.users);
            setTotalPages(cachedResponse.totalPages);
            setTotalItems(cachedResponse.totalItems);
            setCurrentPage(page);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await usersApi.getAll({ page, limit: 5, search: searchTerm });

            const data = response.users || [];
            const totalReal = response.totalCount || response.count || 0;

            usersCacheRef.current[cacheKey] = {
                users: data,
                totalPages: response.totalPages || 1,
                totalItems: totalReal
            };

            setUsers(data);
            setTotalPages(response.totalPages || 1);
            setTotalItems(totalReal);
            setCurrentPage(page);
        } catch (error) {
            console.error('Erro ao carregar clientes:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => {
            loadUsers(1, search);
        }, 500);

        return () => clearTimeout(handler);
    }, [search, loadUsers]);

    const exportAllToCSV = async () => {
        const toastId = toast.loading('Buscando todos os registros no banco...');

        try {
            const response = await usersApi.getAll({ limit: 9999 });
            const allUsers = response.users || [];

            if (allUsers.length === 0) {
                toast.update(toastId, { render: 'Nenhum cliente encontrado para exportar.', type: 'error', isLoading: false, autoClose: 3000 });
                return;
            }

            downloadCsvFile(buildAllCustomersCsv(allUsers), 'RELATORIO_GERAL_CLIENTES.csv');

            toast.update(toastId, { render: 'Relatório Geral baixado!', type: 'success', isLoading: false, autoClose: 3000 });
        } catch {
            toast.update(toastId, { render: 'Erro ao gerar relatório.', type: 'error', isLoading: false, autoClose: 3000 });
        }
    };

    const exportCurrentPageToCSV = () => {
        downloadCsvFile(buildCurrentPageCustomersCsv(users), `clientes_pagina_${currentPage}.csv`);

        toast.success('Página exportada com sucesso!');
    };

    return (
        <S.Container>
            <S.TopBar>
                <S.TitleGroup>
                    <h2>
                        <FiUsers color="#00ff88" /> Gestão de Clientes
                        <S.PageBadge>{totalItems} clientes totais</S.PageBadge>
                    </h2>
                </S.TitleGroup>

                <S.ControlsGroup>
                    <ButtonV2
                        label="Exportar Tudo"
                        icon={<FiDownload size={16} />}
                        onClick={exportAllToCSV}
                    />
                    <ButtonV2
                        label="Página"
                        icon={<FiDownload size={16} />}
                        variant="neutral"
                        onClick={exportCurrentPageToCSV}
                    />
                    <S.ControlField $width="250px">
                        <InputV2
                            type="text"
                            placeholder="Pesquisar..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            icon={<FiSearch size={18} />}
                            fullWidth
                        />
                    </S.ControlField>
                </S.ControlsGroup>
            </S.TopBar>

            <S.DesktopTableWrapper>
                <S.Table>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>CPF</th>
                            <th>E-mail</th>
                            <th>Contato</th>
                            <th>Endereço</th>
                            <th>Cadastro</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#888' }}>Carregando dados...</td></tr>
                        ) : users.length > 0 ? (
                            users.map((user) => (
                                <tr key={user.id}>
                                    <td><InfoCard value={user.name || '---'} /></td>
                                    <td><InfoCard value={user.cpf || '---'} /></td>
                                    <td><InfoCard value={user.email || '---'} /></td>
                                    <td><InfoCard value={user.phone || '---'} /></td>
                                    <td><InfoCard value={user.address || '---'} /></td>
                                    <td>{formatCustomerCreatedAt(user.createdAt)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#666' }}>Nenhum cliente encontrado.</td></tr>
                        )}
                    </tbody>
                </S.Table>
            </S.DesktopTableWrapper>

            <S.MobileCards>
                {loading ? (
                    <S.EmptyStateCard>Carregando dados...</S.EmptyStateCard>
                ) : users.length > 0 ? (
                    users.map((user) => (
                        <S.MobileCard key={user.id}>
                            <S.MobileCardHeader>
                                <div>
                                    <strong>{user.name || '---'}</strong>
                                    <span>{user.email || 'Sem e-mail'}</span>
                                </div>
                                <S.MobileBadge>Cliente</S.MobileBadge>
                            </S.MobileCardHeader>

                            <S.MobileFieldList>
                                <S.MobileField>
                                    <small>CPF</small>
                                    <span>{user.cpf || '---'}</span>
                                </S.MobileField>
                                <S.MobileField>
                                    <small>Contato</small>
                                    <span>{user.phone || '---'}</span>
                                </S.MobileField>
                                <S.MobileField>
                                    <small>Endereço</small>
                                    <span>{user.address || '---'}</span>
                                </S.MobileField>
                                <S.MobileField>
                                    <small>Cadastro</small>
                                    <span>{formatCustomerCreatedAt(user.createdAt)}</span>
                                </S.MobileField>
                            </S.MobileFieldList>
                        </S.MobileCard>
                    ))
                ) : (
                    <S.EmptyStateCard>Nenhum cliente encontrado.</S.EmptyStateCard>
                )}
            </S.MobileCards>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => {
                    setCurrentPage(page);
                    loadUsers(page, search);
                }}
            />
        </S.Container>
    );
}
