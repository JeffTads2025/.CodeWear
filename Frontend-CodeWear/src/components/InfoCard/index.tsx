import type { ReactNode } from 'react';
import * as S from './styles';

interface InfoCardProps {
    value?: ReactNode;
    children?: ReactNode;
}

export function InfoCard({ value, children }: InfoCardProps) {
    return (
        <S.Container>
            <S.Content>{children ?? value ?? '---'}</S.Content>
        </S.Container>
    );
}