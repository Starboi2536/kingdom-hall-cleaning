// app/supplies/page.tsx
import { supabase } from '@/lib/supabase'
import { Package, AlertTriangle } from 'lucide-react'
import { StockAdjuster } from '@/components/StockAdjuster'
import { AddSupplyForm } from '@/components/AddSupplyForm'
import { DeleteSupplyButton } from '@/components/DeleteSupplyButton'
import { getUser } from '@/lib/get-user'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { requireRole } from '@/lib/require-role'

export const revalidate = 0

export default async function SuppliesPage() {
  const user = await requireRole('OVERSEER')
  if (!user) return null

  const supabase = await createSupabaseServerClient()

  const { data: supplies, error } = await supabase
    .from('supplies')
    .select('*')
    .eq('hall_id', user.hallId)
    .order('name')

  if (error) {
    return <p className="p-6 text-red-600">Failed to load: {error.message}</p>
  }

  const lowStock = supplies?.filter(s => s.current_stock <= s.min_stock) ?? []

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      {/* Header row */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <Package className="h-6 w-6 text-blue-600" />
            Supply Management
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Track inventory and get reorder alerts</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Items', value: supplies?.length ?? 0, color: 'text-gray-900' },
          { label: 'Low Stock', value: lowStock.length, color: 'text-amber-600' },
          { label: 'Well Stocked', value: (supplies?.length ?? 0) - lowStock.length, color: 'text-green-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{stat.label}</p>
            <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 text-sm">
              {lowStock.length} item{lowStock.length > 1 ? 's' : ''} need restocking
            </p>
            <p className="text-amber-700 text-sm mt-0.5">
              {lowStock.map(s => s.name).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Add form */}
      <div className="mb-6">
        <AddSupplyForm />
      </div>

      {/* Supply table */}
      {supplies && supplies.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-gray-100 bg-gray-50">
            <div className="col-span-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Item</div>
            <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</div>
            <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Min Level</div>
            <div className="col-span-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock</div>
            <div className="col-span-1"></div>
          </div>

          {supplies.map((supply) => {
            const isLow = supply.current_stock <= supply.min_stock
            return (
              <div
                key={supply.id}
                className="grid grid-cols-12 gap-4 items-center px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
              >
                <div className="col-span-4 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isLow ? 'bg-amber-400' : 'bg-green-400'}`} />
                  <span className="font-medium text-gray-900 text-sm">{supply.name}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full capitalize">
                    {supply.category ?? 'general'}
                  </span>
                </div>
                <div className="col-span-2 text-sm text-gray-500">
                  {supply.min_stock} {supply.unit}
                </div>
                <div className="col-span-3">
                  <StockAdjuster
                    supplyId={supply.id}
                    currentStock={supply.current_stock}
                    unit={supply.unit}
                  />
                </div>
                <div className="col-span-1 flex justify-end">
                  <DeleteSupplyButton id={supply.id} name={supply.name} />
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Package className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No supplies yet</p>
          <p className="text-gray-400 text-sm mt-1">Click "Add Supply" above to get started</p>
        </div>
      )}
    </div>
  )
}