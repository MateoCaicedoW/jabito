import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import HabitCard from './components/HabitCard'
import { requestState } from './lib/api'
import { buildHistory, today } from './lib/dates'
import type { Habit, HabitState } from './types'

const colors = ['#2da56f', '#3478c7', '#9162c5', '#c76b54', '#328b91', '#9b8432']

export default function App() {
  const [state, setState] = useState<HabitState>({ habits: [], completions: {} })
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState('')
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 600px)').matches)
  const [historyRange, setHistoryRange] = useState<'recent' | 'earlier'>('recent')
  const saveQueue = useRef(Promise.resolve())

  useEffect(() => {
    requestState()
      .then(setState)
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoaded(true))
  }, [])

  useEffect(() => {
    const query = window.matchMedia('(max-width: 600px)')
    const update = () => setIsMobile(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  const todayKey = today()
  const history = useMemo(() => buildHistory(new Date()), [todayKey])
  const visibleHistory = isMobile
    ? historyRange === 'recent' ? history.slice(-27) : history.slice(0, 26)
    : history
  const completedToday = state.habits.filter((habit) => state.completions[habit.id]?.includes(todayKey)).length
  const progress = state.habits.length ? Math.round((completedToday / state.habits.length) * 100) : 0

  function save(next: HabitState) {
    setState(next)
    setError('')
    saveQueue.current = saveQueue.current
      .then(() => requestState('PUT', next))
      .then(() => setError(''))
      .catch((reason: Error) => setError(reason.message))
  }

  function toggle(habitId: string, date: string) {
    const dates = state.completions[habitId] ?? []
    const nextDates = dates.includes(date) ? dates.filter((item) => item !== date) : [...dates, date]
    void save({ ...state, completions: { ...state.completions, [habitId]: nextDates } })
  }

  function renameHabit(habitId: string, name: string) {
    void save({
      ...state,
      habits: state.habits.map((habit) => habit.id === habitId ? { ...habit, name } : habit),
    })
  }

  function addHabit(event: FormEvent) {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    const habit: Habit = {
      id: crypto.randomUUID(),
      name: trimmed,
      emoji: ['🌱', '☀️', '🍵', '📖', '🚶'][state.habits.length % 5],
      color: colors[state.habits.length % colors.length],
      createdAt: today(),
    }
    void save({ ...state, habits: [...state.habits, habit] })
    setName('')
    setAdding(false)
  }

  function removeHabit(habit: Habit) {
    if (!window.confirm(`Remove “${habit.name}” and its progress?`)) return
    const { [habit.id]: _removed, ...completions } = state.completions
    void save({ habits: state.habits.filter((item) => item.id !== habit.id), completions })
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Habit Garden home">
          <span className="brand-mark">✳</span><span>habit garden</span>
        </a>
        <span className="today-label">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
      </header>

      <section className="welcome">
        <div>
          <p className="eyebrow">YOUR LITTLE DAILY PRACTICE</p>
          <h1>Little by little.</h1>
          <p className="subtitle">A good day is made of small things.</p>
        </div>
        <div className="today-card" aria-live="polite">
          <div className="ring" style={{ '--progress': `${progress}%` } as CSSProperties}>
            <span>{completedToday}<small>/{state.habits.length}</small></span>
          </div>
          <p>{state.habits.length ? 'done today' : 'start with one'}</p>
        </div>
      </section>

      <section className="habits-section" aria-labelledby="habits-heading">
        <div className="section-heading">
          <div>
            <h2 id="habits-heading">Your habits</h2>
            <p>Show up when you can. Begin again when you need.</p>
          </div>
          <button className="add-button" disabled={!loaded || Boolean(error)} onClick={() => setAdding((value) => !value)}>
            <span aria-hidden="true">＋</span> Add habit
          </button>
        </div>

        {adding && (
          <form className="add-form" onSubmit={addHabit}>
            <label className="visually-hidden" htmlFor="habit-name">Habit name</label>
            <input id="habit-name" autoFocus maxLength={40} placeholder="What would you like to do?" value={name} onChange={(event) => setName(event.target.value)} />
            <button className="save-button" type="submit">Add</button>
            <button className="cancel-button" type="button" onClick={() => { setAdding(false); setName('') }}>Cancel</button>
          </form>
        )}

        {isMobile && state.habits.length > 0 && (
          <div className="history-switch" role="group" aria-label="Choose completion history period">
            <button type="button" aria-pressed={historyRange === 'recent'} onClick={() => setHistoryRange('recent')}>Recent 6 months</button>
            <button type="button" aria-pressed={historyRange === 'earlier'} onClick={() => setHistoryRange('earlier')}>Earlier 6 months</button>
          </div>
        )}

        {!loaded ? (
          <div className="empty-state">Growing your garden…</div>
        ) : state.habits.length === 0 ? (
          <div className="empty-state">
            <span className="empty-flower" aria-hidden="true">✿</span>
            <strong>Your garden is waiting</strong>
            <span>Add a habit to start keeping track.</span>
          </div>
        ) : (
          <ul className="habit-list">
            {state.habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                completions={state.completions[habit.id] ?? []}
                todayKey={todayKey}
                history={visibleHistory}
                onToggle={toggle}
                onRename={renameHabit}
                onRemove={removeHabit}
              />
            ))}
          </ul>
        )}
      </section>

      {error && <p className="error-message" role="alert">{error}</p>}
      <footer className="footer"><span>Progress, not perfection.</span><span>✳</span></footer>
    </main>
  )
}
