/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * Pagination utility hook
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import { ITEMS_PER_PAGE, MAX_VISIBLE_PAGES } from '@/config/constants';

interface UsePaginationProps {
    totalItems: number;
    itemsPerPage?: number;
}

export const usePagination = ({
    totalItems,
    itemsPerPage = ITEMS_PER_PAGE,
}: UsePaginationProps) => {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = useMemo(() => {
        return Math.ceil(totalItems / itemsPerPage);
    }, [totalItems, itemsPerPage]);

    // Reset to page 1 when total pages changes
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(1);
        }
    }, [totalPages, currentPage]);

    const getPageNumbers = useCallback(() => {
        const pages = [];
        const halfVisible = Math.floor(MAX_VISIBLE_PAGES / 2);

        let startPage = Math.max(1, currentPage - halfVisible);
        let endPage = Math.min(totalPages, startPage + MAX_VISIBLE_PAGES - 1);

        if (endPage - startPage + 1 < MAX_VISIBLE_PAGES) {
            startPage = Math.max(1, endPage - MAX_VISIBLE_PAGES + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages;
    }, [currentPage, totalPages]);

    const goToPage = useCallback((page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    }, [totalPages]);

    const nextPage = useCallback(() => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
        }
    }, [currentPage, totalPages]);

    const prevPage = useCallback(() => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    }, [currentPage]);

    return {
        currentPage,
        totalPages,
        setCurrentPage,
        goToPage,
        nextPage,
        prevPage,
        getPageNumbers,
    };
};
