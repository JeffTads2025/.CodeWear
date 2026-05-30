import styled, { css } from 'styled-components';
import type { ButtonV2Variant } from './index';

const variantStyles: Record<ButtonV2Variant, { border: string; glow: string; icon: string; background: string; color: string }> = {
    default: {
        border: '#00ff88',
        glow: 'rgba(0, 255, 136, 0.18)',
        icon: '#00ff88',
        background: '#161616',
        color: '#fff'
    },
    neutral: {
        border: '#3a4352',
        glow: 'rgba(148, 163, 184, 0.16)',
        icon: '#cbd5e1',
        background: '#161616',
        color: '#fff'
    },
    highlight: {
        border: '#ffcc00',
        glow: 'rgba(255, 204, 0, 0.18)',
        icon: '#000',
        background: '#ffcc00',
        color: '#000'
    }
};

const buttonVariant = ($variant: ButtonV2Variant) => {
    const palette = variantStyles[$variant];

    return css`
    border-color: ${palette.border};
    background: ${palette.background};
    color: ${palette.color};

    .icon {
      color: ${palette.icon};
    }

    &:focus-visible {
      box-shadow: 0 0 0 3px ${palette.glow};
    }
  `;
};

export const ButtonContainer = styled.button<{ $variant: ButtonV2Variant }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 15px;
  border-radius: 8px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  filter: none;

  ${({ $variant }) => buttonVariant($variant)}

  &:hover:not(:disabled) {
    filter: none;
  }

  &:active:not(:disabled) {
    box-shadow: none;
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    border-color: #2d2d2d;
    color: #7a7a7a;
    box-shadow: none;
  }

  .icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 0;
  }
`;