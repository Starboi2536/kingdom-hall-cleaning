'use server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getUser } from '@/lib/get-user'
import { revalidatePath } from 'next/cache'

export async function adjustStock(id: string, amount: number) {
  const supabase = await createSupabaseServerClient()

  const { data: supply } = await supabase
    .from('supplies')
    .select('current_stock')
    .eq('id', id)
    .single()

  if (!supply) return { error: 'Supply not found' }

  const newStock = Math.max(0, supply.current_stock + amount)

  const { error } = await supabase
    .from('supplies')
    .update({ current_stock: newStock })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/supplies')
  return { success: true }
}

export async function addSupply(formData: FormData) {
  const user = await getUser()
  if (!user) return { error: 'Not authenticated' }

  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from('supplies')
    .insert({
      name:          formData.get('name') as string,
      current_stock: parseInt(formData.get('current_stock') as string),
      min_stock:     parseInt(formData.get('min_stock') as string),
      unit:          formData.get('unit') as string,
      category:      formData.get('category') as string,
      hall_id:       user.hallId,
    })

  if (error) return { error: error.message }
  revalidatePath('/supplies')
  return { success: true }
}

export async function deleteSupply(id: string) {
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from('supplies')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/supplies')
  return { success: true }
}