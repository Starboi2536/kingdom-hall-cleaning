'use client'

import { useState } from 'react'
import { deleteHall } from '@/app/super-admin/actions'
import { Trash2, Loader2 } from 'lucide-react'

export function DeleteHallButton({ id, name }: { id: string; name: string }) {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${name}"? This permanently removes all areas, tasks, supplies and users for this hall. This cannot be undone.`
    )
    if (!confirmed) return
    setLoading(true)
    await deleteHall(id)
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-40"
      title="Delete hall"
    >
      {loading
        ? <Loader2 className="h-4 w-4 animate-spin" />
        : <Trash2 className="h-4 w-4" />
      }
    </button>
  )
}