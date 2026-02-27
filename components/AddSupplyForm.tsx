'use client'
// components/AddSupplyForm.tsx
import { useState, useRef } from 'react'
import { addSupply } from '@/app/supplies/action'
import { Plus, X, Loader2 } from 'lucide-react'

export function AddSupplyForm() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError('')
    const result = await addSupply(formData)
    setLoading(false)

    if (result?.error) {
      setError(result.error)
    } else {
      setOpen(false)
      formRef.current?.reset()
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg
                   hover:bg-blue-700 transition-colors text-sm font-medium"
      >
        <Plus className="h-4 w-4" />
        Add Supply
      </button>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Add New Supply</h3>
        <button onClick={() => setOpen(false)}>
          <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
        </button>
      </div>

      {/* 
        action={handleSubmit} — this is how you connect a Server Action to a form.
        When the form submits, Next.js automatically collects all the field values
        into a FormData object and passes it to handleSubmit.
        No event.preventDefault() needed — Next.js handles it.
      */}
      <form ref={formRef} action={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              required
              placeholder="e.g. Toilet Paper"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit <span className="text-red-500">*</span>
            </label>
            <input
              name="unit"
              required
              placeholder="e.g. rolls, bottles, pieces"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Stock
            </label>
            <input
              name="current_stock"
              type="number"
              min="0"
              defaultValue="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Stock (alert threshold)
            </label>
            <input
              name="min_stock"
              type="number"
              min="0"
              defaultValue="5"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              name="category"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="bathroom">Bathroom</option>
              <option value="general">General</option>
              <option value="floor">Floor</option>
              <option value="stage">Stage</option>
            </select>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg
                       hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Supply
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg
                       hover:bg-gray-50 transition-colors text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}