import Link from "next/link"
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react"
import type { AdjacentPage } from "@/lib/content"

export function PageNavigation({
  prev,
  next,
}: {
  prev: AdjacentPage | null
  next: AdjacentPage | null
}) {
  if (!prev && !next) return null

  return (
    <nav className="mt-12 grid gap-4 border-t pt-6 sm:grid-cols-2">
      {prev ? (
        <Link
          href={prev.href}
          className="group flex flex-col gap-1 rounded-lg border p-4 transition-colors hover:bg-muted"
        >
          <span className="text-muted-foreground flex items-center gap-1 text-sm">
            <IconArrowLeft className="size-3.5" />
            Previous
          </span>
          <span className="font-medium group-hover:text-foreground">
            {prev.title}
          </span>
          {prev.description && (
            <span className="text-muted-foreground line-clamp-2 text-sm">
              {prev.description}
            </span>
          )}
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={next.href}
          className="group flex flex-col gap-1 rounded-lg border p-4 text-right transition-colors hover:bg-muted"
        >
          <span className="text-muted-foreground flex items-center justify-end gap-1 text-sm">
            Next
            <IconArrowRight className="size-3.5" />
          </span>
          <span className="font-medium group-hover:text-foreground">
            {next.title}
          </span>
          {next.description && (
            <span className="text-muted-foreground line-clamp-2 text-sm">
              {next.description}
            </span>
          )}
        </Link>
      ) : (
        <div />
      )}
    </nav>
  )
}
