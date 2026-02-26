"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { IconSun, IconMoon } from "@tabler/icons-react"
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

export function ThemeToggle({ variant = "sidebar" }: { variant?: "sidebar" | "icon" }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const toggle = () => setTheme(resolvedTheme === "dark" ? "light" : "dark")
  const Icon = !mounted || resolvedTheme !== "dark" ? IconMoon : IconSun
  const label = !mounted || resolvedTheme !== "dark" ? "Dark mode" : "Light mode"

  if (variant === "icon") {
    return (
      <Button variant="ghost" size="icon" onClick={toggle} aria-label={label}>
        <Icon className="size-4" />
      </Button>
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton onClick={toggle}>
          <Icon />
          <span>{label}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
