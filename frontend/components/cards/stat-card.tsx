import { ArrowDown, ArrowUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { statIcons, fallbackIcon } from '@/lib/icons'
import { cn } from '@/lib/utils'
import type { StatCard as StatCardType } from '@/types'

export function StatCard({ stat }: { stat: StatCardType }) {
  const Icon = statIcons[stat.icon] ?? fallbackIcon
  const up = stat.trend === 'up'
  const down = stat.trend === 'down'

  return (
    <Card className="p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
        {stat.trend !== 'neutral' && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium',
              up && 'bg-success/12 text-success',
              down && 'bg-destructive/12 text-destructive',
            )}
          >
            {up ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
            {stat.change}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="font-mono text-2xl font-semibold tracking-tight text-foreground">
          {stat.value}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
      </div>
    </Card>
  )
}
