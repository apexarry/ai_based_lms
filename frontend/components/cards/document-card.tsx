'use client'

import { useState } from 'react'
import { Bookmark, Download, Eye, FolderOpen, User, Calendar } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { docTypeIcons } from '@/lib/icons'
import { cn } from '@/lib/utils'
import type { LibraryDocument } from '@/types'

interface DocumentCardProps {
  doc: LibraryDocument
  view?: 'grid' | 'list'
}

export function DocumentCard({ doc, view = 'grid' }: DocumentCardProps) {
  const [bookmarked, setBookmarked] = useState(doc.bookmarked)
  const Icon = docTypeIcons[doc.type]

  if (view === 'list') {
    return (
      <Card className="flex flex-col gap-3 p-4 transition-shadow hover:shadow-md sm:flex-row sm:items-center">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-foreground">{doc.title}</h3>
            <Badge variant="secondary">{doc.type}</Badge>
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {doc.author} · {doc.department} · {doc.year} · {doc.fileSize}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" aria-label="Preview">
            <Eye className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Download">
            <Download className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setBookmarked((b) => !b)}
            aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
          >
            <Bookmark
              className={cn('size-4', bookmarked && 'fill-primary text-primary')}
            />
          </Button>
          <Button variant="outline" size="sm" className="ml-1">
            Open
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="group flex flex-col p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
        <button
          onClick={() => setBookmarked((b) => !b)}
          className="text-muted-foreground transition-colors hover:text-primary"
          aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
        >
          <Bookmark className={cn('size-5', bookmarked && 'fill-primary text-primary')} />
        </button>
      </div>

      <Badge variant="secondary" className="mt-4 w-fit">
        {doc.type}
      </Badge>
      <h3 className="mt-2 line-clamp-2 text-pretty text-sm font-semibold leading-snug text-foreground">
        {doc.title}
      </h3>

      <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <User className="size-3.5" /> {doc.author}
        </span>
        <span className="flex items-center gap-1.5">
          <FolderOpen className="size-3.5" /> {doc.department}
        </span>
        <span className="flex items-center gap-1.5">
          <Calendar className="size-3.5" /> {doc.year} · {doc.pages} pages · {doc.fileSize}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {doc.keywords.slice(0, 3).map((k) => (
          <span
            key={k}
            className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground"
          >
            {k}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
        <Button size="sm" className="flex-1">
          Open
        </Button>
        <Button variant="outline" size="icon-sm" aria-label="Preview">
          <Eye className="size-4" />
        </Button>
        <Button variant="outline" size="icon-sm" aria-label="Download">
          <Download className="size-4" />
        </Button>
      </div>
    </Card>
  )
}
