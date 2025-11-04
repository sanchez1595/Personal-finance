'use client'

import { Avatar } from '@/components/avatar'
import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from '@/components/dropdown'
import { Navbar, NavbarItem, NavbarSection, NavbarSpacer } from '@/components/navbar'
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
  SidebarSpacer,
} from '@/components/sidebar'
import { SidebarLayout } from '@/components/sidebar-layout'
import {
  ArrowRightStartOnRectangleIcon,
  ChevronUpIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  UserCircleIcon,
} from '@heroicons/react/16/solid'
import {
  BanknotesIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  HomeIcon,
  LightBulbIcon as LightBulbIconOutline,
  PresentationChartLineIcon,
  RocketLaunchIcon,
} from '@heroicons/react/20/solid'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

function AccountDropdownMenu({ anchor, onSignOut }: { anchor: 'top start' | 'bottom end'; onSignOut: () => void }) {
  return (
    <DropdownMenu className="min-w-64" anchor={anchor}>
      <DropdownItem href="/settings">
        <UserCircleIcon />
        <DropdownLabel>Mi cuenta</DropdownLabel>
      </DropdownItem>
      <DropdownDivider />
      <DropdownItem href="#">
        <ShieldCheckIcon />
        <DropdownLabel>Privacidad</DropdownLabel>
      </DropdownItem>
      <DropdownItem href="#">
        <LightBulbIcon />
        <DropdownLabel>Ayuda</DropdownLabel>
      </DropdownItem>
      <DropdownDivider />
      <DropdownItem onClick={onSignOut}>
        <ArrowRightStartOnRectangleIcon />
        <DropdownLabel>Cerrar sesión</DropdownLabel>
      </DropdownItem>
    </DropdownMenu>
  )
}

export function ApplicationLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<{ full_name: string } | null>(null)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        // Cargar perfil
        supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single()
          .then(({ data }) => {
            setProfile(data)
          })
      }
    })
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const userInitials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U'

  return (
    <SidebarLayout
      navbar={
        <Navbar>
          <NavbarSpacer />
          <NavbarSection>
            <Dropdown>
              <DropdownButton as={NavbarItem}>
                <Avatar initials={userInitials} square className="bg-blue-500" />
              </DropdownButton>
              <AccountDropdownMenu anchor="bottom end" onSignOut={handleSignOut} />
            </Dropdown>
          </NavbarSection>
        </Navbar>
      }
      sidebar={
        <Sidebar>
          <SidebarHeader>
            <SidebarItem href="/">
              <Avatar initials="💰" className="bg-gradient-to-br from-blue-500 to-blue-600" />
              <SidebarLabel className="text-lg font-semibold">Mis Finanzas</SidebarLabel>
            </SidebarItem>
          </SidebarHeader>

          <SidebarBody>
            <SidebarSection>
              <SidebarItem href="/" current={pathname === '/'}>
                <HomeIcon />
                <SidebarLabel>Dashboard</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/transacciones" current={pathname.startsWith('/transacciones')}>
                <BanknotesIcon />
                <SidebarLabel>Transacciones</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/metas" current={pathname.startsWith('/metas')}>
                <RocketLaunchIcon />
                <SidebarLabel>Metas</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/simuladores" current={pathname.startsWith('/simuladores')}>
                <PresentationChartLineIcon />
                <SidebarLabel>Simuladores</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/salud-financiera" current={pathname.startsWith('/salud-financiera')}>
                <ChartBarIcon />
                <SidebarLabel>Salud Financiera</SidebarLabel>
              </SidebarItem>
            </SidebarSection>

            <SidebarSpacer />

            <SidebarSection>
              <SidebarItem href="/settings" current={pathname.startsWith('/settings')}>
                <Cog6ToothIcon />
                <SidebarLabel>Configuración</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="#">
                <LightBulbIconOutline />
                <SidebarLabel>Consejos</SidebarLabel>
              </SidebarItem>
            </SidebarSection>
          </SidebarBody>

          <SidebarFooter className="max-lg:hidden">
            <Dropdown>
              <DropdownButton as={SidebarItem}>
                <span className="flex min-w-0 items-center gap-3">
                  <Avatar initials={userInitials} className="size-10 bg-blue-500" square alt="" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm/5 font-medium text-zinc-950 dark:text-white">
                      {profile?.full_name || 'Usuario'}
                    </span>
                    <span className="block truncate text-xs/5 font-normal text-zinc-500 dark:text-zinc-400">
                      {user?.email || ''}
                    </span>
                  </span>
                </span>
                <ChevronUpIcon />
              </DropdownButton>
              <AccountDropdownMenu anchor="top start" onSignOut={handleSignOut} />
            </Dropdown>
          </SidebarFooter>
        </Sidebar>
      }
    >
      {children}
    </SidebarLayout>
  )
}
