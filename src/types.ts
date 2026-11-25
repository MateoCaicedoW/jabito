export type Habit = {
  id: string
  name: string
  emoji: string
  color: string
  createdAt: string
}

export type HabitState = {
  habits: Habit[]
  completions: Record<string, string[]>
}

export type HistoryDay = { date: Date; key: string }
export type HabitHistory = HistoryDay[][]
