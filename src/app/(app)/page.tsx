import { Heading, Subheading } from '@/components/heading'
import { StatCard } from '@/components/stat-card'
import { HealthScore } from '@/components/health-score'
import { Badge } from '@/components/badge'
import { Button } from '@/components/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table'
import {
  dummyDashboardData,
  formatCurrency,
  calculateChange
} from '@/lib/dummy-data'
import {
  BanknotesIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'

export default function Dashboard() {
  const data = dummyDashboardData

  // Calcular cambios vs mes anterior
  const savingsChange = calculateChange(data.currentMonth.totalSavings, data.previousMonth.totalSavings)

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <Heading>¡Hola! 👋</Heading>
        <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
          Así va tu situación financiera en {data.currentMonth.period}
        </p>
      </div>

      {/* Health Score */}
      <div className="mb-8">
        <HealthScore score={data.currentMonth.healthScore} />
      </div>

      {/* Resumen Este Mes */}
      <div className="mb-8">
        <Subheading>Este mes</Subheading>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Ingresos"
            value={formatCurrency(data.currentMonth.totalIncome)}
            icon={<ArrowTrendingUpIcon className="size-6 text-green-600" />}
          />

          <StatCard
            title="Gastos"
            value={formatCurrency(data.currentMonth.totalExpenses)}
            icon={<ArrowTrendingDownIcon className="size-6 text-red-600" />}
          />

          <StatCard
            title="Ahorraste"
            value={formatCurrency(data.currentMonth.totalSavings)}
            change={savingsChange}
            changeLabel="vs mes anterior"
            icon={<BanknotesIcon className="size-6 text-blue-600" />}
            trend="up"
          />

          <div className="rounded-lg border border-zinc-950/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-900">
            <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Tasa de Ahorro
            </div>
            <div className="mt-2 text-3xl font-semibold text-zinc-950 dark:text-white">
              {data.currentMonth.savingsRate}%
            </div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className="h-full bg-green-500 transition-all duration-500"
                style={{ width: `${data.currentMonth.savingsRate}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              Meta: 20%
            </div>
          </div>
        </div>
      </div>

      {/* Cards de métricas clave */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Dinero Disponible"
          value={formatCurrency(data.accounts.availableMoney)}
          change={`+${formatCurrency(data.currentMonth.totalSavings)}`}
          changeLabel="este mes"
          icon={<BanknotesIcon className="size-6 text-blue-600" />}
        />

        <StatCard
          title="Fondo de Emergencia"
          value={`${data.accounts.emergencyFundMonths} meses`}
          icon={<ShieldCheckIcon className="size-6 text-orange-600" />}
        />

        <StatCard
          title="Deudas"
          value={formatCurrency(data.accounts.totalDebts)}
          change="-$5,000"
          changeLabel="vs mes anterior"
          icon={<CreditCardIcon className="size-6 text-red-600" />}
          trend="down"
        />
      </div>

      {/* Insight Principal */}
      {data.mainInsight && (
        <div className="mb-8 rounded-lg border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-900/50 dark:bg-yellow-900/10">
          <div className="flex items-start gap-4">
            <div className="text-2xl">💡</div>
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-200">
                {data.mainInsight.title}
              </h3>
              <p className="mt-2 text-sm text-yellow-800 dark:text-yellow-300">
                {data.mainInsight.description}
              </p>
              <div className="mt-4 flex gap-3">
                <Button outline>
                  {data.mainInsight.actionLabel}
                </Button>
                <Button plain>
                  Ignorar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transacciones Recientes */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <Subheading>Transacciones Recientes</Subheading>
          <Button href="/transacciones" outline>
            Ver todas
          </Button>
        </div>

        <div className="mt-4 overflow-hidden rounded-lg border border-zinc-950/10 dark:border-white/10">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Fecha</TableHeader>
                <TableHeader>Descripción</TableHeader>
                <TableHeader>Categoría</TableHeader>
                <TableHeader className="text-right">Monto</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.recentTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="text-zinc-500">
                    {new Date(transaction.date).toLocaleDateString('es-MX', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{transaction.icon}</span>
                      {transaction.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge color="zinc">{transaction.category}</Badge>
                  </TableCell>
                  <TableCell className={`text-right font-semibold ${
                    transaction.amount > 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Metas Activas */}
      <div>
        <div className="flex items-center justify-between">
          <Subheading>Tus Metas</Subheading>
          <Button href="/metas" outline>
            Ver todas
          </Button>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {data.goals.map((goal) => (
            <div
              key={goal.id}
              className="rounded-lg border border-zinc-950/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-900"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-zinc-950 dark:text-white">
                    {goal.name}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Meta: {formatCurrency(goal.targetAmount)}
                  </p>
                </div>
                <Badge color={goal.progress > 50 ? 'green' : goal.progress > 0 ? 'yellow' : 'zinc'}>
                  {goal.progress}%
                </Badge>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400">
                    {formatCurrency(goal.currentAmount)}
                  </span>
                  <span className="text-zinc-600 dark:text-zinc-400">
                    {formatCurrency(goal.targetAmount)}
                  </span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>

              {goal.monthlyContribution > 0 && (
                <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                  Aportando {formatCurrency(goal.monthlyContribution)}/mes
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
