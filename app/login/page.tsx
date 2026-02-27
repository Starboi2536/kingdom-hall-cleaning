// app/login/page.tsx
import { LoginForm } from '@/components/LoginForm'
import { CheckSquare } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4">
            <CheckSquare className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">KH Cleaning</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
        </div>

        <LoginForm />
      </div>
    </div>
  )
}