'use client';

import { useState, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import type { FilterState, PaginationState } from '@/lib/types';

const DEFAULT_FILTERS: FilterState = {
  searchTerm: '',
  classFilter: '',
  shiftFilter: '',
  dateFrom: '',
  dateTo: '',
  severityFilter: '',
  showArchived: false,
};

const DEFAULT_PAGINATION: PaginationState = {
  page: 1,
  pageSize: 20,
  total: 0,
};

interface UseFiltersOptions {
  persistToUrl?: boolean;
  defaultPageSize?: number;
}

export function useFilters<T>(
  items: T[],
  filterFn: (item: T, filters: FilterState) => boolean,
  options: UseFiltersOptions = {}
) {
  const { persistToUrl = false, defaultPageSize = 20 } = options;
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize filters from URL if persistToUrl is enabled
  const initialFilters = useMemo(() => {
    if (!persistToUrl) return DEFAULT_FILTERS;
    
    return {
      searchTerm: searchParams.get('q') || '',
      classFilter: searchParams.get('class') || '',
      shiftFilter: searchParams.get('shift') || '',
      dateFrom: searchParams.get('from') || '',
      dateTo: searchParams.get('to') || '',
      severityFilter: (searchParams.get('severity') as FilterState['severityFilter']) || '',
      showArchived: searchParams.get('archived') === 'true',
    };
  }, [searchParams, persistToUrl]);

  const [filters, setFiltersState] = useState<FilterState>(initialFilters);
  const [pagination, setPagination] = useState<PaginationState>({
    ...DEFAULT_PAGINATION,
    pageSize: defaultPageSize,
  });

  // Update URL when filters change
  const updateUrl = useCallback((newFilters: FilterState) => {
    if (!persistToUrl) return;
    
    const params = new URLSearchParams();
    if (newFilters.searchTerm) params.set('q', newFilters.searchTerm);
    if (newFilters.classFilter) params.set('class', newFilters.classFilter);
    if (newFilters.shiftFilter) params.set('shift', newFilters.shiftFilter);
    if (newFilters.dateFrom) params.set('from', newFilters.dateFrom);
    if (newFilters.dateTo) params.set('to', newFilters.dateTo);
    if (newFilters.severityFilter) params.set('severity', newFilters.severityFilter);
    if (newFilters.showArchived) params.set('archived', 'true');
    
    const queryString = params.toString();
    router.replace(`${pathname}${queryString ? `?${queryString}` : ''}`, { scroll: false });
  }, [pathname, router, persistToUrl]);

  const setFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFiltersState(prev => {
      const updated = { ...prev, ...newFilters };
      updateUrl(updated);
      return updated;
    });
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [updateUrl]);

  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
    updateUrl(DEFAULT_FILTERS);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [updateUrl]);

  // Apply filters to items
  const filteredItems = useMemo(() => {
    return items.filter(item => filterFn(item, filters));
  }, [items, filters, filterFn]);

  // Apply pagination
  const paginatedItems = useMemo(() => {
    const start = (pagination.page - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    return filteredItems.slice(start, end);
  }, [filteredItems, pagination.page, pagination.pageSize]);

  // Update total when filtered items change
  const total = filteredItems.length;
  const totalPages = Math.ceil(total / pagination.pageSize);

  const goToPage = useCallback((page: number) => {
    setPagination(prev => ({
      ...prev,
      page: Math.max(1, Math.min(page, totalPages)),
    }));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    goToPage(pagination.page + 1);
  }, [pagination.page, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(pagination.page - 1);
  }, [pagination.page, goToPage]);

  const setPageSize = useCallback((pageSize: number) => {
    setPagination(prev => ({
      ...prev,
      pageSize,
      page: 1,
    }));
  }, []);

  return {
    // Filters
    filters,
    setFilters,
    resetFilters,
    
    // Pagination
    pagination: { ...pagination, total, totalPages },
    goToPage,
    nextPage,
    prevPage,
    setPageSize,
    
    // Results
    filteredItems,
    paginatedItems,
    
    // Counts
    totalCount: items.length,
    filteredCount: filteredItems.length,
  };
}

// Specialized filter functions
export function studentFilter(student: { name: string; class: string; archived?: boolean }, filters: FilterState): boolean {
  if (!filters.showArchived && student.archived) return false;
  if (filters.classFilter && student.class !== filters.classFilter) return false;
  
  const term = filters.searchTerm.toLowerCase();
  if (term && !student.name.toLowerCase().includes(term) && !student.class.toLowerCase().includes(term)) {
    return false;
  }
  
  return true;
}

export function occurrenceFilter(
  occurrence: { date: string; archived?: boolean; studentId: string },
  filters: FilterState,
  students: { id: string; class: string }[],
  rules: { code: number; severity: string }[],
  ruleCode: number
): boolean {
  if (!filters.showArchived && occurrence.archived) return false;
  
  // Date range filter
  if (filters.dateFrom && occurrence.date < filters.dateFrom) return false;
  if (filters.dateTo && occurrence.date > filters.dateTo) return false;
  
  // Class filter (via student)
  if (filters.classFilter) {
    const student = students.find(s => s.id === occurrence.studentId);
    if (!student || student.class !== filters.classFilter) return false;
  }
  
  // Severity filter
  if (filters.severityFilter) {
    const rule = rules.find(r => r.code === ruleCode);
    if (!rule || rule.severity !== filters.severityFilter) return false;
  }
  
  return true;
}
