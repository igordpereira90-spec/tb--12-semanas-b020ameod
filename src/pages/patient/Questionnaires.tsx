import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { getQuestionnaires } from '@/services/questionnaires'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Lock, Clock, Loader2, Stethoscope } from 'lucide-react'
import { cn } from '@/lib/utils'
import { QUESTIONNAIRE_WEEKS, CONSULTATION_WEEKS, ALL_WEEKS } from '@/lib/questionnaire-config'
import type { Questionnaire } from '@/services/questionnaires'

export default function PatientQuestionnaires() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    if (!user?.id) return
    try {
      const data = await getQuestionnaires(user.id)
      setQuestionnaires(data)
    } catch {
      setQuestionnaires([])
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('questionnaires', () => {
    loadData()
  })

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const completedWeeks = questionnaires.map((q) => q.week_number)
  const nextPending = QUESTIONNAIRE_WEEKS.find((w) => !completedWeeks.includes(w))

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Acompanhamento</h1>
        <p className="text-slate-600">
          Preencha seus questionários quinzenais para acompanharmos sua evolução.
        </p>
      </div>

      <div className="grid gap-3">
        {ALL_WEEKS.map((week) => {
          const isC = CONSULTATION_WEEKS.includes(week)
          const isDone = completedWeeks.includes(week)
          const isPending = !isDone && week === nextPending && QUESTIONNAIRE_WEEKS.includes(week)
          const isLocked = !isDone && !isPending

          if (isC) {
            return (
              <Card
                key={week}
                className="p-4 flex items-center gap-4 border-purple-100 bg-purple-50/30"
              >
                <div className="w-11 h-11 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800">Semana {week} — Consulta</h3>
                  <p className="text-sm text-slate-500">Consulta de acompanhamento presencial</p>
                </div>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  Consulta
                </Badge>
              </Card>
            )
          }

          return (
            <Card
              key={week}
              className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:shadow-md border-slate-100"
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center shrink-0',
                    isDone
                      ? 'bg-emerald-100 text-emerald-600'
                      : isPending
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-slate-100 text-slate-400',
                  )}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : isPending ? (
                    <Clock className="w-6 h-6 animate-pulse" />
                  ) : (
                    <Lock className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-slate-800">
                    Semana {week} {week === 0 && '(Início)'}
                  </h3>
                  {isDone && (
                    <p className="text-sm text-slate-500">
                      Preenchido em:{' '}
                      {questionnaires
                        .find((q) => q.week_number === week)
                        ?.created?.slice(0, 10)
                        .split('-')
                        .reverse()
                        .join('/')}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                {isDone && (
                  <Badge
                    variant="outline"
                    className="bg-emerald-50 text-emerald-700 border-emerald-200 py-1"
                  >
                    Concluído
                  </Badge>
                )}
                {isPending && (
                  <Badge
                    variant="outline"
                    className="bg-amber-50 text-amber-700 border-amber-200 py-1 animate-pulse"
                  >
                    Pendente
                  </Badge>
                )}
                {isLocked && (
                  <Badge
                    variant="outline"
                    className="bg-slate-50 text-slate-500 border-slate-200 py-1"
                  >
                    Aguardando
                  </Badge>
                )}
                {isPending && (
                  <Button
                    onClick={() => navigate(`/patient/questionnaires/${week}`)}
                    className="ml-auto md:ml-4"
                  >
                    Preencher Agora
                  </Button>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
