'use server'

import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getUser } from '@/lib/get-user'
import { revalidatePath } from 'next/cache'

function canManage(role: string) {
  return role === 'ADMIN' || role === 'SUPER_ADMIN'
}

export async function addTask(formData: FormData) {
  const user = await getUser()
  if (!user || !canManage(user.role)) return { error: 'Unauthorized' }

  const name    = formData.get('name') as string
  const area_id = formData.get('area_id') as string

  if (!name || !area_id) return { error: 'All fields are required' }

  const supabase = await createSupabaseServerClient()

  const { data: existing } = await supabase
    .from('tasks')
    .select('sort_order')
    .eq('area_id', area_id)
    .eq('hall_id', user.hallId)
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextOrder = existing && existing.length > 0
    ? existing[0].sort_order + 1
    : 1

  const { error } = await supabase
    .from('tasks')
    .insert({
      name,
      area_id,
      hall_id:    user.hallId,
      sort_order: nextOrder,
    })

  if (error) return { error: error.message }

  revalidatePath('/settings')
  revalidatePath('/areas')
  return { success: true }
}

export async function updateTask(id: string, name: string) {
  const user = await getUser()
  if (!user || !canManage(user.role)) return { error: 'Unauthorized' }

  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from('tasks')
    .update({ name })
    .eq('id', id)
    .eq('hall_id', user.hallId)

  if (error) return { error: error.message }

  revalidatePath('/settings')
  revalidatePath('/areas')
  return { success: true }
}

export async function deleteTask(id: string) {
  const user = await getUser()
  if (!user || !canManage(user.role)) return { error: 'Unauthorized' }

  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('hall_id', user.hallId)

  if (error) return { error: error.message }

  revalidatePath('/settings')
  revalidatePath('/areas')
  return { success: true }
}

export async function moveTask(id: string, direction: 'up' | 'down') {
  const user = await getUser()
  if (!user || !canManage(user.role)) return { error: 'Unauthorized' }

  const supabase = await createSupabaseServerClient()

  const { data: task } = await supabase
    .from('tasks')
    .select('id, sort_order, area_id')
    .eq('id', id)
    .single()

  if (!task) return { error: 'Task not found' }

  const { data: neighbour } = await supabase
    .from('tasks')
    .select('id, sort_order')
    .eq('area_id', task.area_id)
    .eq('hall_id', user.hallId)
    .eq('sort_order', direction === 'up'
      ? task.sort_order - 1
      : task.sort_order + 1
    )
    .single()

  if (!neighbour) return { success: true }

  await supabase.from('tasks').update({ sort_order: neighbour.sort_order }).eq('id', task.id)
  await supabase.from('tasks').update({ sort_order: task.sort_order }).eq('id', neighbour.id)

  revalidatePath('/settings')
  revalidatePath('/areas')
  return { success: true }
}

export async function changeOwnPassword(formData: FormData) {
  const user = await getUser()
  if (!user) return { error: 'Not authenticated' }

  const newPassword     = formData.get('new_password') as string
  const confirmPassword = formData.get('confirm_password') as string

  if (!newPassword || newPassword.length < 6) {
    return { error: 'Password must be at least 6 characters' }
  }

  if (newPassword !== confirmPassword) {
    return { error: 'Passwords do not match' }
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.updateUser({ password: newPassword })

  if (error) return { error: error.message }
  return { success: true }
}