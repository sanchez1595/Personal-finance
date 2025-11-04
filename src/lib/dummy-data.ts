// Datos dummy temporales para el dashboard
// Estos se reemplazarán con datos reales de Supabase

export const dummyDashboardData = {
  currentMonth: {
    period: 'Noviembre 2025',
    totalIncome: 50000,
    totalExpenses: 42000,
    totalSavings: 8000,
    savingsRate: 16,
    healthScore: 72,
  },

  previousMonth: {
    totalIncome: 48000,
    totalExpenses: 42000,
    totalSavings: 6000,
    savingsRate: 12.5,
  },

  accounts: {
    availableMoney: 125000,
    emergencyFundMonths: 3.2,
    totalDebts: 110000,
  },

  incomeSources: [
    {
      id: '1',
      name: 'Salario Empresa X',
      amount: 45000,
      type: 'fijo' as const,
      frequency: 'mensual' as const,
    },
    {
      id: '2',
      name: 'Freelance',
      amount: 5000,
      type: 'variable' as const,
      frequency: 'mensual' as const,
    },
  ],

  expensesByCategory: [
    { category: 'Casa', amount: 15000, percentage: 36, icon: '🏠' },
    { category: 'Comida', amount: 12000, percentage: 29, icon: '🍔' },
    { category: 'Deudas', amount: 5000, percentage: 12, icon: '💳' },
    { category: 'Transporte', amount: 4000, percentage: 10, icon: '🚗' },
    { category: 'Entretenimiento', amount: 3000, percentage: 7, icon: '🎉' },
    { category: 'Personal', amount: 2000, percentage: 5, icon: '👕' },
    { category: 'Educación', amount: 1000, percentage: 2, icon: '📚' },
  ],

  recentTransactions: [
    {
      id: '1',
      description: 'Walmart',
      category: 'Comida',
      amount: -1247,
      date: '2025-11-03',
      icon: '🍔',
    },
    {
      id: '2',
      description: 'Uber',
      category: 'Transporte',
      amount: -185,
      date: '2025-11-03',
      icon: '🚗',
    },
    {
      id: '3',
      description: 'Netflix',
      category: 'Entretenimiento',
      amount: -299,
      date: '2025-11-02',
      icon: '🎉',
    },
    {
      id: '4',
      description: 'Renta',
      category: 'Casa',
      amount: -12000,
      date: '2025-11-01',
      icon: '🏠',
    },
    {
      id: '5',
      description: 'Salario',
      category: 'Ingreso',
      amount: 45000,
      date: '2025-11-01',
      icon: '💼',
    },
  ],

  mainInsight: {
    type: 'warning' as const,
    title: 'Gastos en restaurantes elevados',
    description: 'Estás gastando $12,000/mes en restaurantes (24% de tus ingresos). Si reduces a $7,500, ahorrarías $4,500 extra al mes.',
    actionLabel: 'Ver plan de ahorro',
  },

  goals: [
    {
      id: '1',
      name: 'Fondo de Emergencia',
      type: 'emergencia' as const,
      targetAmount: 210000,
      currentAmount: 45000,
      progress: 21,
      monthlyContribution: 6875,
      deadline: '2027-11-01',
      status: 'activa' as const,
    },
    {
      id: '2',
      name: 'Enganche de Casa',
      type: 'compra' as const,
      targetAmount: 200000,
      currentAmount: 0,
      progress: 0,
      monthlyContribution: 0,
      deadline: '2026-12-31',
      status: 'activa' as const,
    },
  ],
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatPercentage(value: number): string {
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
}

export function calculateChange(current: number, previous: number): string {
  const change = ((current - previous) / previous) * 100
  return formatPercentage(change)
}
