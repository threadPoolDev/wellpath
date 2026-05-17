import { useState, useEffect, useRef } from 'react'
import { fetchTravelEstimate } from '@/features/travel/api'

export interface CommuteDurationValue {
  durationMinutes: number
  overridden: boolean
}

interface CommuteDurationAnswerProps {
  home: string
  office: string
  mode: string
  value: CommuteDurationValue | null
  onChange: (value: CommuteDurationValue) => void
}

export function CommuteDurationAnswer({
  home,
  office,
  mode,
  value,
  onChange,
}: CommuteDurationAnswerProps) {
  const [status, setStatus] = useState<'loading' | 'found' | 'editing' | 'fallback'>('loading')
  const [fetched, setFetched] = useState<number | null>(null)
  const [manual, setManual] = useState('')
  const hasFetched = useRef(false)

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true

    fetchTravelEstimate(home, office, mode)
      .then((result) => {
        if ('fallback' in result) {
          setStatus('fallback')
        } else {
          setFetched(result.durationMinutes)
          setManual(String(result.durationMinutes))
          setStatus('found')
          onChange({ durationMinutes: result.durationMinutes, overridden: false })
        }
      })
      .catch(() => setStatus('fallback'))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const confirmFetched = () => {
    if (fetched !== null) {
      onChange({ durationMinutes: fetched, overridden: false })
      setStatus('found')
    }
  }

  const saveManual = () => {
    const mins = parseInt(manual)
    if (isNaN(mins) || mins <= 0) return
    onChange({ durationMinutes: mins, overridden: fetched !== null })
    setStatus('editing')
  }

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-sage-400 border-t-transparent" />
        <p className="text-sm text-stone-400">Looking up your commute...</p>
      </div>
    )
  }

  if (status === 'fallback') {
    return (
      <div className="flex flex-col gap-4 w-full max-w-xs mx-auto">
        <p className="text-sm text-stone-500 text-center">
          Enter your one-way commute time manually.
        </p>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min="1"
            max="300"
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            placeholder="35"
            className="flex-1 text-2xl font-light text-center text-stone-800 bg-transparent border-b-2 border-stone-200 focus:border-sage-500 outline-none py-2 transition-colors"
          />
          <span className="text-stone-500 text-sm shrink-0">minutes</span>
        </div>
        <button
          type="button"
          onClick={saveManual}
          disabled={!manual || isNaN(parseInt(manual))}
          className="w-full py-3 rounded-2xl bg-sage-500 text-white text-sm font-semibold hover:bg-sage-600 disabled:bg-stone-100 disabled:text-stone-400 transition-all"
        >
          Save
        </button>
      </div>
    )
  }

  if (status === 'editing') {
    const saved = value?.durationMinutes
    return (
      <div className="flex flex-col gap-4 w-full max-w-xs mx-auto">
        <div className="flex items-center gap-3">
          <input
            type="number"
            min="1"
            max="300"
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            className="flex-1 text-2xl font-light text-center text-stone-800 bg-transparent border-b-2 border-sage-400 focus:border-sage-500 outline-none py-2 transition-colors"
          />
          <span className="text-stone-500 text-sm shrink-0">minutes</span>
        </div>
        <div className="flex gap-2">
          {fetched !== null && (
            <button
              type="button"
              onClick={confirmFetched}
              className="flex-1 py-3 rounded-2xl border-2 border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50"
            >
              Use {fetched} min
            </button>
          )}
          <button
            type="button"
            onClick={saveManual}
            disabled={!manual || isNaN(parseInt(manual))}
            className="flex-1 py-3 rounded-2xl bg-sage-500 text-white text-sm font-semibold hover:bg-sage-600 disabled:bg-stone-100 disabled:text-stone-400 transition-all"
          >
            {saved ? 'Update' : 'Save'}
          </button>
        </div>
      </div>
    )
  }

  // status === 'found'
  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-xs mx-auto">
      <div className="text-center">
        <p className="text-5xl font-light text-stone-800">{fetched}</p>
        <p className="text-stone-400 text-sm mt-1">minutes each way</p>
      </div>

      <p className="text-sm text-stone-500 text-center">
        Does that sound about right?
      </p>

      <div className="flex gap-3 w-full">
        <button
          type="button"
          onClick={() => setStatus('editing')}
          className="flex-1 py-3 rounded-2xl border-2 border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50 transition-all"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={confirmFetched}
          className="flex-1 py-3 rounded-2xl bg-sage-500 text-white text-sm font-semibold hover:bg-sage-600 transition-all"
        >
          Yes, that's right
        </button>
      </div>
    </div>
  )
}
