'use server'

import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { getUser } from '@/lib/get-user'
import { revalidatePath } from 'next/cache'

export async function createUser(formData: FormData) {
  const admin = await getUser()
  if (!admin || admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN') return { error: 'Unauthorized' }

  const full_name = formData.get('full_name') as string
  const email     = formData.get('email') as string
  const password  = formData.get('password') as string
  const role      = formData.get('role') as string

  if (!full_name || !email || !password || !role) {
    return { error: 'All fields are required' }
  }

  //Prevent anyone from creating a SUPER_ADMIN through this form
  if (role === 'SUPER_ADMIN') {
    return { error: 'Cannont create Super Admin accounts from here'}
  }

  const supabase = createSupabaseAdminClient()

  const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
  })

  if (authError) return { error: authError.message }
  if (!newUser.user) return { error: 'Failed to create user' }

  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id:       newUser.user.id,
      full_name,
      role,
      hall_id:  admin.hallId,
    })

  if (profileError) {
    await supabase.auth.admin.deleteUser(newUser.user.id)
    return { error: profileError.message }
  }

  revalidatePath('/users')
  return { success: true }
}

export async function deleteUser(id: string) {
  const admin = await getUser()
  if (!admin || admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN' ) return { error: 'Unauthorized' }

  const supabase = createSupabaseAdminClient()

  //Check the target user's role before deleting
  const {data: targetProfile } = await supabase
    .from('profile')
    .select('role, hall_id')
    .eq('id', id)
    .single()

  //Nobody can delete a SUPER_ADMIN
  if (targetProfile?.role === 'SUPER_ADMIN') {
    return {error: 'Super Admin account cannot be deleted'}
  }

  //Regular admin can only delete users in thier own hall
  if (admin.role === 'ADMIN' && targetProfile?.hall_id !== admin.hallId) {
    return { error: 'Unauthorized'}
  }

  const { error } = await supabase.auth.admin.deleteUser(id)
  if (error) return { error: error.message }

  revalidatePath('/users')
  return { success: true }
}

export async function resetMemberPassword(id: string, newPassword: string) {
  const admin = await getUser()
  if (!admin || (admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN')) {
    return { error: 'Unauthorized' }
  }

  if (!newPassword || newPassword.length < 6) {
    return { error: 'Password must be at least 6 characters' }
  }

  const supabase = createSupabaseAdminClient()

  //Check the target user's role before resetting
  const {data: targetProfile } = await supabase
    .from('profiles')
    .select('role, hall_id')
    .eq('id',id)
    .single()

  //Nobody can reset a SUPER_ADMIN password from here
  if (targetProfile?.role === 'SUPER_ADMIN') {
     return {error: 'Super Admin passwords cannot be reset from here'}
  }

  //Regular admin can only reset passwords for users in their own hall
  if (admin.role === 'ADMIN' && targetProfile?.hall_id !==admin.hallId) {
    return {error:'Unauthrized'}
  }
  
  const { error } = await supabase.auth.admin.updateUserById(id, {
    password: newPassword,
  })

  if (error) return { error: error.message }
  return { success: true }
}