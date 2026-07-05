import { CheckCircle2, Clock, Lock, Calendar, ClipboardCheck, BookOpen, Unlock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { PROGRAM_WEEKS, QUESTIONNAIRE_WEEKS, CONSULTATION_WEEKS } from '@/lib/questionnaire-config'

interface RoadmapProps {
  completedWeeks: number[]
  unlockedWeeks?: number[]
  materialWeeks?: number[]
  completedMaterialWeeks?: number[]
  questionnaireConfigWeeks?: number[]
  consultationWeeks?: number[]
  onActivityClick?: (week: number, type: 'material' | 'questionnaire' | 'consultation') => void
}

interface RoadmapActivity {
  label: string
  icon: typeof BookOpen
  completed: boolean
  type: 'material' | 'questionnaire' | 'consultation'
  clickable: boolean
}

export function Roadmap({
  completedWeeks,
  unlockedWeeks = [],
  materialWeeks = [],
  completedMaterialWeeks = [],
  questionnaireConfigWeeks = [],
  consultationWeeks = [],
  onActivityClick,
}: RoadmapProps) {
  const qWeeks = [...new Set([...QUESTIONNAIRE_WEEKS, ...questionnaireConfigWeeks])]
  const cWeeks = [...new Set([...CONSULTATION_WEEKS, ...consultationWeeks])]

  return (
    <div className="space-y-3">
      {PROGRAM_WEEKS.map((week) => {
        const isCompleted = completedWeeks.includes(week)
        const isQuestionnaire = qWeeks.includes(week)
        const isConsultation = cWeeks.includes(week)
        const hasMaterial = materialWeeks.includes(week)
        const isMaterialCompleted = completedMaterialWeeks.includes(week)

        const prevWeeks = PROGRAM_WEEKS.filter((w) => w < week)
        const isAvailable =
          isCompleted ||
          unlockedWeeks.includes(week) ||
          prevWeeks.every((w) => (qWeeks.includes(w) ? completedWeeks.includes(w) : true))
        const isManuallyUnlocked = !isCompleted && unlockedWeeks.includes(week)
        const isCurrent =
          !isCompleted &&
          isAvailable &&
          (prevWeeks.some((w) => completedWeeks.includes(w)) || week === 0)
        const isLocked = !isCompleted && !isAvailable && !isManuallyUnlocked

        const activities: RoadmapActivity[] = []
        if (hasMaterial) {
          activities.push({
            label: 'Material Educativo',
            icon: BookOpen,
            completed: isMaterialCompleted,
            type: 'material',
            clickable: !isLocked && !!onActivityClick,
          })
        }
        if (isQuestionnaire) {
          activities.push({
            label: 'Questionário',
            icon: ClipboardCheck,
            completed: isCompleted,
            type: 'questionnaire',
            clickable: !isLocked && !!onActivityClick,
          })
        }
        if (isConsultation) {
          activities.push({
            label: 'Consulta',
            icon: Calendar,
            completed: isCompleted,
            type: 'consultation',
            clickable: false,
          })
        }

        return (
          <Card
            key={week}
            className={cn(
              'p-4 transition-all duration-300',
              isCompleted
                ? 'border-emerald-200 bg-emerald-50/30'
                : isCurrent
                  ? 'border-primary/30 bg-primary/5 shadow-md shadow-primary/10'
                  : isManuallyUnlocked
                    ? 'border-indigo-200 bg-indigo-50/30'
                    : 'border-slate-200 bg-white',
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300',
                  isCompleted
                    ? 'bg-emerald-100 text-emerald-600'
                    : isCurrent
                      ? 'bg-primary text-white shadow-lg shadow-primary/30 ring-4 ring-primary/20'
                      : isManuallyUnlocked
                        ? 'bg-indigo-100 text-indigo-600'
                        : 'bg-slate-100 text-slate-400',
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : isCurrent ? (
                  <Clock className="w-4 h-4 animate-pulse" />
                ) : isManuallyUnlocked ? (
                  <Unlock className="w-4 h-4" />
                ) : isConsultation ? (
                  <Calendar className="w-4 h-4" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span
                    className={cn(
                      'font-semibold text-sm',
                      isCurrent
                        ? 'text-primary'
                        : isCompleted
                          ? 'text-slate-700'
                          : 'text-slate-500',
                    )}
                  >
                    Semana {week}
                  </span>
                  {isCurrent && (
                    <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      Atual
                    </span>
                  )}
                  {isLocked && (
                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                      Bloqueada
                    </span>
                  )}
                  {isManuallyUnlocked && (
                    <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                      Liberada
                    </span>
                  )}
                  {isCompleted && (
                    <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Concluída
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  {activities.length > 0 ? (
                    activities.map((act) => {
                      const Icon = act.icon
                      return (
                        <div
                          key={act.label}
                          onClick={() => {
                            if (act.clickable && onActivityClick) {
                              onActivityClick(week, act.type)
                            }
                          }}
                          className={cn(
                            'flex items-center gap-2 text-sm rounded-lg px-3 py-2 transition-colors',
                            act.completed
                              ? 'bg-emerald-50 text-emerald-700'
                              : isLocked
                                ? 'bg-slate-50 text-slate-400'
                                : 'bg-slate-50 text-slate-600',
                            act.clickable && 'cursor-pointer hover:bg-slate-100 hover:shadow-sm',
                            !act.clickable && 'cursor-default',
                          )}
                        >
                          <Icon
                            className={cn(
                              'w-4 h-4 shrink-0',
                              isLocked && !act.completed && 'opacity-50',
                            )}
                          />
                          <span className="flex-1 font-medium">{act.label}</span>
                          {act.completed ? (
                            <span className="text-xs text-emerald-600 font-semibold shrink-0 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Concluído
                            </span>
                          ) : (
                            <span
                              className={cn(
                                'text-xs font-medium shrink-0 flex items-center gap-1',
                                isLocked ? 'text-slate-400' : 'text-slate-500',
                              )}
                            >
                              {isLocked && <Lock className="w-3 h-3" />}
                              Pendente
                            </span>
                          )}
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-xs text-slate-400 italic px-3 py-2">
                      Nenhuma atividade agendada
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
