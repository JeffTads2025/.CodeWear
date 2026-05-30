import type { ButtonHTMLAttributes, ReactNode } from 'react';
import * as S from './styles';

export type ButtonV2Variant = 'default' | 'neutral' | 'highlight';

interface ButtonV2Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
    label: string;
    icon?: ReactNode;
    variant?: ButtonV2Variant;
}

export function ButtonV2({
    label,
    icon,
    variant = 'default',
    type = 'button',
    ...rest
}: ButtonV2Props) {
    return (
        <S.ButtonContainer type={type} $variant={variant} {...rest}>
            {icon ? <span className="icon">{icon}</span> : null}
            <span>{label}</span>
        </S.ButtonContainer>
    );
}