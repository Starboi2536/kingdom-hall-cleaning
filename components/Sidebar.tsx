'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Home, MapPin, Package, Settings, Menu, X, CheckSquare, Users, Shield } from 'lucide-react'
import { LogoutButton } from '@/components/LogoutButton'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'


const allNavItems = [
  { href: '/',         label: 'Dashboard', icon: Home,     roles: ['VOLUNTEER','OVERSEER','ADMIN','SUPER_ADMIN'] },
  { href: '/areas',    label: 'Areas',     icon: MapPin,   roles: ['VOLUNTEER','OVERSEER','ADMIN','SUPER_ADMIN'] },
  { href: '/supplies', label: 'Supplies',  icon: Package,  roles: ['OVERSEER','ADMIN','SUPER_ADMIN'] },
  { href: '/users',    label: 'Users',     icon: Users,    roles: ['ADMIN','SUPER_ADMIN'] },
  { href: '/settings', label: 'Settings',  icon: Settings, roles: ['ADMIN','SUPER_ADMIN','OVERSEER','VOLUNTEER'] },
  { href: '/super-admin', label: 'Super Admin',icon: Shield,     roles: ['SUPER_ADMIN'] },
]

export function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen]               = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [hallName, setHallName]       = useState('')
  const [role, setRole]               = useState('')

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role, halls(name)')  // role was missing from your query
        .eq('id', data.user.id)
        .single()
      if (profile) {
        setDisplayName(profile.full_name)
        setRole(profile.role)
        setHallName((profile.halls as any)?.name ?? '')
      }
    })
  }, [])

  const navItems = allNavItems.filter(item =>
    !role || item.roles.includes(role)
  )

  function SidebarContent() {
    return (
      <nav className="flex flex-col h-full bg-white border-r border-gray-200 w-64">

        {/* Hall name + logged in user */}
        <div className="flex items-center gap-3 p-5 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <CheckSquare className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-900 text-sm truncate">
              {hallName || 'KH Cleaning'}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {displayName || '...'}
            </p>
          </div>
        </div>

        {/* Navigation links */}
        <ul className="flex-1 p-3 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Role badge */}
        {role && (
            <div className="px-5 py-3 border-t border-gray-100">
               <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                 role === 'SUPER_ADMIN' ? 'bg-red-100 text-red-700' :
                 role === 'ADMIN'       ? 'bg-purple-100 text-purple-700' :
                 role === 'OVERSEER'    ? 'bg-blue-100 text-blue-700' :
                               'bg-gray-100 text-gray-600'
                }`}>
                  {role === 'SUPER_ADMIN' ? 'Super Admin' : role.charAt(0) + role.slice(1).toLowerCase()}
              </span>
            </div>
          )}

        {/* Logout */}
        <div className="p-3 border-t border-gray-100">
          <LogoutButton />
        </div>
      </nav>
    )
  }

  return (
    <>
      {/* Desktop — fixed sidebar */}
      <div className="hidden md:flex">
        <SidebarContent />
      </div>

      {/* Mobile — top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
        <button
          onClick={() => setOpen(!open)}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <p className="font-bold text-gray-900 text-sm truncate">
          {hallName || 'KH Cleaning'}
        </p>
      </div>

      {/* Mobile — overlay + slide-in drawer */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/40"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-64 h-full bg-white shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  )
}