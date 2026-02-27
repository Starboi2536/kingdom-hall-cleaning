'use client'
import { useState } from 'react'
import { deleteSupply } from '@/app/supplies/action'
import { Trash2, Loader2 } from 'lucide-react'

export function DeleteSupplyButton({ id, name }: { id: string; name: string }) {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    // Always confirm destructive actions — never delete silently
    const confirmed = window.confirm(`Delete "${name}"? This cannot be undone.`)
    if (!confirmed) return

    setLoading(true)
    await deleteSupply(id)
    // No need to setLoading(false) — the page re-renders after revalidatePath
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded
                 transition-colors disabled:opacity-40"
      title="Delete supply"
    >
      {loading
        ? <Loader2 className="h-4 w-4 animate-spin" />
        : <Trash2 className="h-4 w-4" />
      }
    </button>
  )
}