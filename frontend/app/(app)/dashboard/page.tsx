import type { Metadata } from 'next'
import Link from 'next/link'
import { Bot, TrendingUp, ArrowRight } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { StatCard } from '@/components/cards/stat-card'
import { ActivityList } from '@/components/dashboard/activity-list'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  stats,
  recentUploads,
  recentlyViewed,
  recentConversations,
  trendingTopics,
  userProfile,
} from '@/lib/mock-data'

export const metadata: Metadata = {
  title: 'Dashboard · DESIDOC AI Knowledge Library',
}

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      <PageHeader
        title={`Welcome back, ${userProfile.name.split(' ')[1]}`}
        description="Here is an overview of the knowledge library and your recent research activity."
      >
        <QuickActions />
      </PageHeader>

      {/* Stats */}
      <section aria-label="Statistics">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          {stats.map((s) => (
            <StatCard key={s.id} stat={s} />
          ))}
        </div>
      </section>

      {/* Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ActivityList title="Recent Uploads" items={recentUploads} href="/upload" />
        <ActivityList
          title="Recently Viewed"
          items={recentlyViewed}
          href="/library"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Recent AI conversations */}
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
            {recentConversations.map((c, i) => (
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
                  <p className="truncate text-sm font-medium text-foreground">{c.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{c.preview}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{c.time}</span>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Trending topics */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" />
              Trending Research Topics
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col">
            {trendingTopics.map((t, i) => (
              <div
                key={t.id}
                className="flex items-center gap-3 border-t border-border py-3 first:border-t-0 first:pt-0"
              >
                <span className="font-mono text-sm font-semibold text-muted-foreground/70">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{t.topic}</p>
                  <p className="text-xs text-muted-foreground">{t.count} documents</p>
                </div>
                <span className="inline-flex items-center gap-0.5 rounded-md bg-success/12 px-1.5 py-0.5 text-xs font-medium text-success">
                  <TrendingUp className="size-3" />
                  {t.change}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
