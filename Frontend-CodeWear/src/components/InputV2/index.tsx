import type { InputHTMLAttributes, ReactNode } from 'react';
import * as S from './styles';

interface InputV2Props extends InputHTMLAttributes<HTMLInputElement> {
    icon?: ReactNode;
    fullWidth?: boolean;
}

export function InputV2({ icon, fullWidth = false, ...rest }: InputV2Props) {
    return (
        <S.FieldContainer $fullWidth={fullWidth}>
            {icon ? <span className="icon">{icon}</span> : null}
            <S.FieldInput {...rest} />
        </S.FieldContainer>
    );
}