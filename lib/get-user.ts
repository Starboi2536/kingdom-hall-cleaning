// lib/get-user.ts
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function getUser() {
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, role, hall_id, halls(name)')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  return {
    id:       user.id,
    email:    user.email ?? '',
    fullName: profile.full_name,
    role:     profile.role as 'VOLUNTEER' | 'OVERSEER' | 'ADMIN' | 'SUPER_ADMIN',
    hallId:   profile.hall_id,
    hallName: (profile.halls as any)?.name ?? '',
  }
}