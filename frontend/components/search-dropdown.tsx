'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { searchDocuments, type SearchResult } from '@/lib/api'

export function SearchDropdown() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  const fetchResults = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([])
      setOpen(false)
      return
    }
    const data = await searchDocuments(q)
    setResults(data)
    setOpen(data.length > 0)
    setActiveIndex(-1)
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchResults(query), 250)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, fetchResults])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function openDocument(id: number) {
    window.open(`http://127.0.0.1:8000/documents/${id}/view`, '_blank', 'noopener,noreferrer')
    setOpen(false)
    setQuery('')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (i < results.length - 1 ? i + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i > 0 ? i - 1 : results.length - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIndex >= 0 && activeIndex < results.length) {
        openDocument(results[activeIndex].id)
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setOpen(true) }}
          onKeyDown={handleKeyDown}
          placeholder="Search documents, authors..."
          className={cn(
            'h-9 w-full rounded-lg border border-border bg-background pl-9 pr-14 text-sm shadow-sm transition-colors outline-none',
            'placeholder:text-muted-foreground',
            'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25',
          )}
          aria-label="Search"
          autoComplete="off"
        />
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 select-none items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
          ⌘K
        </kbd>
      </div>

      {open && (
        <div className="absolute top-full z-50 mt-1 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
          {results.map((doc, i) => (
            <button
              key={doc.id}
              onClick={() => openDocument(doc.id)}
              onMouseEnter={() => setActiveIndex(i)}
              className={cn(
                'flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors',
                i === activeIndex ? 'bg-accent text-accent-foreground' : 'text-popover-foreground',
                i !== results.length - 1 && 'border-b border-border',
              )}
            >
              <FileText className="size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{doc.title}</p>
                {doc.author && (
                  <p className="truncate text-xs text-muted-foreground">{doc.author}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
