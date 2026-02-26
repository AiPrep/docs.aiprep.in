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

export const docsNavigation: NavGroup[] = [
  {
    title: "Getting Started",
    icon: IconRocket,
    items: [
      { title: "Introduction", href: "/docs/introduction" },
      { title: "Installation", href: "/docs/installation" },
    ],
  },
  {
    title: "API Reference",
    icon: IconApi,
    items: [{ title: "REST API", href: "/docs/api/rest" }],
  },
]
