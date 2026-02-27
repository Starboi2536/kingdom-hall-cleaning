// app/users/page.tsx
import { requireRole } from '@/lib/require-role'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { Users } from 'lucide-react'
import { CreateUserForm } from '@/components/CreateUserForm'
import { DeleteUserButton } from '@/components/DeleteUserButton'
import { ResetPasswordButton } from '@/components/ResetPasswordButton'

export const revalidate = 0

export default async function UsersPage() {
  const user = await requireRole('ADMIN')
  const supabase = await createSupabaseServerClient()

  // Fetch all profiles belonging to this hall
  const { data: members } = await supabase
    .from('profiles')
    .select('id, full_name, role, created_at')
    .eq('hall_id', user.hallId)
    .neq('role', 'SUPER_ADMIN') // hide Super Admin from everyone
    .order('full_name')

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <Users className="h-6 w-6 text-blue-600" />
          Users
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage members of {user.hallName}
        </p>
      </div>

      {/* Create new user form */}
      <div className="mb-8">
        <CreateUserForm hallId={user.hallId} />
      </div>

      {/* Members list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {members?.length ?? 0} members
          </p>
        </div>

        {members && members.length > 0 ? (
          members.map((member, index) => (
            <div
              key={member.id}
              className={`flex items-center justify-between px-5 py-4 ${
                index > 0 ? 'border-t border-gray-100' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Avatar using first letter of name */}
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <span className="text-sm font-semibold text-blue-700">
                    {member.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {member.full_name}
                  </p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-0.5 ${
                    member.role === 'ADMIN'     ? 'bg-purple-100 text-purple-700' :
                    member.role === 'OVERSEER'  ? 'bg-blue-100 text-blue-700' :
                                                  'bg-gray-100 text-gray-600'
                  }`}>
                    {member.role.charAt(0) + member.role.slice(1).toLowerCase()}
                  </span>
                </div>
              </div>

              {/* Do not allow admin to delete themselves */}
              {member.id !== user.id && member.role !== 'SUPER_ADMIN' && (
                <div className="flex items-center gap-1">
                  <ResetPasswordButton id={member.id} name={member.full_name} />
                  <DeleteUserButton id={member.id} name={member.full_name} />
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="px-5 py-12 text-center">
            <p className="text-gray-400 text-sm">No members yet</p>
          </div>
        )}
      </div>
    </div>
  )
}