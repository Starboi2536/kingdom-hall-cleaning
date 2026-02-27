'use client'
import { useState } from 'react'
import { deleteUser } from '@/app/users/actions'
import { Trash2, Loader2 } from 'lucide-react'

export function DeleteUserButton({ id, name }: { id: string; name: string }) {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    const confirmed = window.confirm(`Remove ${name} from this hall? They will lose access immediately.`)
    if (!confirmed) return
    setLoading(true)
    await deleteUser(id)
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-40"
      title="Remove member"
    >
      {loading
        ? <Loader2 className="h-4 w-4 animate-spin" />
        : <Trash2 className="h-4 w-4" />
      }
    </button>
  )
}