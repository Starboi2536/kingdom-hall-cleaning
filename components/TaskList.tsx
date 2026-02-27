'use client'
import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'

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

export function TaskList({ tasks, areaId, initialCompletedIds, userEmail }: TaskListProps) {
  const [completedIds, setCompletedIds] = useState<string[]>(initialCompletedIds)

  // This is the critical fix — when the server sends fresh data
  // (e.g. after login or navigation), sync the local state to match it.
  // Without this, useState ignores prop changes after the first render.
  useEffect(() => {
    setCompletedIds(initialCompletedIds)
  }, [initialCompletedIds])

  async function toggleTask(taskId: string) {
    const isCompleted  = completedIds.includes(taskId)
    const newCompleted = !isCompleted

    // Optimistic update — update UI immediately before server responds
    setCompletedIds(prev =>
      newCompleted
        ? [...prev, taskId]
        : prev.filter(id => id !== taskId)
    )

    const response = await fetch('/api/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, userEmail, completed: newCompleted }),
    })

    // If server failed — revert the optimistic update
    if (!response.ok) {
      setCompletedIds(prev =>
        newCompleted
          ? prev.filter(id => id !== taskId)
          : [...prev, taskId]
      )
    }
  }

  const sorted         = [...tasks].sort((a, b) => a.sort_order - b.sort_order)
  const completedCount = sorted.filter(t => completedIds.includes(t.id)).length
  const progress       = sorted.length > 0
    ? Math.round((completedCount / sorted.length) * 100)
    : 0

  return (
    <div>
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

      <div className="space-y-2">
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
    </div>
  )
}