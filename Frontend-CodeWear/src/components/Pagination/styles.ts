import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
`;

export const Button = styled.button`
  background: #ffcc00;
  color: #000;
  border: none;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;

  &:hover:not(:disabled) {
    background: #e6b800;
    transform: scale(1.05);
  }

  &:disabled {
    background: #333;
    color: #666;
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

export const PageInfo = styled.span`
  color: #fff;
  font-weight: bold;
  font-size: 16px;
  min-width: 60px;
  text-align: center;
`;