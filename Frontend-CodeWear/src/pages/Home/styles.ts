import styled from 'styled-components';

export const Container = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
  background: transparent;
  min-height: 100%;
`;

export const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(205px, 1fr));
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 14px;
  }

  @media (max-width: 420px) {
    grid-template-columns: 1fr;
  }
`;

export const EmptyState = styled.div`
  min-height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #cfcfcf;
  font-size: 1rem;
  border: 1px solid #1f1f1f;
  border-radius: 16px;
  background: #111111;
`;

export const ImageModalOverlay = styled.div<{ $active: boolean }>`
  display: ${props => (props.$active ? 'flex' : 'none')};
  position: fixed;
  top: 0; 
  left: 0; 
  right: 0; 
  bottom: 0;
  background: rgba(0, 0, 0, 0.96);
  z-index: 9999;
  align-items: center;
  justify-content: center;
  padding: 20px;

  img {
    max-width: 95%;
    max-height: 95vh;
    border-radius: 12px;
    border: 1px solid #333;
    box-shadow: 0 0 50px rgba(0,0,0,0.9);
  }
`;