import type { HabitHistory } from '../types'

export function dateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function today() {
  return dateKey(new Date())
}

function shiftDate(date: Date, offset: number) {
  const shifted = new Date(date)
  shifted.setDate(shifted.getDate() + offset)
  return shifted
}

function parseDate(key: string) {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function buildHistory(now: Date): HabitHistory {
  const end = shiftDate(now, 6 - now.getDay())
  const start = shiftDate(end, -370)
  return Array.from({ length: 53 }, (_, week) =>
    Array.from({ length: 7 }, (_, day) => {
      const date = shiftDate(start, week * 7 + day)
      return { date, key: dateKey(date) }
    }),
  )
}

export function getStreaks(dates: string[], todayKey: string) {
  const completed = new Set(dates)
  let current = completed.has(todayKey) ? parseDate(todayKey) : shiftDate(parseDate(todayKey), -1)
  let streak = 0
  while (completed.has(dateKey(current))) {
    streak++
    current = shiftDate(current, -1)
  }

  let best = 0
  let run = 0
  let previous = ''
  for (const date of [...completed].sort()) {
    run = previous && dateKey(shiftDate(parseDate(previous), 1)) === date ? run + 1 : 1
    best = Math.max(best, run)
    previous = date
  }
  return { streak, best }
}
