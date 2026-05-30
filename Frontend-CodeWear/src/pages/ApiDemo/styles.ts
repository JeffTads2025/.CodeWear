import styled from 'styled-components';

export const Container = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
  background: #0a0a0a;
  min-height: 100vh;
  color: #fff;
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #333;

  .icon-bg {
    width: 60px;
    height: 60px;
    background: #ffcc00;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: #000;
  }

  h2 {
    color: #fff;
    margin: 0;
    font-size: 2rem;
  }

  p {
    color: #999;
    margin: 5px 0 0 0;
    font-size: 1rem;
  }

  @media (max-width: 700px) {
    align-items: flex-start;

    h2 {
      font-size: 1.5rem;
    }
  }
`;

export const Content = styled.div`
  background: #161616;
  border-radius: 12px;
  padding: 30px;
  border: 1px solid #222;

  h3 {
    color: #ffcc00;
    margin-bottom: 15px;
    font-size: 1.2rem;
  }

  pre {
    color: #fff;
    font-family: 'Courier New', monospace;
  }

  .tab-list,
  .button-row {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .tab-list {
    margin-bottom: 20px;
  }

  .actions-panel {
    margin-bottom: 20px;
  }

  .action-card {
    margin-bottom: 20px;
    padding: 15px;
    background: #1a1a1a;
    border-radius: 8px;
  }

  .fields-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 10px;
    margin-bottom: 10px;
  }

  .fields-grid.two-columns {
    grid-template-columns: 1fr 1fr;
  }

  .inline-fields {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 10px;
    flex-wrap: wrap;
  }

  .json-output {
    margin-top: 20px;
  }

  .json-output pre {
    background: #1a1a1a;
    padding: 15px;
    border-radius: 8px;
    font-size: 12px;
    overflow: auto;
    max-height: 400px;
  }

  input,
  textarea {
    min-width: 0;
  }

  @media (max-width: 700px) {
    padding: 20px;

    .tab-list > button,
    .button-row > button {
      width: 100%;
    }

    .fields-grid.two-columns {
      grid-template-columns: 1fr;
    }

    .inline-fields > * {
      width: 100%;
    }
  }
`;