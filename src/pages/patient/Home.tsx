import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { getQuestionnaires } from '@/services/questionnaires'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, Loader2, Unlock } from 'lucide-react'
import { Timeline } from '@/components/patient/Timeline'
import { MedalCase } from '@/components/patient/MedalCase'
import { useUnlocks } from '@/hooks/use-unlocks'
import { calculateMedals, getCurrentWeek, getProgress } from '@/lib/patient-utils'
import type { Questionnaire } from '@/services/questionnaires'

export default function PatientHome() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([])
  const [loading, setLoading] = useState(true)
  const { unlockedWeeks } = useUnlocks(user?.id)

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

  const name = user?.name || 'Usuário'
  const currentWeek = getCurrentWeek(questionnaires)
  const progress = getProgress(questionnaires)
  const completedWeeks = questionnaires.map((q) => q.week_number)
  const medals = calculateMedals(questionnaires)

  return (
    <div className="space-y-8 animate-fade-in">
      <section className="glass-panel p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Olá, {name}! 👋</h1>
            <p className="text-slate-600 flex items-center">
              <Sparkles className="w-5 h-5 text-amber-500 mr-2" />
              Você está indo muito bem. A constância é a chave para o equilíbrio.
            </p>
          </div>
          <Button
            onClick={() => navigate('/patient/questionnaires')}
            size="lg"
            className="rounded-full shadow-lg shadow-primary/20"
          >
            Avaliação Semana {currentWeek} <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Sua Jornada</h2>
          <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
            {progress}% Concluído
          </span>
        </div>
        <Card className="p-2 md:p-6 shadow-sm border-slate-100">
          <Timeline completedWeeks={completedWeeks} unlockedWeeks={unlockedWeeks} />
          <div className="mt-8 px-4 pb-4">
            <Progress value={progress} className="h-3 bg-slate-100" />
          </div>
        </Card>
        {unlockedWeeks.length > 0 && (
          <Card className="p-4 bg-indigo-50/50 border-indigo-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <Unlock className="w-4 h-4" />
            </div>
            <p className="text-sm text-indigo-700">
              Seu profissional liberou {unlockedWeeks.length}{' '}
              {unlockedWeeks.length > 1 ? 'semanas adicionais' : 'semana adicional'} para acesso
              antecipado.
            </p>
          </Card>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">Suas Conquistas</h2>
        <MedalCase medals={medals} />
      </section>
    </div>
  )
}
