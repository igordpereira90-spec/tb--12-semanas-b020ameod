import { CheckCircle2, Clock, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Timeline({ currentWeek }: { currentWeek: number }) {
  const steps = [0, 2, 4, 6, 8, 10, 12]

  return (
    <div className="relative w-full overflow-x-auto py-8 hide-scrollbar">
      <div className="flex items-center min-w-max px-4">
        {steps.map((week, idx) => {
          const isCompleted = week < currentWeek
          const isCurrent = week === currentWeek
          const isLocked = week > currentWeek

          return (
            <div key={week} className="flex items-center">
              <div className="flex flex-col items-center relative group">
                <div
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center z-10 transition-all duration-300',
                    isCompleted
                      ? 'bg-emerald-100 text-emerald-600 shadow-sm'
                      : isCurrent
                        ? 'bg-primary text-white shadow-lg shadow-primary/30 ring-4 ring-primary/20 scale-110'
                        : 'bg-slate-100 text-slate-400',
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : isCurrent ? (
                    <Clock className="w-6 h-6 animate-pulse" />
                  ) : (
                    <Lock className="w-5 h-5" />
                  )}
                </div>
                <div
                  className={cn(
                    'absolute -bottom-8 whitespace-nowrap text-xs font-semibold transition-colors',
                    isCurrent ? 'text-primary' : 'text-slate-500',
                  )}
                >
                  Semana {week}
                </div>
              </div>

              {idx < steps.length - 1 && (
                <div className="w-16 md:w-24 h-1 mx-2 rounded-full overflow-hidden bg-slate-100">
                  <div
                    className={cn(
                      'h-full transition-all duration-1000',
                      isCompleted
                        ? 'bg-emerald-400 w-full'
                        : isCurrent
                          ? 'bg-primary/30 w-1/2'
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
