export default function DashboardLoading() {
  return (
    <div className="space-y-7 px-5 py-7 sm:px-8" aria-label="Loading dashboard">
      <div className="h-16 animate-pulse rounded-xl bg-white" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-xl border border-[#e4e7ec] bg-white"
          />
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="h-80 animate-pulse rounded-xl border border-[#e4e7ec] bg-white" />
        <div className="h-80 animate-pulse rounded-xl border border-[#e4e7ec] bg-white" />
      </div>
    </div>
  );
}
