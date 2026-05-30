import styled from 'styled-components';

export const Container = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 104px;
  z-index: 1000;
  background: #0d0d0d;
  border-bottom: 1px solid #222;
  display: flex;
  align-items: center;
  padding: 0 2rem 0 0;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    height: 84px;
    padding: 0 1rem;
  }
`;

export const Content = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

export const MobileMenuButton = styled.button`
  display: none;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  border: 1px solid #222;
  background: #141414;
  color: #f5f5f5;
  margin-right: 0.75rem;

  @media (max-width: 768px) {
    display: inline-flex;
  }
`;

export const BrandBlock = styled.button`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
  width: 240px;
  height: 104px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  isolation: isolate;

  @media (max-width: 768px) {
    position: static;
    width: auto;
    height: auto;
    margin-right: auto;
  }
`;

export const SloganArea = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;

  @media (max-width: 1280px) {
    display: none;
  }
`;

export const Slogan = styled.p`
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0;
  color: #dcdcdc;
  font-size: 14px;
  line-height: 1.1;
  white-space: nowrap;
`;

export const HighlightWord = styled.span`
  background-color: #1a1a1a;
  border: 1px solid rgba(0, 255, 136, 0.28);
  border-radius: 999px;
  padding: 3px 11px;
  font-family: Consolas, Menlo, Monaco, monospace;
  font-weight: 400;
  color: #f1f1f1;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03), 0 0 14px rgba(0, 255, 136, 0.08);
`;

export const Ellipsis = styled.span`
  margin-left: 4px;
  color: #00ff88;
  font-family: Consolas, Menlo, Monaco, monospace;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  min-width: 28px;
  font-size: 20px;
  line-height: 1;

  @keyframes dotPulse {
    0% {
      opacity: 0.22;
      transform: translateY(0) scale(0.82);
      filter: blur(0.2px);
    }

    35% {
      opacity: 1;
      transform: translateY(-2px) scale(1.16);
      text-shadow: 0 0 12px rgba(0, 255, 136, 0.45);
      filter: blur(0);
    }

    70% {
      opacity: 0.65;
      transform: translateY(0) scale(0.96);
      text-shadow: 0 0 6px rgba(0, 255, 136, 0.16);
      filter: blur(0);
    }

    100% {
      opacity: 0.22;
      transform: translateY(0) scale(0.82);
      text-shadow: none;
      filter: blur(0.2px);
    }
  }
`;

export const Dot = styled.span`
  display: inline-block;
  line-height: 1;
  font-weight: 700;
  animation: dotPulse 1.35s cubic-bezier(0.22, 1, 0.36, 1) infinite;

  &:nth-child(2) {
    animation-delay: 0.18s;
  }

  &:nth-child(3) {
    animation-delay: 0.36s;
  }

  &:nth-child(1),
  &:nth-child(2),
  &:nth-child(3) {
    will-change: transform, opacity;
  }
`;

export const IconsArea = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-left: auto;

  @media (max-width: 768px) {
    gap: 0.5rem;
  }

  button {
    background: none;
    border: none;
    color: #888;
    cursor: pointer;
    display: flex;
    align-items: center;
    position: relative;
    transition: color 0.2s;

    &:hover {
      color: #00ff88;
    }

    span {
      margin-left: 8px;
      font-size: 0.9rem;
    }

    small {
      display: none;
    }

    &.cart .badge {
      position: absolute;
      top: -8px;
      right: -8px;
      background: #00ff88;
      color: #000;
      font-size: 0.7rem;
      font-weight: bold;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    &.user-greeting {
      color: #d9dee7;
      font-weight: 600;
      padding: 6px 10px;
      border-radius: 8px;

      span {
        color: #f3f4f6;
        font-weight: 700;
        font-size: 1rem;
      }

      &:hover {
        color: #00ff88;
      }

      @media (max-width: 768px) {
        padding: 6px 8px;

        span {
          display: none;
        }

        small {
          display: block;
          margin-left: 6px;
          font-size: 0.75rem;
          color: #c9ced6;
        }
      }
    }
  }

  .logout-btn {
    margin-left: 10px;

    &:hover {
      color: #ff4444;
    }
  }
`;

export const BrandImage = styled.img`
  width: 240px;
  height: 104px;
  object-fit: contain;
  border-radius: 0;
  display: block;
  flex-shrink: 0;
  margin: 0;
  padding: 6px 8px;
  border: 1px solid rgba(0, 255, 136, 0.16);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.02) 0%, rgba(0, 255, 136, 0.03) 100%);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.28), 0 0 18px rgba(0, 255, 136, 0.08);

  @media (max-width: 768px) {
    width: 132px;
    height: 56px;
    padding: 4px 6px;
  }
`;