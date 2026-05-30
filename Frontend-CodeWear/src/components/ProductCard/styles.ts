import styled from 'styled-components';

export const ProductCard = styled.div`
  background: #161616;
  border-radius: 12px;
  border: 1px solid #222;
  overflow: hidden;
  transition: all 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
  height: 440px;

  @media (max-width: 768px) {
    height: auto;
    min-height: 100%;
  }

  &:hover {
    transform: translateY(-5px);
    border-color: #ffcc00;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
  }

  .image-container {
    height: 210px;
    overflow: hidden;
    background: #0d0d0d;
    position: relative;

    @media (max-width: 768px) {
      height: 180px;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease-in-out;
    }
  }

  &:hover .image-container img {
    transform: scale(1.08);
  }

  .content {
    padding: 14px;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;

    h3 {
      color: #fff;
      font-size: 1.05rem;
      margin-bottom: 6px;
      white-space: normal;
      overflow-wrap: anywhere;
      line-height: 1.35;
      font-weight: 700;
    }

    .description {
      color: #999;
      font-size: 0.8rem;
      margin-bottom: 12px;
      line-height: 1.4;
      height: 34px;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .availability {
      font-size: 11px;
      font-weight: bold;
      margin-bottom: 10px;
    }

    .size-selector {
      display: flex;
      gap: 6px;
      margin-bottom: 15px;
      justify-content: flex-start;
    }

    .footer-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid #222;
      padding-top: 12px;
      margin-top: auto;

      @media (max-width: 480px) {
        flex-direction: column;
        align-items: stretch;
        gap: 10px;
      }

      .price {
        color: #fff;
        font-weight: 800;
        font-size: 1.3rem;
      }
    }
  }
`;

export const AddButton = styled.button`
  background: #ffcc00;
  color: #000;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: bold;
  transition: all 0.3s;

  @media (max-width: 480px) {
    width: 100%;
    justify-content: center;
  }

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
