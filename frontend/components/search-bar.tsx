'use client'

import * as React from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onSubmit?: (value: string) => void
  className?: string
  showShortcut?: boolean
}

export function SearchBar({
  placeholder = 'Search documents, authors, keywords...',
  value,
  onChange,
  onSubmit,
  className,
  showShortcut = false,
}: SearchBarProps) {
  const [internal, setInternal] = React.useState('')
  const val = value ?? internal

  const handleChange = (v: string) => {
    if (onChange) onChange(v)
    else setInternal(v)
  }

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit?.(val)
      }}
      className={cn('relative w-full', className)}
    >
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        value={val}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'h-9 w-full rounded-lg border border-border bg-background pl-9 pr-14 text-sm shadow-sm transition-colors outline-none',
          'placeholder:text-muted-foreground',
          'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25',
        )}
        aria-label="Search"
      />
      {showShortcut && (
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 select-none items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
          ⌘K
        </kbd>
      )}
    </form>
  )
}
