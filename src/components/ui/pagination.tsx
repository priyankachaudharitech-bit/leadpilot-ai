import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

const Pagination = React.forwardRef<HTMLDivElement, PaginationProps>(
  (
    {
      currentPage,
      totalPages,
      totalItems,
      pageSize,
      onPageChange,
      onPageSizeChange,
      pageSizeOptions = [10, 25, 50, 100],
      className,
    },
    ref
  ) => {
    const startItem = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    const pages = [];
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= halfVisible) {
        for (let i = 1; i <= maxVisiblePages - 2; i++) {
          pages.push(i);
        }
        pages.push(-1);
        pages.push(totalPages);
      } else if (currentPage >= totalPages - halfVisible) {
        pages.push(1);
        pages.push(-1);
        for (let i = totalPages - (maxVisiblePages - 3); i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push(-1);
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push(-1);
        pages.push(totalPages);
      }
    }

    const goToPage = (page: number) => {
      const safePage = Math.max(1, Math.min(page, totalPages));
      if (safePage !== currentPage) {
        onPageChange(safePage);
      }
    };

    return (
      <nav
        ref={ref}
        className={cn(
          'flex items-center justify-between px-2 py-4',
          'border-t border-border',
          className
        )}
        aria-label="Pagination"
      >
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span>
            Showing {startItem}-{endItem} of {totalItems}
          </span>
          {onPageSizeChange && (
            <>
              <span> | Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="ml-1 rounded border bg-background px-2 py-1 text-sm"
                aria-label="Rows per page"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>

        {totalPages > 0 && (
          <div className="flex items-center space-x-1">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className={cn(
                'rounded-md border border-input bg-background px-3 py-1 text-sm',
                'hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50'
              )}
              aria-label="Previous page"
            >
              Previous
            </button>

            {pages.map((page, index) =>
              page === -1 ? (
                <span key={`ellipsis-${index}`} className="px-2 text-sm">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={cn(
                    'rounded-md border border-input px-3 py-1 text-sm',
                    page === currentPage
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'hover:bg-accent'
                  )}
                  aria-label={`Page ${page}`}
                  aria-current={page === currentPage ? 'page' : undefined}
                >
                  {page}
                </button>
              )
            )}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className={cn(
                'rounded-md border border-input bg-background px-3 py-1 text-sm',
                'hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50'
              )}
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        )}
      </nav>
    );
  }
);
Pagination.displayName = 'Pagination';

export { Pagination };
