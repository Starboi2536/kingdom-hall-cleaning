import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { getUser } from '@/lib/get-user'

export async function POST(request: Request) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Use admin client so RLS never blocks inserts or deletes
  // This is safe because we are on the server and we manually
  // verify the user is authenticated via getUser() above
  const supabase = createSupabaseAdminClient()
  const { taskId, completed } = await request.json()

  if (completed) {
    // Prevent duplicate completions by checking first
    const { data: existing } = await supabase
      .from('task_completions')
      .select('id')
      .eq('task_id', taskId)
      .eq('hall_id', user.hallId)
      .maybeSingle()

    if (!existing) {
      const { error } = await supabase
        .from('task_completions')
        .insert({
          task_id:    taskId,
          user_email: user.email,
          hall_id:    user.hallId,
        })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }
  } else {
    const { error } = await supabase
      .from('task_completions')
      .delete()
      .eq('task_id',    taskId)
      .eq('hall_id',    user.hallId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}