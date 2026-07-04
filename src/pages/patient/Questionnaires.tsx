import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { getQuestionnaires, createQuestionnaire } from '@/services/questionnaires'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  CheckCircle2,
  Lock,
  Clock,
  PartyPopper,
  Loader2,
  ClipboardList,
  Stethoscope,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { QuestionnaireForm } from '@/components/patient/QuestionnaireForm'
import { QUESTIONNAIRE_WEEKS, CONSULTATION_WEEKS, ALL_WEEKS } from '@/lib/questionnaire-config'
import type { Questionnaire } from '@/services/questionnaires'

export default function PatientQuestionnaires() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([])
  const [loading, setLoading] = useState(true)
  const [activeWeek, setActiveWeek] = useState<number | null>(null)
  const [showReward, setShowReward] = useState(false)

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

  const completedWeeks = questionnaires.map((q) => q.week_number)
  const nextPending = QUESTIONNAIRE_WEEKS.find((w) => !completedWeeks.includes(w))

  const handleSubmit = async (data: Record<string, unknown>) => {
    if (!user?.id || activeWeek === null) return
    await createQuestionnaire({ ...data, patient: user.id } as Partial<Questionnaire>)
    setActiveWeek(null)
    setShowReward(true)
    toast({ title: 'Sucesso!', description: 'Questionário salvo com sucesso.', duration: 3000 })
    loadData()
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

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
          const isQ = QUESTIONNAIRE_WEEKS.includes(week)
          const isC = CONSULTATION_WEEKS.includes(week)
          const isDone = completedWeeks.includes(week)
          const isPending = !isDone && week === nextPending && isQ
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
                  className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                    isDone
                      ? 'bg-emerald-100 text-emerald-600'
                      : isPending
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-slate-100 text-slate-400'
                  }`}
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
                  <Button onClick={() => setActiveWeek(week)} className="ml-auto md:ml-4">
                    Preencher Agora
                  </Button>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      <Dialog open={activeWeek !== null} onOpenChange={(o) => !o && setActiveWeek(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" /> Questionário — Semana {activeWeek}
            </DialogTitle>
            <DialogDescription>
              Responda com sinceridade. Suas respostas ajudam no seu tratamento.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 px-1">
            {activeWeek !== null && <QuestionnaireForm week={activeWeek} onSubmit={handleSubmit} />}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={showReward} onOpenChange={setShowReward}>
        <DialogContent className="sm:max-w-md text-center p-8">
          <DialogHeader>
            <div className="mx-auto w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
              <PartyPopper className="w-10 h-10 text-amber-500" />
            </div>
            <DialogTitle className="text-2xl mb-2">Excelente trabalho!</DialogTitle>
            <DialogDescription className="text-base">
              Você está participando ativamente do seu tratamento. Sua constância nos ajuda a
              entender melhor sua evolução e ajustar o que for preciso.
            </DialogDescription>
          </DialogHeader>
          <Button
            onClick={() => setShowReward(false)}
            className="mt-6 w-full rounded-full"
            size="lg"
          >
            Continuar
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
