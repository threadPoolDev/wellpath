import {
  LineChart,
  Line,
  Area,
  AreaChart,
  XAxis,
  ResponsiveContainer,
  Tooltip,
  ComposedChart,
} from 'recharts'
import { MoodGraphDay } from '../api'

interface MoodGraphProps {
  data: MoodGraphDay[]
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number | null; name: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  const energy = payload.find((p) => p.name === 'energyLevel')?.value
  const completion = payload.find((p) => p.name === 'completionPercentage')?.value
  const energyLabel = energy === 1 ? 'Low' : energy === 2 ? 'Medium' : energy === 3 ? 'High' : null

  return (
    <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-stone-700 dark:text-stone-200 mb-1">{label}</p>
      {energyLabel && <p className="text-stone-500 dark:text-stone-400">Energy: {energyLabel}</p>}
      {completion !== null && completion !== undefined && (
        <p className="text-stone-500 dark:text-stone-400">Completion: {completion}%</p>
      )}
    </div>
  )
}

export function MoodGraph({ data }: MoodGraphProps) {
  const chartData = data.map((d) => ({
    date: formatDate(d.date),
    energyLevel: d.energyLevel,
    completionPercentage: d.completionPercentage,
  }))

  return (
    <div>
      <ResponsiveContainer width="100%" height={160}>
        <ComposedChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="completionFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: '#a8a29e' }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />

          <Tooltip content={<CustomTooltip />} />

          <Area
            type="monotone"
            dataKey="completionPercentage"
            fill="url(#completionFill)"
            stroke="#f59e0b"
            strokeWidth={1.5}
            strokeOpacity={0.5}
            dot={false}
            connectNulls={false}
          />

          <Line
            type="monotone"
            dataKey="energyLevel"
            stroke="#84a98c"
            strokeWidth={2}
            dot={false}
            connectNulls={false}
          />
        </ComposedChart>
      </ResponsiveContainer>

      <p className="text-[11px] text-stone-400 dark:text-stone-500 text-center mt-2">
        Your energy and routine tend to move together
      </p>
    </div>
  )
}
