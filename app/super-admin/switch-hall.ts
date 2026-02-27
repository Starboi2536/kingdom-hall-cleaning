'use server'

import { cookies } from 'next/headers'
import { getUser } from '@/lib/get-user'
import { redirect } from 'next/navigation'

export async function switchHall(hallId: string) {
  const user = await getUser()
  if (!user || user.role !== 'SUPER_ADMIN') return { error: 'Unauthorized' }

  const cookieStore = await cookies()

  if (hallId === 'own') {
    // Remove override — revert to Super Admin's own hall
    cookieStore.delete('super_admin_hall_override')
  } else {
    // Set override to the selected hall
    cookieStore.set('super_admin_hall_override', hallId, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   60 * 60 * 24, // 24 hours
    })
  }

  redirect('/')
}