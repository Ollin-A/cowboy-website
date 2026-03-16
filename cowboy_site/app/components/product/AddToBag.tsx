import {useState, useEffect, useCallback} from 'react';

type AddToBagState = 'default' | 'disabled' | 'loading' | 'added';

interface AddToBagProps {
  /** Whether a size/variant has been selected */
  sizeSelected: boolean;
  /** Whether the selected variant is available for purchase */
  available: boolean;
  /** Called when user clicks Add to Bag */
  onAddToBag: () => void;
  /** Pass true while the add-to-cart request is in flight */
  isLoading?: boolean;
  /** Pass true briefly after a successful add to show confirmation */
  isAdded?: boolean;
}

export default function AddToBag({
  sizeSelected,
  available,
  onAddToBag,
  isLoading = false,
  isAdded = false,
}: AddToBagProps) {
  const [showAdded, setShowAdded] = useState(false);

  // Brief "Added" confirmation, then revert
  useEffect(() => {
    if (isAdded) {
      setShowAdded(true);
      const timer = setTimeout(() => setShowAdded(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isAdded]);

  const getState = useCallback((): AddToBagState => {
    if (isLoading) return 'loading';
    if (showAdded) return 'added';
    if (!sizeSelected || !available) return 'disabled';
    return 'default';
  }, [isLoading, showAdded, sizeSelected, available]);

  const state = getState();

  const labelMap: Record<AddToBagState, string> = {
    default: 'Add to Bag',
    disabled: !available ? 'Sold Out' : 'Select a Size',
    loading: 'Adding...',
    added: 'Added',
  };

  return (
    <button
      type="button"
      onClick={onAddToBag}
      disabled={state === 'disabled' || state === 'loading'}
      aria-busy={state === 'loading'}
      className={[
        'w-full py-4 px-8 font-body font-medium text-sm tracking-widest uppercase',
        'border-none cursor-pointer transition-all duration-fast',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        'flex items-center justify-center gap-2',
        // State-based styles
        state === 'default'
          ? 'bg-primary text-white hover:bg-primary/90'
          : '',
        state === 'disabled'
          ? 'bg-primary/30 text-white/70 cursor-not-allowed'
          : '',
        state === 'loading'
          ? 'bg-primary text-white cursor-wait'
          : '',
        state === 'added'
          ? 'bg-primary text-white'
          : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {state === 'loading' && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      {state === 'added' && (
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}

      {labelMap[state]}
    </button>
  );
}
