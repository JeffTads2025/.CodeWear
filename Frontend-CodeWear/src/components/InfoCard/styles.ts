import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
  min-width: 0;
  padding: 0;
  border-radius: 0;
  border: none;
  background: transparent;
`;

export const Content = styled.div`
  color: #fff;
  font-size: 0.84rem;
  line-height: 1.35;
  word-break: break-word;

  strong {
    color: #fff;
  }
`;