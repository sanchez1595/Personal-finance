-- ============================================
-- ESQUEMA DE BASE DE DATOS - FINANZAS PERSONALES
-- ============================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLA: profiles (Perfiles de usuario)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  preferred_currency TEXT DEFAULT 'MXN',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) para profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- TABLA: accounts (Cuentas bancarias/efectivo)
-- ============================================
CREATE TABLE IF NOT EXISTS accounts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('efectivo', 'banco', 'tarjeta', 'inversion')),
  balance DECIMAL(15, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para accounts
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own accounts" ON accounts
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- TABLA: income_sources (Fuentes de ingreso)
-- ============================================
CREATE TABLE IF NOT EXISTS income_sources (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('fijo', 'variable')),
  frequency TEXT NOT NULL CHECK (frequency IN ('mensual', 'quincenal', 'unico')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para income_sources
ALTER TABLE income_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own income sources" ON income_sources
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- TABLA: categories (Categorías)
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  parent_category_id UUID REFERENCES categories ON DELETE CASCADE,
  is_fixed_expense BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all categories" ON categories
  FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can manage own categories" ON categories
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- TABLA: transactions (Transacciones)
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES accounts ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES categories ON DELETE SET NULL,
  income_source_id UUID REFERENCES income_sources ON DELETE SET NULL,
  amount DECIMAL(15, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('ingreso', 'gasto')),
  description TEXT NOT NULL,
  notes TEXT,
  date DATE NOT NULL,
  receipt_url TEXT,
  ocr_processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own transactions" ON transactions
  FOR ALL USING (auth.uid() = user_id);

-- Índices para mejorar performance
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX idx_transactions_category ON transactions(category_id);

-- ============================================
-- TABLA: goals (Metas)
-- ============================================
CREATE TABLE IF NOT EXISTS goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('emergencia', 'compra', 'deuda', 'ahorro', 'personalizada')),
  target_amount DECIMAL(15, 2) NOT NULL,
  current_amount DECIMAL(15, 2) DEFAULT 0,
  monthly_contribution DECIMAL(15, 2) DEFAULT 0,
  deadline DATE,
  status TEXT NOT NULL DEFAULT 'activa' CHECK (status IN ('activa', 'pausada', 'completada')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para goals
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own goals" ON goals
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- TABLA: debts (Deudas)
-- ============================================
CREATE TABLE IF NOT EXISTS debts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  original_amount DECIMAL(15, 2) NOT NULL,
  current_balance DECIMAL(15, 2) NOT NULL,
  interest_rate DECIMAL(5, 2) NOT NULL,
  minimum_payment DECIMAL(15, 2) NOT NULL,
  payment_day INTEGER CHECK (payment_day BETWEEN 1 AND 31),
  status TEXT NOT NULL DEFAULT 'activa' CHECK (status IN ('activa', 'pagada')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para debts
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own debts" ON debts
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- TABLA: budgets (Presupuestos)
-- ============================================
CREATE TABLE IF NOT EXISTS budgets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES categories ON DELETE CASCADE NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  period TEXT NOT NULL CHECK (period IN ('mensual', 'semanal')),
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para budgets
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own budgets" ON budgets
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- TABLA: monthly_snapshots (Resumen mensual)
-- ============================================
CREATE TABLE IF NOT EXISTS monthly_snapshots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  period TEXT NOT NULL, -- YYYY-MM
  total_income DECIMAL(15, 2) DEFAULT 0,
  total_expenses DECIMAL(15, 2) DEFAULT 0,
  total_savings DECIMAL(15, 2) DEFAULT 0,
  savings_rate DECIMAL(5, 2) DEFAULT 0,
  net_worth DECIMAL(15, 2) DEFAULT 0,
  health_score INTEGER DEFAULT 0 CHECK (health_score BETWEEN 0 AND 100),
  emergency_fund_months DECIMAL(5, 2) DEFAULT 0,
  debt_to_income_ratio DECIMAL(5, 2) DEFAULT 0,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, period)
);

-- RLS para monthly_snapshots
ALTER TABLE monthly_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own snapshots" ON monthly_snapshots
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own snapshots" ON monthly_snapshots
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TABLA: insights (Insights de IA)
-- ============================================
CREATE TABLE IF NOT EXISTS insights (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('recomendacion', 'alerta', 'logro')),
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical', 'success')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  actionable BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para insights
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own insights" ON insights
  FOR ALL USING (auth.uid() = user_id);

-- Índice para insights no leídos
CREATE INDEX idx_insights_unread ON insights(user_id, is_read) WHERE is_read = FALSE;

-- ============================================
-- TABLA: simulations (Simulaciones guardadas)
-- ============================================
CREATE TABLE IF NOT EXISTS simulations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('ingreso', 'deuda', 'ahorro', 'comparador')),
  name TEXT NOT NULL,
  input_data JSONB NOT NULL,
  results JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para simulations
ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own simulations" ON simulations
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- CATEGORÍAS GLOBALES PREDEFINIDAS
-- ============================================
INSERT INTO categories (user_id, name, icon, color, parent_category_id, is_fixed_expense) VALUES
  (NULL, 'Casa', '🏠', '#3B82F6', NULL, TRUE),
  (NULL, 'Comida', '🍔', '#10B981', NULL, FALSE),
  (NULL, 'Transporte', '🚗', '#F59E0B', NULL, FALSE),
  (NULL, 'Deudas', '💳', '#EF4444', NULL, TRUE),
  (NULL, 'Entretenimiento', '🎉', '#8B5CF6', NULL, FALSE),
  (NULL, 'Personal', '👕', '#EC4899', NULL, FALSE),
  (NULL, 'Educación', '📚', '#06B6D4', NULL, FALSE),
  (NULL, 'Otros', '🎁', '#6B7280', NULL, FALSE)
ON CONFLICT DO NOTHING;

-- ============================================
-- FUNCIÓN: Trigger para actualizar updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCIÓN: Crear perfil automáticamente al registrarse
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, preferred_currency)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario'), 'MXN');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FIN DEL ESQUEMA
-- ============================================
