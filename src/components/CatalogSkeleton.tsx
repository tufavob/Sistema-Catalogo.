export function CatalogSkeleton() {
  return (
    <section
      className="mx-auto w-full max-w-7xl animate-pulse px-4 pb-14 sm:px-6 sm:pb-16"
      aria-hidden="true"
    >
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-hidden px-4 sm:-mx-6 sm:px-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <span key={index} className="h-10 w-24 shrink-0 rounded-full bg-zinc-200" />
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white"
          >
            <div className="aspect-[4/5] bg-zinc-100" />
            <div className="space-y-2 p-3 sm:p-4">
              <div className="h-4 w-4/5 rounded-full bg-zinc-200" />
              <div className="h-3 w-1/2 rounded-full bg-zinc-200" />
              <div className="h-3 w-1/3 rounded-full bg-zinc-200" />
              <div className="h-11 w-full rounded-2xl bg-zinc-200" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
