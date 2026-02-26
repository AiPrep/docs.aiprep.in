"use client"

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-4xl font-bold tracking-tight">Something went wrong</h1>
      <p className="text-muted-foreground max-w-md text-lg">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        className="bg-primary text-primary-foreground hover:bg-primary/90 mt-2 inline-flex h-10 cursor-pointer items-center rounded-md px-6 text-sm font-medium transition-colors"
      >
        Try again
      </button>
    </div>
  )
}
