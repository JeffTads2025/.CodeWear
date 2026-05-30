import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FiHome, FiShoppingBag, FiUser, FiLogOut, FiX,
  FiShoppingCart, FiShield, FiUsers, FiActivity
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import * as S from './styles';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  const handleLogout = () => {
    signOut();
    onClose();
    navigate('/login');
  };

  return (
    <>
      <S.Overlay $open={isOpen} onClick={onClose} />
      <S.Container $open={isOpen}>
        <S.MobileTopBar>
          <strong>Navegação</strong>
          <button type="button" onClick={onClose} aria-label="Fechar menu">
            <FiX size={18} />
          </button>
        </S.MobileTopBar>
        <S.Nav>
          <span className="group-title">ÁREA DO CLIENTE</span>
          <S.NavItem onClick={() => navigate('/')} className={location.pathname === '/' ? 'active' : ''}>
            <FiHome size={20} /> <span>Início</span>
          </S.NavItem>
          <S.NavItem onClick={() => navigate('/cart')} className={location.pathname === '/cart' ? 'active' : ''}>
            <FiShoppingCart size={20} /> <span>Carrinho</span>
          </S.NavItem>
          <S.NavItem onClick={() => navigate('/orders')} className={location.pathname === '/orders' ? 'active' : ''}>
            <FiShoppingBag size={20} /> <span>Meus Pedidos</span>
          </S.NavItem>

          {user?.role === 'admin' && (
            <>
              <span className="group-title" style={{ marginTop: '12px' }}>GERENCIAMENTO</span>
              <S.NavItem onClick={() => navigate('/admin')} className={location.pathname === '/admin' ? 'active' : ''}>
                <FiShield size={20} color="#00ff88" /> <span>Painel Geral</span>
              </S.NavItem>
              <S.NavItem onClick={() => navigate('/admin/sales')} className={location.pathname === '/admin/sales' ? 'active' : ''}>
                <FiShoppingBag size={20} /> <span>Vendas</span>
              </S.NavItem>
              <S.NavItem onClick={() => navigate('/admin/customers')} className={location.pathname === '/admin/customers' ? 'active' : ''}>
                <FiUsers size={20} /> <span>Clientes</span>
              </S.NavItem>
              <S.NavItem onClick={() => navigate('/admin/audit')} className={location.pathname === '/admin/audit' ? 'active' : ''}>
                <FiActivity size={20} /> <span>Auditoria</span>
              </S.NavItem>
              <S.NavItem onClick={() => navigate('/api-demo')} className={location.pathname === '/api-demo' ? 'active' : ''}>
                <FiActivity size={20} /> <span>API Demo</span>
              </S.NavItem>
            </>
          )}
        </S.Nav>

        <S.FooterNav>
          <S.NavItem onClick={() => navigate('/profile')} className={location.pathname === '/profile' ? 'active' : ''}>
            <FiUser size={20} /> <span>Meu Perfil</span>
          </S.NavItem>
          <S.NavItem onClick={handleLogout} className="logout">
            <FiLogOut size={20} /> <span>Sair</span>
          </S.NavItem>
        </S.FooterNav>
      </S.Container>
    </>
  );
}