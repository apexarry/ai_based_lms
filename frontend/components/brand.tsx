import { Library } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BrandProps {
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: { box: 'size-8', icon: 'size-4', title: 'text-sm', sub: 'text-[10px]' },
  md: { box: 'size-9', icon: 'size-5', title: 'text-sm', sub: 'text-[11px]' },
  lg: { box: 'size-12', icon: 'size-7', title: 'text-lg', sub: 'text-xs' },
}

export function Brand({ className, showText = true, size = 'md' }: BrandProps) {
  const s = sizeMap[size]
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm',
          s.box,
        )}
        aria-hidden="true"
      >
        <Library className={s.icon} />
      </div>
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={cn('font-semibold tracking-tight text-foreground', s.title)}>
            DESIDOC AI
          </span>
          <span className={cn('font-medium uppercase tracking-wider text-muted-foreground', s.sub)}>
            Knowledge Library
          </span>
        </div>
      )}
    </div>
  )
}
