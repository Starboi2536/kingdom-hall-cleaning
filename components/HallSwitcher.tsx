// components/HallSwitcher.tsx
import { switchHall } from '@/app/super-admin/switch-hall'
import { ArrowLeftRight } from 'lucide-react'

interface Hall {
  id: string
  name: string
}

interface Props {
  halls: Hall[]
  currentHallId: string
  ownHallId: string
}

// Wrapper that passes hallId via hidden form input instead of .bind
async function switchToHall(formData: FormData) {
  'use server'
  const hallId = formData.get('hallId') as string
  await switchHall(hallId)
}

export function HallSwitcher({ halls, currentHallId, ownHallId }: Props) {
  const isOverriding = currentHallId !== ownHallId

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <ArrowLeftRight className="h-4 w-4 text-blue-600" />
        <h3 className="font-semibold text-gray-900 text-sm">View Hall As</h3>
      </div>

      <p className="text-xs text-gray-500 mb-3">
        Switch your active view to see any hall's data exactly as their users see it.
      </p>

      <div className="flex flex-wrap gap-2">

        {/* Revert to own hall */}
        <form action={switchToHall}>
          <input type="hidden" name="hallId" value="own" />
          <button
            type="submit"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              !isOverriding
                ? 'bg-blue-600 text-white'
                : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            My Hall
          </button>
        </form>

        {/* One button per hall */}
        {halls.map(hall => (
          <form key={hall.id} action={switchToHall}>
            <input type="hidden" name="hallId" value={hall.id} />
            <button
              type="submit"
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                currentHallId === hall.id && isOverriding
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {hall.name}
            </button>
          </form>
        ))}
      </div>

      {isOverriding && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3">
          You are viewing as{' '}
          <strong>
            {halls.find(h => h.id === currentHallId)?.name}
          </strong>
          . All pages show that hall's data.
        </p>
      )}
    </div>
  )
}