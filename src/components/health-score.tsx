interface HealthScoreProps {
  score: number // 0-100
  label?: string
}

export function HealthScore({ score, label = 'Tu Salud Financiera' }: HealthScoreProps) {
  // Determinar color y texto basado en el score
  const getScoreData = (score: number) => {
    if (score >= 80) {
      return {
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-100 dark:bg-green-900/20',
        borderColor: 'border-green-500',
        emoji: '🟢',
        text: 'Excelente'
      }
    } else if (score >= 60) {
      return {
        color: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
        borderColor: 'border-yellow-500',
        emoji: '🟡',
        text: 'Buena, pero mejorable'
      }
    } else if (score >= 40) {
      return {
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-100 dark:bg-orange-900/20',
        borderColor: 'border-orange-500',
        emoji: '🟠',
        text: 'Necesita atención'
      }
    } else {
      return {
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-100 dark:bg-red-900/20',
        borderColor: 'border-red-500',
        emoji: '🔴',
        text: 'Requiere acción urgente'
      }
    }
  }

  const scoreData = getScoreData(score)
  const progressWidth = `${score}%`

  return (
    <div className="rounded-lg border border-zinc-950/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {label}
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-zinc-950 dark:text-white">
              {score}
            </span>
            <span className="text-lg text-zinc-500 dark:text-zinc-400">/100</span>
            <span className="ml-2 text-xl">{scoreData.emoji}</span>
          </div>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="mt-4">
        <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div
            className={`h-full transition-all duration-500 ${scoreData.bgColor.replace('dark:bg-', 'dark:bg-').replace('/20', '')}`}
            style={{ width: progressWidth }}
          />
        </div>
      </div>

      <div className={`mt-3 text-sm font-medium ${scoreData.color}`}>
        {scoreData.text}
      </div>
    </div>
  )
}
