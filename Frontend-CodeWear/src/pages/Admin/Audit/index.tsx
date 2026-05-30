import { useCallback, useEffect, useRef, useState } from 'react';
import { FiActivity, FiSearch } from 'react-icons/fi';
import { InfoCard } from '../../../components/InfoCard';
import { InputV2 } from '../../../components/InputV2';
import { auditApi } from '../../../services/api';
import { Pagination } from '../../../components/Pagination';
import type { AuditLogEntry } from '../../../types/api';
import * as S from '../styles';

type AuditLogsCacheEntry = {
    logs: AuditLogEntry[];
    totalPages: number;
};

const INVALID_AUDIT_TOKENS = ['undefined', 'undifined', 'null'];

function getAuditCacheKey(page: number, searchTerm: string): string {
    return `${page}:${searchTerm.trim().toLowerCase()}`;
}

function normalizeAuditDetails(action: string, details: string): string {
    const cleanedDetails = details
        .replace(/\s*\(ID:\s*\d+\)/gi, '')
        .trim();

    const parts = cleanedDetails
        .split(' - ')
        .map((part) => part.trim())
        .filter((part) => part.length > 0);

    const validParts = parts.filter((part, index) => {
        if (index === 0) {
            return true;
        }

        const normalizedPart = part.toLowerCase();
        return !INVALID_AUDIT_TOKENS.some((token) => normalizedPart.includes(token));
    });

    const firstPart = validParts[0] || '';
    const productNameMatch = firstPart.match(/^(?:Criou|Atualizou|Deletou) produto\s+"([^"]+)"$/i);
    const remainingParts = validParts.slice(1);

    if (productNameMatch) {
        const summary = `"${productNameMatch[1]}"`;
        return [summary, ...remainingParts].join(' - ');
    }

    if (action === 'DELETE_PRODUCT' && firstPart) {
        return firstPart.replace(/^Deletou produto\s+/i, '');
    }

    if (action === 'CREATE_PRODUCT' && firstPart) {
        return firstPart.replace(/^Criou produto\s+/i, '');
    }

    if (action === 'UPDATE_PRODUCT' && firstPart) {
        return firstPart.replace(/^Atualizou produto\s+/i, '');
    }

    if (action === 'DELETE_ORDER' && firstPart) {
        return firstPart;
    }

    return validParts.join(' - ') || 'Sem detalhes';
}

function translateAuditAction(action: string): string {
    switch (action) {
        case 'CREATE_PRODUCT':
            return 'Criou produto';
        case 'UPDATE_PRODUCT':
            return 'Atualizou produto';
        case 'DELETE_PRODUCT':
            return 'Deletou produto';
        case 'DELETE_ORDER':
            return 'Deletou pedido';
        default:
            return action;
    }
}

function formatAuditDate(createdAt: string): string {
    return new Date(createdAt).toLocaleString('pt-BR');
}

export function AdminAudit() {
    const logsCacheRef = useRef<Record<string, AuditLogsCacheEntry>>({});
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const loadLogs = useCallback(async (page = 1) => {
        const cacheKey = getAuditCacheKey(page, searchTerm);
        const cachedResponse = logsCacheRef.current[cacheKey];

        if (cachedResponse) {
            setLogs(cachedResponse.logs);
            setTotalPages(cachedResponse.totalPages);
            setCurrentPage(page);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await auditApi.getLogs({ page, limit: 5, search: searchTerm });
            const nextLogs = response.logs || [];
            const nextTotalPages = response.totalPages || 1;

            logsCacheRef.current[cacheKey] = {
                logs: nextLogs,
                totalPages: nextTotalPages
            };

            setLogs(nextLogs);
            setTotalPages(nextTotalPages);
            setCurrentPage(page);
        } catch {
            console.error('Erro ao carregar auditoria');
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    useEffect(() => {
        const timer = setTimeout(() => loadLogs(1), 500);
        return () => clearTimeout(timer);
    }, [loadLogs]);

    return (
        <S.Container>
            <S.TopBar>
                <S.TitleGroup>
                    <h2>
                        <FiActivity color="#00ff88" /> Auditoria do Sistema
                        <S.PageBadge>atividade recente</S.PageBadge>
                    </h2>
                </S.TitleGroup>

                <S.ControlsGroup>
                    <S.ControlField $width="280px">
                        <InputV2
                            placeholder="Pesquisar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            icon={<FiSearch size={16} />}
                            fullWidth
                        />
                    </S.ControlField>
                </S.ControlsGroup>
            </S.TopBar>

            {loading ? <p>Carregando...</p> : null}

            {!loading ? (
                <>
                    <S.DesktopTableWrapper>
                        <S.AuditTable>
                            <thead>
                                <tr>
                                    <th>Usuário</th>
                                    <th>Ação</th>
                                    <th>Detalhes</th>
                                    <th>Data</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <tr key={log.id}>
                                        <td><strong>{log.adminName || 'Sistema'}</strong></td>
                                        <td><span style={{ color: 'var(--primary)' }}>{translateAuditAction(log.action)}</span></td>
                                        <td>
                                            <InfoCard value={normalizeAuditDetails(log.action, log.details || 'Sem detalhes')} />
                                        </td>
                                        <td>{formatAuditDate(log.createdAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </S.AuditTable>
                    </S.DesktopTableWrapper>

                    <S.MobileCards>
                        {logs.length > 0 ? (
                            logs.map((log) => (
                                <S.MobileCard key={log.id}>
                                    <S.MobileCardHeader>
                                        <div>
                                            <strong>{log.adminName || 'Sistema'}</strong>
                                            <span>{formatAuditDate(log.createdAt)}</span>
                                        </div>
                                        <S.MobileBadge>{translateAuditAction(log.action)}</S.MobileBadge>
                                    </S.MobileCardHeader>

                                    <S.MobileFieldList>
                                        <S.MobileField>
                                            <small>Ação</small>
                                            <span>{translateAuditAction(log.action)}</span>
                                        </S.MobileField>
                                        <S.MobileField>
                                            <small>Detalhes</small>
                                            <span>{normalizeAuditDetails(log.action, log.details || 'Sem detalhes')}</span>
                                        </S.MobileField>
                                    </S.MobileFieldList>
                                </S.MobileCard>
                            ))
                        ) : (
                            <S.EmptyStateCard>Nenhum registro de auditoria encontrado.</S.EmptyStateCard>
                        )}
                    </S.MobileCards>
                </>
            ) : null}

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => {
                    setCurrentPage(page);
                    loadLogs(page);
                }}
            />
        </S.Container>
    );
}
