"use client"

import { ThemeProvider } from "@/providers/theme-provider"
import { ApiKeyProvider } from "@/providers/api-key-provider"
import { TooltipProvider } from "@/components/ui/tooltip"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ApiKeyProvider>
        <TooltipProvider>{children}</TooltipProvider>
      </ApiKeyProvider>
    </ThemeProvider>
  )
}
