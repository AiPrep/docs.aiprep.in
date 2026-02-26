import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-4xl font-bold tracking-tight">404</h1>
      <p className="text-muted-foreground max-w-md text-lg">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="bg-primary text-primary-foreground hover:bg-primary/90 mt-2 inline-flex h-10 items-center rounded-md px-6 text-sm font-medium transition-colors"
      >
        Back to Home
      </Link>
    </div>
  )
}
