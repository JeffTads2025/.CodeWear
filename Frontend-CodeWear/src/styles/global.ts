import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  html, body, #root {
    min-height: 100%;
    width: 100%;
  }

  :root {
    --background: #0b0e14;       /* Fundo escuro do Figma */
    --sidebar: #111720;          /* Cor da barra lateral */
    --card: #161d26;             /* Cor dos cards */
    --primary: #0d99ff;          /* Azul principal */
    --text-main: #ffffff;
    --text-secondary: #94a3b8;
    --success: #10b981;          /* Verde do "Em estoque" */
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Inter', sans-serif;
  }

  body {
    background-color: var(--background);
    color: var(--text-main);
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }

  button {
    cursor: pointer;
    transition: filter 0.2s;
    border: none;
    
    &:hover {
      filter: brightness(0.9);
    }
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  .Toastify__toast-container {
    z-index: 20000;
  }

  .Toastify__toast {
    border-radius: 12px;
  }
`;