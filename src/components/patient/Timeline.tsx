import { CheckCircle2, Clock, Lock, Stethoscope, ClipboardList, Unlock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ALL_WEEKS, QUESTIONNAIRE_WEEKS, CONSULTATION_WEEKS } from '@/lib/questionnaire-config'

interface TimelineProps {
  completedWeeks: number[]
  unlockedWeeks?: number[]
}

export function Timeline({ completedWeeks, unlockedWeeks = [] }: TimelineProps) {
  return (
    <div className="relative w-full overflow-x-auto py-8">
      <div className="flex items-center min-w-max px-4">
        {ALL_WEEKS.map((week, idx) => {
          const isCompleted = completedWeeks.includes(week)
          const isQuestionnaire = QUESTIONNAIRE_WEEKS.includes(week)
          const isConsultation = CONSULTATION_WEEKS.includes(week)
          const prevWeeks = ALL_WEEKS.filter((w) => w < week)
          const isAvailable =
            isCompleted ||
            unlockedWeeks.includes(week) ||
            prevWeeks.every((w) =>
              QUESTIONNAIRE_WEEKS.includes(w) ? completedWeeks.includes(w) : true,
            )
          const isManuallyUnlocked = !isCompleted && unlockedWeeks.includes(week)
          const isCurrent =
            !isCompleted && isAvailable && prevWeeks.some((w) => completedWeeks.includes(w))

          return (
            <div key={week} className="flex items-center">
              <div className="flex flex-col items-center relative group">
                <div
                  className={cn(
                    'w-11 h-11 rounded-full flex items-center justify-center z-10 transition-all duration-300',
                    isCompleted
                      ? 'bg-amber-100 text-amber-600 shadow-sm'
                      : isCurrent
                        ? 'bg-primary text-white shadow-lg shadow-primary/30 ring-4 ring-primary/20 scale-110'
                        : isManuallyUnlocked
                          ? 'bg-indigo-100 text-indigo-600 shadow-sm ring-2 ring-indigo-200'
                          : 'bg-slate-100 text-slate-400',
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : isCurrent ? (
                    <Clock className="w-5 h-5 animate-pulse" />
                  ) : isManuallyUnlocked ? (
                    <Unlock className="w-4 h-4" />
                  ) : isConsultation ? (
                    <Stethoscope className="w-4 h-4" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                </div>
                <div
                  className={cn(
                    'absolute -bottom-7 whitespace-nowrap text-[10px] font-semibold transition-colors flex flex-col items-center',
                    isCurrent ? 'text-primary' : 'text-slate-500',
                  )}
                >
                  <span>S{week}</span>
                  {isQuestionnaire && <ClipboardList className="w-2.5 h-2.5 mt-0.5 opacity-50" />}
                </div>
              </div>
              {idx < ALL_WEEKS.length - 1 && (
                <div className="w-12 md:w-20 h-1 mx-1.5 rounded-full overflow-hidden bg-slate-100">
                  <div
                    className={cn(
                      'h-full transition-all duration-1000',
                      isCompleted
                        ? 'bg-amber-400 w-full'
                        : isCurrent
                          ? 'bg-primary/30 w-1/2'
                          : isManuallyUnlocked
                            ? 'bg-indigo-300 w-1/2'
                            : 'w-0',
                    )}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
