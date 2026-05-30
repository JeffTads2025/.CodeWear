import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  gap: 0;
  background: #0a0a0a;
  overflow: visible;
`;

export const Content = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  margin-top: 104px;    /* Altura exata do Header */
  margin-left: 240px;  /* Largura exata da Sidebar */
  width: auto;
  min-height: calc(100vh - 104px);
  background: #0a0a0a;
  overflow-x: hidden;
  padding: 2rem;

  @media (max-width: 768px) {
    margin-top: 84px;
    margin-left: 0;
    width: 100%;
    padding: 1.25rem;
  }
`;