'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut, PanelLeftClose, PanelLeft, X } from 'lucide-react'
import { navItems } from '@/lib/nav'
import { Brand } from '@/components/brand'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'

interface SidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
  mobileOpen: boolean
  onCloseMobile: () => void
}

export function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const isAdmin = user?.role === 'ADMIN'

  const visibleItems = useMemo(
    () => navItems.filter((item) => !item.adminOnly || isAdmin),
    [isAdmin],
  )

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-sidebar-border bg-sidebar transition-[width,transform] duration-300 ease-in-out',
          collapsed ? 'lg:w-[76px]' : 'lg:w-64',
          'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        {/* Header */}
        <div
          className={cn(
            'flex h-16 items-center border-b border-sidebar-border px-4',
            collapsed ? 'lg:justify-center' : 'justify-between',
          )}
        >
          <Brand showText={!collapsed} size="md" />
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onCloseMobile}
            aria-label="Close menu"
          >
            <X className="size-5" />
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Primary">
          <ul className="flex flex-col gap-1">
            {visibleItems.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(item.href + '/')
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onCloseMobile}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      collapsed && 'lg:justify-center lg:px-0',
                      active
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                    )}
                    <Icon className="size-[18px] shrink-0" />
                    <span className={cn('truncate', collapsed && 'lg:hidden')}>
                      {item.label}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer actions */}
        <div className="border-t border-sidebar-border p-3">
          <button
            onClick={() => { logout(); router.push('/') }}
            title={collapsed ? 'Logout' : undefined}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive',
              collapsed && 'lg:justify-center lg:px-0',
            )}
          >
            <LogOut className="size-[18px] shrink-0" />
            <span className={cn(collapsed && 'lg:hidden')}>Logout</span>
          </button>
          <button
            onClick={onToggleCollapse}
            className={cn(
              'mt-1 hidden w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:flex',
              collapsed && 'lg:justify-center lg:px-0',
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <PanelLeft className="size-[18px] shrink-0" />
            ) : (
              <>
                <PanelLeftClose className="size-[18px] shrink-0" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  )
}
