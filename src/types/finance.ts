// Tipos base para la plataforma de finanzas personales

export type TransactionType = 'ingreso' | 'gasto'
export type IncomeType = 'fijo' | 'variable'
export type AccountType =
  | 'efectivo'      // Dinero en físico
  | 'ahorro'        // Cuenta de ahorros
  | 'corriente'     // Cuenta corriente
  | 'credito'       // Tarjeta de crédito
  | 'debito'        // Tarjeta de débito
  | 'prepago'       // Tarjeta prepagada
  | 'inversion'     // Inversiones
  | 'banco'         // [Deprecated] Usar ahorro/corriente
  | 'tarjeta'       // [Deprecated] Usar credito/debito
  | 'otro'          // Otros tipos
export type GoalType = 'emergencia' | 'compra' | 'deuda' | 'ahorro' | 'personalizada'
export type GoalStatus = 'activa' | 'pausada' | 'completada'
export type InsightType = 'recomendacion' | 'alerta' | 'logro'
export type InsightSeverity = 'info' | 'warning' | 'critical' | 'success'

// Country (País)
export interface Country {
  code: string
  name: string
  currency_code: string
  currency_symbol: string
  currency_name: string
  decimal_separator: string
  thousands_separator: string
  created_at: string
}

// Bank (Banco)
export interface Bank {
  id: string
  name: string
  code: string
  country_code: string
  logo_url?: string
  is_active: boolean
  created_at: string
}

// Profile
export interface Profile {
  id: string
  full_name: string
  avatar_url?: string
  preferred_currency: string
  country_code: string
  onboarding_completed: boolean
  created_at: string
  updated_at?: string
}

// Account (Cuentas bancarias/efectivo)
export interface Account {
  id: string
  user_id: string
  name: string
  type: AccountType
  balance: number
  bank_id?: string | null  // Opcional: banco asociado
  is_active: boolean
  created_at: string
}

// Income Source (Fuentes de ingreso)
export interface IncomeSource {
  id: string
  user_id: string
  name: string
  amount: number
  type: IncomeType
  frequency: 'mensual' | 'quincenal' | 'unico'
  is_active: boolean
  created_at: string
}

// Category (Categorías)
export interface Category {
  id: string
  user_id?: string | null // null = global
  name: string
  icon: string
  color: string
  parent_category_id?: string | null
  is_fixed_expense: boolean
  created_at: string
}

// Transaction (Transacciones)
export interface Transaction {
  id: string
  user_id: string
  account_id: string
  category_id: string
  income_source_id?: string | null
  amount: number
  type: TransactionType
  description: string
  notes?: string
  date: string
  receipt_url?: string
  ocr_processed: boolean
  created_at: string
}

// Goal (Metas)
export interface Goal {
  id: string
  user_id: string
  name: string
  type: GoalType
  target_amount: number
  current_amount: number
  monthly_contribution: number
  deadline: string
  status: GoalStatus
  created_at: string
}

// Debt (Deudas)
export interface Debt {
  id: string
  user_id: string
  name: string
  original_amount: number
  current_balance: number
  interest_rate: number
  minimum_payment: number
  payment_day: number
  status: 'activa' | 'pagada'
  created_at: string
}

// Monthly Snapshot (Resumen mensual)
export interface MonthlySnapshot {
  id: string
  user_id: string
  period: string // YYYY-MM
  total_income: number
  total_expenses: number
  total_savings: number
  savings_rate: number
  net_worth: number
  health_score: number
  emergency_fund_months: number
  debt_to_income_ratio: number
  calculated_at: string
}

// Insight (Insights de IA)
export interface Insight {
  id: string
  user_id: string
  type: InsightType
  severity: InsightSeverity
  title: string
  description: string
  actionable: boolean
  action_url?: string
  is_read: boolean
  created_at: string
}

// Budget (Presupuestos)
export interface Budget {
  id: string
  user_id: string
  category_id: string
  amount: number
  period: 'mensual' | 'semanal'
  start_date: string
  end_date?: string
  created_at: string
}
