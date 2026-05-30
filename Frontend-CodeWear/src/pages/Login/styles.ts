import { Link } from 'react-router-dom';
import styled from 'styled-components';

export const Container = styled.div`
  height: 100vh;
  display: flex; 
  align-items: center; 
  justify-content: center;
  background: #0a0a0a; /* Fundo padrão do seu site */
`;

export const Content = styled.div`
  width: 100%; 
  max-width: 400px; 
  padding: 20px;
  display: flex; 
  flex-direction: column; 
  gap: 32px;
`;

export const LogoSection = styled.div`
  text-align: center;
  .icon-box {
    background: #ffcc00; /* Amarelo Admin */
    width: 50px; 
    height: 50px;
    border-radius: 12px; 
    display: flex; 
    align-items: center; 
    justify-content: center;
    margin: 0 auto 16px; 
    color: #000; /* Ícone preto no fundo amarelo */
    font-size: 24px;
  }
  h1 { color: white; font-size: 32px; font-weight: 700; }
  p { color: #999; }
`;

export const FormCard = styled.form`
  background: #161616; /* Mesmo fundo do OrderCard/ProductCard */
  padding: 40px; 
  border-radius: 16px;
  border: 1px solid #222; /* Borda discreta */
  display: flex; 
  flex-direction: column; 
  gap: 20px;

  h2 { color: white; font-size: 24px; text-align: center; font-weight: 700; }

  .input-group {
    display: flex; 
    flex-direction: column; 
    gap: 8px;
    
    label { color: #666; font-size: 14px; display: flex; align-items: center; gap: 8px; font-weight: bold; }
    
    input {
      background: #0d0d0d; /* Fundo mais escuro para o input */
      border: 1px solid #2a2a2a; 
      border-radius: 8px;
      padding: 12px; 
      color: white; 
      outline: none;
      transition: 0.2s;
      
      &:focus { border-color: #ffcc00; }
    }
  }


`;

export const SignUpButton = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 46px;
  border: 1px solid #ffcc00;
  border-radius: 8px;
  background: transparent;
  color: #ffcc00;
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;

  &:hover {
    background: rgba(255, 204, 0, 0.08);
    color: #ffcc00;
  }
`;