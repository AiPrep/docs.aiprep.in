"use client"

import * as React from "react"
import { IconCopy, IconCheck } from "@tabler/icons-react"

export function CodeBlock({
  children,
  ...props
}: React.ComponentProps<"pre">) {
  const [copied, setCopied] = React.useState(false)
  const preRef = React.useRef<HTMLPreElement>(null)

  const handleCopy = async () => {
    const text = preRef.current?.textContent ?? ""
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="group relative my-4 overflow-hidden rounded-lg border">
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 z-10 inline-flex cursor-pointer items-center justify-center rounded-md border border-border bg-background/80 p-1.5 text-muted-foreground opacity-0 backdrop-blur transition-all hover:bg-muted hover:text-foreground group-hover:opacity-100"
        aria-label="Copy code"
      >
        {copied ? (
          <IconCheck className="size-3.5" />
        ) : (
          <IconCopy className="size-3.5" />
        )}
      </button>
      <pre
        ref={preRef}
        className="overflow-x-auto bg-muted p-4 text-sm"
        {...props}
      >
        {children}
      </pre>
    </div>
  )
}
