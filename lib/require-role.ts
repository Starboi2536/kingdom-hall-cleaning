// lib/require-role.ts
// Call this at the top of any page that requires a specific role.
// If the user does not have permission, they are redirected away.

import { redirect } from 'next/navigation'
import { getUser } from '@/lib/get-user'

type Role = 'VOLUNTEER' | 'OVERSEER' | 'ADMIN' | 'SUPER_ADMIN'

// Role hierarchy — ADMIN can access OVERSEER pages, OVERSEER can access VOLUNTEER pages
const hierarchy: Record<Role, number> = {
  VOLUNTEER: 1,
  OVERSEER:  2,
  ADMIN:     3,
  SUPER_ADMIN:4,
}

export async function requireRole(minimum: Role) {
  const user = await getUser()

  if (!user) redirect('/login')

  const userLevel    = hierarchy[user.role as Role] ?? 0
  const requiredLevel = hierarchy[minimum]

  if (userLevel < requiredLevel) redirect('/')

  return user
}