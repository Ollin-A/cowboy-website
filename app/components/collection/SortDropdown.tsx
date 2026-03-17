import {useSearchParams} from 'react-router';
import {useCallback} from 'react';

const SORT_OPTIONS = [
  {label: 'Newest', value: 'newest'},
  {label: 'Price: Low to High', value: 'price-asc'},
  {label: 'Price: High to Low', value: 'price-desc'},
  {label: 'Best Selling', value: 'best-selling'},
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]['value'];

export default function SortDropdown() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentSort = searchParams.get('sort') || 'newest';

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSearchParams(
        (prev) => {
          prev.set('sort', e.target.value);
          // Reset pagination when sort changes
          prev.delete('cursor');
          prev.delete('direction');
          return prev;
        },
        {preventScrollReset: false},
      );
    },
    [setSearchParams],
  );

  return (
    <div className="flex items-center gap-3">
      <label
        htmlFor="sort-select"
        className="font-body text-xs font-medium tracking-widest uppercase text-text/60 whitespace-nowrap"
      >
        Sort By
      </label>
      <select
        id="sort-select"
        value={currentSort}
        onChange={handleChange}
        className="font-body text-sm text-text bg-transparent border border-[#e5e5e5] px-3 py-2 pr-8 appearance-none cursor-pointer focus:outline-none focus:border-primary transition-colors duration-fast"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%233C3737' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.75rem center',
        }}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/** Map URL sort param to Storefront API sortKey + reverse */
export function parseSortParam(sort: string | null): {
  sortKey: string;
  reverse: boolean;
} {
  switch (sort) {
    case 'price-asc':
      return {sortKey: 'PRICE', reverse: false};
    case 'price-desc':
      return {sortKey: 'PRICE', reverse: true};
    case 'best-selling':
      return {sortKey: 'BEST_SELLING', reverse: false};
    case 'newest':
    default:
      return {sortKey: 'CREATED', reverse: true};
  }
}
