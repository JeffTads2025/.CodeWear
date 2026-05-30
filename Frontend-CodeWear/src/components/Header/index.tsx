import { useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiLogOut, FiMenu } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import * as S from './styles';

interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { cart } = useCart();

  const cartSize = cart.reduce((acc, item) => acc + item.quantity, 0);
  const userName = user?.name ? user.name.split(' ')[0] : '';

  function handleLogout() {
    signOut();
    navigate('/login');
  }

  return (
    <S.Container>
      <S.Content>
        <S.MobileMenuButton type="button" onClick={onMenuToggle} aria-label="Abrir menu">
          <FiMenu size={22} />
        </S.MobileMenuButton>

        <S.BrandBlock>
          <S.BrandImage
            src="/codewear-dev.png"
            alt="CodeWear"
            onClick={() => navigate('/')}
          />
        </S.BrandBlock>

        <S.SloganArea>
          <S.Slogan>
            Eleve seu <S.HighlightWord>{'<style>'}</S.HighlightWord> e de um <S.HighlightWord>{'<Git push>'}</S.HighlightWord> na sua <S.HighlightWord>{'<View>'}</S.HighlightWord>
            <S.Ellipsis aria-hidden="true">
              <S.Dot>.</S.Dot>
              <S.Dot>.</S.Dot>
              <S.Dot>.</S.Dot>
            </S.Ellipsis>
          </S.Slogan>
        </S.SloganArea>

        <S.IconsArea>
          <button onClick={() => userName ? navigate('/profile') : navigate('/login')} className="user-greeting">
            <FiUser size={22} />
            <span>{userName ? `Olá, ${userName} !` : 'Entrar'}</span>
            <small>{userName ? 'Perfil' : 'Login'}</small>
          </button>

          <button onClick={() => navigate('/cart')} className="cart">
            <FiShoppingCart size={22} />
            {cartSize > 0 && <span className="badge">{cartSize}</span>}
          </button>

          {userName && (
            <button onClick={handleLogout} className="logout-btn" title="Sair">
              <FiLogOut size={22} />
            </button>
          )}
        </S.IconsArea>
      </S.Content>
    </S.Container>
  );
}