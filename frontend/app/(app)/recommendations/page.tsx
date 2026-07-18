'use client'

import { useEffect, useState } from 'react'
import { getRecommendations } from '@/lib/api'

const API_BASE = 'http://127.0.0.1:8000'
import type { Recommendation } from '@/lib/api'
import {
  Bot,
  TrendingUp,
  Sparkles,
  User,
  FolderOpen,
  Calendar,
  BookOpen,
  FileText,
  ScanLine,
} from 'lucide-react'

const typeIcons: Record<string, typeof BookOpen> = {
  Book: BookOpen,
  'Research Paper': FileText,
  'Scanned PDF': ScanLine,
}

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getRecommendations()
        setRecommendations(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Sparkles className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Recommendations</h1>
          <p className="text-sm text-muted-foreground">
            AI-curated documents relevant to your research.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl border bg-card p-5">
              <div className="h-4 w-3/4 rounded bg-muted" />
              <div className="mt-2 h-3 w-1/2 rounded bg-muted" />
              <div className="mt-4 space-y-2">
                <div className="h-3 w-full rounded bg-muted" />
                <div className="h-3 w-5/6 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : recommendations.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <Bot className="size-12 text-muted-foreground/50" />
          <p className="text-lg font-medium text-foreground">No recommendations yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Upload and index more documents to get personalised AI recommendations.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {recommendations.map((doc) => {
            const Icon = typeIcons[doc.type] ?? FileText
            return (
              <div
                key={doc.id}
                className="group rounded-xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
                      {doc.title}
                    </h2>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      <User className="mr-1 inline size-3" />
                      {doc.author}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1">
                    <FolderOpen className="size-3" />
                    {doc.department}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1">
                    <Calendar className="size-3" />
                    {doc.year}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1">
                    <BookOpen className="size-3" />
                    {doc.type}
                  </span>
                </div>

                {doc.summary && (
                  <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                    {doc.summary}
                  </p>
                )}

                <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
                  <button
                    onClick={() => window.open(`${API_BASE}/documents/${doc.id}/view`, '_blank', 'noopener,noreferrer')}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    <TrendingUp className="size-3.5" />
                    View Document
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
