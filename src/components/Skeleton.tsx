import clsx from 'clsx';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
}: SkeletonProps) {
  const baseClasses = 'bg-slate-700/50 animate-pulse';

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={clsx(baseClasses, variantClasses[variant], className)}
      style={style}
    />
  );
}

// Pre-built skeleton components for common use cases
export function SkeletonPost() {
  return (
    <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" height={16} className="w-32" />
          <Skeleton variant="text" height={12} className="w-24" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton variant="text" height={14} className="w-full" />
        <Skeleton variant="text" height={14} className="w-3/4" />
      </div>
      <Skeleton variant="rectangular" height={200} className="w-full" />
      <div className="flex gap-4 pt-2">
        <Skeleton variant="text" height={20} className="w-16" />
        <Skeleton variant="text" height={20} className="w-16" />
      </div>
    </div>
  );
}

export function SkeletonRoutineCard() {
  return (
    <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton variant="text" height={20} className="w-3/4" />
          <Skeleton variant="text" height={14} className="w-1/2" />
        </div>
        <Skeleton variant="rectangular" width={60} height={24} />
      </div>
      <div className="flex gap-2">
        <Skeleton variant="text" height={24} className="w-20" />
        <Skeleton variant="text" height={24} className="w-20" />
        <Skeleton variant="text" height={24} className="w-20" />
      </div>
    </div>
  );
}

export function SkeletonMessage() {
  return (
    <div className="flex items-center gap-3 p-4 bg-slate-900 rounded-lg border border-slate-800">
      <Skeleton variant="circular" width={48} height={48} />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" height={16} className="w-32" />
        <Skeleton variant="text" height={14} className="w-48" />
      </div>
      <Skeleton variant="text" height={12} className="w-16" />
    </div>
  );
}

export function SkeletonNotification() {
  return (
    <div className="flex items-start gap-3 p-3">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" height={14} className="w-full" />
        <Skeleton variant="text" height={12} className="w-24" />
      </div>
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 space-y-3">
      <Skeleton variant="text" height={14} className="w-24" />
      <Skeleton variant="text" height={32} className="w-16" />
      <Skeleton variant="text" height={12} className="w-32" />
    </div>
  );
}
