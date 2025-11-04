'use client'

import { Button } from '@/components/button'
import { Field, Label } from '@/components/fieldset'
import { Heading } from '@/components/heading'
import { Input } from '@/components/input'
import { Strong, Text, TextLink } from '@/components/text'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Register() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validaciones
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        setError(error.message)
      } else if (data.user) {
        setSuccess(true)
        // Esperar 2 segundos y redirigir al dashboard
        setTimeout(() => {
          router.push('/')
          router.refresh()
        }, 2000)
      }
    } catch (err) {
      setError('Ocurrió un error inesperado')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="grid w-full max-w-sm grid-cols-1 gap-8 text-center">
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            <span className="text-4xl">💰</span>
            <span className="text-2xl font-bold">Mis Finanzas</span>
          </div>
        </div>

        <div className="rounded-lg border border-green-200 bg-green-50 p-6 dark:border-green-900/50 dark:bg-green-900/10">
          <div className="mb-4 text-4xl">✅</div>
          <Heading>¡Cuenta creada!</Heading>
          <Text className="mt-4">
            Tu cuenta ha sido creada exitosamente. Redirigiendo al dashboard...
          </Text>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="grid w-full max-w-sm grid-cols-1 gap-8">
      <div className="flex justify-center">
        <div className="flex items-center gap-2">
          <span className="text-4xl">💰</span>
          <span className="text-2xl font-bold">Mis Finanzas</span>
        </div>
      </div>

      <Heading>Crea tu cuenta</Heading>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-200">
          {error}
        </div>
      )}

      <Field>
        <Label>Nombre completo</Label>
        <Input
          name="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          autoComplete="name"
        />
      </Field>

      <Field>
        <Label>Email</Label>
        <Input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </Field>

      <Field>
        <Label>Contraseña</Label>
        <Input
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          minLength={6}
        />
        <Text className="mt-1 text-xs text-zinc-500">Mínimo 6 caracteres</Text>
      </Field>

      <Field>
        <Label>Confirmar contraseña</Label>
        <Input
          type="password"
          name="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
      </Field>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
      </Button>

      <Text>
        ¿Ya tienes cuenta?{' '}
        <TextLink href="/login">
          <Strong>Inicia sesión</Strong>
        </TextLink>
      </Text>
    </form>
  )
}
