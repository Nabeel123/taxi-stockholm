export default function BookLoading() {
  return (
    <div className="min-h-screen bg-[var(--dark-slate)]">
      <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="h-5 w-32 animate-pulse rounded bg-white/10 mb-6" />
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6">
          <div className="h-7 w-48 animate-pulse rounded bg-white/10" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded bg-white/5" />
          <div className="mt-8 space-y-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-white/5" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
