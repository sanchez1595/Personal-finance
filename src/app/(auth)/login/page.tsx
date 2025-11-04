'use client'

import { Logo } from '@/app/logo'
import { Button } from '@/components/button'
import { Field, Label } from '@/components/fieldset'
import { Heading } from '@/components/heading'
import { Input } from '@/components/input'
import { Strong, Text, TextLink } from '@/components/text'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else if (data.user) {
        router.push('/')
        router.refresh()
      }
    } catch (err) {
      setError('Ocurrió un error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid w-full max-w-sm grid-cols-1 gap-8">
      <div className="flex justify-center">
        <div className="flex items-center gap-2">
          <span className="text-4xl">💰</span>
          <span className="text-2xl font-bold">Mis Finanzas</span>
        </div>
      </div>

      <Heading>Inicia sesión</Heading>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-200">
          {error}
        </div>
      )}

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
          autoComplete="current-password"
        />
      </Field>

      <div className="flex items-center justify-end">
        <Text>
          <TextLink href="/forgot-password">
            <Strong>¿Olvidaste tu contraseña?</Strong>
          </TextLink>
        </Text>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Ingresando...' : 'Ingresar'}
      </Button>

      <Text>
        ¿No tienes cuenta?{' '}
        <TextLink href="/register">
          <Strong>Regístrate</Strong>
        </TextLink>
      </Text>
    </form>
  )
}
