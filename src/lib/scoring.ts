export interface PointCalculation {
  base: number
  streak: number
  total: number
}

const SCHEDULED_WEEKS = [0, 2, 4, 6, 8, 10, 12]

export function getBasePoints(weekNumber: number): number {
  if (weekNumber === 0 || weekNumber === 2) return 10
  if (weekNumber === 4 || weekNumber === 6) return 15
  if (weekNumber === 8 || weekNumber === 10) return 20
  if (weekNumber === 12) return 25
  return 10
}

export function getPreviousScheduledWeek(weekNumber: number): number | null {
  const idx = SCHEDULED_WEEKS.indexOf(weekNumber)
  if (idx <= 0) return null
  return SCHEDULED_WEEKS[idx - 1]
}

export function calculateQuestionnairePoints(
  weekNumber: number,
  completedWeeks: number[],
): PointCalculation {
  const base = getBasePoints(weekNumber)
  const prevWeek = getPreviousScheduledWeek(weekNumber)
  const hasStreak = prevWeek !== null && completedWeeks.includes(prevWeek)
  const streak = hasStreak ? 5 : 0
  return { base, streak, total: base + streak }
}
