# 📋 PRD - Plataforma de Finanzas Personales
## "Mis Finanzas - Tu casa como una empresa"

**Versión:** 1.0
**Última actualización:** 4 de Noviembre, 2025
**Estado del Proyecto:** 🟢 En Desarrollo (Sprint 1 y 2 Completados)

---

## 🎯 Visión del Producto

Una plataforma **simple e intuitiva** que permite a personas sin conocimiento financiero:
1. **Entender cómo están** - Ver su situación financiera actual de forma clara
2. **Definir dónde quieren estar** - Establecer metas alcanzables
3. **Saber cómo llegar** - Recibir un plan paso a paso personalizado

**Filosofía:** "La plataforma hace los cálculos complejos, tú solo ves lo que importa"

---

## 📊 Estado del Proyecto

### ✅ Completado (Sprint 1 - 4 Nov 2025)

- [x] Configuración de Supabase
- [x] Esquema de base de datos completo (SQL)
- [x] Estructura de carpetas del proyecto
- [x] Tipos TypeScript para todas las entidades
- [x] Layout adaptado para finanzas personales
- [x] Componentes UI base:
  - [x] StatCard (tarjetas de métricas)
  - [x] HealthScore (score 0-100)
- [x] Dashboard principal con datos dummy:
  - [x] Score de salud financiera
  - [x] Resumen mensual
  - [x] Métricas clave
  - [x] Insights/recomendaciones
  - [x] Transacciones recientes
  - [x] Metas activas
- [x] Navegación principal (5 vistas)
- [x] Primer commit y push a GitHub

### ✅ Completado (Sprint 2 - 4 Nov 2025)

- [x] Aplicar migraciones en Supabase usando MCP
- [x] Crear todas las tablas en la base de datos:
  - [x] profiles (con trigger de auto-creación)
  - [x] accounts
  - [x] income_sources
  - [x] categories (con 8 categorías predefinidas)
  - [x] transactions
  - [x] goals
  - [x] debts
  - [x] budgets
  - [x] monthly_snapshots
  - [x] insights
  - [x] simulations
- [x] Configurar Row Level Security (RLS) en todas las tablas
- [x] Configurar autenticación con Supabase Auth
- [x] Crear helpers de Supabase (client, server, middleware)
- [x] Implementar middleware de Next.js para proteger rutas
- [x] Implementar página de Login funcional
- [x] Implementar página de Registro funcional
- [x] Agregar botón de logout en el layout
- [x] Mostrar datos del usuario en el sidebar (nombre e email)
- [x] Sistema de sesiones funcionando completamente

### ⏳ Por Hacer (Sprints 3-12)

Ver sección "Roadmap de Desarrollo" abajo

---

## 🏗️ Arquitectura Técnica

### **Stack Tecnológico**

- **Frontend:** Next.js 15 (App Router) + React 19
- **Estilos:** Tailwind CSS 4 + Catalyst UI Components
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Lenguaje:** TypeScript
- **Despliegue:** Vercel (frontend) + Supabase Cloud (backend)

### **Base de Datos (Supabase)**

```
Tablas principales:
├── profiles (perfiles de usuario)
├── accounts (cuentas bancarias/efectivo)
├── income_sources (fuentes de ingreso)
├── categories (categorías de gastos)
├── transactions (transacciones)
├── goals (metas financieras)
├── debts (deudas)
├── budgets (presupuestos)
├── monthly_snapshots (resúmenes mensuales)
├── insights (recomendaciones IA)
└── simulations (simulaciones guardadas)
```

---

## 🎨 Estructura de la Plataforma

### **5 Vistas Principales**

```
1. 🏠 Dashboard - "¿Cómo voy?"
   └── Resumen de salud financiera

2. 💸 Transacciones - "¿A dónde va mi dinero?"
   ├── Lista de transacciones
   ├── Agregar gasto/ingreso
   ├── Gestión de cuentas
   └── Fuentes de ingreso

3. 🎯 Metas - "¿Qué quiero lograr?"
   ├── Metas activas
   ├── Crear meta (wizard guiado)
   └── Progreso de metas

4. 🧮 Simuladores - "¿Qué pasaría si...?"
   ├── Simulador de aumento de ingresos
   ├── Simulador de pago de deudas
   ├── Simulador de ahorro
   └── Comparador de escenarios

5. 💡 Salud Financiera - "Reportes"
   ├── Score de salud (0-100)
   ├── Balance general (patrimonio)
   ├── Evolución mensual
   └── Reportes exportables
```

---

## 📱 Funcionalidades Detalladas

### **SPRINT 1: ✅ COMPLETADO - Fundamentos**

#### Dashboard Principal
- **Score de Salud Financiera (0-100)**
  - 80-100: 🟢 Excelente
  - 60-79: 🟡 Buena, mejorable
  - 40-59: 🟠 Necesita atención
  - 0-39: 🔴 Requiere acción urgente

- **Resumen del Mes**
  - Ingresos totales
  - Gastos totales
  - Ahorro del mes
  - Tasa de ahorro (%)

- **Métricas Clave**
  - Dinero disponible
  - Fondo de emergencia (meses)
  - Deudas totales

- **Sistema de Insights**
  - Recomendación principal destacada
  - Alertas de gastos elevados
  - Sugerencias de ahorro

- **Transacciones Recientes (últimas 5)**
  - Fecha, descripción, categoría, monto
  - Código de color (verde=ingreso, rojo=gasto)

- **Metas Activas (primeras 2)**
  - Nombre, progreso, monto objetivo
  - Barra de progreso visual
  - Aporte mensual

---

### **SPRINT 2: 🟡 EN PROGRESO - Autenticación**

#### Sistema de Autenticación (Supabase Auth)
- [ ] **Registro de usuario**
  - Email + contraseña
  - Confirmación por email
  - Creación automática de perfil

- [ ] **Login**
  - Email + contraseña
  - Recordar sesión
  - Recuperar contraseña

- [ ] **Gestión de sesión**
  - Verificar autenticación en rutas
  - Redirect a login si no autenticado
  - Logout

- [ ] **Perfil de usuario**
  - Nombre completo
  - Avatar
  - Moneda preferida (MXN por defecto)
  - Configuración de cuenta

---

### **SPRINT 3: ⏳ Transacciones Core**

#### CRUD de Cuentas
- [ ] **Crear cuenta**
  - Nombre (ej: "Efectivo", "BBVA Débito")
  - Tipo (efectivo, banco, tarjeta, inversión)
  - Balance inicial
  - Ícono y color

- [ ] **Listar cuentas**
  - Tarjetas con balance actual
  - Total disponible
  - Marcar como activa/inactiva

- [ ] **Editar/Eliminar cuenta**

#### CRUD de Fuentes de Ingreso
- [ ] **Ingresos Fijos**
  - Nombre (ej: "Salario Empresa X")
  - Monto
  - Frecuencia (mensual, quincenal)
  - Día de pago

- [ ] **Ingresos Variables**
  - Nombre (ej: "Freelance Noviembre")
  - Monto
  - Fecha única

- [ ] **Listar ingresos**
  - Separados por fijos y variables
  - Total mensual estimado

#### CRUD de Transacciones
- [ ] **Agregar Gasto (Simple)**
  ```
  └── Monto
  └── Categoría (8 principales)
  └── Fecha (default: hoy)
  └── Nota (opcional)
  └── Foto de ticket (opcional)
  ```

- [ ] **Agregar Ingreso**
  ```
  └── Monto
  └── Fuente de ingreso
  └── Fecha
  └── Nota (opcional)
  ```

- [ ] **Lista de Transacciones**
  - Tabla filtrable
  - Filtros: fecha, categoría, monto
  - Búsqueda por descripción
  - Paginación

- [ ] **Editar/Eliminar transacción**

---

### **SPRINT 4: ⏳ Categorías y Gastos**

#### Sistema de Categorías
- [ ] **8 Categorías Predefinidas** (globales)
  ```
  1. 🏠 Casa → Renta, Servicios, Mantenimiento
  2. 🍔 Comida → Supermercado, Restaurantes, Delivery
  3. 🚗 Transporte → Gasolina, Uber, Estacionamiento
  4. 💳 Deudas → Tarjetas, Préstamos
  5. 🎉 Entretenimiento → Cine, Salidas, Hobbies
  6. 👕 Personal → Ropa, Salud, Belleza
  7. 📚 Educación → Cursos, Libros
  8. 🎁 Otros
  ```

- [ ] **Subcategorías personalizables**
  - Usuario puede agregar subcategorías
  - Asociar a categoría principal

- [ ] **Crear categoría personalizada**

#### Análisis "¿A dónde va mi dinero?"
- [ ] **Gráfico de Pie**
  - % por categoría
  - Colores diferenciados

- [ ] **Comparativa vs mes anterior**
  - Cambios por categoría
  - Alertas de aumentos >20%

- [ ] **Top gastos del mes**
  - 5 transacciones más grandes

---

### **SPRINT 5: ⏳ Presupuestos**

#### Sistema de Presupuestos
- [ ] **Crear presupuesto por categoría**
  - Monto mensual
  - Período (mensual/semanal)
  - Alertas cuando se exceda

- [ ] **Vista de presupuestos**
  - Barra de progreso por categoría
  - Gasto actual vs presupuesto
  - % utilizado

- [ ] **Alertas de presupuesto**
  - 80%: Advertencia
  - 100%: Límite alcanzado
  - >100%: Excedido

---

### **SPRINT 6: ⏳ Metas Financieras**

#### Crear Meta (Wizard Guiado)
- [ ] **Metas Predefinidas**
  ```
  ├── 🛡️ Fondo de emergencia
  │   └── Wizard: calcular 3/6/12 meses de gastos
  ├── 🏠 Comprar una casa
  ├── 💳 Salir de deudas
  ├── ✈️ Vacaciones
  ├── 🚗 Comprar un auto
  ├── 🏖️ Jubilación
  └── ✨ Meta personalizada (libre)
  ```

- [ ] **Wizard de creación**
  ```
  Paso 1: Seleccionar tipo de meta
  Paso 2: Definir monto objetivo
  Paso 3: Establecer plazo
  Paso 4: Calcular aporte mensual
  Paso 5: Confirmar y activar
  ```

- [ ] **Proyecciones automáticas**
  - Fecha estimada de cumplimiento
  - Ajuste si no alcanza
  - Sugerencias de ahorro

#### Gestión de Metas
- [ ] **Lista de metas activas**
  - Progreso visual
  - Tiempo restante
  - Aportes realizados

- [ ] **Pausar/Reactivar meta**
- [ ] **Editar meta**
- [ ] **Completar meta** (celebración 🎉)
- [ ] **Distribución de ahorro entre metas**

---

### **SPRINT 7: ⏳ OCR de Facturas**

#### Upload y Procesamiento
- [ ] **Subir foto/PDF de factura**
  - Cámara o galería (móvil)
  - Drag & drop (desktop)
  - Formatos: JPG, PNG, PDF

- [ ] **Procesamiento con OCR**
  - Extracción automática:
    - Monto
    - Fecha
    - Comercio/proveedor
    - Items (opcional)

- [ ] **Sugerencia de categoría con IA**
  - Basado en comercio detectado
  - Aprendizaje de patrones del usuario

- [ ] **Confirmación rápida**
  ```
  ¿Es correcto?
  ├── Monto: $1,247 ✓
  ├── Categoría: 🍔 Comida [Cambiar ▼]
  ├── Cuenta: Tarjeta débito [Cambiar ▼]
  └── [Guardar] [Editar manualmente]
  ```

- [ ] **Historial de facturas procesadas**
  - Ver imagen original
  - Re-procesar si hubo error

---

### **SPRINT 8: ⏳ Simuladores Financieros**

#### A. Simulador "¿Qué pasa si gano más?"
- [ ] **Inputs**
  - Aumento de ingreso (monto)
  - Tipo (permanente/temporal)

- [ ] **Outputs**
  - Nuevo ahorro mensual
  - Impacto en metas (tiempo reducido)
  - Proyección de patrimonio

#### B. Simulador "Plan para Pagar Deudas"
- [ ] **Inputs**
  - Lista de deudas
  - Monto disponible para pago mensual

- [ ] **Estrategias**
  ```
  1. Avalancha (interés alto primero)
     └── Minimiza intereses totales

  2. Bola de nieve (deuda baja primero)
     └── Motivación psicológica
  ```

- [ ] **Outputs**
  - Plan de pago mes a mes
  - Total de intereses ahorrados
  - Fecha de libertad de deudas

#### C. Simulador "¿Cómo ahorrar más?"
- [ ] **Análisis automático**
  - Detectar gastos reducibles
  - Suscripciones sin usar
  - Comparativas vs promedios

- [ ] **Inputs (ajustables)**
  - Reducción por categoría (%)
  - Cancelar suscripciones

- [ ] **Outputs**
  - Nuevo ahorro mensual
  - Impacto en metas
  - Lista de acciones recomendadas

#### D. Comparador de Escenarios
- [ ] **Comparar hasta 3 escenarios**
  - Tabla comparativa
  - Gráficos lado a lado

---

### **SPRINT 9: ⏳ Deudas**

#### CRUD de Deudas
- [ ] **Agregar deuda**
  - Nombre (ej: "Tarjeta BBVA")
  - Monto original
  - Balance actual
  - Tasa de interés anual
  - Pago mínimo mensual
  - Día de corte

- [ ] **Lista de deudas**
  - Ordenadas por interés (default)
  - Total adeudado
  - Costo mensual de intereses

- [ ] **Registrar pago**
  - Monto pagado
  - Fecha
  - Actualizar balance

- [ ] **Alertas de pago**
  - 3 días antes del corte
  - Recordatorio de pago mínimo

- [ ] **Proyección de liquidación**
  - Si sigues pagando mínimo
  - Si pagas X extra al mes

---

### **SPRINT 10: ⏳ Salud Financiera Avanzada**

#### Score de Salud (0-100)
- [ ] **Cálculo automático mensual**
  ```
  Componentes del score:
  ├── Fondo de emergencia (25 pts)
  ├── Tasa de ahorro (25 pts)
  ├── Nivel de deudas (25 pts)
  └── Control de gastos (25 pts)
  ```

- [ ] **Desglose detallado**
  - Explicación de cada componente
  - Cómo mejorar cada uno
  - Progreso mes a mes

#### Balance General (Patrimonio)
- [ ] **Lo que TENGO (Activos)**
  - Cuentas bancarias
  - Inversiones
  - Propiedades (opcional)
  - Total activos

- [ ] **Lo que DEBO (Pasivos)**
  - Tarjetas de crédito
  - Préstamos
  - Hipoteca
  - Total pasivos

- [ ] **Patrimonio Neto**
  ```
  Patrimonio = Activos - Pasivos
  └── Gráfico de evolución mensual
  ```

#### Métricas Clave
- [ ] **Fondo de Emergencia**
  - Meses de cobertura
  - Meta recomendada: 6 meses
  - Progreso

- [ ] **Tasa de Ahorro**
  - % del ingreso ahorrado
  - Meta recomendada: 20%
  - Comparativa con meses anteriores

- [ ] **Ratio Deuda/Ingreso**
  - % del ingreso que va a deudas
  - Meta recomendada: <30%
  - Alerta si >40%

---

### **SPRINT 11: ⏳ Insights Inteligentes**

#### Sistema de Insights Automáticos
- [ ] **Detección de Patrones**
  ```
  Ejemplos:
  ├── "Gastas 35% más los fines de semana"
  ├── "Tus gastos en X aumentaron 40% este mes"
  ├── "Tienes 3 suscripciones duplicadas"
  └── "No has registrado ingresos en 30 días"
  ```

- [ ] **Recomendaciones Personalizadas**
  ```
  ├── "Si reduces X a Y, ahorras $Z al mes"
  ├── "Puedes completar Meta A en 2 meses menos"
  └── "Considera pagar Deuda B primero (mayor interés)"
  ```

- [ ] **Alertas Críticas**
  ```
  ⚠️ Ejemplos:
  ├── "Solo tienes $X y debes pagar $Y en Z días"
  ├── "Tu fondo de emergencia está en 0.5 meses"
  └── "Excediste tu presupuesto en 3 categorías"
  ```

- [ ] **Logros y Gamificación**
  ```
  🎉 Ejemplos:
  ├── "3 meses seguidos ahorrando >15%"
  ├── "Completaste tu primera meta"
  └── "Redujiste deudas en $XX,XXX"
  ```

#### Frecuencia de Notificaciones
- **Diarias:** Solo alertas críticas
- **Semanales:** Resumen de la semana + insights
- **Mensuales:** Reporte completo + recomendaciones

---

### **SPRINT 12: ⏳ Reportes y Exportación**

#### Gráficos y Análisis
- [ ] **Gráfico de Líneas**
  - Ingresos vs Gastos (6 meses)
  - Evolución de patrimonio
  - Tendencias de ahorro

- [ ] **Gráfico de Barras**
  - Gastos por categoría
  - Comparativa mes a mes

- [ ] **Gráfico de Área**
  - Flujo de efectivo acumulado
  - Proyección de metas

#### Reportes Automáticos
- [ ] **Resumen Semanal**
  ```
  Esta semana:
  ├── Gastos: $X,XXX
  ├── vs promedio: +X%
  └── Categoría con más gasto: X
  ```

- [ ] **Reporte Mensual Completo**
  ```
  Mes de [X]:
  ├── Resumen Ejecutivo
  ├── Números clave
  ├── Lo mejor del mes ✅
  ├── Áreas de mejora ⚠️
  ├── Meta para próximo mes 💡
  └── Gráficos de tendencias
  ```

#### Exportación
- [ ] **Exportar a PDF**
  - Reporte mensual completo
  - Diseño profesional

- [ ] **Exportar a Excel/CSV**
  - Transacciones
  - Filtros personalizables
  - Formato compatible con Excel

- [ ] **Dashboard Personalizable**
  - Arrastrar y soltar widgets
  - Elegir métricas a mostrar
  - Guardar vista personalizada

---

## 🎨 Componentes UI Requeridos

### ✅ Ya Implementados
- [x] StatCard
- [x] HealthScore
- [x] Badge
- [x] Button
- [x] Table
- [x] Heading/Subheading
- [x] Avatar
- [x] Dialog/Modal
- [x] Dropdown
- [x] Input/Select/Textarea
- [x] Sidebar Navigation

### ⏳ Por Implementar
- [ ] **Charts** (Recharts)
  - [ ] Line Chart
  - [ ] Bar Chart
  - [ ] Pie Chart
  - [ ] Area Chart

- [ ] **Progress Components**
  - [x] Progress Bar (básica)
  - [ ] Circular Progress
  - [ ] Multi-step Progress

- [ ] **File Upload**
  - [ ] Drag & drop
  - [ ] Camera capture (móvil)
  - [ ] Preview de imagen

- [ ] **Date Picker**
  - [ ] Single date
  - [ ] Date range
  - [ ] Month/Year picker

- [ ] **Toast Notifications**
  - [ ] Success
  - [ ] Error
  - [ ] Warning
  - [ ] Info

- [ ] **Empty States**
  - [x] Básico
  - [ ] Con ilustraciones

- [ ] **Loading States**
  - [ ] Skeleton loaders
  - [ ] Spinner
  - [ ] Progress bar

- [ ] **Form Validation**
  - [ ] Real-time validation
  - [ ] Error messages
  - [ ] Success states

---

## 🔐 Seguridad y Privacidad

### Autenticación y Autorización
- [x] Supabase Auth configurado
- [ ] Email + contraseña
- [ ] Confirmación de email
- [ ] Recuperación de contraseña
- [ ] Row Level Security (RLS) en todas las tablas
- [ ] Políticas de acceso por usuario

### Datos Sensibles
- [x] Variables de entorno en `.env.local` (no en Git)
- [ ] Encriptación de datos sensibles
- [ ] No almacenar contraseñas de cuentas bancarias
- [ ] Cumplir con GDPR (exportar/eliminar datos)

---

## 📱 Responsive Design

### Breakpoints
```
- Mobile: 0-640px
- Tablet: 641-1024px
- Desktop: 1025px+
```

### Prioridades
- [x] Desktop: Completo
- [ ] Tablet: Optimizado
- [ ] Mobile: App-like (foco en agregar gastos rápido)

---

## 🚀 Roadmap de Desarrollo

### **Fase 1: MVP Funcional** (Sprints 1-6) - 6 semanas
```
✅ Sprint 1: Fundamentos y Dashboard (COMPLETADO)
🟡 Sprint 2: Autenticación (EN PROGRESO)
⏳ Sprint 3: Transacciones Core
⏳ Sprint 4: Categorías y Análisis
⏳ Sprint 5: Presupuestos
⏳ Sprint 6: Metas Financieras
```

### **Fase 2: Features Avanzadas** (Sprints 7-9) - 3 semanas
```
⏳ Sprint 7: OCR de Facturas
⏳ Sprint 8: Simuladores
⏳ Sprint 9: Gestión de Deudas
```

### **Fase 3: Inteligencia y Reportes** (Sprints 10-12) - 3 semanas
```
⏳ Sprint 10: Salud Financiera Avanzada
⏳ Sprint 11: Insights Inteligentes
⏳ Sprint 12: Reportes y Exportación
```

### **Fase 4: Optimización** (Post-MVP)
```
⏳ Optimización de rendimiento
⏳ Testing completo
⏳ Documentación de usuario
⏳ Deploy a producción (Vercel)
⏳ Monitoreo y analytics
```

---

## 🎯 Métricas de Éxito

### KPIs de Producto
- [ ] **Tiempo para agregar un gasto:** <30 segundos
- [ ] **Tiempo de carga del dashboard:** <2 segundos
- [ ] **Precisión del OCR:** >90%
- [ ] **Tasa de retención (30 días):** >60%
- [ ] **Usuarios que completan onboarding:** >80%

### KPIs de Negocio
- [ ] **Usuarios activos mensuales (MAU)**
- [ ] **Usuarios que crean al menos 1 meta:** >70%
- [ ] **Transacciones registradas por usuario/mes:** >20
- [ ] **NPS (Net Promoter Score):** >50

---

## 🔧 Configuración de Desarrollo

### Variables de Entorno Requeridas
```bash
NEXT_PUBLIC_SUPABASE_URL=https://hvayacwixakhdzowdecj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### Comandos Útiles
```bash
# Desarrollo
npm run dev

# Build
npm run build

# Lint
npm run lint

# Deploy
vercel deploy
```

---

## 📚 Documentación Adicional

### Archivos Clave del Proyecto
```
├── PRD.md (este archivo)
├── supabase-schema.sql (esquema de BD)
├── src/types/finance.ts (tipos TypeScript)
├── src/lib/supabase.ts (cliente Supabase)
├── src/lib/dummy-data.ts (datos de desarrollo)
├── .env.local (credenciales - NO en Git)
└── .env.example (plantilla de credenciales)
```

### Enlaces Útiles
- **Repositorio:** https://github.com/sanchez1595/Personal-finance
- **Supabase Dashboard:** https://supabase.com/dashboard/project/hvayacwixakhdzowdecj
- **Tailwind Plus:** https://tailwindcss.com/plus/ui-blocks
- **Next.js Docs:** https://nextjs.org/docs

---

## 📝 Notas de Implementación

### Decisiones Técnicas
1. **¿Por qué Supabase?**
   - Backend completo (DB + Auth + Storage)
   - PostgreSQL robusto
   - RLS para seguridad
   - Fácil de escalar

2. **¿Por qué Next.js App Router?**
   - Server Components para mejor performance
   - File-based routing
   - Built-in API routes
   - Excelente DX

3. **¿Por qué Tailwind + Catalyst?**
   - Componentes profesionales out-of-the-box
   - Customizable
   - Responsive por defecto
   - Dark mode incluido

### Limitaciones Conocidas
- OCR requiere servicio externo (Google Vision / Tesseract)
- Reportes PDF requieren librería adicional (react-pdf)
- Gráficos requieren librería (Recharts)
- Multi-moneda requiere API de tasas de cambio

---

## ✅ Checklist de Deployment

### Pre-lanzamiento
- [ ] Todas las features del MVP completadas
- [ ] Testing en móvil, tablet, desktop
- [ ] Seguridad: auditoría de RLS policies
- [ ] Performance: Lighthouse score >90
- [ ] SEO: Meta tags y Open Graph
- [ ] Analytics: Google Analytics / Plausible
- [ ] Error tracking: Sentry
- [ ] Backup automático de BD

### Lanzamiento
- [ ] Deploy a Vercel (producción)
- [ ] Dominio personalizado
- [ ] SSL activado
- [ ] Emails transaccionales configurados
- [ ] Monitoreo de uptime

### Post-lanzamiento
- [ ] Documentación de usuario
- [ ] Onboarding tutorial
- [ ] Soporte por email
- [ ] Recolección de feedback
- [ ] Roadmap público

---

## 🤝 Contribución

Este proyecto es personal pero documentado para ser mantenible. Si pierdes contexto:

1. Lee este PRD primero
2. Revisa el estado actual en la sección "Estado del Proyecto"
3. Consulta `supabase-schema.sql` para estructura de BD
4. Revisa `src/types/finance.ts` para tipos
5. Usa los datos dummy en `src/lib/dummy-data.ts` para desarrollo

---

**Última actualización:** 4 de Noviembre, 2025
**Versión:** 1.0
**Mantenedor:** @sanchez1595
