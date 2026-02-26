"use client"

import * as React from "react"
import { IconCopy, IconCheck } from "@tabler/icons-react"

export function CopyPageButton({ content }: { content: string }) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="text-muted-foreground hover:text-foreground inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
      aria-label="Copy page markdown"
    >
      {copied ? (
        <>
          <IconCheck className="size-3.5" />
          Copied!
        </>
      ) : (
        <>
          <IconCopy className="size-3.5" />
          Copy Page
        </>
      )}
    </button>
  )
}
