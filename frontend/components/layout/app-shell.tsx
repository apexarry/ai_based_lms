'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { cn } from '@/lib/utils'

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div
        className={cn(
          'flex min-h-screen flex-col transition-[padding] duration-300 ease-in-out',
          collapsed ? 'lg:pl-[76px]' : 'lg:pl-64',
        )}
      >
        <Navbar onOpenMobile={() => setMobileOpen(true)} />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </div>
  )
}
