import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import * as S from './styles';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <S.Container>
      <S.Button onClick={handlePrev} disabled={currentPage === 1}>
        <FiChevronLeft size={20} />
      </S.Button>

      <S.PageInfo>
        {currentPage} / {totalPages}
      </S.PageInfo>

      <S.Button onClick={handleNext} disabled={currentPage === totalPages}>
        <FiChevronRight size={20} />
      </S.Button>
    </S.Container>
  );
};