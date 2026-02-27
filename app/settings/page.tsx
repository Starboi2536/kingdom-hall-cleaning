// app/settings/page.tsx
import { requireRole } from '@/lib/require-role'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { Settings } from 'lucide-react'
import { TaskEditor } from '@/components/TaskEditor'
import { AddTaskForm } from '@/components/AddTaskForm'
import { ChangePasswordForm } from '@/components/ChangePasswordForm'

export const revalidate = 0

export default async function SettingsPage() {
  const user    = await requireRole('VOLUNTEER')
  const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
  const supabase = await createSupabaseServerClient()

  const { data: areas } = isAdmin
    ? await supabase
        .from('areas')
        .select('id, name, tasks(id, name, sort_order)')
        .eq('hall_id', user.hallId)
        .order('name')
    : { data: null }

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <Settings className="h-6 w-6 text-blue-600" />
          Settings
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {isAdmin
            ? `Manage cleaning tasks for ${user.hallName}`
            : `Account settings for ${user.hallName}`
          }
        </p>
      </div>

      {isAdmin && (
        <>
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Cleaning Tasks by Area
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Hover over a task to edit, reorder or delete it
            </p>
          </div>

          <div className="space-y-4">
            {areas?.map(area => {
              const sorted = [...(area.tasks ?? [])]
                .sort((a, b) => a.sort_order - b.sort_order)
              return (
                <div key={area.id} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{area.name}</h3>
                    <span className="text-xs text-gray-400">
                      {sorted.length} task{sorted.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {sorted.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {sorted.map((task, index) => (
                        <TaskEditor
                          key={task.id}
                          id={task.id}
                          name={task.name}
                          isFirst={index === 0}
                          isLast={index === sorted.length - 1}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 py-2">
                      No tasks yet — add one below
                    </p>
                  )}
                  <AddTaskForm areaId={area.id} />
                </div>
              )
            })}
          </div>
        </>
      )}

      <div className={isAdmin ? 'mt-8' : ''}>
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Account Security
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Update your login password
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-600 mb-4">
            Choose a strong password that you do not use anywhere else.
          </p>
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  )
}