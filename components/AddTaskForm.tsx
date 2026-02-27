'use client'

import { useState, useRef } from 'react'
import { addTask } from '@/app/settings/actions'
import { Plus, Loader2 } from 'lucide-react'

export function AddTaskForm({ areaId }: { areaId: string }) {
  const [open, setOpen]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const inputRef              = useRef<HTMLInputElement>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError('')
    const result = await addTask(formData)
    setLoading(false)
    if (result?.error) {
      setError(result.error)
    } else {
      setOpen(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => {
          setOpen(true)
          setTimeout(() => inputRef.current?.focus(), 50)
        }}
        className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700
                   font-medium mt-2 transition-colors"
      >
        <Plus className="h-3.5 w-3.5" />
        Add task
      </button>
    )
  }

  return (
    <form action={handleSubmit} className="mt-2">
      {/* Pass the area_id as a hidden field */}
      <input type="hidden" name="area_id" value={areaId} />

      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          name="name"
          required
          placeholder="Task name"
          className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white
                     rounded-lg text-sm font-medium hover:bg-blue-700
                     disabled:opacity-50 transition-colors"
        >
          {loading
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : 'Add'
          }
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-3 py-1.5 text-gray-500 border border-gray-300 rounded-lg
                     text-sm hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </form>
  )
}