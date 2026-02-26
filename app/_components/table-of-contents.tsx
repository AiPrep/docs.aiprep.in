"use client"

import * as React from "react"
import type { TocHeading } from "@/lib/toc"

export function TableOfContents({ headings }: { headings: TocHeading[] }) {
  const [activeId, setActiveId] = React.useState<string>("")

  React.useEffect(() => {
    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[]

    if (elements.length === 0) return

    const scrollRoot = document.querySelector("[data-scroll-root]")

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { root: scrollRoot, rootMargin: "0px 0px -60% 0px", threshold: 0 }
    )

    for (const el of elements) {
      observer.observe(el)
    }

    return () => observer.disconnect()
  }, [headings])

  return (
    <nav className="sticky top-6 w-56 shrink-0">
      <p className="mb-3 text-sm font-medium">On this page</p>
      <ul className="border-l border-border text-sm">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={`-ml-px block border-l-2 transition-colors ${
                heading.level === 3 ? "py-0.5 pl-7" : "py-0.5 pl-3"
              } ${
                activeId === heading.id
                  ? "border-foreground text-foreground font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
