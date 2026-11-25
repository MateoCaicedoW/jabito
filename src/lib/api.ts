import type { HabitState } from '../types'

export async function requestState(method?: 'PUT', state?: HabitState): Promise<HabitState> {
  const response = await fetch('/api/state', {
    method: method ?? 'GET',
    headers: method ? { 'Content-Type': 'application/json' } : undefined,
    body: state ? JSON.stringify(state) : undefined,
  })
  if (!response.ok) throw new Error('Could not save your progress. Check that the app is running.')
  return response.json() as Promise<HabitState>
}
