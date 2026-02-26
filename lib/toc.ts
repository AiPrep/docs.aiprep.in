export type TocHeading = {
  id: string
  text: string
  level: 2 | 3
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

export function extractHeadings(rawMdx: string): TocHeading[] {
  const headings: TocHeading[] = []
  const lines = rawMdx.split("\n")

  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)$/)
    if (match) {
      const level = match[1].length as 2 | 3
      const text = match[2].trim()
      headings.push({ id: slugify(text), text, level })
    }
  }

  return headings
}
