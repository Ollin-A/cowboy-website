type SkeletonVariant = 'text' | 'image' | 'card';

interface SkeletonProps {
  variant?: SkeletonVariant;
  className?: string;
}

const variantStyles: Record<SkeletonVariant, string> = {
  text: 'h-4 w-3/4 rounded',
  image: 'w-full rounded aspect-square',
  card: 'w-full rounded-lg',
};

export default function Skeleton({variant = 'text', className = ''}: SkeletonProps) {
  if (variant === 'card') {
    return (
      <div className={`${variantStyles.card} ${className}`}>
        <div className="skeleton-shimmer aspect-[3/4] rounded-lg mb-3" />
        <div className="skeleton-shimmer h-4 w-3/4 rounded mb-2" />
        <div className="skeleton-shimmer h-4 w-1/3 rounded" />
      </div>
    );
  }

  return (
    <div
      className={`skeleton-shimmer ${variantStyles[variant]} ${className}`}
    />
  );
}
