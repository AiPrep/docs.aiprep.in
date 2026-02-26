import { Skeleton } from "@/components/ui/skeleton"

export default function DocsLoading() {
  return (
    <div className="mx-auto flex max-w-5xl gap-10">
      <article className="min-w-0 max-w-3xl flex-1 space-y-6">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="size-8 rounded-md" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <Skeleton className="h-40 w-full rounded-lg" />
        <div className="space-y-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </article>
      <aside className="hidden xl:block">
        <div className="w-56 space-y-3">
          <Skeleton className="h-4 w-24" />
          <div className="space-y-2 border-l border-border pl-3">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3.5 w-36" />
            <Skeleton className="h-3.5 w-24" />
          </div>
        </div>
      </aside>
    </div>
  )
}
