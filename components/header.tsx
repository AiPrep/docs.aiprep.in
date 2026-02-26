"use client"

import Image from "next/image"
import Link from "next/link"
import { IconSearch } from "@tabler/icons-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/sidebar/theme-toggle"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"

export function Header() {
  return (
    <header className="bg-background/80 sticky top-0 z-50 flex h-14 items-center gap-4 border-b px-4 backdrop-blur">
      <SidebarTrigger className="md:hidden" />

      <Link href="/" className="flex shrink-0 items-center">
        <Image
          src="/logos/aiprep-light-logo.svg"
          alt="AIPrep"
          width={88}
          height={20}
          priority
          className="dark:hidden"
        />
        <Image
          src="/logos/aiprep-white-logo.svg"
          alt="AIPrep"
          width={88}
          height={20}
          priority
          className="hidden dark:block"
        />
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
