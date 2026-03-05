import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { getUser } from '@/lib/get-user'

export async function POST(request: Request) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createSupabaseAdminClient()
  const body = await request.json()

  // Batch submit — called when user clicks Mark Area Complete
  if (body.type === 'batch') {
    const { taskIds } = body as { taskIds: string[] }

    for (const taskId of taskIds) {
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
    }

    return NextResponse.json({ success: true })
  }

  // Single toggle — called when user unchecks a task
  const { taskId, completed } = body

  if (completed) {
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
      .eq('task_id',  taskId)
      .eq('hall_id',  user.hallId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}