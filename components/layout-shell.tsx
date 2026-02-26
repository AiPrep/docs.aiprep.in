"use client"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { DocsSidebar } from "@/components/sidebar/docs-sidebar"
import { Header } from "@/components/header"

export function LayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      className="h-svh flex-col overflow-hidden"
      style={{ "--header-height": "3.5rem" } as React.CSSProperties}
    >
      <Header />
      <div className="flex min-h-0 flex-1">
        <DocsSidebar />
        <SidebarInset>
          <main data-scroll-root className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
