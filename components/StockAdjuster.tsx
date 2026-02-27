'use client'
// components/StockAdjuster.tsx
// This is a Client Component because it needs onClick handlers.
// It receives the Server Action as a prop and calls it when buttons are clicked.

import { useState } from 'react'
import { adjustStock } from '@/app/supplies/action'
import { Plus, Minus, Loader2 } from 'lucide-react'

interface Props {
  supplyId: string
  currentStock: number
  unit: string
}

export function StockAdjuster({ supplyId, currentStock, unit }: Props) {
  const [stock, setStock] = useState(currentStock)
  const [loading, setLoading] = useState(false)

  async function handleAdjust(amount: number) {
    const newValue = Math.max(0, stock + amount)
    setStock(newValue) // optimistic update — show immediately
    setLoading(true)

    const result = await adjustStock(supplyId, amount)

    if (result?.error) {
      setStock(stock) // revert if server failed
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleAdjust(-1)}
        disabled={loading || stock === 0}
        className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center
                   hover:bg-red-50 hover:border-red-300 disabled:opacity-40 disabled:cursor-not-allowed
                   transition-colors"
      >
        <Minus className="h-3 w-3 text-gray-600" />
      </button>

      <span className="w-20 text-center font-semibold text-gray-900 text-sm">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin mx-auto text-gray-400" />
        ) : (
          `${stock} ${unit}`
        )}
      </span>

      <button
        onClick={() => handleAdjust(1)}
        disabled={loading}
        className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center
                   hover:bg-green-50 hover:border-green-300 disabled:opacity-40 disabled:cursor-not-allowed
                   transition-colors"
      >
        <Plus className="h-3 w-3 text-gray-600" />
      </button>
    </div>
  )
}