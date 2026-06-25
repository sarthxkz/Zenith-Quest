'use client';

export default function LoadingSkeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="glass-card-static p-6 space-y-4">
          <LoadingSkeleton className="h-5 w-1/3" />
          <LoadingSkeleton className="h-32 w-full" />
          <LoadingSkeleton className="h-4 w-2/3" />
          <LoadingSkeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="glass-card-static p-6 space-y-4">
      <LoadingSkeleton className="h-5 w-1/3" />
      <LoadingSkeleton className="h-20 w-full" />
      <LoadingSkeleton className="h-4 w-2/3" />
    </div>
  );
}
