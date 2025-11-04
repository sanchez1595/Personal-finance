'use client'

import { Badge } from '@/components/badge'
import { Button } from '@/components/button'
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
} from '@/components/dialog'
import { Field, Label } from '@/components/fieldset'
import { Heading, Subheading } from '@/components/heading'
import { Input } from '@/components/input'
import { Select } from '@/components/select'
import { Text } from '@/components/text'
import { createClient } from '@/lib/supabase/client'
import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/16/solid'
import { useEffect, useState } from 'react'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount)
}

interface Budget {
  id: string
  category_id: string
  amount: number
  period: string
  start_date: string
  end_date: string | null
  spent?: number
  percentage?: number
}

interface Category {
  id: string
  name: string
}

export default function PresupuestosPage() {
  const [loading, setLoading] = useState(true)
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)

  // Form state
  const [formCategoryId, setFormCategoryId] = useState('')
  const [formAmount, setFormAmount] = useState('')
  const [formPeriod, setFormPeriod] = useState<'mensual' | 'semanal'>('mensual')
  const [formError, setFormError] = useState('')

  useEffect(() => {
    loadCategories()
    loadBudgets()
  }, [])

  const loadCategories = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const loadBudgets = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Get current month range
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split('T')[0]
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString()
        .split('T')[0]

      // Get budgets
      const { data: budgetsData, error: budgetsError } = await supabase
        .from('budgets')
        .select(
          `
          *,
          category:categories(name)
        `
        )
        .eq('user_id', user.id)
        .lte('start_date', endOfMonth)
        .or(`end_date.is.null,end_date.gte.${startOfMonth}`)
        .order('created_at', { ascending: false })

      if (budgetsError) throw budgetsError

      // Get spending for each budget
      const budgetsWithSpending = await Promise.all(
        (budgetsData || []).map(async (budget) => {
          const { data: transactions, error: txError } = await supabase
            .from('transactions')
            .select('amount')
            .eq('user_id', user.id)
            .eq('category_id', budget.category_id)
            .eq('type', 'gasto')
            .gte('date', startOfMonth)
            .lte('date', endOfMonth)

          if (txError) throw txError

          const spent = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0
          const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0

          return {
            ...budget,
            spent,
            percentage,
          }
        })
      )

      setBudgets(budgetsWithSpending)
    } catch (error) {
      console.error('Error loading budgets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setFormCategoryId(categories.length > 0 ? categories[0].id : '')
    setFormAmount('')
    setFormPeriod('mensual')
    setFormError('')
    setIsAddDialogOpen(true)
  }

  const handleEdit = (budget: Budget) => {
    setSelectedBudget(budget)
    setFormCategoryId(budget.category_id)
    setFormAmount(budget.amount.toString())
    setFormPeriod(budget.period as 'mensual' | 'semanal')
    setFormError('')
    setIsEditDialogOpen(true)
  }

  const handleDelete = (budget: Budget) => {
    setSelectedBudget(budget)
    setIsDeleteDialogOpen(true)
  }

  const submitAdd = async () => {
    setFormError('')

    if (!formCategoryId) {
      setFormError('Debes seleccionar una categoría')
      return
    }

    if (!formAmount || parseFloat(formAmount) <= 0) {
      setFormError('El monto debe ser mayor a 0')
      return
    }

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Calculate start and end dates based on period
      const now = new Date()
      let startDate: string
      let endDate: string | null = null

      if (formPeriod === 'mensual') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
        // No end date for recurring monthly budgets
      } else {
        // Weekly
        const dayOfWeek = now.getDay()
        const diff = now.getDate() - dayOfWeek
        startDate = new Date(now.setDate(diff)).toISOString().split('T')[0]
        endDate = new Date(now.setDate(diff + 6)).toISOString().split('T')[0]
      }

      const { error } = await supabase.from('budgets').insert({
        user_id: user.id,
        category_id: formCategoryId,
        amount: parseFloat(formAmount),
        period: formPeriod,
        start_date: startDate,
        end_date: endDate,
      })

      if (error) throw error

      setIsAddDialogOpen(false)
      loadBudgets()
    } catch (error: any) {
      setFormError(error.message || 'Error al crear el presupuesto')
    }
  }

  const submitEdit = async () => {
    if (!selectedBudget) return
    setFormError('')

    if (!formCategoryId) {
      setFormError('Debes seleccionar una categoría')
      return
    }

    if (!formAmount || parseFloat(formAmount) <= 0) {
      setFormError('El monto debe ser mayor a 0')
      return
    }

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('budgets')
        .update({
          category_id: formCategoryId,
          amount: parseFloat(formAmount),
          period: formPeriod,
        })
        .eq('id', selectedBudget.id)

      if (error) throw error

      setIsEditDialogOpen(false)
      setSelectedBudget(null)
      loadBudgets()
    } catch (error: any) {
      setFormError(error.message || 'Error al actualizar el presupuesto')
    }
  }

  const submitDelete = async () => {
    if (!selectedBudget) return

    try {
      const supabase = createClient()

      const { error } = await supabase.from('budgets').delete().eq('id', selectedBudget.id)

      if (error) throw error

      setIsDeleteDialogOpen(false)
      setSelectedBudget(null)
      loadBudgets()
    } catch (error: any) {
      console.error('Error deleting budget:', error)
    }
  }

  const getStatusColor = (percentage: number) => {
    if (percentage >= 100) return 'red'
    if (percentage >= 80) return 'orange'
    if (percentage >= 60) return 'yellow'
    return 'lime'
  }

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= 80) return 'bg-orange-500'
    if (percentage >= 60) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0)
  const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0)
  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Text className="text-zinc-500">Cargando presupuestos...</Text>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <div>
          <Heading>Presupuestos</Heading>
          <Text>Controla tus gastos por categoría</Text>
        </div>
        <Button onClick={handleAdd} disabled={categories.length === 0}>
          <PlusIcon />
          Crear presupuesto
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-zinc-950/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-900">
          <Text className="text-sm text-zinc-500">Presupuesto Total</Text>
          <div className="mt-2 text-3xl font-semibold text-zinc-950 dark:text-white">
            {formatCurrency(totalBudget)}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-950/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-900">
          <Text className="text-sm text-zinc-500">Gastado</Text>
          <div className="mt-2 text-3xl font-semibold text-zinc-950 dark:text-white">
            {formatCurrency(totalSpent)}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-950/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-900">
          <Text className="text-sm text-zinc-500">Disponible</Text>
          <div
            className={`mt-2 text-3xl font-semibold ${
              totalBudget - totalSpent < 0
                ? 'text-red-600 dark:text-red-400'
                : 'text-green-600 dark:text-green-400'
            }`}
          >
            {formatCurrency(totalBudget - totalSpent)}
          </div>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="mt-8 rounded-lg border border-zinc-950/10 bg-white p-12 text-center dark:border-white/10 dark:bg-zinc-900">
          <Text className="text-zinc-500">
            No hay categorías disponibles. Las categorías se crean automáticamente al agregar
            transacciones.
          </Text>
        </div>
      ) : budgets.length === 0 ? (
        <div className="mt-8 rounded-lg border border-zinc-950/10 bg-white p-12 text-center dark:border-white/10 dark:bg-zinc-900">
          <Text className="text-zinc-500">
            No tienes presupuestos configurados. Crea tu primer presupuesto para controlar tus
            gastos.
          </Text>
          <Button onClick={handleAdd} className="mt-4" outline>
            Crear presupuesto
          </Button>
        </div>
      ) : (
        <>
          {/* Budgets List */}
          <div className="mt-8">
            <Subheading>Presupuestos Activos</Subheading>

            <div className="mt-4 space-y-4">
              {budgets.map((budget) => (
                <div
                  key={budget.id}
                  className="rounded-lg border border-zinc-950/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-900"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-zinc-950 dark:text-white">
                          {(budget as any).category?.name}
                        </h3>
                        <Badge color={getStatusColor(budget.percentage || 0)}>
                          {budget.percentage?.toFixed(0)}%
                        </Badge>
                      </div>
                      <div className="mt-1 flex items-center gap-4 text-sm text-zinc-500">
                        <span className="capitalize">{budget.period}</span>
                        <span>•</span>
                        <span>Presupuesto: {formatCurrency(budget.amount)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button plain onClick={() => handleEdit(budget)}>
                        <PencilIcon />
                      </Button>
                      <Button plain onClick={() => handleDelete(budget)}>
                        <TrashIcon />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-zinc-700 dark:text-zinc-300">
                        Gastado: {formatCurrency(budget.spent || 0)}
                      </span>
                      <span className="text-zinc-500">
                        Restante: {formatCurrency(budget.amount - (budget.spent || 0))}
                      </span>
                    </div>
                    <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div
                        className={`h-full transition-all duration-500 ${getProgressBarColor(budget.percentage || 0)}`}
                        style={{ width: `${Math.min(100, budget.percentage || 0)}%` }}
                      />
                    </div>
                  </div>

                  {budget.percentage && budget.percentage >= 80 && (
                    <div className="mt-4 rounded-lg bg-orange-50 p-3 dark:bg-orange-900/10">
                      <Text className="text-xs text-orange-800 dark:text-orange-300">
                        {budget.percentage >= 100
                          ? '⚠️ Has excedido el presupuesto de esta categoría'
                          : '⚠️ Estás cerca de alcanzar el límite de esta categoría'}
                      </Text>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Overall Progress */}
          <div className="mt-8">
            <Subheading>Progreso General</Subheading>
            <div className="mt-4 rounded-lg border border-zinc-950/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-900">
              <div className="flex items-center justify-between">
                <div>
                  <Text className="text-sm text-zinc-500">Total presupuestado este mes</Text>
                  <div className="mt-1 text-2xl font-semibold text-zinc-950 dark:text-white">
                    {formatCurrency(totalBudget)}
                  </div>
                </div>
                <Badge color={getStatusColor(overallPercentage)} className="text-lg">
                  {overallPercentage.toFixed(0)}%
                </Badge>
              </div>
              <div className="mt-4">
                <div className="h-4 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className={`h-full transition-all duration-500 ${getProgressBarColor(overallPercentage)}`}
                    style={{ width: `${Math.min(100, overallPercentage)}%` }}
                  />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400">
                <span>Gastado: {formatCurrency(totalSpent)}</span>
                <span>Disponible: {formatCurrency(totalBudget - totalSpent)}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add Budget Dialog */}
      <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)}>
        <DialogTitle>Crear presupuesto</DialogTitle>
        <DialogDescription>
          Establece un límite de gasto para una categoría
        </DialogDescription>
        <DialogBody>
          {formError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-200">
              {formError}
            </div>
          )}
          <Field>
            <Label>Categoría</Label>
            <Select
              value={formCategoryId}
              onChange={(e) => setFormCategoryId(e.target.value)}
              autoFocus
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field className="mt-4">
            <Label>Monto del presupuesto</Label>
            <Input
              type="number"
              step="0.01"
              value={formAmount}
              onChange={(e) => setFormAmount(e.target.value)}
              placeholder="0.00"
            />
          </Field>
          <Field className="mt-4">
            <Label>Período</Label>
            <Select value={formPeriod} onChange={(e) => setFormPeriod(e.target.value as any)}>
              <option value="mensual">Mensual</option>
              <option value="semanal">Semanal</option>
            </Select>
          </Field>
        </DialogBody>
        <DialogActions>
          <Button plain onClick={() => setIsAddDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={submitAdd}>Crear presupuesto</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Budget Dialog */}
      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)}>
        <DialogTitle>Editar presupuesto</DialogTitle>
        <DialogDescription>Actualiza el presupuesto de la categoría</DialogDescription>
        <DialogBody>
          {formError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-200">
              {formError}
            </div>
          )}
          <Field>
            <Label>Categoría</Label>
            <Select
              value={formCategoryId}
              onChange={(e) => setFormCategoryId(e.target.value)}
              autoFocus
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field className="mt-4">
            <Label>Monto del presupuesto</Label>
            <Input
              type="number"
              step="0.01"
              value={formAmount}
              onChange={(e) => setFormAmount(e.target.value)}
              placeholder="0.00"
            />
          </Field>
          <Field className="mt-4">
            <Label>Período</Label>
            <Select value={formPeriod} onChange={(e) => setFormPeriod(e.target.value as any)}>
              <option value="mensual">Mensual</option>
              <option value="semanal">Semanal</option>
            </Select>
          </Field>
        </DialogBody>
        <DialogActions>
          <Button plain onClick={() => setIsEditDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={submitEdit}>Guardar cambios</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
        <DialogTitle>Eliminar presupuesto</DialogTitle>
        <DialogDescription>
          ¿Estás seguro de que deseas eliminar este presupuesto? Esta acción no se puede deshacer.
        </DialogDescription>
        <DialogActions>
          <Button plain onClick={() => setIsDeleteDialogOpen(false)}>
            Cancelar
          </Button>
          <Button color="red" onClick={submitDelete}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
