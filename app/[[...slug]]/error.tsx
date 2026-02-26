"use client"

import Link from "next/link"

export default function DocsError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="mx-auto max-w-3xl space-y-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">
        Failed to load this page
      </h1>
      <p className="text-muted-foreground">
        Something went wrong while rendering this document. The content may be
        malformed or an unexpected error occurred.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 cursor-pointer items-center rounded-md px-6 text-sm font-medium transition-colors"
        >
          Try again
        </button>
        <Link
          href="/"
          className="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-10 items-center rounded-md border px-6 text-sm font-medium transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}
