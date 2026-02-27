// app/areas/page.tsx
import { TaskList } from '@/components/TaskList'
import { MapPin } from 'lucide-react'
import { getUser } from '@/lib/get-user'
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase-server'

export const revalidate = 0

export default async function AreasPage() {
  const user = await getUser()
  if (!user) return null

  const supabase      = await createSupabaseServerClient()
  const adminSupabase = createSupabaseAdminClient()

  const now = new Date()
  const startOfTodaySAST = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCHours() >= 2 ? now.getUTCDate() : now.getUTCDate() - 1,
      now.getUTCHours() >= 2 ? 0 : 22,
      0, 0, 0
    )
  )

  const { data: areas } = await supabase
    .from('areas')
    .select('id, name, description, tasks(id, name, sort_order)')
    .eq('hall_id', user.hallId)
    .order('name')

  const { data: completions } = await adminSupabase
    .from('task_completions')
    .select('task_id')
    .eq('hall_id', user.hallId)
    .gte('completed_at', startOfTodaySAST.toISOString())

  const completedTaskIds = completions?.map(c => c.task_id) ?? []

  return (
    <div className="p-6 lg:p-8">
      <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 mb-8">
        <MapPin className="h-6 w-6 text-blue-600" />
        Cleaning Areas
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {areas?.map(area => (
          <div key={area.id} className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {area.name}
            </h2>
            <TaskList
              tasks={area.tasks}
              areaId={area.id}
              initialCompletedIds={completedTaskIds}
              userEmail={user.email}
            />
          </div>
        ))}
      </div>
    </div>
  )
}