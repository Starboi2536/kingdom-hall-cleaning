'use client'

import { useState, useRef } from 'react'
import { createHallWithAdmin } from '@/app/super-admin/actions'
import { Plus, X, Loader2, CheckCircle } from 'lucide-react'

export function CreateHallForm() {
  const [open, setOpen]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')
  const formRef               = useRef<HTMLFormElement>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError('')
    setSuccess('')
    const result = await createHallWithAdmin(formData)
    setLoading(false)

    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess(
        `${result.hallName} created. Admin login: ${result.adminEmail}`
      )
      formRef.current?.reset()
      setOpen(false)
    }
  }

  if (!open) {
    return (
      <div>
        {success && (
          <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Add New Kingdom Hall
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-gray-900">Register New Kingdom Hall</h3>
        <button onClick={() => setOpen(false)}>
          <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
        </button>
      </div>

      <form ref={formRef} action={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hall Name <span className="text-red-500">*</span>
            </label>
            <input
              name="hall_name"
              required
              placeholder="e.g. Mitchells Plain Kingdom Hall"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              name="location"
              required
              placeholder="e.g. Mitchells Plain, Cape Town"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admin Full Name <span className="text-red-500">*</span>
            </label>
            <input
              name="admin_name"
              required
              placeholder="e.g. John Smith"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admin Email <span className="text-red-500">*</span>
            </label>
            <input
              name="admin_email"
              type="email"
              required
              placeholder="admin@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Temporary Password <span className="text-red-500">*</span>
            </label>
            <input
              name="admin_password"
              type="password"
              required
              minLength={6}
              placeholder="Minimum 6 characters"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              Share this privately. The admin should change it after first login.
            </p>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Create Hall & Admin
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}