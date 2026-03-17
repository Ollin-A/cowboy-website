import {useSearchParams} from 'react-router';
import {useCallback} from 'react';

const FILTER_KEYS = ['size', 'color', 'price', 'material'] as const;

const FILTER_LABELS: Record<string, string> = {
  size: 'Size',
  color: 'Color',
  price: 'Price',
  material: 'Material',
};

interface ActiveFilter {
  paramKey: string;
  value: string;
}

export default function ActiveFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeFilters: ActiveFilter[] = [];
  FILTER_KEYS.forEach((key) => {
    const values = searchParams.get(key);
    if (values) {
      values.split(',').forEach((value) => {
        activeFilters.push({paramKey: key, value});
      });
    }
  });

  const removeFilter = useCallback(
    (paramKey: string, value: string) => {
      setSearchParams(
        (prev) => {
          const current = prev.get(paramKey);
          if (!current) return prev;

          const values = current.split(',').filter((v) => v !== value);
          if (values.length > 0) {
            prev.set(paramKey, values.join(','));
          } else {
            prev.delete(paramKey);
          }
          // Reset pagination
          prev.delete('cursor');
          prev.delete('direction');
          return prev;
        },
        {preventScrollReset: false},
      );
    },
    [setSearchParams],
  );

  const clearAll = useCallback(() => {
    setSearchParams(
      (prev) => {
        FILTER_KEYS.forEach((key) => prev.delete(key));
        prev.delete('cursor');
        prev.delete('direction');
        return prev;
      },
      {preventScrollReset: false},
    );
  }, [setSearchParams]);

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {activeFilters.map((filter) => (
        <span
          key={`${filter.paramKey}-${filter.value}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 border border-primary/15 text-xs font-body font-medium text-text"
        >
          <span className="text-text/50">{FILTER_LABELS[filter.paramKey]}:</span>
          {filter.value}
          <button
            type="button"
            onClick={() => removeFilter(filter.paramKey, filter.value)}
            className="ml-0.5 text-text/40 hover:text-primary transition-colors duration-fast cursor-pointer bg-transparent border-none p-0 text-sm leading-none"
            aria-label={`Remove ${FILTER_LABELS[filter.paramKey]}: ${filter.value} filter`}
          >
            &times;
          </button>
        </span>
      ))}

      <button
        type="button"
        onClick={clearAll}
        className="font-body text-xs text-text/50 hover:text-text underline bg-transparent border-none cursor-pointer ml-1"
      >
        Clear All
      </button>
    </div>
  );
}
