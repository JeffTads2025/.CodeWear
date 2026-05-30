import styled from 'styled-components';

export const Container = styled.div`
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  gap: 32px; 
  width: 100%;
  max-width: 1200px; 
  margin: 0 auto; 
  padding: 0;
  background: transparent;
  min-height: 100%;
`;

export const Header = styled.header`
  display: flex; 
  align-items: center; 
  gap: 16px;
  width: 100%;
  max-width: 800px;

  @media (max-width: 600px) {
    align-items: flex-start;
  }

  .icon-bg { 
    background: #ffcc00; 
    padding: 12px; 
    border-radius: 12px; 
    color: #000; 
    display: flex; 
    font-size: 24px; 
  }
  
  h2 { color: white; margin: 0; font-size: 28px; font-weight: 700; } 
  p { color: #999; margin: 4px 0 0 0; }
`;

export const Content = styled.div`
  display: flex; 
  flex-direction: column;
  align-items: center; 
  gap: 32px;
  width: 100%;
`;

export const ProfileCard = styled.div`
  background: #161616; 
  border: 1px solid #222; 
  padding: 32px; 
  border-radius: 16px;
  width: 100%;
  max-width: 800px;

  @media (max-width: 600px) {
    padding: 20px;
  }

  .card-header {
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    margin-bottom: 30px;

    @media (max-width: 600px) {
      flex-direction: column;
      align-items: stretch;
      gap: 14px;
    }

    h3 { color: white; margin: 0; font-weight: 700; }
    
    .actions {
      display: flex;
      gap: 12px;

      @media (max-width: 600px) {
        flex-direction: column;
      }
    }
  }
`;

export const InfoGroup = styled.div`
  display: grid; 
  grid-template-columns: 1fr 1fr; 
  gap: 24px;

  @media (max-width: 600px) { grid-template-columns: 1fr; }

  .field {
    display: flex; 
    flex-direction: column; 
    gap: 8px;

    label { color: #666; font-size: 13px; display: flex; align-items: center; gap: 6px; font-weight: bold; }
    
    p { 
      color: white; 
      font-size: 15px; 
      margin: 0; 
      background: #0d0d0d; 
      padding: 12px; 
      border-radius: 8px; 
      border: 1px solid #222;
      &.disabled-field { color: #555; background: rgba(0,0,0,0.2); }
    }

    input, textarea { 
      background: #0d0d0d; 
      border: 1px solid #2a2a2a; 
      border-radius: 8px; 
      padding: 12px; 
      color: white; 
      width: 100%;
      outline: none;
      transition: border-color 0.2s;
      &:focus { border-color: #ffcc00; }
    }
  }
  .full-width { grid-column: 1 / -1; }
`;