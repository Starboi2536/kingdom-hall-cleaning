'use client'
import { useState, useEffect } from 'react'
import { Check, Loader2, CheckSquare } from 'lucide-react'

interface Task {
  id: string
  name: string
  sort_order: number
}

interface TaskListProps {
  tasks: Task[]
  areaId: string
  initialCompletedIds: string[]
  userEmail: string
}

export function TaskList({
  tasks,
  areaId,
  initialCompletedIds,
  userEmail,
}: TaskListProps) {
  const [completedIds, setCompletedIds]   = useState<string[]>(initialCompletedIds)
  const [submitting, setSubmitting]       = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  useEffect(() => {
    setCompletedIds(initialCompletedIds)
  }, [initialCompletedIds])

  const sorted         = [...tasks].sort((a, b) => a.sort_order - b.sort_order)
  const completedCount = sorted.filter(t => completedIds.includes(t.id)).length
  const progress       = sorted.length > 0
    ? Math.round((completedCount / sorted.length) * 100)
    : 0

  // Toggle a single checkbox locally — does NOT save to DB yet
  // Unchecking an already-saved task saves immediately
  async function toggleTask(taskId: string) {
    const isCompleted  = completedIds.includes(taskId)
    const newCompleted = !isCompleted

    // Optimistic update
    setCompletedIds(prev =>
      newCompleted
        ? [...prev, taskId]
        : prev.filter(id => id !== taskId)
    )

    // If unchecking — save immediately to DB
    if (!newCompleted) {
      const response = await fetch('/api/complete', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ taskId, userEmail, completed: false }),
      })

      if (!response.ok) {
        // Revert if save failed
        setCompletedIds(prev => [...prev, taskId])
      }
    }
    // If checking — only saved when user clicks Mark Area Complete
  }

  // Submit all currently checked tasks for this area in one batch
  async function handleSubmitArea() {
    const checkedIds = sorted
      .filter(t => completedIds.includes(t.id))
      .map(t => t.id)

    if (checkedIds.length === 0) return

    setSubmitting(true)
    setSubmitSuccess(false)

    const response = await fetch('/api/complete', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ type: 'batch', taskIds: checkedIds }),
    })

    setSubmitting(false)

    if (response.ok) {
      setSubmitSuccess(true)
      // Clear success message after 3 seconds
      setTimeout(() => setSubmitSuccess(false), 3000)
    }
  }

  const allComplete = completedCount === sorted.length && sorted.length > 0

  return (
    <div>
      {/* Progress bar */}
      <div className="flex justify-between text-sm text-gray-500 mb-2">
        <span>{completedCount} of {sorted.length} complete</span>
        <span>{progress}%</span>
      </div>

      <div className="w-full h-2 bg-gray-200 rounded-full mb-4">
        <div
          className="h-2 rounded-full bg-blue-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Task list */}
      <div className="space-y-2 mb-4">
        {sorted.map(task => {
          const done = completedIds.includes(task.id)
          return (
            <button
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors cursor-pointer ${
                done
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
              }`}
            >
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                done ? 'bg-green-500 border-green-500' : 'border-gray-300'
              }`}>
                {done && <Check className="h-3 w-3 text-white" />}
              </div>
              <span className={`text-sm ${
                done ? 'text-green-700 line-through' : 'text-gray-700'
              }`}>
                {task.name}
              </span>
            </button>
          )
        })}
      </div>

      {/* Submit button */}
      {completedCount > 0 && (
        <div className="border-t border-gray-100 pt-3">
          {submitSuccess ? (
            <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <Check className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm font-medium">
                Area marked complete
              </span>
            </div>
          ) : (
            <button
              onClick={handleSubmitArea}
              disabled={submitting}
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
                allComplete
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              } disabled:opacity-50`}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckSquare className="h-4 w-4" />
              )}
              {submitting
                ? 'Saving...'
                : allComplete
                ? 'Mark All Complete'
                : `Save ${completedCount} Task${completedCount !== 1 ? 's' : ''}`
              }
            </button>
          )}
        </div>
      )}
    </div>
  )
}