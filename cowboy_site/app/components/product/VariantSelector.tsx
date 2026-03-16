import type {GalleryImage} from './ProductGallery';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface VariantOption {
  /** e.g. "Color", "Size", "Fit" */
  name: string;
  values: VariantOptionValue[];
}

export interface VariantOptionValue {
  value: string;
  /** Whether this option value is available for purchase */
  available: boolean;
  /** Optional: show "Only X left" when stock is low */
  quantityAvailable?: number;
  /** Low-stock threshold — shows indicator when quantityAvailable ≤ this */
  lowStockThreshold?: number;
  /** Thumbnail image for visual selectors (color/wash/print) */
  image?: {
    src: string;
    alt: string;
  };
  /** Gallery images for this variant — passed up on selection to swap gallery */
  galleryImages?: GalleryImage[];
}

export interface SelectedVariant {
  [optionName: string]: string;
}

interface VariantSelectorProps {
  options: VariantOption[];
  selected: SelectedVariant;
  onSelect: (optionName: string, value: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function VariantSelector({
  options,
  selected,
  onSelect,
}: VariantSelectorProps) {
  if (options.length === 0) return null;

  return (
    <div className="flex flex-col gap-6">
      {options.map((option) => {
        const isVisual = option.values.some((v) => v.image);
        const selectedValue = selected[option.name] ?? '';

        return (
          <fieldset key={option.name} className="border-none p-0 m-0">
            <legend className="font-body text-sm font-medium tracking-wide text-text mb-3">
              {option.name}
              {selectedValue && (
                <span className="font-normal text-text/60 ml-2">
                  — {selectedValue}
                </span>
              )}
            </legend>

            <div
              className={
                isVisual
                  ? 'flex flex-wrap gap-2'
                  : 'grid grid-cols-4 sm:grid-cols-5 gap-2'
              }
              role="radiogroup"
              aria-label={`Select ${option.name}`}
            >
              {option.values.map((optValue) => {
                const isSelected = selectedValue === optValue.value;
                const isUnavailable = !optValue.available;
                const isLowStock =
                  optValue.available &&
                  optValue.quantityAvailable != null &&
                  optValue.lowStockThreshold != null &&
                  optValue.quantityAvailable <= optValue.lowStockThreshold;

                if (isVisual && optValue.image) {
                  return (
                    <VisualSwatch
                      key={optValue.value}
                      value={optValue.value}
                      image={optValue.image}
                      isSelected={isSelected}
                      isUnavailable={isUnavailable}
                      isLowStock={isLowStock}
                      quantityAvailable={optValue.quantityAvailable}
                      onSelect={() => onSelect(option.name, optValue.value)}
                    />
                  );
                }

                return (
                  <TextSwatch
                    key={optValue.value}
                    value={optValue.value}
                    isSelected={isSelected}
                    isUnavailable={isUnavailable}
                    isLowStock={isLowStock}
                    quantityAvailable={optValue.quantityAvailable}
                    onSelect={() => onSelect(option.name, optValue.value)}
                  />
                );
              })}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Visual Swatch (thumbnail image — for color/wash/print)
// ---------------------------------------------------------------------------

function VisualSwatch({
  value,
  image,
  isSelected,
  isUnavailable,
  isLowStock,
  quantityAvailable,
  onSelect,
}: {
  value: string;
  image: {src: string; alt: string};
  isSelected: boolean;
  isUnavailable: boolean;
  isLowStock: boolean;
  quantityAvailable?: number;
  onSelect: () => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        role="radio"
        aria-checked={isSelected}
        aria-label={`${value}${isUnavailable ? ' — Sold out' : ''}${isLowStock ? ` — Only ${quantityAvailable} left` : ''}`}
        onClick={onSelect}
        disabled={isUnavailable}
        className={[
          'relative w-16 h-20 overflow-hidden p-0 cursor-pointer bg-transparent',
          'border-2 transition-all duration-fast',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          isSelected
            ? 'border-primary'
            : 'border-transparent hover:border-primary/40',
          isUnavailable
            ? 'opacity-40 cursor-not-allowed grayscale'
            : '',
        ].join(' ')}
      >
        <img
          src={image.src}
          alt={image.alt}
          className="w-full h-full object-cover"
          loading="lazy"
          width={64}
          height={80}
        />
        {/* Strikethrough line for unavailable */}
        {isUnavailable && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            aria-hidden="true"
          >
            <div className="w-[120%] h-[1px] bg-text/60 rotate-[-30deg]" />
          </div>
        )}
      </button>
      {isLowStock && quantityAvailable != null && (
        <span className="block text-center font-body text-[10px] text-[#D40000] mt-1">
          Only {quantityAvailable} left
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Text Swatch (for size, fit, length)
// ---------------------------------------------------------------------------

function TextSwatch({
  value,
  isSelected,
  isUnavailable,
  isLowStock,
  quantityAvailable,
  onSelect,
}: {
  value: string;
  isSelected: boolean;
  isUnavailable: boolean;
  isLowStock: boolean;
  quantityAvailable?: number;
  onSelect: () => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        role="radio"
        aria-checked={isSelected}
        aria-label={`${value}${isUnavailable ? ' — Sold out' : ''}${isLowStock ? ` — Only ${quantityAvailable} left` : ''}`}
        onClick={onSelect}
        disabled={isUnavailable}
        className={[
          'w-full py-3 px-2 font-body text-sm text-center cursor-pointer',
          'border transition-all duration-fast',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          isSelected
            ? 'border-primary bg-primary text-white'
            : 'border-primary/20 bg-transparent text-text hover:border-primary/60',
          isUnavailable
            ? 'opacity-40 cursor-not-allowed line-through decoration-text/40'
            : '',
        ].join(' ')}
      >
        {value}
      </button>
      {isLowStock && quantityAvailable != null && (
        <span className="block text-center font-body text-[10px] text-[#D40000] mt-1">
          Only {quantityAvailable} left
        </span>
      )}
    </div>
  );
}
