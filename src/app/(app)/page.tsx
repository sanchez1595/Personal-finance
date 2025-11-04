'use client'

import { Badge } from '@/components/badge'
import { Button } from '@/components/button'
import { HealthScore } from '@/components/health-score'
import { Heading, Subheading } from '@/components/heading'
import { StatCard } from '@/components/stat-card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table'
import { createClient } from '@/lib/supabase/client'
import type { Account, Goal, IncomeSource, Transaction } from '@/types/finance'
import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  CreditCardIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount)
}

function calculateChange(current: number, previous: number): string {
  if (previous === 0) return '+0%'
  const change = ((current - previous) / previous) * 100
  return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([])

  // Metrics state
  const [totalIncome, setTotalIncome] = useState(0)
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [totalSavings, setTotalSavings] = useState(0)
  const [savingsRate, setSavingsRate] = useState(0)
  const [healthScore, setHealthScore] = useState(0)
  const [availableMoney, setAvailableMoney] = useState(0)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Load all data in parallel
      const [accountsRes, transactionsRes, goalsRes, incomeSourcesRes] = await Promise.all([
        supabase.from('accounts').select('*').eq('user_id', user.id).eq('is_active', true),
        supabase
          .from('transactions')
          .select(
            `
          *,
          account:accounts(name),
          category:categories(name)
        `
          )
          .eq('user_id', user.id)
          .gte('date', getFirstDayOfMonth())
          .lte('date', getLastDayOfMonth())
          .order('date', { ascending: false }),
        supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'activa')
          .limit(4),
        supabase
          .from('income_sources')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true),
      ])

      const accountsData = accountsRes.data || []
      const transactionsData = transactionsRes.data || []
      const goalsData = goalsRes.data || []
      const incomeSourcesData = incomeSourcesRes.data || []

      setAccounts(accountsData)
      setTransactions(transactionsData)
      setGoals(goalsData)
      setIncomeSources(incomeSourcesData)

      // Calculate metrics
      const income = transactionsData
        .filter((t) => t.type === 'ingreso')
        .reduce((sum, t) => sum + t.amount, 0)

      const expenses = transactionsData
        .filter((t) => t.type === 'gasto')
        .reduce((sum, t) => sum + t.amount, 0)

      const savings = income - expenses
      const rate = income > 0 ? (savings / income) * 100 : 0

      setTotalIncome(income)
      setTotalExpenses(expenses)
      setTotalSavings(savings)
      setSavingsRate(Math.round(rate))

      // Calculate available money (sum of all account balances)
      const available = accountsData.reduce((sum, acc) => sum + acc.balance, 0)
      setAvailableMoney(available)

      // Calculate health score (simplified version)
      const score = calculateHealthScore({
        savingsRate: rate,
        hasEmergencyFund: available >= expenses * 3,
        debtToIncomeRatio: 0, // We'll implement this later
        savingsToIncomeRatio: savings / income,
      })
      setHealthScore(score)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getFirstDayOfMonth = () => {
    const date = new Date()
    return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0]
  }

  const getLastDayOfMonth = () => {
    const date = new Date()
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0]
  }

  const calculateHealthScore = (metrics: {
    savingsRate: number
    hasEmergencyFund: boolean
    debtToIncomeRatio: number
    savingsToIncomeRatio: number
  }) => {
    let score = 0

    // Savings rate (0-40 points)
    if (metrics.savingsRate >= 20) score += 40
    else if (metrics.savingsRate >= 10) score += 30
    else if (metrics.savingsRate > 0) score += 20

    // Emergency fund (0-30 points)
    if (metrics.hasEmergencyFund) score += 30
    else score += 10

    // Savings to income ratio (0-30 points)
    if (metrics.savingsToIncomeRatio >= 0.2) score += 30
    else if (metrics.savingsToIncomeRatio >= 0.1) score += 20
    else if (metrics.savingsToIncomeRatio > 0) score += 10

    return Math.min(100, score)
  }

  const getCurrentMonth = () => {
    return new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
  }

  const emergencyFundMonths = totalExpenses > 0 ? (availableMoney / totalExpenses).toFixed(1) : '0'

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-zinc-500">Cargando...</p>
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <Heading>¡Hola! 👋</Heading>
        <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
          Así va tu situación financiera en {getCurrentMonth()}
        </p>
      </div>

      {/* Health Score */}
      <div className="mb-8">
        <HealthScore score={healthScore} />
      </div>

      {/* Resumen Este Mes */}
      <div className="mb-8">
        <Subheading>Este mes</Subheading>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Ingresos"
            value={formatCurrency(totalIncome)}
            icon={<ArrowTrendingUpIcon className="size-6 text-green-600" />}
          />

          <StatCard
            title="Gastos"
            value={formatCurrency(totalExpenses)}
            icon={<ArrowTrendingDownIcon className="size-6 text-red-600" />}
          />

          <StatCard
            title="Ahorraste"
            value={formatCurrency(totalSavings)}
            icon={<BanknotesIcon className="size-6 text-blue-600" />}
            trend={totalSavings > 0 ? 'up' : totalSavings < 0 ? 'down' : 'neutral'}
          />

          <div className="rounded-lg border border-zinc-950/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-900">
            <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Tasa de Ahorro
            </div>
            <div className="mt-2 text-3xl font-semibold text-zinc-950 dark:text-white">
              {savingsRate}%
            </div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className="h-full bg-green-500 transition-all duration-500"
                style={{ width: `${Math.min(100, savingsRate)}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Meta: 20%</div>
          </div>
        </div>
      </div>

      {/* Cards de métricas clave */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Dinero Disponible"
          value={formatCurrency(availableMoney)}
          change={totalSavings > 0 ? `+${formatCurrency(totalSavings)}` : undefined}
          changeLabel="este mes"
          icon={<BanknotesIcon className="size-6 text-blue-600" />}
        />

        <StatCard
          title="Fondo de Emergencia"
          value={`${emergencyFundMonths} meses`}
          icon={<ShieldCheckIcon className="size-6 text-orange-600" />}
        />

        <StatCard
          title="Deudas"
          value={formatCurrency(0)}
          icon={<CreditCardIcon className="size-6 text-red-600" />}
        />
      </div>

      {/* Insight Principal */}
      {totalIncome === 0 && totalExpenses === 0 && (
        <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-900/50 dark:bg-blue-900/10">
          <div className="flex items-start gap-4">
            <div className="text-2xl">🚀</div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 dark:text-blue-200">
                ¡Comienza a registrar tus movimientos!
              </h3>
              <p className="mt-2 text-sm text-blue-800 dark:text-blue-300">
                Para empezar a ver tu situación financiera, primero crea una cuenta y registra tus
                primeros ingresos y gastos. Así podremos ayudarte a tomar mejores decisiones
                financieras.
              </p>
              <div className="mt-4 flex gap-3">
                <Button href="/transacciones" outline>
                  Ir a Transacciones
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {savingsRate < 10 && totalIncome > 0 && (
        <div className="mb-8 rounded-lg border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-900/50 dark:bg-yellow-900/10">
          <div className="flex items-start gap-4">
            <div className="text-2xl">💡</div>
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-200">
                Mejora tu tasa de ahorro
              </h3>
              <p className="mt-2 text-sm text-yellow-800 dark:text-yellow-300">
                Tu tasa de ahorro actual es de {savingsRate}%. Te recomendamos apuntar a al menos
                20% para tener una mejor salud financiera. Revisa tus gastos y busca oportunidades
                para ahorrar más.
              </p>
              <div className="mt-4 flex gap-3">
                <Button href="/simuladores" outline>
                  Usar Simulador
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

        {transactions.length === 0 ? (
          <div className="mt-4 rounded-lg border border-zinc-950/10 bg-white p-8 text-center dark:border-white/10 dark:bg-zinc-900">
            <p className="text-zinc-500">
              No hay transacciones este mes. Agrega tu primera transacción.
            </p>
            <Button href="/transacciones" className="mt-4" outline>
              Agregar transacción
            </Button>
          </div>
        ) : (
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
                {transactions.slice(0, 5).map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="text-zinc-500">
                      {new Date(transaction.date).toLocaleDateString('es-MX', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="font-medium">{transaction.description}</TableCell>
                    <TableCell>
                      <Badge color="zinc">{(transaction as any).category?.name || 'Sin categoría'}</Badge>
                    </TableCell>
                    <TableCell
                      className={`text-right font-semibold ${
                        transaction.type === 'ingreso'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {transaction.type === 'ingreso' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Metas Activas */}
      <div>
        <div className="flex items-center justify-between">
          <Subheading>Tus Metas</Subheading>
          <Button href="/metas" outline>
            {goals.length > 0 ? 'Ver todas' : 'Crear meta'}
          </Button>
        </div>

        {goals.length === 0 ? (
          <div className="mt-4 rounded-lg border border-zinc-950/10 bg-white p-8 text-center dark:border-white/10 dark:bg-zinc-900">
            <p className="text-zinc-500">
              No tienes metas activas. Crea tu primera meta financiera.
            </p>
            <Button href="/metas" className="mt-4" outline>
              Crear meta
            </Button>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {goals.map((goal) => {
              const progress = Math.round((goal.current_amount / goal.target_amount) * 100)
              return (
                <div
                  key={goal.id}
                  className="rounded-lg border border-zinc-950/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-900"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-zinc-950 dark:text-white">{goal.name}</h3>
                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        Meta: {formatCurrency(goal.target_amount)}
                      </p>
                    </div>
                    <Badge color={progress > 50 ? 'green' : progress > 0 ? 'yellow' : 'zinc'}>
                      {progress}%
                    </Badge>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-600 dark:text-zinc-400">
                        {formatCurrency(goal.current_amount)}
                      </span>
                      <span className="text-zinc-600 dark:text-zinc-400">
                        {formatCurrency(goal.target_amount)}
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div
                        className="h-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${Math.min(100, progress)}%` }}
                      />
                    </div>
                  </div>

                  {goal.deadline && (
                    <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                      Fecha objetivo:{' '}
                      {new Date(goal.deadline).toLocaleDateString('es-MX', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
