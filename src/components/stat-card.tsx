import { Badge } from '@/components/badge'
import { Divider } from '@/components/divider'

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  changeLabel?: string
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
}

export function StatCard({
  title,
  value,
  change,
  changeLabel = 'vs mes anterior',
  icon,
  trend
}: StatCardProps) {
  // Determinar color basado en trend
  const getChangeColor = () => {
    if (!change) return 'zinc'
    if (trend === 'up') return 'lime'
    if (trend === 'down') return 'pink'
    return 'zinc'
  }

  // Auto-detectar trend si no se proporciona
  const autoTrend = trend || (change?.startsWith('+') ? 'up' : change?.startsWith('-') ? 'down' : 'neutral')

  return (
    <div className="relative overflow-hidden rounded-lg border border-zinc-950/10 bg-white dark:border-white/10 dark:bg-zinc-900">
      <Divider />
      <div className="p-6">
        {icon && (
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800">
              {icon}
            </div>
          </div>
        )}

        <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {title}
        </div>

        <div className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white sm:text-2xl">
          {value}
        </div>

        {change && (
          <div className="mt-3 flex items-center gap-2 text-sm">
            <Badge color={getChangeColor()}>
              {change}
            </Badge>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {changeLabel}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
