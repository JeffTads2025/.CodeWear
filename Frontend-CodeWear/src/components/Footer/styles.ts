import styled from 'styled-components';

export const Container = styled.footer`
  /* REMOVIDO: position: fixed e bottom: 0 */
  position: relative; 
  width: 100%;
  height: 90px;
  background: #0d0d0d; /* Defini a cor aqui para unir tudo */
  z-index: 10;
  display: flex;
  align-items: center;
  
  /* REMOVIDO: pointer-events: none (não faz sentido se ele não é fixo) */

  @media (max-width: 768px) {
    height: auto;
    padding: 20px 0;
  }
`;

export const ContentWrapper = styled.div`
  flex: 1;
  min-width: 0;
  margin-left: 240px;
  width: auto;
  height: 100%;
  background-color: #0d0d0d;
  border-top: 1px solid #1a1a1a;
  
  display: flex;
  flex-direction: column; 
  justify-content: center;
  gap: 8px; 
  
  padding: 0 30px;

  @media (max-width: 768px) {
    margin-left: 0;
    width: 100%;
  }
`;

export const Content = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  width: 100%;
  margin-left: 0;
  width: 100%;
  @media (max-width: 768px) {
    gap: 15px;
  }
`;

export const Contact = styled.div`
  ul {
    list-style: none;
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 0;
    margin: 0;
    
    @media (max-width: 480px) {
      flex-direction: column;
      gap: 10px;
    }

    li {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #999;
      font-size: 0.75rem;

      a {
        color: inherit;
        text-decoration: none;
      }

      svg { color: #00ff88; min-width: 14px; }
    }
  }
`;

export const MapSection = styled.div`
  a {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    background: #111;
    border: 1px solid #222;
    border-radius: 4px;
    text-decoration: none;
    transition: 0.2s;
    
    svg { color: #00ff88; }
    span { color: #00ff88; font-size: 0.7rem; font-weight: bold; }

    &:hover {
      border-color: #00ff88;
      background: #1a1a1a;
    }
  }
`;

export const Social = styled.div`
  display: flex;
  gap: 15px;
  padding-left: 20px;
  border-left: 1px solid #222;
  
  a { 
    color: #555; 
    transition: 0.2s; 
    display: flex;
    &:hover { color: #00ff88; } 
  }

  @media (max-width: 768px) {
    border-left: none;
    padding-left: 0;
  }
`;

export const Copyright = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  
  p { 
    color: #444; 
    font-size: 0.65rem; 
    margin: 0;
    letter-spacing: 0.5px;
    text-align: center;
  }
`;