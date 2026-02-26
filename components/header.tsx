"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useTheme } from "next-themes"
import { IconSearch } from "@tabler/icons-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/sidebar/theme-toggle"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"

export function Header() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="bg-background/80 sticky top-0 z-50 flex h-14 items-center gap-4 border-b px-4 backdrop-blur">
      <SidebarTrigger className="md:hidden" />

      <Link href="/" className="flex shrink-0 items-center">
        {mounted ? (
          <Image
            src={
              resolvedTheme === "dark"
                ? "/logos/aiprep-white-logo.svg"
                : "/logos/aiprep-light-logo.svg"
            }
            alt="AIPrep"
            width={88}
            height={20}
            priority
          />
        ) : (
          <Image
            src="/logos/aiprep-light-logo.svg"
            alt="AIPrep"
            width={88}
            height={20}
            priority
          />
        )}
      </Link>

      <div className="ml-auto flex items-center gap-2">
        <InputGroup className="w-56">
          <InputGroupAddon>
            <IconSearch className="size-4" />
          </InputGroupAddon>
          <InputGroupInput placeholder="Search docs..." />
        </InputGroup>
        <ThemeToggle variant="icon" />
      </div>
    </header>
  )
}
