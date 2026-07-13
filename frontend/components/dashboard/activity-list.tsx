import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { docTypeIcons, fallbackIcon } from '@/lib/icons'

interface ActivityItem {
  id: number | string
  title: string
  author: string
  type: string
  time: string
}

interface ActivityListProps {
  title: string
  items: ActivityItem[]
  href: string
  linkLabel?: string
}

export function ActivityList({
  title,
  items,
  href,
  linkLabel = 'View all',
}: ActivityListProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>

        <Link
          href={href}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary transition-opacity hover:opacity-80"
        >
          {linkLabel}
          <ArrowRight className="size-3.5" />
        </Link>
      </CardHeader>

      <CardContent className="flex flex-col">
        {items.map((item, i) => {
          const Icon =
            docTypeIcons[item.type as keyof typeof docTypeIcons] ??
            fallbackIcon

          return (
            <div
              key={item.id}
              className="flex items-center gap-3 border-t border-border py-3 first:border-t-0 first:pt-0"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Icon className="size-[18px]" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {item.title}
                </p>

                <p className="truncate text-xs text-muted-foreground">
                  {item.author}
                </p>
              </div>

              <span className="shrink-0 text-xs text-muted-foreground">
                {item.time}
              </span>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}