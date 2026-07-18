'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bot, TrendingUp, ArrowRight } from 'lucide-react'

import { PageHeader } from '@/components/page-header'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { StatCard } from '@/components/cards/stat-card'
import { ActivityList } from '@/components/dashboard/activity-list'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

import { getDashboardStats, getRecentUploads, getDashboardProfile, getRecentlyViewed, getConversations, getAiQuestionsToday, getTrendingTopics } from '@/lib/api'

export function DashboardContent() {
  const [stats, setStats] = useState({
    total_documents: 0,
    books: 0,
    research_papers: 0,
    scanned_pdfs: 0,
    active_researchers: 0,
  })
  const [recentUploads, setRecentUploads] = useState<any[]>([])
  const [profileName, setProfileName] = useState("Researcher")
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([])
  const [recentConvs, setRecentConvs] = useState<any[]>([])
  const [aiQuestions, setAiQuestions] = useState(0)
  const [trendingTopics, setTrendingTopics] = useState<any[]>([])

  useEffect(() => {
    async function loadData() {
        try {
            const [statsData, uploads, profile, viewed, convs, aiq, trending] = await Promise.all([
              getDashboardStats(),
              getRecentUploads(),
              getDashboardProfile(),
              getRecentlyViewed(),
              getConversations(),
              getAiQuestionsToday(),
              getTrendingTopics(),
            ])
            setStats(statsData)
            setRecentUploads(uploads)
            const first = profile.name.split(' ')[0]
            setProfileName(first)
            setRecentlyViewed(viewed)
            setRecentConvs(convs.slice(0, 5))
            setAiQuestions(aiq.count ?? 0)
            setTrendingTopics(trending)
        } catch (err) {
            console.error(err)
        }
    }
    loadData()
}, [])

  const dashboardCards = [
    {
      id: 'documents',
      label: 'Total Documents',
      value: stats.total_documents.toString(),
      change: '',
      trend: 'neutral',
      icon: 'FileText',
    },
    {
      id: 'books',
      label: 'Books',
      value: stats.books.toString(),
      change: '',
      trend: 'neutral',
      icon: 'BookOpen',
    },
    {
      id: 'papers',
      label: 'Research Papers',
      value: stats.research_papers.toString(),
      change: '',
      trend: 'neutral',
      icon: 'FileStack',
    },
    {
      id: 'scanned',
      label: 'Scanned Documents',
      value: stats.scanned_pdfs.toString(),
      change: '',
      trend: 'neutral',
      icon: 'ScanLine',
    },
    {
      id: 'ai',
      label: 'AI Questions Today',
      value: aiQuestions.toString(),
      change: '',
      trend: 'neutral',
      icon: 'Bot',
    },
    {
      id: 'researchers',
      label: 'Active Researchers',
      value: stats.active_researchers.toString(),
      change: '',
      trend: 'neutral',
      icon: 'Users',
    },
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      <PageHeader
        title={`Welcome back, ${profileName}`}
        description="Here is an overview of the knowledge library and your recent research activity."
      >
        <QuickActions />
      </PageHeader>

      <section aria-label="Statistics">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          {dashboardCards.map((s) => (
            <StatCard key={s.id} stat={s} />
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <ActivityList
            title="Recent Uploads"
            items={recentUploads}
            href="/upload"
        />

        <ActivityList
          title="Recently Viewed"
          items={recentlyViewed}
          href="/library"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bot className="size-4 text-primary" />
              Recent AI Conversations
            </CardTitle>

            <Link
              href="/assistant"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary transition-opacity hover:opacity-80"
            >
              Open Assistant
              <ArrowRight className="size-3.5" />
            </Link>
          </CardHeader>

          <CardContent className="flex flex-col">
            {recentConvs.map((c, i) => (
              <Link
                key={c.id}
                href="/assistant"
                className="flex items-start gap-3 rounded-lg border-t border-border p-3 -mx-3 transition-colors hover:bg-muted first:border-t-0"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Bot className="size-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {c.title}
                  </p>

                  <p className="truncate text-xs text-muted-foreground">
                    {c.preview}
                  </p>
                </div>

                <span className="shrink-0 text-xs text-muted-foreground">
                    {c.date || c.time || ""}
                  </span>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" />
              Trending Research Topics
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col">
            {trendingTopics.map((t, i) => {
              const docUrl = `http://127.0.0.1:8000/documents/${t.id}/view`
              return (
              <a
                key={t.id ?? i}
                href={docUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 border-t border-border py-3 first:border-t-0 first:pt-0 transition-colors hover:bg-muted/50 -mx-3 px-3"
              >
                <span className="font-mono text-sm font-semibold text-muted-foreground/70">
                  {String(i + 1).padStart(2, '0')}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {t.topic}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {t.count} documents
                  </p>
                </div>

                {t.change && (
                  <span className="inline-flex items-center gap-0.5 rounded-md bg-success/12 px-1.5 py-0.5 text-xs font-medium text-success">
                    <TrendingUp className="size-3" />
                    {t.change}
                  </span>
                )}
              </a>
            )
          })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}