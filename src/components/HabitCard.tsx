import { useState } from 'react'
import type { FormEvent } from 'react'
import { getStreaks } from '../lib/dates'
import type { Habit, HabitHistory } from '../types'

type Props = {
  habit: Habit
  completions: string[]
  todayKey: string
  history: HabitHistory
  onToggle: (habitId: string, date: string) => void
  onRename: (habitId: string, name: string) => void
  onRemove: (habit: Habit) => void
}

export default function HabitCard({ habit, completions, todayKey, history, onToggle, onRename, onRemove }: Props) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(habit.name)
  const completed = new Set(completions)
  const { streak, best } = getStreaks(completions, todayKey)
  const completedToday = completed.has(todayKey)

  function submitRename(event: FormEvent) {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    if (trimmed !== habit.name) onRename(habit.id, trimmed)
    setEditing(false)
  }

  return (
    <li className="habit-item">
      <article className="habit-card">
        <div className="habit-card-heading">
          <div className="habit-title">
            <span className="habit-emoji" style={{ backgroundColor: habit.color }}>{habit.emoji}</span>
            {editing ? (
              <form className="rename-form" onSubmit={submitRename}>
                <label className="visually-hidden" htmlFor={`habit-name-${habit.id}`}>Habit title</label>
                <input
                  id={`habit-name-${habit.id}`}
                  autoFocus
                  required
                  maxLength={40}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                      setName(habit.name)
                      setEditing(false)
                    }
                  }}
                />
                <button className="rename-save" type="submit">Save</button>
                <button className="rename-cancel" type="button" onClick={() => { setName(habit.name); setEditing(false) }}>Cancel</button>
              </form>
            ) : (
              <>
                <h3 title={habit.name}>{habit.name}</h3>
                <button
                  className="rename-button"
                  type="button"
                  aria-label={`Edit title: ${habit.name}`}
                  onClick={() => { setName(habit.name); setEditing(true) }}
                >
                  <svg aria-hidden="true" viewBox="0 0 16 16">
                    <path d="m11.5 2.5 2 2M3 13l2.8-.6 7.3-7.3a1.4 1.4 0 0 0-2-2l-7.3 7.3L3 13Z" />
                  </svg>
                </button>
              </>
            )}
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
