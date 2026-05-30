import styled from 'styled-components';

export const FieldContainer = styled.label<{ $fullWidth: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
  padding: 8px 15px;
  border: 1px solid #333;
  border-radius: 8px;
  background: #161616;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;

  .icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #888;
    line-height: 0;
    flex-shrink: 0;
  }

  &:focus-within {
    border-color: #00ff88;
    box-shadow: 0 0 0 2px rgba(0, 255, 136, 0.08);
  }
`;

export const FieldInput = styled.input`
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: #fff;

  &::placeholder {
    color: #888;
  }

  &[type='date'] {
    color-scheme: dark;
  }

  &::-webkit-calendar-picker-indicator {
    cursor: pointer;
    opacity: 0.85;
    filter: invert(1) brightness(0.7);
  }
`;