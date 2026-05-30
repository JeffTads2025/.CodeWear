import React from 'react';
import { FiLoader } from 'react-icons/fi';
import * as S from './styles';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ children, loading = false, ...rest }) => {
    return (
        <S.ButtonContainer disabled={loading || rest.disabled} {...rest}>
            {loading ? (
                <>
                    <FiLoader className="spinner" />
                    Carregando...
                </>
            ) : (
                children
            )}
        </S.ButtonContainer>
    );
};