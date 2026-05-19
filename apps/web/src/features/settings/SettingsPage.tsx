import { useEffect, useState } from 'react'
import { settingsApi, UserProfile, UpdateProfilePayload } from './api'
import { Avatar } from '@/components/Avatar'

interface Medicine {
  nameOrNickname: string
  timings: string[]
  withFood: string
  isCritical: string
  reminderEnabled: boolean
}

export function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Editable fields
  const [name, setName] = useState('')
  const [workMode, setWorkMode] = useState('')
  const [wakeTime, setWakeTime] = useState('')
  const [sleepGoal, setSleepGoal] = useState(7)
  const [exercise, setExercise] = useState('')
  const [peakWindow, setPeakWindow] = useState('')
  const [dietType, setDietType] = useState('')
  const [waterReminder, setWaterReminder] = useState(false)
  const [shareWithGroups, setShareWithGroups] = useState(true)
  const [sharingPreference, setSharingPreference] = useState('completion_only')
  const [insightsEnabled, setInsightsEnabled] = useState(true)
  const [medicines, setMedicines] = useState<Medicine[]>([])

  useEffect(() => {
    settingsApi.getProfile().then((p) => {
      setProfile(p)
      setName(p.name ?? '')
      setWorkMode(p.profile.workMode ?? '')
      setWakeTime(p.profile.sleep?.wakeTime ?? '')
      setSleepGoal(p.profile.sleep?.sleepGoal ?? 7)
      setExercise(p.profile.exercise?.preference ?? '')
      setPeakWindow(p.profile.focus?.peakWindow ?? '')
      setDietType(p.profile.diet?.type ?? '')
      setWaterReminder(p.profile.diet?.waterReminderNeeded ?? false)
      setShareWithGroups(p.groupSharingDefaults?.shareWithGroups ?? true)
      setSharingPreference(p.groupSharingDefaults?.defaultSharingPreference ?? 'completion_only')
      setInsightsEnabled(p.insightsEnabled ?? true)
      setMedicines(p.profile.health?.medicines ?? [])
    }).catch(() => null).finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      const payload: UpdateProfilePayload = {
        name,
        workMode,
        sleep: { wakeTime, sleepGoal },
        exercise: { preference: exercise },
        focus: { peakWindow },
        diet: { type: dietType, waterReminderNeeded: waterReminder },
        medicines,
        groupSharingDefaults: { shareWithGroups, defaultSharingPreference: sharingPreference },
        insightsEnabled,
      }
      const updated = await settingsApi.updateProfile(payload)
      setProfile(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('[settings] save failed:', err)
    } finally {
      setSaving(false)
    }
  }

  function addMedicine() {
    setMedicines((prev) => [...prev, {
      nameOrNickname: '',
      timings: ['08:00'],
      withFood: 'not_sure',
      isCritical: 'not_sure',
      reminderEnabled: true,
    }])
  }

  function removeMedicine(i: number) {
    setMedicines((prev) => prev.filter((_, idx) => idx !== i))
  }

  function updateMedicine(i: number, field: keyof Medicine, value: unknown) {
    setMedicines((prev) => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m))
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((n) => <div key={n} className="h-16 bg-stone-100 dark:bg-stone-800 rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6 pb-24">
      <h1 className="text-2xl font-semibold text-stone-800 dark:text-stone-100 mb-6">Settings</h1>

      {/* Profile photo */}
      {profile && (
        <div className="flex items-center gap-4 mb-8">
          <Avatar
            name={name || profile.name}
            photoUrl={profile.profilePhoto?.url}
            thumbnailUrl={profile.profilePhoto?.thumbnailUrl}
            size="lg"
            variant="full"
          />
          <div>
            <p className="font-medium text-stone-700 dark:text-stone-200">{profile.email}</p>
            <p className="text-sm text-stone-400 dark:text-stone-500">Profile photo is managed separately</p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Basic info */}
        <Section title="Basic info">
          <Field label="Your name">
            <input value={name} onChange={(e) => setName(e.target.value)}
              className="input-base" placeholder="Your name" />
          </Field>
          <Field label="Work mode">
            <Select value={workMode} onChange={setWorkMode} options={[
              { value: 'wfh', label: 'Work from home' },
              { value: 'office', label: 'Office' },
              { value: 'hybrid', label: 'Hybrid' },
            ]} />
          </Field>
        </Section>

        {/* Sleep */}
        <Section title="Sleep">
          <Field label="Wake time">
            <input type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)}
              className="input-base" />
          </Field>
          <Field label="Sleep goal">
            <Select value={String(sleepGoal)} onChange={(v) => setSleepGoal(Number(v))} options={[
              { value: '6', label: '6 hours' },
              { value: '7', label: '7 hours' },
              { value: '8', label: '8 hours' },
            ]} />
          </Field>
        </Section>

        {/* Routine preferences */}
        <Section title="Routine preferences">
          <Field label="Exercise">
            <Select value={exercise} onChange={setExercise} options={[
              { value: 'walk', label: 'Walk' },
              { value: 'gym', label: 'Gym' },
              { value: 'yoga', label: 'Yoga' },
              { value: 'home_workout', label: 'Home workout' },
              { value: 'none', label: 'None' },
            ]} />
          </Field>
          <Field label="Peak focus window">
            <Select value={peakWindow} onChange={setPeakWindow} options={[
              { value: 'early_morning', label: 'Early morning' },
              { value: 'morning', label: 'Morning' },
              { value: 'afternoon', label: 'Afternoon' },
              { value: 'evening', label: 'Evening' },
              { value: 'night', label: 'Night' },
            ]} />
          </Field>
          <Field label="Diet">
            <Select value={dietType} onChange={setDietType} options={[
              { value: 'veg', label: 'Vegetarian' },
              { value: 'vegan', label: 'Vegan' },
              { value: 'non_veg', label: 'Non-vegetarian' },
              { value: 'eggetarian', label: 'Eggetarian' },
              { value: 'jain', label: 'Jain' },
            ]} />
          </Field>
          <Field label="Water reminders">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={waterReminder} onChange={(e) => setWaterReminder(e.target.checked)}
                className="w-4 h-4 accent-stone-700 dark:accent-stone-400" />
              <span className="text-sm text-stone-600 dark:text-stone-300">Remind me to drink water throughout the day</span>
            </label>
          </Field>
        </Section>

        {/* Medicines */}
        <Section title="Medicine reminders">
          <p className="text-xs text-stone-400 dark:text-stone-500 -mt-2 mb-3">
            WellPath is not a medical app. Reminders are gentle nudges — always follow your doctor's guidance.
          </p>
          {medicines.map((med, i) => (
            <div key={i} className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-stone-600 dark:text-stone-300">Medicine {i + 1}</p>
                <button onClick={() => removeMedicine(i)} className="text-xs text-stone-400 dark:text-stone-500 hover:text-red-400 transition-colors">
                  Remove
                </button>
              </div>
              <input
                value={med.nameOrNickname}
                onChange={(e) => updateMedicine(i, 'nameOrNickname', e.target.value)}
                placeholder="Name or nickname (informal names welcome)"
                className="input-base"
              />
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-stone-400 dark:text-stone-500 mb-1 block">Time</label>
                  <input type="time" value={med.timings[0] ?? '08:00'}
                    onChange={(e) => updateMedicine(i, 'timings', [e.target.value])}
                    className="input-base" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-stone-400 dark:text-stone-500 mb-1 block">With food?</label>
                  <Select value={med.withFood} onChange={(v) => updateMedicine(i, 'withFood', v)} options={[
                    { value: 'yes', label: 'Yes' },
                    { value: 'no', label: 'No' },
                    { value: 'not_sure', label: 'Not sure' },
                  ]} />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={med.reminderEnabled}
                  onChange={(e) => updateMedicine(i, 'reminderEnabled', e.target.checked)}
                  className="w-4 h-4 accent-stone-700 dark:accent-stone-400" />
                <span className="text-sm text-stone-600 dark:text-stone-300">Enable reminder</span>
              </label>
            </div>
          ))}
          <button onClick={addMedicine}
            className="w-full py-3 rounded-xl border border-dashed border-stone-300 dark:border-stone-600 text-sm text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors">
            + Add medicine
          </button>
        </Section>

        {/* Weekly insights */}
        <Section title="Trends & insights">
          <Field label="">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={insightsEnabled} onChange={(e) => setInsightsEnabled(e.target.checked)}
                className="w-4 h-4 accent-stone-700 dark:accent-stone-400" />
              <span className="text-sm text-stone-600 dark:text-stone-300">Show mood and energy trends in History</span>
            </label>
            {!insightsEnabled && (
              <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
                You can turn this back on anytime.
              </p>
            )}
          </Field>
        </Section>

        {/* Groups & sharing */}
        <Section title="Groups & sharing">
          <Field label="">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={shareWithGroups} onChange={(e) => setShareWithGroups(e.target.checked)}
                className="w-4 h-4 accent-stone-700 dark:accent-stone-400" />
              <span className="text-sm text-stone-600 dark:text-stone-300">Share my progress with groups</span>
            </label>
          </Field>
          {shareWithGroups && (
            <Field label="Default sharing level">
              <Select value={sharingPreference} onChange={setSharingPreference} options={[
                { value: 'completion_only', label: 'Completion % only' },
                { value: 'with_task_detail', label: 'Include task details' },
                { value: 'with_reasons', label: 'Include reasons & alternatives' },
              ]} />
            </Field>
          )}
        </Section>
      </div>

      {/* Save button — fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-stone-800 border-t border-stone-100 dark:border-stone-700 p-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 rounded-xl bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 font-medium text-sm disabled:opacity-40 hover:bg-stone-700 dark:hover:bg-stone-100 transition-colors"
          >
            {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Tiny shared components ────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wide mb-3">{title}</h2>
      <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl p-4 space-y-4">
        {children}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-1">{label}</label>}
      {children}
    </div>
  )
}

function Select({ value, onChange, options }: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="input-base"
    >
      <option value="">Select...</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}
