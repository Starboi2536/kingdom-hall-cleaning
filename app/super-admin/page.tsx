// app/super-admin/page.tsx
import { requireRole } from '@/lib/require-role'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { Shield } from 'lucide-react'
import { CreateHallForm } from '@/components/CreateHallForm'
import { DeleteHallButton } from '@/components/DeleteHallButton'

export const revalidate = 0

export default async function SuperAdminPage() {
  await requireRole('SUPER_ADMIN')
  const supabase = createSupabaseAdminClient()

  const { data: halls } = await supabase
    .from('halls')
    .select('id, name, location, created_at')
    .order('created_at', { ascending: true })

  const { data: profiles } = await supabase
    .from('profiles')
    .select('hall_id')

  const memberCounts = halls?.reduce((acc, hall) => {
    acc[hall.id] = profiles?.filter(p => p.hall_id === hall.id).length ?? 0
    return acc
  }, {} as Record<string, number>) ?? {}

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <Shield className="h-6 w-6 text-red-600" />
          Super Admin
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage all Kingdom Halls across the system
        </p>
      </div>

      <div className="mb-8">
        <CreateHallForm />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {halls?.length ?? 0} Kingdom Halls Registered
          </p>
        </div>

        {halls && halls.length > 0 ? (
          halls.map((hall, index) => (
            <div
              key={hall.id}
              className={`flex items-center justify-between px-5 py-4 ${
                index > 0 ? 'border-t border-gray-100' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-blue-700">
                    {hall.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{hall.name}</p>
                  <p className="text-xs text-gray-400">
                    {hall.location} · {memberCounts[hall.id] ?? 0} members
                  </p>
                </div>
              </div>
              <DeleteHallButton id={hall.id} name={hall.name} />
            </div>
          ))
        ) : (
          <div className="px-5 py-12 text-center">
            <p className="text-gray-400 text-sm">No halls registered yet</p>
          </div>
        )}
      </div>
    </div>
  )
}