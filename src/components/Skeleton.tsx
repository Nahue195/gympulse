import clsx from 'clsx';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className, variant = 'rectangular', width, height }: SkeletonProps) {
  const style: React.CSSProperties = {
    width:  typeof width  === 'number' ? `${width}px`  : width,
    height: typeof height === 'number' ? `${height}px` : height,
    background: 'linear-gradient(90deg, var(--surface) 25%, var(--surface-3) 50%, var(--surface) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s linear infinite',
    borderRadius: variant === 'circular' ? '9999px' : variant === 'text' ? '2px' : '2px',
  };
  return <div className={clsx('block', className)} style={style} />;
}

export function SkeletonPost() {
  return (
    <div className="gp-card p-4 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={44} height={44} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" height={14} className="w-32" />
          <Skeleton variant="text" height={11} className="w-24" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton variant="text" height={13} className="w-full" />
        <Skeleton variant="text" height={13} className="w-3/4" />
      </div>
      <Skeleton variant="rectangular" height={180} className="w-full" />
      <div className="flex gap-4">
        <Skeleton variant="text" height={18} className="w-14" />
        <Skeleton variant="text" height={18} className="w-14" />
      </div>
    </div>
  );
}

export function SkeletonRoutineCard() {
  return (
    <div className="gp-card p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton variant="text" height={18} className="w-3/4" />
          <Skeleton variant="text" height={13} className="w-1/2" />
        </div>
        <Skeleton variant="rectangular" width={56} height={22} />
      </div>
      <div className="flex gap-2">
        <Skeleton variant="text" height={22} className="w-20" />
        <Skeleton variant="text" height={22} className="w-20" />
      </div>
    </div>
  );
}

export function SkeletonMessage() {
  return (
    <div className="flex items-center gap-3 p-4 gp-card">
      <Skeleton variant="circular" width={44} height={44} />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" height={14} className="w-32" />
        <Skeleton variant="text" height={12} className="w-48" />
      </div>
      <Skeleton variant="text" height={11} className="w-14" />
    </div>
  );
}

export function SkeletonNotification() {
  return (
    <div className="flex items-start gap-3 p-3">
      <Skeleton variant="circular" width={38} height={38} />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" height={13} className="w-full" />
        <Skeleton variant="text" height={11} className="w-24" />
      </div>
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="gp-card p-4 space-y-3">
      <Skeleton variant="text" height={12} className="w-24" />
      <Skeleton variant="text" height={28} className="w-16" />
      <Skeleton variant="text" height={11} className="w-32" />
    </div>
  );
}
