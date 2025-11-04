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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table'
import { Text } from '@/components/text'
import { Textarea } from '@/components/textarea'
import { createClient } from '@/lib/supabase/client'
import type { Account, Transaction } from '@/types/finance'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/16/solid'
import { useEffect, useState } from 'react'

const accountTypeLabels = {
  efectivo: 'Efectivo',
  banco: 'Banco',
  tarjeta: 'Tarjeta de Crédito',
  inversion: 'Inversión',
}

const accountTypeColors = {
  efectivo: 'lime',
  banco: 'sky',
  tarjeta: 'pink',
  inversion: 'purple',
} as const

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount)
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

type Tab = 'cuentas' | 'transacciones'

interface Category {
  id: string
  name: string
}

export default function TransaccionesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('transacciones')

  // Accounts state
  const [accounts, setAccounts] = useState<Account[]>([])
  const [accountsLoading, setAccountsLoading] = useState(true)
  const [isAddAccountDialogOpen, setIsAddAccountDialogOpen] = useState(false)
  const [isEditAccountDialogOpen, setIsEditAccountDialogOpen] = useState(false)
  const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)

  // Transactions state
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [transactionsLoading, setTransactionsLoading] = useState(true)
  const [isAddTransactionDialogOpen, setIsAddTransactionDialogOpen] = useState(false)
  const [isDeleteTransactionDialogOpen, setIsDeleteTransactionDialogOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)

  // Categories
  const [categories, setCategories] = useState<Category[]>([])

  // Account form state
  const [accountFormName, setAccountFormName] = useState('')
  const [accountFormType, setAccountFormType] = useState<'efectivo' | 'banco' | 'tarjeta' | 'inversion'>('efectivo')
  const [accountFormBalance, setAccountFormBalance] = useState('')
  const [accountFormError, setAccountFormError] = useState('')

  // Transaction form state
  const [transactionFormType, setTransactionFormType] = useState<'ingreso' | 'gasto'>('gasto')
  const [transactionFormAccountId, setTransactionFormAccountId] = useState('')
  const [transactionFormCategoryId, setTransactionFormCategoryId] = useState('')
  const [transactionFormAmount, setTransactionFormAmount] = useState('')
  const [transactionFormDescription, setTransactionFormDescription] = useState('')
  const [transactionFormNotes, setTransactionFormNotes] = useState('')
  const [transactionFormDate, setTransactionFormDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [transactionFormError, setTransactionFormError] = useState('')

  useEffect(() => {
    loadAccounts()
    loadTransactions()
    loadCategories()
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

  const loadAccounts = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setAccounts(data || [])
    } catch (error) {
      console.error('Error loading accounts:', error)
    } finally {
      setAccountsLoading(false)
    }
  }

  const loadTransactions = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          account:accounts(name),
          category:categories(name)
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(50)

      if (error) throw error
      setTransactions(data || [])
    } catch (error) {
      console.error('Error loading transactions:', error)
    } finally {
      setTransactionsLoading(false)
    }
  }

  // Account handlers
  const handleAddAccount = () => {
    setAccountFormName('')
    setAccountFormType('efectivo')
    setAccountFormBalance('0')
    setAccountFormError('')
    setIsAddAccountDialogOpen(true)
  }

  const handleEditAccount = (account: Account) => {
    setSelectedAccount(account)
    setAccountFormName(account.name)
    setAccountFormType(account.type)
    setAccountFormBalance(account.balance.toString())
    setAccountFormError('')
    setIsEditAccountDialogOpen(true)
  }

  const handleDeleteAccount = (account: Account) => {
    setSelectedAccount(account)
    setIsDeleteAccountDialogOpen(true)
  }

  const submitAddAccount = async () => {
    setAccountFormError('')

    if (!accountFormName.trim()) {
      setAccountFormError('El nombre es requerido')
      return
    }

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { error } = await supabase.from('accounts').insert({
        user_id: user.id,
        name: accountFormName.trim(),
        type: accountFormType,
        balance: parseFloat(accountFormBalance) || 0,
        is_active: true,
      })

      if (error) throw error

      setIsAddAccountDialogOpen(false)
      loadAccounts()
    } catch (error: any) {
      setAccountFormError(error.message || 'Error al crear la cuenta')
    }
  }

  const submitEditAccount = async () => {
    if (!selectedAccount) return
    setAccountFormError('')

    if (!accountFormName.trim()) {
      setAccountFormError('El nombre es requerido')
      return
    }

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('accounts')
        .update({
          name: accountFormName.trim(),
          type: accountFormType,
          balance: parseFloat(accountFormBalance) || 0,
        })
        .eq('id', selectedAccount.id)

      if (error) throw error

      setIsEditAccountDialogOpen(false)
      setSelectedAccount(null)
      loadAccounts()
    } catch (error: any) {
      setAccountFormError(error.message || 'Error al actualizar la cuenta')
    }
  }

  const submitDeleteAccount = async () => {
    if (!selectedAccount) return

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('accounts')
        .update({ is_active: false })
        .eq('id', selectedAccount.id)

      if (error) throw error

      setIsDeleteAccountDialogOpen(false)
      setSelectedAccount(null)
      loadAccounts()
    } catch (error: any) {
      console.error('Error deleting account:', error)
    }
  }

  // Transaction handlers
  const handleAddTransaction = () => {
    setTransactionFormType('gasto')
    setTransactionFormAccountId(accounts.length > 0 ? accounts[0].id : '')
    setTransactionFormCategoryId(categories.length > 0 ? categories[0].id : '')
    setTransactionFormAmount('')
    setTransactionFormDescription('')
    setTransactionFormNotes('')
    setTransactionFormDate(new Date().toISOString().split('T')[0])
    setTransactionFormError('')
    setIsAddTransactionDialogOpen(true)
  }

  const handleDeleteTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsDeleteTransactionDialogOpen(true)
  }

  const submitAddTransaction = async () => {
    setTransactionFormError('')

    if (!transactionFormAccountId) {
      setTransactionFormError('Debes seleccionar una cuenta')
      return
    }

    if (!transactionFormCategoryId) {
      setTransactionFormError('Debes seleccionar una categoría')
      return
    }

    if (!transactionFormAmount || parseFloat(transactionFormAmount) <= 0) {
      setTransactionFormError('El monto debe ser mayor a 0')
      return
    }

    if (!transactionFormDescription.trim()) {
      setTransactionFormError('La descripción es requerida')
      return
    }

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { error } = await supabase.from('transactions').insert({
        user_id: user.id,
        account_id: transactionFormAccountId,
        category_id: transactionFormCategoryId,
        amount: parseFloat(transactionFormAmount),
        type: transactionFormType,
        description: transactionFormDescription.trim(),
        notes: transactionFormNotes.trim() || null,
        date: transactionFormDate,
        ocr_processed: false,
      })

      if (error) throw error

      setIsAddTransactionDialogOpen(false)
      loadTransactions()
      loadAccounts() // Reload accounts to update balances
    } catch (error: any) {
      setTransactionFormError(error.message || 'Error al crear la transacción')
    }
  }

  const submitDeleteTransaction = async () => {
    if (!selectedTransaction) return

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', selectedTransaction.id)

      if (error) throw error

      setIsDeleteTransactionDialogOpen(false)
      setSelectedTransaction(null)
      loadTransactions()
      loadAccounts()
    } catch (error: any) {
      console.error('Error deleting transaction:', error)
    }
  }

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)

  const totalIncome = transactions
    .filter((t) => t.type === 'ingreso')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter((t) => t.type === 'gasto')
    .reduce((sum, t) => sum + t.amount, 0)

  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <div>
          <Heading>Transacciones</Heading>
          <Text>Gestiona tus cuentas y movimientos</Text>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 border-b border-zinc-200 dark:border-zinc-800">
        <nav className="-mb-px flex gap-6">
          <button
            onClick={() => setActiveTab('transacciones')}
            className={`border-b-2 px-1 pb-4 text-sm font-medium transition-colors ${
              activeTab === 'transacciones'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
            }`}
          >
            Movimientos
          </button>
          <button
            onClick={() => setActiveTab('cuentas')}
            className={`border-b-2 px-1 pb-4 text-sm font-medium transition-colors ${
              activeTab === 'cuentas'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
            }`}
          >
            Cuentas
          </button>
        </nav>
      </div>

      {/* Transactions Tab */}
      {activeTab === 'transacciones' && (
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Text className="text-xs text-zinc-500">Ingresos</Text>
                <Text className="text-lg font-semibold text-lime-600 dark:text-lime-400">
                  {formatCurrency(totalIncome)}
                </Text>
              </div>
              <div>
                <Text className="text-xs text-zinc-500">Gastos</Text>
                <Text className="text-lg font-semibold text-pink-600 dark:text-pink-400">
                  {formatCurrency(totalExpenses)}
                </Text>
              </div>
              <div>
                <Text className="text-xs text-zinc-500">Balance</Text>
                <Text className="text-lg font-semibold">
                  {formatCurrency(totalIncome - totalExpenses)}
                </Text>
              </div>
            </div>
            <Button onClick={handleAddTransaction} disabled={accounts.length === 0}>
              <PlusIcon />
              Agregar movimiento
            </Button>
          </div>

          {accounts.length === 0 ? (
            <div className="mt-8 text-center">
              <Text className="text-zinc-500">
                Primero debes crear al menos una cuenta en la pestaña "Cuentas".
              </Text>
            </div>
          ) : transactionsLoading ? (
            <div className="mt-4 text-center">
              <Text>Cargando transacciones...</Text>
            </div>
          ) : transactions.length === 0 ? (
            <div className="mt-8 text-center">
              <Text className="text-zinc-500">
                No hay transacciones registradas. Agrega tu primer movimiento.
              </Text>
            </div>
          ) : (
            <Table className="mt-4">
              <TableHead>
                <TableRow>
                  <TableHeader>Fecha</TableHeader>
                  <TableHeader>Descripción</TableHeader>
                  <TableHeader>Cuenta</TableHeader>
                  <TableHeader>Categoría</TableHeader>
                  <TableHeader className="text-right">Monto</TableHeader>
                  <TableHeader className="text-right">Acciones</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="text-sm text-zinc-500">
                      {formatDate(transaction.date)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{transaction.description}</div>
                        {transaction.notes && (
                          <div className="text-xs text-zinc-500">{transaction.notes}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {(transaction as any).account?.name}
                    </TableCell>
                    <TableCell className="text-sm">
                      {(transaction as any).category?.name}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {transaction.type === 'ingreso' ? (
                          <ArrowUpIcon className="size-4 text-lime-600 dark:text-lime-400" />
                        ) : (
                          <ArrowDownIcon className="size-4 text-pink-600 dark:text-pink-400" />
                        )}
                        <span
                          className={`font-medium ${
                            transaction.type === 'ingreso'
                              ? 'text-lime-600 dark:text-lime-400'
                              : 'text-pink-600 dark:text-pink-400'
                          }`}
                        >
                          {formatCurrency(transaction.amount)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button plain onClick={() => handleDeleteTransaction(transaction)}>
                        <TrashIcon />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      {/* Accounts Tab */}
      {activeTab === 'cuentas' && (
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <div>
              <Subheading>Cuentas</Subheading>
              <Text className="mt-1">
                Saldo total: <strong>{formatCurrency(totalBalance)}</strong>
              </Text>
            </div>
            <Button onClick={handleAddAccount}>
              <PlusIcon />
              Agregar cuenta
            </Button>
          </div>

          {accountsLoading ? (
            <div className="mt-4 text-center">
              <Text>Cargando cuentas...</Text>
            </div>
          ) : accounts.length === 0 ? (
            <div className="mt-8 text-center">
              <Text className="text-zinc-500">
                No tienes cuentas registradas. Agrega tu primera cuenta para empezar.
              </Text>
            </div>
          ) : (
            <Table className="mt-4">
              <TableHead>
                <TableRow>
                  <TableHeader>Nombre</TableHeader>
                  <TableHeader>Tipo</TableHeader>
                  <TableHeader className="text-right">Saldo</TableHeader>
                  <TableHeader className="text-right">Acciones</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">{account.name}</TableCell>
                    <TableCell>
                      <Badge color={accountTypeColors[account.type]}>
                        {accountTypeLabels[account.type]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(account.balance)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button plain onClick={() => handleEditAccount(account)}>
                          <PencilIcon />
                        </Button>
                        <Button plain onClick={() => handleDeleteAccount(account)}>
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
      )}

      {/* Add Transaction Dialog */}
      <Dialog open={isAddTransactionDialogOpen} onClose={() => setIsAddTransactionDialogOpen(false)}>
        <DialogTitle>Agregar movimiento</DialogTitle>
        <DialogDescription>Registra un nuevo ingreso o gasto</DialogDescription>
        <DialogBody>
          {transactionFormError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-200">
              {transactionFormError}
            </div>
          )}
          <Field>
            <Label>Tipo</Label>
            <Select
              value={transactionFormType}
              onChange={(e) => setTransactionFormType(e.target.value as any)}
            >
              <option value="gasto">Gasto</option>
              <option value="ingreso">Ingreso</option>
            </Select>
          </Field>
          <Field className="mt-4">
            <Label>Cuenta</Label>
            <Select
              value={transactionFormAccountId}
              onChange={(e) => setTransactionFormAccountId(e.target.value)}
            >
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field className="mt-4">
            <Label>Categoría</Label>
            <Select
              value={transactionFormCategoryId}
              onChange={(e) => setTransactionFormCategoryId(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field className="mt-4">
            <Label>Monto</Label>
            <Input
              type="number"
              step="0.01"
              value={transactionFormAmount}
              onChange={(e) => setTransactionFormAmount(e.target.value)}
              placeholder="0.00"
              autoFocus
            />
          </Field>
          <Field className="mt-4">
            <Label>Descripción</Label>
            <Input
              value={transactionFormDescription}
              onChange={(e) => setTransactionFormDescription(e.target.value)}
              placeholder="ej. Compra de supermercado"
            />
          </Field>
          <Field className="mt-4">
            <Label>Fecha</Label>
            <Input
              type="date"
              value={transactionFormDate}
              onChange={(e) => setTransactionFormDate(e.target.value)}
            />
          </Field>
          <Field className="mt-4">
            <Label>Notas (opcional)</Label>
            <Textarea
              value={transactionFormNotes}
              onChange={(e) => setTransactionFormNotes(e.target.value)}
              placeholder="Información adicional"
              rows={2}
            />
          </Field>
        </DialogBody>
        <DialogActions>
          <Button plain onClick={() => setIsAddTransactionDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={submitAddTransaction}>Guardar</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Transaction Dialog */}
      <Dialog
        open={isDeleteTransactionDialogOpen}
        onClose={() => setIsDeleteTransactionDialogOpen(false)}
      >
        <DialogTitle>Eliminar transacción</DialogTitle>
        <DialogDescription>
          ¿Estás seguro de que deseas eliminar esta transacción? Esta acción no se puede deshacer.
        </DialogDescription>
        <DialogActions>
          <Button plain onClick={() => setIsDeleteTransactionDialogOpen(false)}>
            Cancelar
          </Button>
          <Button color="red" onClick={submitDeleteTransaction}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Account Dialog */}
      <Dialog open={isAddAccountDialogOpen} onClose={() => setIsAddAccountDialogOpen(false)}>
        <DialogTitle>Agregar cuenta</DialogTitle>
        <DialogDescription>Crea una nueva cuenta para organizar tus finanzas</DialogDescription>
        <DialogBody>
          {accountFormError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-200">
              {accountFormError}
            </div>
          )}
          <Field>
            <Label>Nombre de la cuenta</Label>
            <Input
              value={accountFormName}
              onChange={(e) => setAccountFormName(e.target.value)}
              placeholder="ej. Cuenta de ahorros"
              autoFocus
            />
          </Field>
          <Field className="mt-4">
            <Label>Tipo de cuenta</Label>
            <Select
              value={accountFormType}
              onChange={(e) => setAccountFormType(e.target.value as any)}
            >
              <option value="efectivo">Efectivo</option>
              <option value="banco">Banco</option>
              <option value="tarjeta">Tarjeta de Crédito</option>
              <option value="inversion">Inversión</option>
            </Select>
          </Field>
          <Field className="mt-4">
            <Label>Saldo inicial</Label>
            <Input
              type="number"
              step="0.01"
              value={accountFormBalance}
              onChange={(e) => setAccountFormBalance(e.target.value)}
              placeholder="0.00"
            />
          </Field>
        </DialogBody>
        <DialogActions>
          <Button plain onClick={() => setIsAddAccountDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={submitAddAccount}>Crear cuenta</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Account Dialog */}
      <Dialog open={isEditAccountDialogOpen} onClose={() => setIsEditAccountDialogOpen(false)}>
        <DialogTitle>Editar cuenta</DialogTitle>
        <DialogDescription>Actualiza la información de tu cuenta</DialogDescription>
        <DialogBody>
          {accountFormError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-200">
              {accountFormError}
            </div>
          )}
          <Field>
            <Label>Nombre de la cuenta</Label>
            <Input
              value={accountFormName}
              onChange={(e) => setAccountFormName(e.target.value)}
              placeholder="ej. Cuenta de ahorros"
              autoFocus
            />
          </Field>
          <Field className="mt-4">
            <Label>Tipo de cuenta</Label>
            <Select
              value={accountFormType}
              onChange={(e) => setAccountFormType(e.target.value as any)}
            >
              <option value="efectivo">Efectivo</option>
              <option value="banco">Banco</option>
              <option value="tarjeta">Tarjeta de Crédito</option>
              <option value="inversion">Inversión</option>
            </Select>
          </Field>
          <Field className="mt-4">
            <Label>Saldo actual</Label>
            <Input
              type="number"
              step="0.01"
              value={accountFormBalance}
              onChange={(e) => setAccountFormBalance(e.target.value)}
              placeholder="0.00"
            />
          </Field>
        </DialogBody>
        <DialogActions>
          <Button plain onClick={() => setIsEditAccountDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={submitEditAccount}>Guardar cambios</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={isDeleteAccountDialogOpen} onClose={() => setIsDeleteAccountDialogOpen(false)}>
        <DialogTitle>Eliminar cuenta</DialogTitle>
        <DialogDescription>
          ¿Estás seguro de que deseas eliminar la cuenta "{selectedAccount?.name}"? Esta acción no
          se puede deshacer.
        </DialogDescription>
        <DialogActions>
          <Button plain onClick={() => setIsDeleteAccountDialogOpen(false)}>
            Cancelar
          </Button>
          <Button color="red" onClick={submitDeleteAccount}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
