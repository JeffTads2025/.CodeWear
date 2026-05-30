import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export const ButtonContainer = styled.button`
  background: #ffcc00; /* Mesma cor amarela do Login */
  color: #000; /* Texto preto */
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-weight: 800;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: 0.2s;

  &:hover:not(:disabled) {
    background: #e6b800; /* Mesmo hover do Login */
    transform: scale(1.02);
  }

  &:disabled {
    background: #333; /* Mesmo disabled do Login */
    color: #666;
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .spinner {
    animation: ${spin} 1s linear infinite;
    font-size: 16px;
  }
`;