'use client'

import { useState } from 'react'
import { updateTask, deleteTask, moveTask } from '@/app/settings/actions'
import { Pencil, Trash2, Check, X, ChevronUp, ChevronDown, Loader2 } from 'lucide-react'

interface Props {
  id: string
  name: string
  isFirst: boolean
  isLast: boolean
}

export function TaskEditor({ id, name, isFirst, isLast }: Props) {
  const [editing, setEditing]   = useState(false)
  const [value, setValue]       = useState(name)
  const [loading, setLoading]   = useState(false)

  async function handleSave() {
    if (!value.trim() || value === name) {
      setEditing(false)
      setValue(name)
      return
    }
    setLoading(true)
    await updateTask(id, value.trim())
    setLoading(false)
    setEditing(false)
  }

  async function handleDelete() {
    const confirmed = window.confirm(`Delete task "${name}"?`)
    if (!confirmed) return
    setLoading(true)
    await deleteTask(id)
  }

  async function handleMove(direction: 'up' | 'down') {
    setLoading(true)
    await moveTask(id, direction)
    setLoading(false)
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2 py-2">
        <input
          autoFocus
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter')  handleSave()
            if (e.key === 'Escape') { setEditing(false); setValue(name) }
          }}
          className="flex-1 px-3 py-1.5 border border-blue-400 rounded-lg text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSave}
          disabled={loading}
          className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
        >
          {loading
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Check className="h-4 w-4" />
          }
        </button>
        <button
          onClick={() => { setEditing(false); setValue(name) }}
          className="p-1.5 text-gray-400 hover:bg-gray-100 rounded transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 py-2 group">
      {/* Move up/down buttons */}
      <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => handleMove('up')}
          disabled={isFirst || loading}
          className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-20 transition-colors"
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => handleMove('down')}
          disabled={isLast || loading}
          className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-20 transition-colors"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>

      <span className="flex-1 text-sm text-gray-700">{name}</span>

      {/* Edit / delete — visible on hover */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setEditing(true)}
          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
        >
          {loading
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : <Trash2 className="h-3.5 w-3.5" />
          }
        </button>
      </div>
    </div>
  )
}