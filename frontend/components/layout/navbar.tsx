'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Menu, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { SearchBar } from '@/components/search-bar'
import { ThemeToggle } from '@/components/theme-toggle'
import { breadcrumbLabels } from '@/lib/nav'
import { userProfile } from '@/lib/mock-data'

interface NavbarProps {
  onOpenMobile: () => void
}

export function Navbar({ onOpenMobile }: NavbarProps) {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)
  const current = segments[0] ?? 'dashboard'

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onOpenMobile}
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </Button>

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="hidden items-center gap-1.5 text-sm md:flex">
        <span className="text-muted-foreground">DESIDOC</span>
        <ChevronRight className="size-4 text-muted-foreground/60" />
        <span className="font-medium text-foreground">
          {breadcrumbLabels[current] ?? 'Dashboard'}
        </span>
      </nav>

      {/* Search */}
      <div className="ml-auto hidden w-full max-w-md md:block">
        <SearchBar showShortcut />
      </div>

      <div className="ml-auto flex items-center gap-1 md:ml-0">
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications (3 unread)"
        >
          <Bell className="size-4" />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive ring-2 ring-background" />
        </Button>
        <Link href="/profile" className="ml-1" aria-label="Open profile">
          <Avatar initials={userProfile.avatarInitials} className="size-8" />
        </Link>
      </div>
    </header>
  )
}
