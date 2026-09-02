export function HomeSkeleton() {
  return (
    <div className="w-full space-y-4 animate-fade-in select-none">
      {/* 4 Stat Metric Cards Rail Skeleton */}
      <div className="flex gap-2.5 overflow-x-hidden no-scrollbar pt-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex-1 min-w-[88px] h-[78px] rounded-[18px] bg-slate-100 p-2.5 flex flex-col justify-between"
          >
            <div className="w-7 h-7 rounded-full animate-shimmer" />
            <div className="space-y-1.5">
              <div className="w-8 h-4 rounded-md animate-shimmer" />
              <div className="w-14 h-2.5 rounded animate-shimmer" />
            </div>
          </div>
        ))}
      </div>

      {/* Section Header Skeleton */}
      <div className="flex items-center justify-between px-1 pt-2">
        <div className="w-32 h-4 rounded-md animate-shimmer" />
        <div className="w-14 h-3 rounded animate-shimmer" />
      </div>

      {/* Horizontal Work Items Cards Skeleton */}
      <div className="flex gap-3 overflow-x-hidden no-scrollbar pb-2">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="w-[260px] shrink-0 rounded-[20px] bg-white border border-slate-100 p-3.5 space-y-3 shadow-xs"
          >
            <div className="w-full h-[120px] rounded-[14px] animate-shimmer" />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-16 h-3 rounded-full animate-shimmer" />
                <div className="w-12 h-3 rounded-full animate-shimmer" />
              </div>
              <div className="w-4/5 h-4 rounded animate-shimmer" />
              <div className="w-3/5 h-3 rounded animate-shimmer" />
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-50">
              <div className="w-16 h-2.5 rounded animate-shimmer" />
              <div className="w-6 h-6 rounded-full animate-shimmer" />
            </div>
          </div>
        ))}
      </div>

      {/* Phase Progress Card Skeleton */}
      <div className="w-full rounded-[22px] bg-white border border-slate-100 p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="w-28 h-4 rounded animate-shimmer" />
          <div className="w-10 h-3 rounded animate-shimmer" />
        </div>
        <div className="w-full h-2 rounded-full animate-shimmer" />
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="h-10 rounded-xl bg-slate-50 animate-shimmer" />
          <div className="h-10 rounded-xl bg-slate-50 animate-shimmer" />
        </div>
      </div>
    </div>
  );
}

export function ListSkeleton() {
  return (
    <div className="w-full space-y-2.5 animate-fade-in select-none">
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div
          key={i}
          className="w-full min-h-[58px] py-3.5 px-4 rounded-[16px] bg-white border border-slate-100 flex items-center justify-between gap-3 shadow-2xs"
        >
          <div className="flex-1 space-y-2">
            {/* Title Line */}
            <div
              className="h-3.5 rounded-md animate-shimmer"
              style={{ width: `${60 + (i % 3) * 15}%` }}
            />
            {/* Subtitle / Metadata Line */}
            <div className="flex items-center gap-2">
              <div className="w-14 h-2.5 rounded animate-shimmer" />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
              <div className="w-16 h-2.5 rounded animate-shimmer" />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
              <div className="w-20 h-2.5 rounded animate-shimmer" />
            </div>
          </div>
          <div className="w-6 h-6 rounded-full animate-shimmer shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function PullIndicator({
  isPulling,
  isRefreshing,
  pullDistance,
}: {
  isPulling: boolean;
  isRefreshing: boolean;
  pullDistance: number;
}) {
  if (!isPulling && !isRefreshing) return null;

  return (
    <div
      className="flex items-center justify-center transition-all duration-150 overflow-hidden"
      style={{
        height: isRefreshing ? 48 : Math.min(pullDistance, 56),
        opacity: isRefreshing ? 1 : Math.min(pullDistance / 40, 1),
      }}
    >
      <div className="w-8 h-8 rounded-full bg-white shadow-md border border-slate-200/80 flex items-center justify-center text-[#0055ff]">
        {isRefreshing ? (
          <svg
            className="animate-spin"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        ) : (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: `rotate(${Math.min(pullDistance * 4, 180)}deg)`,
              transition: "transform 0.1s ease",
            }}
          >
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        )}
      </div>
    </div>
  );
}
