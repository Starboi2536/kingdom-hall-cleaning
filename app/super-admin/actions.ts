'use server'

import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { getUser } from '@/lib/get-user'
import { revalidatePath } from 'next/cache'

export async function createHallWithAdmin(formData: FormData) {
  const currentUser = await getUser()
  if (!currentUser || currentUser.role !== 'SUPER_ADMIN') {
    return { error: 'Unauthorized' }
  }

  const supabase = createSupabaseAdminClient()

  const hallName      = formData.get('hall_name') as string
  const location      = formData.get('location') as string
  const adminName     = formData.get('admin_name') as string
  const adminEmail    = formData.get('admin_email') as string
  const adminPassword = formData.get('admin_password') as string

  if (!hallName || !location || !adminName || !adminEmail || !adminPassword) {
    return { error: 'All fields are required' }
  }

  // Step 1 — Create the hall
  const { data: hall, error: hallError } = await supabase
    .from('halls')
    .insert({ name: hallName, location })
    .select()
    .single()

  if (hallError) return { error: hallError.message }

  // Step 2 — Create the 4 standard areas automatically
  const { error: areasError } = await supabase
    .from('areas')
    .insert([
      { name: "Main Hall",       description: "Main auditorium",    hall_id: hall.id },
      { name: "Men's Toilet",    description: "Men's restroom",     hall_id: hall.id },
      { name: "Women's Toilet",  description: "Women's restroom",   hall_id: hall.id },
      { name: "School B",        description: "Second school room", hall_id: hall.id },
    ])

  if (areasError) return { error: areasError.message }

  // Step 3 — Create the admin auth user
  const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
    email:         adminEmail,
    password:      adminPassword,
    email_confirm: true,
    user_metadata: { full_name: adminName },
  })

  if (authError) return { error: authError.message }

  // Step 4 — Create the admin profile linked to the new hall
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id:        newUser.user.id,
      full_name: adminName,
      role:      'ADMIN',
      hall_id:   hall.id,
    })

  if (profileError) {
    // Clean up the auth user if profile creation fails
    await supabase.auth.admin.deleteUser(newUser.user.id)
    return { error: profileError.message }
  }

  revalidatePath('/super-admin')
  return { success: true, hallName, adminEmail }
}

export async function deleteHall(hallId: string) {
  const currentUser = await getUser()
  if (!currentUser || currentUser.role !== 'SUPER_ADMIN') {
    return { error: 'Unauthorized' }
  }

  const supabase = createSupabaseAdminClient()

  // Get all profiles in this hall so we can delete their auth accounts
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id')
    .eq('hall_id', hallId)

  // Delete each auth user — this cascades to their profile
  if (profiles) {
    for (const profile of profiles) {
      await supabase.auth.admin.deleteUser(profile.id)
    }
  }

  // Delete hall data in correct order to avoid foreign key conflicts
  await supabase.from('task_completions').delete().eq('hall_id', hallId)
  await supabase.from('tasks').delete().eq('hall_id', hallId)
  await supabase.from('areas').delete().eq('hall_id', hallId)
  await supabase.from('supplies').delete().eq('hall_id', hallId)
  await supabase.from('halls').delete().eq('id', hallId)

  revalidatePath('/super-admin')
  return { success: true }
}