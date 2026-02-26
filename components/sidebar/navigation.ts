import { IconRocket, IconApi } from "@tabler/icons-react"

export type NavItem = {
  title: string
  href: string
}

export type NavGroup = {
  title: string
  icon: React.ComponentType<{ className?: string }>
  items: NavItem[]
}

/** Flat ordered list of all nav items across groups. */
export function getFlatNavItems(): NavItem[] {
  return docsNavigation.flatMap((group) => group.items)
}

export const docsNavigation: NavGroup[] = [
  {
    title: "Getting Started",
    icon: IconRocket,
    items: [
      { title: "Introduction", href: "/" },
      { title: "Installation", href: "/installation" },
    ],
  },
  {
    title: "API Reference",
    icon: IconApi,
    items: [{ title: "REST API", href: "/api/rest" }],
  },
]
