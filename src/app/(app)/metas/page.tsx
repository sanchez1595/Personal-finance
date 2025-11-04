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
import { Textarea } from '@/components/textarea'
import { createClient } from '@/lib/supabase/client'
import type { Goal, GoalType, GoalContribution } from '@/types/finance'
import {
  CheckCircleIcon,
  PauseCircleIcon,
  PencilIcon,
  PlayCircleIcon,
  PlusIcon,
  RocketLaunchIcon,
  TrashIcon,
} from '@heroicons/react/16/solid'
import { useEffect, useState } from 'react'

// Tipos de metas predefinidas con información adicional
const goalTypes = {
  emergencia: {
    label: 'Fondo de Emergencia',
    icon: '🛡️',
    description: 'Ahorra para imprevistos (3-6 meses de gastos)',
    color: 'red',
  },
  compra: {
    label: 'Compra Grande',
    icon: '🏠',
    description: 'Casa, auto, electrodoméstico',
    color: 'blue',
  },
  deuda: {
    label: 'Salir de Deudas',
    icon: '💳',
    description: 'Liquida tus deudas pendientes',
    color: 'orange',
  },
  ahorro: {
    label: 'Ahorro General',
    icon: '💰',
    description: 'Vacaciones, jubilación, educación',
    color: 'green',
  },
  personalizada: {
    label: 'Meta Personalizada',
    icon: '✨',
    description: 'Define tu propia meta',
    color: 'purple',
  },
} as const

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount)
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('es-MX', {
    month: 'long',
    year: 'numeric',
  })
}

function calculateProgress(current: number, target: number): number {
  if (target === 0) return 0
  return Math.min(100, (current / target) * 100)
}

function calculateMonthsRemaining(deadline: string): number {
  const today = new Date()
  const targetDate = new Date(deadline)
  const months = (targetDate.getFullYear() - today.getFullYear()) * 12 + (targetDate.getMonth() - today.getMonth())
  return Math.max(0, months)
}

export default function MetasPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isContributeDialogOpen, setIsContributeDialogOpen] = useState(false)
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)

  // Wizard state
  const [wizardStep, setWizardStep] = useState(1)
  const [wizardType, setWizardType] = useState<GoalType>('emergencia')
  const [wizardName, setWizardName] = useState('')
  const [wizardAmount, setWizardAmount] = useState('')
  const [wizardDeadline, setWizardDeadline] = useState('')
  const [wizardContribution, setWizardContribution] = useState('')
  const [wizardError, setWizardError] = useState('')

  // Edit state
  const [editName, setEditName] = useState('')
  const [editAmount, setEditAmount] = useState('')
  const [editDeadline, setEditDeadline] = useState('')
  const [editContribution, setEditContribution] = useState('')
  const [editError, setEditError] = useState('')

  // Contribute state
  const [contributeAmount, setContributeAmount] = useState('')
  const [contributeDescription, setContributeDescription] = useState('')
  const [contributeError, setContributeError] = useState('')

  useEffect(() => {
    loadGoals()
  }, [])

  const loadGoals = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('status', { ascending: true }) // Activas primero
        .order('deadline', { ascending: true })

      if (error) throw error
      setGoals(data || [])
    } catch (error) {
      console.error('Error loading goals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartWizard = () => {
    setWizardStep(1)
    setWizardType('emergencia')
    setWizardName('')
    setWizardAmount('')
    setWizardDeadline('')
    setWizardContribution('')
    setWizardError('')
    setIsWizardOpen(true)
  }

  const handleWizardNext = () => {
    setWizardError('')

    if (wizardStep === 1) {
      // Step 1: Seleccionar tipo - siempre puede avanzar
      setWizardStep(2)
    } else if (wizardStep === 2) {
      // Step 2: Nombre y monto
      if (!wizardName.trim()) {
        setWizardError('El nombre es requerido')
        return
      }
      if (!wizardAmount || parseFloat(wizardAmount) <= 0) {
        setWizardError('El monto objetivo debe ser mayor a 0')
        return
      }
      setWizardStep(3)
    } else if (wizardStep === 3) {
      // Step 3: Plazo
      if (!wizardDeadline) {
        setWizardError('La fecha objetivo es requerida')
        return
      }
      const targetDate = new Date(wizardDeadline)
      const today = new Date()
      if (targetDate <= today) {
        setWizardError('La fecha objetivo debe ser futura')
        return
      }
      setWizardStep(4)
    } else if (wizardStep === 4) {
      // Step 4: Aporte mensual
      if (!wizardContribution || parseFloat(wizardContribution) <= 0) {
        setWizardError('El aporte mensual debe ser mayor a 0')
        return
      }
      setWizardStep(5)
    }
  }

  const handleWizardBack = () => {
    setWizardError('')
    setWizardStep(wizardStep - 1)
  }

  const submitWizard = async () => {
    setWizardError('')

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { error } = await supabase.from('goals').insert({
        user_id: user.id,
        name: wizardName.trim(),
        type: wizardType,
        target_amount: parseFloat(wizardAmount),
        current_amount: 0,
        monthly_contribution: parseFloat(wizardContribution),
        deadline: wizardDeadline,
        status: 'activa',
      })

      if (error) throw error

      setIsWizardOpen(false)
      loadGoals()
    } catch (error: any) {
      setWizardError(error.message || 'Error al crear la meta')
    }
  }

  const handleEdit = (goal: Goal) => {
    setSelectedGoal(goal)
    setEditName(goal.name)
    setEditAmount(goal.target_amount.toString())
    setEditDeadline(goal.deadline)
    setEditContribution(goal.monthly_contribution.toString())
    setEditError('')
    setIsEditDialogOpen(true)
  }

  const submitEdit = async () => {
    if (!selectedGoal) return
    setEditError('')

    if (!editName.trim()) {
      setEditError('El nombre es requerido')
      return
    }

    if (!editAmount || parseFloat(editAmount) <= 0) {
      setEditError('El monto objetivo debe ser mayor a 0')
      return
    }

    if (!editContribution || parseFloat(editContribution) <= 0) {
      setEditError('El aporte mensual debe ser mayor a 0')
      return
    }

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('goals')
        .update({
          name: editName.trim(),
          target_amount: parseFloat(editAmount),
          monthly_contribution: parseFloat(editContribution),
          deadline: editDeadline,
        })
        .eq('id', selectedGoal.id)

      if (error) throw error

      setIsEditDialogOpen(false)
      setSelectedGoal(null)
      loadGoals()
    } catch (error: any) {
      setEditError(error.message || 'Error al actualizar la meta')
    }
  }

  const handleTogglePause = async (goal: Goal) => {
    try {
      const supabase = createClient()
      const newStatus = goal.status === 'activa' ? 'pausada' : 'activa'

      const { error } = await supabase
        .from('goals')
        .update({ status: newStatus })
        .eq('id', goal.id)

      if (error) throw error
      loadGoals()
    } catch (error: any) {
      console.error('Error toggling goal status:', error)
    }
  }

  const handleDelete = (goal: Goal) => {
    setSelectedGoal(goal)
    setIsDeleteDialogOpen(true)
  }

  const submitDelete = async () => {
    if (!selectedGoal) return

    try {
      const supabase = createClient()

      const { error } = await supabase.from('goals').delete().eq('id', selectedGoal.id)

      if (error) throw error

      setIsDeleteDialogOpen(false)
      setSelectedGoal(null)
      loadGoals()
    } catch (error: any) {
      console.error('Error deleting goal:', error)
    }
  }

  const handleContribute = (goal: Goal) => {
    setSelectedGoal(goal)
    setContributeAmount('')
    setContributeDescription('')
    setContributeError('')
    setIsContributeDialogOpen(true)
  }

  const submitContribution = async () => {
    if (!selectedGoal) return
    setContributeError('')

    if (!contributeAmount || parseFloat(contributeAmount) <= 0) {
      setContributeError('El monto debe ser mayor a 0')
      return
    }

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const amount = parseFloat(contributeAmount)
      const newCurrentAmount = selectedGoal.current_amount + amount

      // Crear el aporte
      const { error: contributionError } = await supabase.from('goal_contributions').insert({
        goal_id: selectedGoal.id,
        user_id: user.id,
        amount: amount,
        description: contributeDescription.trim() || null,
        contribution_date: new Date().toISOString().split('T')[0],
      })

      if (contributionError) throw contributionError

      // Actualizar el monto actual de la meta
      const { error: updateError } = await supabase
        .from('goals')
        .update({ current_amount: newCurrentAmount })
        .eq('id', selectedGoal.id)

      if (updateError) throw updateError

      // Si se alcanzó la meta, marcar como completada
      if (newCurrentAmount >= selectedGoal.target_amount) {
        setIsContributeDialogOpen(false)
        setSelectedGoal({ ...selectedGoal, current_amount: newCurrentAmount })
        setIsCompleteDialogOpen(true)
      } else {
        setIsContributeDialogOpen(false)
        setSelectedGoal(null)
        loadGoals()
      }
    } catch (error: any) {
      setContributeError(error.message || 'Error al registrar el aporte')
    }
  }

  const handleCompleteGoal = async () => {
    if (!selectedGoal) return

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('goals')
        .update({ status: 'completada' })
        .eq('id', selectedGoal.id)

      if (error) throw error

      setIsCompleteDialogOpen(false)
      setSelectedGoal(null)
      loadGoals()
    } catch (error: any) {
      console.error('Error completing goal:', error)
    }
  }

  const activeGoals = goals.filter((g) => g.status === 'activa')
  const pausedGoals = goals.filter((g) => g.status === 'pausada')
  const completedGoals = goals.filter((g) => g.status === 'completada')

  const totalSaved = activeGoals.reduce((sum, goal) => sum + goal.current_amount, 0)
  const totalTarget = activeGoals.reduce((sum, goal) => sum + goal.target_amount, 0)
  const monthlyCommitment = activeGoals.reduce((sum, goal) => sum + goal.monthly_contribution, 0)

  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <div>
          <Heading>Metas Financieras</Heading>
          <Text>Define y alcanza tus objetivos de ahorro</Text>
        </div>
      </div>

      {/* Resumen de metas */}
      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <Text className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Ahorrado</Text>
          <Text className="mt-2 text-3xl font-semibold text-zinc-950 dark:text-white">
            {formatCurrency(totalSaved)}
          </Text>
          <Text className="mt-1 text-xs text-zinc-500">de {formatCurrency(totalTarget)}</Text>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <Text className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Metas Activas</Text>
          <Text className="mt-2 text-3xl font-semibold text-zinc-950 dark:text-white">
            {activeGoals.length}
          </Text>
          <Text className="mt-1 text-xs text-zinc-500">
            {pausedGoals.length} pausadas, {completedGoals.length} completadas
          </Text>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <Text className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Compromiso Mensual
          </Text>
          <Text className="mt-2 text-3xl font-semibold text-zinc-950 dark:text-white">
            {formatCurrency(monthlyCommitment)}
          </Text>
          <Text className="mt-1 text-xs text-zinc-500">Aportes mensuales planeados</Text>
        </div>
      </div>

      {/* Botón para crear meta */}
      <div className="mt-8 flex justify-end">
        <Button onClick={handleStartWizard}>
          <PlusIcon />
          Crear nueva meta
        </Button>
      </div>

      {loading ? (
        <div className="mt-4 text-center">
          <Text>Cargando metas...</Text>
        </div>
      ) : goals.length === 0 ? (
        <div className="mt-8 text-center">
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <RocketLaunchIcon className="h-12 w-12 text-zinc-400" />
          </div>
          <Subheading>No tienes metas registradas</Subheading>
          <Text className="mt-2 text-zinc-500">
            Crea tu primera meta financiera y comienza a ahorrar para alcanzarla
          </Text>
        </div>
      ) : (
        <>
          {/* Metas activas */}
          {activeGoals.length > 0 && (
            <div className="mt-8">
              <Subheading>Metas Activas</Subheading>
              <div className="mt-4 grid gap-6 sm:grid-cols-2">
                {activeGoals.map((goal) => {
                  const progress = calculateProgress(goal.current_amount, goal.target_amount)
                  const monthsRemaining = calculateMonthsRemaining(goal.deadline)
                  const goalInfo = goalTypes[goal.type]
                  const remainingAmount = goal.target_amount - goal.current_amount

                  return (
                    <div
                      key={goal.id}
                      className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">{goalInfo.icon}</div>
                          <div>
                            <h3 className="font-semibold text-zinc-950 dark:text-white">
                              {goal.name}
                            </h3>
                            <Badge color={goalInfo.color as any}>{goalInfo.label}</Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button plain onClick={() => handleEdit(goal)}>
                            <PencilIcon />
                          </Button>
                          <Button plain onClick={() => handleTogglePause(goal)}>
                            <PauseCircleIcon />
                          </Button>
                          <Button plain onClick={() => handleDelete(goal)}>
                            <TrashIcon />
                          </Button>
                        </div>
                      </div>

                      <div className="mt-6">
                        <div className="flex items-end justify-between">
                          <div>
                            <Text className="text-sm text-zinc-600 dark:text-zinc-400">
                              Progreso
                            </Text>
                            <Text className="text-2xl font-semibold text-zinc-950 dark:text-white">
                              {formatCurrency(goal.current_amount)}
                            </Text>
                            <Text className="text-xs text-zinc-500">
                              de {formatCurrency(goal.target_amount)}
                            </Text>
                          </div>
                          <div className="text-right">
                            <Text className="text-3xl font-bold text-blue-600">
                              {progress.toFixed(0)}%
                            </Text>
                          </div>
                        </div>

                        <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                            style={{ width: `${Math.min(100, progress)}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-6 grid grid-cols-2 gap-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
                        <div>
                          <Text className="text-xs text-zinc-600 dark:text-zinc-400">
                            Faltan
                          </Text>
                          <Text className="font-medium text-zinc-950 dark:text-white">
                            {formatCurrency(remainingAmount)}
                          </Text>
                        </div>
                        <div>
                          <Text className="text-xs text-zinc-600 dark:text-zinc-400">
                            Aporte mensual
                          </Text>
                          <Text className="font-medium text-zinc-950 dark:text-white">
                            {formatCurrency(goal.monthly_contribution)}
                          </Text>
                        </div>
                        <div>
                          <Text className="text-xs text-zinc-600 dark:text-zinc-400">
                            Plazo objetivo
                          </Text>
                          <Text className="font-medium text-zinc-950 dark:text-white">
                            {formatDate(goal.deadline)}
                          </Text>
                        </div>
                        <div>
                          <Text className="text-xs text-zinc-600 dark:text-zinc-400">
                            Tiempo restante
                          </Text>
                          <Text className="font-medium text-zinc-950 dark:text-white">
                            {monthsRemaining} {monthsRemaining === 1 ? 'mes' : 'meses'}
                          </Text>
                        </div>
                      </div>

                      <div className="mt-4">
                        <Button className="w-full" onClick={() => handleContribute(goal)}>
                          <PlusIcon />
                          Registrar aporte
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Metas pausadas */}
          {pausedGoals.length > 0 && (
            <div className="mt-8">
              <Subheading>Metas Pausadas</Subheading>
              <div className="mt-4 space-y-4">
                {pausedGoals.map((goal) => {
                  const progress = calculateProgress(goal.current_amount, goal.target_amount)
                  const goalInfo = goalTypes[goal.type]

                  return (
                    <div
                      key={goal.id}
                      className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-2xl opacity-50">{goalInfo.icon}</div>
                        <div>
                          <Text className="font-medium text-zinc-950 dark:text-white">
                            {goal.name}
                          </Text>
                          <Text className="text-sm text-zinc-600 dark:text-zinc-400">
                            {formatCurrency(goal.current_amount)} de{' '}
                            {formatCurrency(goal.target_amount)} ({progress.toFixed(0)}%)
                          </Text>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button outline onClick={() => handleTogglePause(goal)}>
                          <PlayCircleIcon />
                          Reactivar
                        </Button>
                        <Button plain onClick={() => handleDelete(goal)}>
                          <TrashIcon />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Metas completadas */}
          {completedGoals.length > 0 && (
            <div className="mt-8">
              <Subheading>Metas Completadas 🎉</Subheading>
              <div className="mt-4 space-y-4">
                {completedGoals.map((goal) => {
                  const goalInfo = goalTypes[goal.type]

                  return (
                    <div
                      key={goal.id}
                      className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900/50 dark:bg-green-900/10"
                    >
                      <div className="flex items-center gap-4">
                        <CheckCircleIcon className="h-8 w-8 text-green-600" />
                        <div>
                          <Text className="font-medium text-zinc-950 dark:text-white">
                            {goal.name}
                          </Text>
                          <Text className="text-sm text-green-700 dark:text-green-400">
                            Meta alcanzada: {formatCurrency(goal.current_amount)}
                          </Text>
                        </div>
                      </div>
                      <Button plain onClick={() => handleDelete(goal)}>
                        <TrashIcon />
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Wizard Dialog */}
      <Dialog open={isWizardOpen} onClose={() => setIsWizardOpen(false)} size="2xl">
        <DialogTitle>Crear Nueva Meta - Paso {wizardStep} de 5</DialogTitle>
        <DialogDescription>
          {wizardStep === 1 && 'Selecciona el tipo de meta que quieres crear'}
          {wizardStep === 2 && 'Define el nombre y monto objetivo de tu meta'}
          {wizardStep === 3 && 'Establece la fecha en la que quieres alcanzar tu meta'}
          {wizardStep === 4 && 'Calcula cuánto debes aportar mensualmente'}
          {wizardStep === 5 && 'Revisa y confirma tu meta'}
        </DialogDescription>

        <DialogBody>
          {wizardError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-200">
              {wizardError}
            </div>
          )}

          {/* Step 1: Tipo de meta */}
          {wizardStep === 1 && (
            <div className="space-y-3">
              {(Object.keys(goalTypes) as GoalType[]).map((type) => {
                const info = goalTypes[type]
                return (
                  <button
                    key={type}
                    onClick={() => setWizardType(type)}
                    className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                      wizardType === type
                        ? 'border-blue-500 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20'
                        : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{info.icon}</div>
                      <div className="flex-1">
                        <Text className="font-semibold text-zinc-950 dark:text-white">
                          {info.label}
                        </Text>
                        <Text className="text-sm text-zinc-600 dark:text-zinc-400">
                          {info.description}
                        </Text>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* Step 2: Nombre y monto */}
          {wizardStep === 2 && (
            <>
              <Field>
                <Label>Nombre de la meta</Label>
                <Input
                  value={wizardName}
                  onChange={(e) => setWizardName(e.target.value)}
                  placeholder="ej. Vacaciones a Europa, Auto nuevo"
                  autoFocus
                />
              </Field>
              <Field className="mt-4">
                <Label>Monto objetivo</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={wizardAmount}
                  onChange={(e) => setWizardAmount(e.target.value)}
                  placeholder="0.00"
                />
              </Field>
            </>
          )}

          {/* Step 3: Plazo */}
          {wizardStep === 3 && (
            <Field>
              <Label>Fecha objetivo</Label>
              <Input
                type="month"
                value={wizardDeadline}
                onChange={(e) => setWizardDeadline(e.target.value + '-01')}
                min={new Date().toISOString().slice(0, 7)}
              />
              <Text className="mt-2 text-sm text-zinc-600">
                Selecciona el mes y año en que quieres alcanzar esta meta
              </Text>
            </Field>
          )}

          {/* Step 4: Aporte mensual */}
          {wizardStep === 4 && (
            <>
              <Field>
                <Label>Aporte mensual</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={wizardContribution}
                  onChange={(e) => setWizardContribution(e.target.value)}
                  placeholder="0.00"
                />
              </Field>
              {wizardAmount && wizardDeadline && (
                <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-900/10">
                  <Text className="text-sm font-medium text-blue-900 dark:text-blue-200">
                    💡 Proyección
                  </Text>
                  {(() => {
                    const months = calculateMonthsRemaining(wizardDeadline)
                    const suggested = months > 0 ? parseFloat(wizardAmount) / months : 0
                    return (
                      <Text className="mt-2 text-sm text-blue-800 dark:text-blue-300">
                        Para alcanzar {formatCurrency(parseFloat(wizardAmount))} en {months}{' '}
                        meses, necesitas aportar aproximadamente{' '}
                        <strong>{formatCurrency(suggested)}</strong> al mes.
                      </Text>
                    )
                  })()}
                </div>
              )}
            </>
          )}

          {/* Step 5: Resumen */}
          {wizardStep === 5 && (
            <div className="space-y-4">
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{goalTypes[wizardType].icon}</div>
                  <div>
                    <Text className="text-lg font-semibold text-zinc-950 dark:text-white">
                      {wizardName}
                    </Text>
                    <Badge color={goalTypes[wizardType].color as any}>
                      {goalTypes[wizardType].label}
                    </Badge>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <Text className="text-sm text-zinc-600 dark:text-zinc-400">
                      Monto objetivo
                    </Text>
                    <Text className="text-xl font-semibold text-zinc-950 dark:text-white">
                      {formatCurrency(parseFloat(wizardAmount))}
                    </Text>
                  </div>
                  <div>
                    <Text className="text-sm text-zinc-600 dark:text-zinc-400">
                      Aporte mensual
                    </Text>
                    <Text className="text-xl font-semibold text-zinc-950 dark:text-white">
                      {formatCurrency(parseFloat(wizardContribution))}
                    </Text>
                  </div>
                  <div>
                    <Text className="text-sm text-zinc-600 dark:text-zinc-400">
                      Fecha objetivo
                    </Text>
                    <Text className="font-medium text-zinc-950 dark:text-white">
                      {formatDate(wizardDeadline)}
                    </Text>
                  </div>
                  <div>
                    <Text className="text-sm text-zinc-600 dark:text-zinc-400">
                      Tiempo para lograrlo
                    </Text>
                    <Text className="font-medium text-zinc-950 dark:text-white">
                      {calculateMonthsRemaining(wizardDeadline)} meses
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogBody>

        <DialogActions>
          {wizardStep > 1 && (
            <Button plain onClick={handleWizardBack}>
              Atrás
            </Button>
          )}
          <Button plain onClick={() => setIsWizardOpen(false)}>
            Cancelar
          </Button>
          {wizardStep < 5 ? (
            <Button onClick={handleWizardNext}>Siguiente</Button>
          ) : (
            <Button onClick={submitWizard}>Crear meta</Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Edit Goal Dialog */}
      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)}>
        <DialogTitle>Editar Meta</DialogTitle>
        <DialogDescription>Actualiza la información de tu meta</DialogDescription>
        <DialogBody>
          {editError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-200">
              {editError}
            </div>
          )}
          <Field>
            <Label>Nombre</Label>
            <Input value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus />
          </Field>
          <Field className="mt-4">
            <Label>Monto objetivo</Label>
            <Input
              type="number"
              step="0.01"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
            />
          </Field>
          <Field className="mt-4">
            <Label>Fecha objetivo</Label>
            <Input
              type="month"
              value={editDeadline?.slice(0, 7)}
              onChange={(e) => setEditDeadline(e.target.value + '-01')}
            />
          </Field>
          <Field className="mt-4">
            <Label>Aporte mensual</Label>
            <Input
              type="number"
              step="0.01"
              value={editContribution}
              onChange={(e) => setEditContribution(e.target.value)}
            />
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
        <DialogTitle>Eliminar Meta</DialogTitle>
        <DialogDescription>
          ¿Estás seguro de que deseas eliminar "{selectedGoal?.name}"? Esta acción no se puede
          deshacer y se perderá todo el historial de aportes.
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

      {/* Contribute Dialog */}
      <Dialog open={isContributeDialogOpen} onClose={() => setIsContributeDialogOpen(false)}>
        <DialogTitle>Registrar Aporte</DialogTitle>
        <DialogDescription>Agrega un aporte a tu meta "{selectedGoal?.name}"</DialogDescription>
        <DialogBody>
          {contributeError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-200">
              {contributeError}
            </div>
          )}
          <Field>
            <Label>Monto del aporte</Label>
            <Input
              type="number"
              step="0.01"
              value={contributeAmount}
              onChange={(e) => setContributeAmount(e.target.value)}
              placeholder="0.00"
              autoFocus
            />
          </Field>
          <Field className="mt-4">
            <Label>Descripción (opcional)</Label>
            <Textarea
              value={contributeDescription}
              onChange={(e) => setContributeDescription(e.target.value)}
              placeholder="ej. Ahorro del mes de noviembre"
              rows={2}
            />
          </Field>
          {selectedGoal && contributeAmount && (
            <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-900/10">
              <Text className="text-sm text-blue-900 dark:text-blue-200">
                Nuevo progreso:{' '}
                <strong>
                  {formatCurrency(
                    selectedGoal.current_amount + parseFloat(contributeAmount || '0')
                  )}
                </strong>{' '}
                de {formatCurrency(selectedGoal.target_amount)} (
                {calculateProgress(
                  selectedGoal.current_amount + parseFloat(contributeAmount || '0'),
                  selectedGoal.target_amount
                ).toFixed(1)}
                %)
              </Text>
            </div>
          )}
        </DialogBody>
        <DialogActions>
          <Button plain onClick={() => setIsContributeDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={submitContribution}>Registrar aporte</Button>
        </DialogActions>
      </Dialog>

      {/* Complete Goal Dialog */}
      <Dialog open={isCompleteDialogOpen} onClose={handleCompleteGoal}>
        <DialogTitle>🎉 ¡Felicitaciones!</DialogTitle>
        <DialogDescription>
          Has alcanzado tu meta "{selectedGoal?.name}". ¡Excelente trabajo!
        </DialogDescription>
        <DialogBody>
          <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center dark:border-green-900/50 dark:bg-green-900/10">
            <div className="mb-4 text-6xl">🎯</div>
            <Text className="text-lg font-semibold text-green-900 dark:text-green-200">
              Meta Completada
            </Text>
            <Text className="mt-2 text-green-800 dark:text-green-300">
              Lograste ahorrar {selectedGoal && formatCurrency(selectedGoal.current_amount)}
            </Text>
          </div>
        </DialogBody>
        <DialogActions>
          <Button onClick={handleCompleteGoal}>¡Genial!</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
