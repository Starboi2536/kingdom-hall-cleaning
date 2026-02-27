// app/page.tsx
import { getUser } from '@/lib/get-user'
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase-server'
import { CheckSquare, Package, MapPin, AlertTriangle, TrendingUp } from 'lucide-react'

export const revalidate = 0

export default async function DashboardPage() {
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

  const [
    { data: areas },
    { data: tasks },
    { data: completions },
    { data: supplies },
  ] = await Promise.all([
    supabase
      .from('areas')
      .select('id, name')
      .eq('hall_id', user.hallId),
    supabase
      .from('tasks')
      .select('id, area_id')
      .eq('hall_id', user.hallId),
    adminSupabase
      .from('task_completions')
      .select('task_id, completed_at')
      .eq('hall_id', user.hallId)
      .gte('completed_at', startOfTodaySAST.toISOString()),
    supabase
      .from('supplies')
      .select('id, name, current_stock, min_stock, unit')
      .eq('hall_id', user.hallId),
  ])

  const totalTasks     = tasks?.length ?? 0
  const completedToday = completions?.length ?? 0
  const completionPct  = totalTasks > 0
    ? Math.round((completedToday / totalTasks) * 100)
    : 0

  const lowStockItems = supplies?.filter(s => s.current_stock <= s.min_stock) ?? []
  const lowStockCount = lowStockItems.length

  const areaProgress = areas?.map(area => {
    const areaTasks        = tasks?.filter(t => t.area_id === area.id) ?? []
    const completedTaskIds = completions?.map(c => c.task_id) ?? []
    const areaCompleted    = areaTasks.filter(t => completedTaskIds.includes(t.id)).length
    const pct = areaTasks.length > 0
      ? Math.round((areaCompleted / areaTasks.length) * 100)
      : 0
    return { name: area.name, completed: areaCompleted, total: areaTasks.length, pct }
  }) ?? []

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          {user.hallName} · {new Date().toLocaleDateString('en-ZA', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          })}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<CheckSquare className="h-5 w-5 text-blue-600" />}
          label="Tasks Done Today"
          value={`${completedToday} / ${totalTasks}`}
          sub={`${completionPct}% complete`}
          color="blue"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5 text-green-600" />}
          label="Completion Rate"
          value={`${completionPct}%`}
          sub="today"
          color="green"
        />
        <StatCard
          icon={<MapPin className="h-5 w-5 text-purple-600" />}
          label="Areas"
          value={areas?.length ?? 0}
          sub="total areas"
          color="purple"
        />
        <StatCard
          icon={<AlertTriangle className="h-5 w-5 text-amber-600" />}
          label="Low Stock"
          value={lowStockCount}
          sub={lowStockCount > 0 ? 'needs attention' : 'all good'}
          color={lowStockCount > 0 ? 'amber' : 'green'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Today's Area Progress</h2>
          <div className="space-y-4">
            {areaProgress.map(area => (
              <div key={area.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{area.name}</span>
                  <span className="text-gray-500">{area.completed}/{area.total} tasks</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      area.pct === 100 ? 'bg-green-500' :
                      area.pct > 0    ? 'bg-blue-500'  : 'bg-gray-200'
                    }`}
                    style={{ width: `${area.pct}%` }}
                  />
                </div>
              </div>
            ))}
            {areaProgress.length === 0 && (
              <p className="text-gray-400 text-sm">No areas found</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Supply Status</h2>
          {lowStockCount > 0 ? (
            <div className="space-y-3">
              {lowStockItems.map(supply => (
                <div
                  key={supply.id}
                  className="flex items-center justify-between p-3 bg-amber-50 border border-amber-100 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-sm font-medium text-gray-800">
                      {supply.name}
                    </span>
                  </div>
                  <span className="text-xs text-amber-700 font-medium">
                    {supply.current_stock} {supply.unit} left
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Package className="h-10 w-10 text-green-300 mb-3" />
              <p className="text-gray-500 font-medium text-sm">All supplies stocked</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon, label, value, sub, color,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  sub: string
  color: 'blue' | 'green' | 'purple' | 'amber'
}) {
  const bgMap = {
    blue:   'bg-blue-50',
    green:  'bg-green-50',
    purple: 'bg-purple-50',
    amber:  'bg-amber-50',
  }
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className={`w-9 h-9 rounded-lg ${bgMap[color]} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  )
}