import { useState } from 'react'
import { cn } from '@/lib/utils'
import { MedicineEntry } from '../../questions/essentialQuestions'

interface MedicineFormAnswerProps {
  value: MedicineEntry[]
  onChange: (value: MedicineEntry[]) => void
}

const emptyMedicine = (): MedicineEntry => ({
  nameOrNickname: '',
  timings: ['08:00'],
  withFood: 'not_sure',
  isCritical: 'not_sure',
  reminderEnabled: true,
})

export function MedicineFormAnswer({ value, onChange }: MedicineFormAnswerProps) {
  const [editing, setEditing] = useState<MedicineEntry>(emptyMedicine())
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const canAddMore = value.length < 5

  const saveEditing = () => {
    if (!editing.nameOrNickname.trim()) return
    const updated = [...value]
    if (editingIndex !== null) {
      updated[editingIndex] = editing
    } else {
      updated.push(editing)
    }
    onChange(updated)
    setEditing(emptyMedicine())
    setEditingIndex(null)
  }

  const remove = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
    if (editingIndex === index) {
      setEditing(emptyMedicine())
      setEditingIndex(null)
    }
  }

  const addTiming = () => {
    setEditing((e) => ({ ...e, timings: [...e.timings, '12:00'] }))
  }

  const updateTiming = (i: number, t: string) => {
    setEditing((e) => {
      const timings = [...e.timings]
      timings[i] = t
      return { ...e, timings }
    })
  }

  const removeTiming = (i: number) => {
    setEditing((e) => ({ ...e, timings: e.timings.filter((_, idx) => idx !== i) }))
  }

  return (
    <div className="w-full max-w-sm mx-auto space-y-4">
      {/* Saved medicines */}
      {value.map((med, i) => (
        <div key={i} className="flex items-center gap-2 bg-sage-50 border border-sage-200 rounded-xl px-4 py-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-stone-800 truncate">{med.nameOrNickname}</p>
            <p className="text-xs text-stone-500">{med.timings.join(' · ')}</p>
          </div>
          <button
            type="button"
            onClick={() => remove(i)}
            className="text-stone-400 hover:text-stone-600 p-1 shrink-0"
            aria-label="Remove"
          >
            ✕
          </button>
        </div>
      ))}

      {/* Edit form */}
      {(canAddMore || editingIndex !== null) && (
        <div className="border-2 border-stone-200 rounded-2xl p-4 space-y-3">
          <input
            type="text"
            placeholder="Medicine name or nickname"
            value={editing.nameOrNickname}
            onChange={(e) => setEditing((ed) => ({ ...ed, nameOrNickname: e.target.value }))}
            className="w-full text-base text-stone-800 bg-transparent border-b border-stone-200 focus:border-sage-500 outline-none pb-2 placeholder:text-stone-300 transition-colors"
          />

          <div className="space-y-2">
            <p className="text-xs text-stone-500 font-medium">When do you take it?</p>
            {editing.timings.map((t, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="time"
                  value={t}
                  onChange={(e) => updateTiming(i, e.target.value)}
                  className="flex-1 text-sm text-stone-800 bg-stone-50 rounded-lg px-3 py-2 border border-stone-200 focus:border-sage-500 outline-none"
                />
                {editing.timings.length > 1 && (
                  <button type="button" onClick={() => removeTiming(i)} className="text-stone-400 hover:text-stone-600 text-sm">
                    ✕
                  </button>
                )}
              </div>
            ))}
            {editing.timings.length < 4 && (
              <button
                type="button"
                onClick={addTiming}
                className="text-xs text-sage-600 hover:text-sage-800 transition-colors"
              >
                + Add another time
              </button>
            )}
          </div>

          <SelectRow
            label="Take with food?"
            options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }, { value: 'not_sure', label: 'Not sure' }]}
            value={editing.withFood}
            onChange={(v) => setEditing((e) => ({ ...e, withFood: v as MedicineEntry['withFood'] }))}
          />

          <SelectRow
            label="Is missing a dose serious?"
            options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }, { value: 'not_sure', label: 'Not sure' }]}
            value={editing.isCritical}
            onChange={(v) => setEditing((e) => ({ ...e, isCritical: v as MedicineEntry['isCritical'] }))}
          />

          <button
            type="button"
            onClick={saveEditing}
            disabled={!editing.nameOrNickname.trim()}
            className={cn(
              'w-full py-3 rounded-xl text-sm font-medium transition-all duration-150',
              editing.nameOrNickname.trim()
                ? 'bg-sage-500 text-white hover:bg-sage-600'
                : 'bg-stone-100 text-stone-400 cursor-not-allowed'
            )}
          >
            {editingIndex !== null ? 'Save changes' : 'Add medicine'}
          </button>
        </div>
      )}

      <p className="text-xs text-stone-400 text-center leading-relaxed">
        WellPath reminders are gentle nudges, not medical advice.
        Always follow your doctor's guidance.
      </p>
    </div>
  )
}

function SelectRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-stone-500 font-medium">{label}</p>
      <div className="flex gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              'flex-1 py-2 rounded-lg text-xs font-medium border transition-all duration-150',
              value === o.value
                ? 'bg-sage-100 border-sage-400 text-sage-800'
                : 'bg-white border-stone-200 text-stone-600 hover:border-sage-200'
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}
