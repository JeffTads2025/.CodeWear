import styled from 'styled-components';

export const Overlay = styled.button<{ $open: boolean }>`
  display: none;

  @media (max-width: 768px) {
    display: ${({ $open }) => ($open ? 'block' : 'none')};
    position: fixed;
    inset: 0;
    z-index: 899;
    border: 0;
    background: rgba(0, 0, 0, 0.6);
  }
`;

export const Container = styled.aside<{ $open: boolean }>`
  width: 240px; 
  background-color: #0d0d0d;
  border-right: 1px solid #222;
  position: fixed;
  left: 0;
  top: 104px; 
  height: calc(100vh - 104px); 
  display: flex;
  flex-direction: column;
  z-index: 900; 
  overflow: hidden;
  padding: 0.8rem 0; /* Padding reduzido para dar mais espaço vertical */

  @media (max-width: 768px) {
    top: 84px;
    height: calc(100vh - 84px);
    width: min(82vw, 320px);
    transform: translateX(${({ $open }) => ($open ? '0' : '-105%')});
    transition: transform 0.25s ease;
    box-shadow: 14px 0 28px rgba(0, 0, 0, 0.35);
  }

  .group-title {
    color: #444;
    font-size: 0.6rem;
    font-weight: bold;
    padding: 0 1.5rem;
    margin-bottom: 0.4rem;
    display: block;
    text-transform: uppercase;
  }
`;

export const MobileTopBar = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.25rem 0.9rem;
    border-bottom: 1px solid #1a1a1a;
    margin-bottom: 0.5rem;

    strong {
      font-size: 0.9rem;
      color: #f2f2f2;
      letter-spacing: 0.04em;
    }

    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 10px;
      border: 1px solid #242424;
      background: #141414;
      color: #f2f2f2;
    }
  }
`;

export const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 1px; /* Gap mínimo para economizar espaço */
  flex: 1;
`;

export const FooterNav = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
  margin-top: auto;
  padding-top: 0.8rem;
  padding-bottom: 25px; 
  border-top: 1px solid #1a1a1a;
`;

export const NavItem = styled.div`
  padding: 0.6rem 1.5rem; /* Altura de cada item reduzida para caber Auditoria */
  color: #888;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-size: 0.82rem;
  transition: 0.2s;

  &:hover { color: #00ff88; background: rgba(0, 255, 136, 0.05); }
  
  &.active { 
    color: #fff; 
    background: #0088ff; 
    border-radius: 0 8px 8px 0; 
    margin-right: 10px;
    font-weight: 600;
  }
  
  &.logout:hover { color: #ff4444; }
`;