'use client'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
  async function handleLogout() {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    // window.location.href does a full page reload, completely clearing
    // all React state. router.push() keeps the old component state alive
    // which is what causes the stale name flash.
    window.location.href = '/login'
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
    >
      <LogOut className="h-5 w-5" />
      Sign out
    </button>
  )
}