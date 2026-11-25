import { getStreaks } from '../lib/dates'
import type { Habit, HabitHistory } from '../types'

type Props = {
  habit: Habit
  completions: string[]
  todayKey: string
  history: HabitHistory
  onToggle: (habitId: string, date: string) => void
  onRemove: (habit: Habit) => void
}

export default function HabitCard({ habit, completions, todayKey, history, onToggle, onRemove }: Props) {
  const completed = new Set(completions)
  const { streak, best } = getStreaks(completions, todayKey)
  const completedToday = completed.has(todayKey)

  return (
    <li className="habit-item">
      <article className="habit-card">
        <div className="habit-card-heading">
          <div className="habit-title">
            <span className="habit-emoji" style={{ backgroundColor: habit.color }}>{habit.emoji}</span>
            <h3>{habit.name}</h3>
          </div>
          <button
            className={`today-check${completedToday ? ' is-done' : ''}`}
            style={completedToday ? { backgroundColor: habit.color } : undefined}
            aria-label={`${completedToday ? 'Undo' : 'Complete'} ${habit.name} for today`}
            aria-pressed={completedToday}
            onClick={() => onToggle(habit.id, todayKey)}
          >
            {completedToday ? '✓' : ''}
          </button>
        </div>
        <div className="habit-stats">
          <span>Streak <strong>{streak}</strong></span>
          <span>Best <strong>{best}</strong></span>
          <span>Total <strong>{completions.length}</strong></span>
        </div>
        <div className="history-scroll" role="group" aria-label={`${habit.name} completion history`}>
          <div className="history-months" aria-hidden="true">
            {history.map((week, index) => {
              const monthStart = week.find(({ date }) => date.getDate() === 1)
              return <span key={index}>{monthStart ? monthStart.date.toLocaleDateString(undefined, { month: 'short' }) : ''}</span>
            })}
          </div>
          <div className="heatmap">
            {history.flatMap((week) => week.map(({ date, key }) => {
              const checked = completed.has(key)
              const unavailable = key > todayKey || key < habit.createdAt
              return (
                <button
                  key={key}
                  className={`heat-cell${checked ? ' completed' : ''}`}
                  style={checked ? { backgroundColor: habit.color } : undefined}
                  aria-label={`${habit.name}, ${date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}: ${checked ? 'completed' : 'not completed'}`}
                  aria-pressed={checked}
                  title={`${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}${checked ? ' · completed' : ''}`}
                  disabled={unavailable}
                  onClick={() => onToggle(habit.id, key)}
                />
              )
            }))}
          </div>
        </div>
        <div className="habit-card-footer">
          <span className="history-legend"><span className="legend-cell" /> less <span className="legend-cell completed" style={{ backgroundColor: habit.color }} /> more</span>
          <button className="remove-button" aria-label={`Remove ${habit.name}`} onClick={() => onRemove(habit)}>Delete</button>
        </div>
      </article>
    </li>
  )
}
