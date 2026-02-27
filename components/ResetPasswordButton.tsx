'use client'

import { useState } from 'react'
import { resetMemberPassword } from '@/app/users/actions'
import { KeyRound, Loader2, X, CheckCircle } from 'lucide-react'

export function ResetPasswordButton({ id, name }: { id: string; name: string }) {
  const [open, setOpen]       = useState(false)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState(false)

  async function handleReset() {
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    setError('')
    const result = await resetMemberPassword(id, password)
    setLoading(false)

    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      setTimeout(() => {
        setOpen(false)
        setSuccess(false)
        setPassword('')
      }, 2000)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
        title="Reset password"
      >
        <KeyRound className="h-4 w-4" />
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-gray-200 p-6 w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Reset Password</h3>
          <button onClick={() => { setOpen(false); setError(''); setPassword('') }}>
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Set a new temporary password for <span className="font-medium text-gray-900">{name}</span>.
          Share it with them privately.
        </p>

        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="New temporary password"
          minLength={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
        />

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-3">{error}</p>
        )}

        {success && (
          <div className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-2 rounded-lg mb-3">
            <CheckCircle className="h-4 w-4" />
            <p className="text-sm">Password reset successfully</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleReset}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-medium flex-1 justify-center"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Reset Password
          </button>
          <button
            onClick={() => { setOpen(false); setError(''); setPassword('') }}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}