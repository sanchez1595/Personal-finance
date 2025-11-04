'use client'

import { Badge } from '@/components/badge'
import { Button } from '@/components/button'
import { Heading, Subheading } from '@/components/heading'
import { Select } from '@/components/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table'
import { Text } from '@/components/text'
import { createClient } from '@/lib/supabase/client'
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/16/solid'
import { useEffect, useState } from 'react'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount)
}

interface CategoryExpense {
  category_id: string
  category_name: string
  total: number
  percentage: number
  transaction_count: number
}

interface MonthlyComparison {
  current: number
  previous: number
  change: number
  changePercent: number
}

export default function AnalisisPage() {
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  const [categoryExpenses, setCategoryExpenses] = useState<CategoryExpense[]>([])
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [monthlyComparison, setMonthlyComparison] = useState<MonthlyComparison>({
    current: 0,
    previous: 0,
    change: 0,
    changePercent: 0,
  })

  const [availableMonths, setAvailableMonths] = useState<string[]>([])

  useEffect(() => {
    loadAvailableMonths()
  }, [])

  useEffect(() => {
    if (selectedMonth) {
      loadAnalysisData()
    }
  }, [selectedMonth])

  const loadAvailableMonths = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Get unique months from transactions
      const { data, error } = await supabase
        .from('transactions')
        .select('date')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (error) throw error

      if (data && data.length > 0) {
        const months = Array.from(
          new Set(
            data.map((t) => {
              const date = new Date(t.date)
              return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            })
          )
        )
        setAvailableMonths(months)
      }
    } catch (error) {
      console.error('Error loading available months:', error)
    }
  }

  const loadAnalysisData = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const [year, month] = selectedMonth.split('-')
      const startDate = `${year}-${month}-01`
      const endDate = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0]

      // Get expenses by category for selected month
      const { data: expenses, error: expensesError } = await supabase
        .from('transactions')
        .select(
          `
          amount,
          category_id,
          category:categories(name)
        `
        )
        .eq('user_id', user.id)
        .eq('type', 'gasto')
        .gte('date', startDate)
        .lte('date', endDate)

      if (expensesError) throw expensesError

      // Group by category
      const categoryMap = new Map<string, { name: string; total: number; count: number }>()
      let total = 0

      expenses?.forEach((expense: any) => {
        const categoryId = expense.category_id
        const categoryName = expense.category?.name || 'Sin categoría'
        const amount = expense.amount

        if (categoryMap.has(categoryId)) {
          const current = categoryMap.get(categoryId)!
          current.total += amount
          current.count += 1
        } else {
          categoryMap.set(categoryId, { name: categoryName, total: amount, count: 1 })
        }

        total += amount
      })

      // Convert to array and calculate percentages
      const categoryData: CategoryExpense[] = Array.from(categoryMap.entries())
        .map(([id, data]) => ({
          category_id: id,
          category_name: data.name,
          total: data.total,
          percentage: total > 0 ? (data.total / total) * 100 : 0,
          transaction_count: data.count,
        }))
        .sort((a, b) => b.total - a.total)

      setCategoryExpenses(categoryData)
      setTotalExpenses(total)

      // Get previous month data for comparison
      const prevMonth = new Date(parseInt(year), parseInt(month) - 2, 1)
      const prevYear = prevMonth.getFullYear()
      const prevMonthNum = String(prevMonth.getMonth() + 1).padStart(2, '0')
      const prevStartDate = `${prevYear}-${prevMonthNum}-01`
      const prevEndDate = new Date(prevYear, prevMonth.getMonth() + 1, 0)
        .toISOString()
        .split('T')[0]

      const { data: prevExpenses, error: prevError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', user.id)
        .eq('type', 'gasto')
        .gte('date', prevStartDate)
        .lte('date', prevEndDate)

      if (prevError) throw prevError

      const prevTotal = prevExpenses?.reduce((sum, t) => sum + t.amount, 0) || 0
      const change = total - prevTotal
      const changePercent = prevTotal > 0 ? (change / prevTotal) * 100 : 0

      setMonthlyComparison({
        current: total,
        previous: prevTotal,
        change,
        changePercent,
      })
    } catch (error) {
      console.error('Error loading analysis data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMonthName = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('es-MX', {
      month: 'long',
      year: 'numeric',
    })
  }

  const getCategoryColor = (index: number) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-yellow-500 to-yellow-600',
      'from-red-500 to-red-600',
      'from-purple-500 to-purple-600',
      'from-pink-500 to-pink-600',
      'from-indigo-500 to-indigo-600',
      'from-orange-500 to-orange-600',
    ]
    return colors[index % colors.length]
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Text className="text-zinc-500">Cargando análisis...</Text>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <div>
          <Heading>Análisis de Gastos</Heading>
          <Text>Analiza tus patrones de gasto y encuentra oportunidades de ahorro</Text>
        </div>
        <div className="w-64">
          <Select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
            {availableMonths.length > 0 ? (
              availableMonths.map((month) => (
                <option key={month} value={month}>
                  {getMonthName(month)}
                </option>
              ))
            ) : (
              <option value={selectedMonth}>{getMonthName(selectedMonth)}</option>
            )}
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-zinc-950/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-900">
          <Text className="text-sm text-zinc-500">Total Gastado</Text>
          <div className="mt-2 text-3xl font-semibold text-zinc-950 dark:text-white">
            {formatCurrency(totalExpenses)}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-950/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-900">
          <Text className="text-sm text-zinc-500">Mes Anterior</Text>
          <div className="mt-2 text-3xl font-semibold text-zinc-950 dark:text-white">
            {formatCurrency(monthlyComparison.previous)}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-950/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-900">
          <Text className="text-sm text-zinc-500">Cambio</Text>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`text-3xl font-semibold ${
                monthlyComparison.change > 0
                  ? 'text-red-600 dark:text-red-400'
                  : monthlyComparison.change < 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-zinc-950 dark:text-white'
              }`}
            >
              {monthlyComparison.change > 0 ? '+' : ''}
              {monthlyComparison.changePercent.toFixed(1)}%
            </span>
            {monthlyComparison.change > 0 ? (
              <ArrowUpIcon className="size-6 text-red-600 dark:text-red-400" />
            ) : monthlyComparison.change < 0 ? (
              <ArrowDownIcon className="size-6 text-green-600 dark:text-green-400" />
            ) : null}
          </div>
          <Text className="mt-1 text-xs text-zinc-500">
            {formatCurrency(Math.abs(monthlyComparison.change))}
          </Text>
        </div>
      </div>

      {totalExpenses === 0 ? (
        <div className="mt-8 rounded-lg border border-zinc-950/10 bg-white p-12 text-center dark:border-white/10 dark:bg-zinc-900">
          <Text className="text-zinc-500">
            No hay gastos registrados en este mes. Selecciona otro mes o agrega transacciones.
          </Text>
          <Button href="/transacciones" className="mt-4" outline>
            Agregar transacciones
          </Button>
        </div>
      ) : (
        <>
          {/* Category Distribution */}
          <div className="mt-8">
            <Subheading>Distribución por Categoría</Subheading>

            <div className="mt-4 grid gap-8 lg:grid-cols-2">
              {/* Visual Chart */}
              <div className="rounded-lg border border-zinc-950/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-900">
                <div className="space-y-4">
                  {categoryExpenses.slice(0, 8).map((category, index) => (
                    <div key={category.category_id}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-zinc-950 dark:text-white">
                          {category.category_name}
                        </span>
                        <span className="text-zinc-500">
                          {category.percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <div
                          className={`h-full bg-gradient-to-r ${getCategoryColor(index)} transition-all duration-500`}
                          style={{ width: `${category.percentage}%` }}
                        />
                      </div>
                      <div className="mt-1 flex items-center justify-between text-xs text-zinc-500">
                        <span>{category.transaction_count} transacciones</span>
                        <span className="font-semibold">{formatCurrency(category.total)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Categories Table */}
              <div className="rounded-lg border border-zinc-950/10 bg-white dark:border-white/10 dark:bg-zinc-900">
                <div className="p-6">
                  <Text className="font-semibold">Top Categorías</Text>
                </div>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeader>Categoría</TableHeader>
                      <TableHeader className="text-right">Monto</TableHeader>
                      <TableHeader className="text-right">%</TableHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {categoryExpenses.slice(0, 8).map((category) => (
                      <TableRow key={category.category_id}>
                        <TableCell className="font-medium">{category.category_name}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(category.total)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge color={category.percentage > 30 ? 'red' : 'zinc'}>
                            {category.percentage.toFixed(1)}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          {/* Insights */}
          {categoryExpenses.length > 0 && (
            <div className="mt-8">
              <Subheading>Insights y Recomendaciones</Subheading>

              <div className="mt-4 space-y-4">
                {/* Highest category warning */}
                {categoryExpenses[0].percentage > 40 && (
                  <div className="rounded-lg border border-orange-200 bg-orange-50 p-6 dark:border-orange-900/50 dark:bg-orange-900/10">
                    <div className="flex items-start gap-4">
                      <div className="text-2xl">⚠️</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-orange-900 dark:text-orange-200">
                          Concentración alta en {categoryExpenses[0].category_name}
                        </h3>
                        <p className="mt-2 text-sm text-orange-800 dark:text-orange-300">
                          El {categoryExpenses[0].percentage.toFixed(1)}% de tus gastos están en
                          esta categoría. Considera revisar si hay oportunidades de optimización.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Month over month increase */}
                {monthlyComparison.changePercent > 20 && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-900/10">
                    <div className="flex items-start gap-4">
                      <div className="text-2xl">📈</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-red-900 dark:text-red-200">
                          Incremento significativo en gastos
                        </h3>
                        <p className="mt-2 text-sm text-red-800 dark:text-red-300">
                          Tus gastos aumentaron {monthlyComparison.changePercent.toFixed(1)}% vs el
                          mes anterior. Revisa tus transacciones recientes para identificar gastos
                          inusuales.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Month over month decrease */}
                {monthlyComparison.changePercent < -10 && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-6 dark:border-green-900/50 dark:bg-green-900/10">
                    <div className="flex items-start gap-4">
                      <div className="text-2xl">🎉</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-green-900 dark:text-green-200">
                          ¡Excelente control de gastos!
                        </h3>
                        <p className="mt-2 text-sm text-green-800 dark:text-green-300">
                          Redujiste tus gastos en {Math.abs(monthlyComparison.changePercent).toFixed(1)}
                          % vs el mes anterior. ¡Sigue así!
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* General tip */}
                {categoryExpenses.length >= 3 && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-900/50 dark:bg-blue-900/10">
                    <div className="flex items-start gap-4">
                      <div className="text-2xl">💡</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-blue-900 dark:text-blue-200">
                          Consejo de ahorro
                        </h3>
                        <p className="mt-2 text-sm text-blue-800 dark:text-blue-300">
                          Tus tres principales categorías de gasto representan el{' '}
                          {categoryExpenses
                            .slice(0, 3)
                            .reduce((sum, c) => sum + c.percentage, 0)
                            .toFixed(1)}
                          % de tus gastos totales. Enfócate en optimizar estas áreas para maximizar
                          tu ahorro.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </>
  )
}
