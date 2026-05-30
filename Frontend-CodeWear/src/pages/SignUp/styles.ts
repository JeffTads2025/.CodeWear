import styled from 'styled-components';

export const Container = styled.div`
  /* Garante que o fundo ocupe 100% da viewport e centralize o conteúdo */
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0a0a0a;
  padding: 15px; /* Padding externo reduzido para telas menores */
  
  /* Remove scroll da página principal para fixar o formulário */
  overflow: hidden;

  @media (max-height: 700px) {
    /* Se a tela for muito baixa (ex: celular deitado), permite scroll para não cortar */
    overflow-y: auto;
    align-items: flex-start;
    padding-top: 20px;
  }
`;

export const Content = styled.div`
  width: 100%;
  /* Aumentamos a largura máxima para acomodar as 2 colunas */
  max-width: 700px;
  display: flex;
  flex-direction: column;
  /* Espaçamento entre o logo e o card reduzido para compactar */
  gap: 15px;
`;

export const LogoSection = styled.div`
  text-align: center;
  
  .icon-box {
    background: #ffcc00;
    width: 40px; /* Reduzido de 60px */
    height: 40px; /* Reduzido de 60px */
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 8px; /* Margem inferior reduzida */
    color: #000;
    font-size: 20px;
  }

  h1 {
    color: white;
    font-size: 24px; /* Reduzido de 32px */
    margin: 0;
    letter-spacing: -1px;
  }

  p {
    color: #ffcc00;
    font-size: 13px; /* Reduzido de 16px */
    font-weight: 700;
    letter-spacing: 0.04em;
    margin-top: 2px;
  }
`;

export const FormCard = styled.form`
  background: #161616;
  border-radius: 16px;
  border: 1px solid #222;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);

  /* Ativa o Grid System para 2 colunas */
  display: grid;
  grid-template-columns: 1fr 1fr; /* Duas colunas iguais */
  gap: 12px 20px; /* Espaço entre linhas (reduzido) e colunas */
  
  /* Padding interno compactado */
  padding: 24px 30px;

  h2 {
    /* O título ocupa as duas colunas */
    grid-column: 1 / -1;
    color: white;
    font-size: 20px; /* Reduzido de 24px */
    text-align: center;
    margin-bottom: 5px; /* Margem inferior reduzida */
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 6px; /* Espaço interno do grupo reduzido */

    /* Classe auxiliar para campos que devem ocupar a linha inteira */
    &.full-width {
      grid-column: 1 / -1;
    }

    label {
      color: #666;
      font-size: 12px; /* Reduzido de 14px */
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 700;
    }

    input {
      background: #0d0d0d;
      border: 1px solid #2a2a2a;
      border-radius: 8px;
      padding: 10px; /* Padding interno do input reduzido */
      color: white;
      font-size: 13px; /* Reduzido de 14px */
      outline: none;
      transition: border-color 0.2s;

      &::placeholder {
        color: #666;
      }

      &:focus {
        border-color: #ffcc00;
      }
    }
  }

  .back-link {
    /* Link ocupa a linha inteira */
    grid-column: 1 / -1;
    color: #999;
    text-decoration: none;
    font-size: 13px; /* Reduzido de 14px */
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-top: 8px; /* Margem superior reduzida */
    transition: color 0.2s;

    &:hover {
      color: white;
    }
  }

  > button {
    grid-column: 1 / -1;
    width: 100%;
    margin-top: 4px;
  }

  /* Responsividade: Volta para uma coluna em telas de celular */
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    padding: 20px;
    
    .input-group {
      grid-column: 1 / -1;
    }
  }
`;