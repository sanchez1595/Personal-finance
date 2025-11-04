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
import { Heading } from '@/components/heading'
import { Input } from '@/components/input'
import { Select } from '@/components/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table'
import { Text } from '@/components/text'
import { Textarea } from '@/components/textarea'
import { createClient } from '@/lib/supabase/client'
import type { IncomeSource } from '@/types/finance'
import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/16/solid'
import { useEffect, useState } from 'react'

const incomeTypeLabels = {
  fijo: 'Fijo',
  variable: 'Variable',
}

const incomeTypeColors = {
  fijo: 'lime',
  variable: 'sky',
} as const

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount)
}

export default function IngresosPage() {
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedSource, setSelectedSource] = useState<IncomeSource | null>(null)

  // Form state
  const [formName, setFormName] = useState('')
  const [formType, setFormType] = useState<'fijo' | 'variable'>('fijo')
  const [formAmount, setFormAmount] = useState('')
  const [formFrequency, setFormFrequency] = useState('mensual')
  const [formDescription, setFormDescription] = useState('')
  const [formError, setFormError] = useState('')

  useEffect(() => {
    loadIncomeSources()
  }, [])

  const loadIncomeSources = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      const { data, error } = await supabase
        .from('income_sources')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setIncomeSources(data || [])
    } catch (error) {
      console.error('Error loading income sources:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setFormName('')
    setFormType('fijo')
    setFormAmount('')
    setFormFrequency('mensual')
    setFormDescription('')
    setFormError('')
    setIsAddDialogOpen(true)
  }

  const handleEdit = (source: IncomeSource) => {
    setSelectedSource(source)
    setFormName(source.name)
    setFormType(source.type)
    setFormAmount(source.amount.toString())
    setFormFrequency(source.frequency)
    setFormDescription(source.description || '')
    setFormError('')
    setIsEditDialogOpen(true)
  }

  const handleDelete = (source: IncomeSource) => {
    setSelectedSource(source)
    setIsDeleteDialogOpen(true)
  }

  const submitAdd = async () => {
    setFormError('')

    if (!formName.trim()) {
      setFormError('El nombre es requerido')
      return
    }

    if (!formAmount || parseFloat(formAmount) <= 0) {
      setFormError('El monto debe ser mayor a 0')
      return
    }

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      const { error } = await supabase.from('income_sources').insert({
        user_id: user.id,
        name: formName.trim(),
        type: formType,
        amount: parseFloat(formAmount),
        frequency: formFrequency,
        description: formDescription.trim() || null,
        is_active: true,
      })

      if (error) throw error

      setIsAddDialogOpen(false)
      loadIncomeSources()
    } catch (error: any) {
      setFormError(error.message || 'Error al crear la fuente de ingreso')
    }
  }

  const submitEdit = async () => {
    if (!selectedSource) return
    setFormError('')

    if (!formName.trim()) {
      setFormError('El nombre es requerido')
      return
    }

    if (!formAmount || parseFloat(formAmount) <= 0) {
      setFormError('El monto debe ser mayor a 0')
      return
    }

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('income_sources')
        .update({
          name: formName.trim(),
          type: formType,
          amount: parseFloat(formAmount),
          frequency: formFrequency,
          description: formDescription.trim() || null,
        })
        .eq('id', selectedSource.id)

      if (error) throw error

      setIsEditDialogOpen(false)
      setSelectedSource(null)
      loadIncomeSources()
    } catch (error: any) {
      setFormError(error.message || 'Error al actualizar la fuente de ingreso')
    }
  }

  const submitDelete = async () => {
    if (!selectedSource) return

    try {
      const supabase = createClient()

      // Soft delete: marcar como inactiva
      const { error } = await supabase
        .from('income_sources')
        .update({ is_active: false })
        .eq('id', selectedSource.id)

      if (error) throw error

      setIsDeleteDialogOpen(false)
      setSelectedSource(null)
      loadIncomeSources()
    } catch (error: any) {
      console.error('Error deleting income source:', error)
    }
  }

  const totalMonthlyIncome = incomeSources
    .filter((source) => source.frequency === 'mensual')
    .reduce((sum, source) => sum + source.amount, 0)

  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <div>
          <Heading>Fuentes de Ingreso</Heading>
          <Text>Administra tus ingresos fijos y variables</Text>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <div>
            <Text className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Ingresos mensuales estimados
            </Text>
            <Text className="mt-1 text-3xl font-semibold text-zinc-950 dark:text-white">
              {formatCurrency(totalMonthlyIncome)}
            </Text>
          </div>
          <Button onClick={handleAdd}>
            <PlusIcon />
            Agregar ingreso
          </Button>
        </div>

        {loading ? (
          <div className="mt-4 text-center">
            <Text>Cargando fuentes de ingreso...</Text>
          </div>
        ) : incomeSources.length === 0 ? (
          <div className="mt-8 text-center">
            <Text className="text-zinc-500">
              No tienes fuentes de ingreso registradas. Agrega tu primera fuente para empezar.
            </Text>
          </div>
        ) : (
          <Table className="mt-4">
            <TableHead>
              <TableRow>
                <TableHeader>Nombre</TableHeader>
                <TableHeader>Tipo</TableHeader>
                <TableHeader>Frecuencia</TableHeader>
                <TableHeader className="text-right">Monto</TableHeader>
                <TableHeader className="text-right">Acciones</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {incomeSources.map((source) => (
                <TableRow key={source.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{source.name}</div>
                      {source.description && (
                        <div className="text-xs text-zinc-500">{source.description}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge color={incomeTypeColors[source.type]}>
                      {incomeTypeLabels[source.type]}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize">{source.frequency}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(source.amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button plain onClick={() => handleEdit(source)}>
                        <PencilIcon />
                      </Button>
                      <Button plain onClick={() => handleDelete(source)}>
                        <TrashIcon />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Add Income Source Dialog */}
      <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)}>
        <DialogTitle>Agregar fuente de ingreso</DialogTitle>
        <DialogDescription>
          Registra un nuevo ingreso fijo o variable
        </DialogDescription>
        <DialogBody>
          {formError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-200">
              {formError}
            </div>
          )}
          <Field>
            <Label>Nombre</Label>
            <Input
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="ej. Salario mensual"
              autoFocus
            />
          </Field>
          <Field className="mt-4">
            <Label>Tipo</Label>
            <Select value={formType} onChange={(e) => setFormType(e.target.value as any)}>
              <option value="fijo">Fijo</option>
              <option value="variable">Variable</option>
            </Select>
          </Field>
          <Field className="mt-4">
            <Label>Monto</Label>
            <Input
              type="number"
              step="0.01"
              value={formAmount}
              onChange={(e) => setFormAmount(e.target.value)}
              placeholder="0.00"
            />
          </Field>
          <Field className="mt-4">
            <Label>Frecuencia</Label>
            <Select value={formFrequency} onChange={(e) => setFormFrequency(e.target.value)}>
              <option value="mensual">Mensual</option>
              <option value="quincenal">Quincenal</option>
              <option value="semanal">Semanal</option>
              <option value="eventual">Eventual</option>
            </Select>
          </Field>
          <Field className="mt-4">
            <Label>Descripción (opcional)</Label>
            <Textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Información adicional sobre este ingreso"
              rows={2}
            />
          </Field>
        </DialogBody>
        <DialogActions>
          <Button plain onClick={() => setIsAddDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={submitAdd}>Crear ingreso</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Income Source Dialog */}
      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)}>
        <DialogTitle>Editar fuente de ingreso</DialogTitle>
        <DialogDescription>
          Actualiza la información de tu ingreso
        </DialogDescription>
        <DialogBody>
          {formError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-200">
              {formError}
            </div>
          )}
          <Field>
            <Label>Nombre</Label>
            <Input
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="ej. Salario mensual"
              autoFocus
            />
          </Field>
          <Field className="mt-4">
            <Label>Tipo</Label>
            <Select value={formType} onChange={(e) => setFormType(e.target.value as any)}>
              <option value="fijo">Fijo</option>
              <option value="variable">Variable</option>
            </Select>
          </Field>
          <Field className="mt-4">
            <Label>Monto</Label>
            <Input
              type="number"
              step="0.01"
              value={formAmount}
              onChange={(e) => setFormAmount(e.target.value)}
              placeholder="0.00"
            />
          </Field>
          <Field className="mt-4">
            <Label>Frecuencia</Label>
            <Select value={formFrequency} onChange={(e) => setFormFrequency(e.target.value)}>
              <option value="mensual">Mensual</option>
              <option value="quincenal">Quincenal</option>
              <option value="semanal">Semanal</option>
              <option value="eventual">Eventual</option>
            </Select>
          </Field>
          <Field className="mt-4">
            <Label>Descripción (opcional)</Label>
            <Textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Información adicional sobre este ingreso"
              rows={2}
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
        <DialogTitle>Eliminar fuente de ingreso</DialogTitle>
        <DialogDescription>
          ¿Estás seguro de que deseas eliminar "{selectedSource?.name}"? Esta acción no se puede deshacer.
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
