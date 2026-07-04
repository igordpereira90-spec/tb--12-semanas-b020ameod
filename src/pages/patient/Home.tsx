import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { getQuestionnaires } from '@/services/questionnaires'
import { getEducationalMaterials } from '@/services/educational_materials'
import { parseUserBadges } from '@/services/gamification'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Unlock, Loader2 } from 'lucide-react'
import { Timeline } from '@/components/patient/Timeline'
import { CurrentTaskCard } from '@/components/patient/CurrentTaskCard'
import { BadgesGallery } from '@/components/patient/BadgesGallery'
import { useUnlocks } from '@/hooks/use-unlocks'
import { getCurrentWeek, getProgress, getProgramWeek } from '@/lib/patient-utils'
import type { Questionnaire } from '@/services/questionnaires'
import type { EducationalMaterial } from '@/services/educational_materials'

export default function PatientHome() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([])
  const [materials, setMaterials] = useState<EducationalMaterial[]>([])
  const [loading, setLoading] = useState(true)
  const { unlockedWeeks } = useUnlocks(user?.id)

  const loadData = useCallback(async () => {
    if (!user?.id) return
    try {
      const [qs, mats] = await Promise.all([getQuestionnaires(user.id), getEducationalMaterials()])
      setQuestionnaires(qs)
      setMaterials(mats)
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
  useRealtime('educational_materials', () => {
    loadData()
  })

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const userBadges = parseUserBadges(user?.badges)
  const points = user?.points ?? 0
  const currentWeek = getCurrentWeek(questionnaires)
  const progress = getProgress(questionnaires)
  const completedWeeks = questionnaires.map((q) => q.week_number)
  const programWeek = getProgramWeek(questionnaires)

  const hasQuestionnairePending = !completedWeeks.includes(currentWeek)
  const nextUnreadMaterial = materials.find(
    (m) =>
      (m.week_number <= programWeek || unlockedWeeks.includes(m.week_number)) &&
      !userBadges.readMaterials.includes(m.id),
  )
  const hasMaterialToRead = !hasQuestionnairePending && !!nextUnreadMaterial

  const handleAction = () => {
    if (hasQuestionnairePending) {
      navigate(`/patient/questionnaires/${currentWeek}`)
    } else {
      navigate('/patient/library')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <CurrentTaskCard
        weekNumber={currentWeek}
        hasQuestionnairePending={hasQuestionnairePending}
        hasMaterialToRead={hasMaterialToRead}
        points={points}
        onAction={handleAction}
      />

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
        <BadgesGallery earnedBadges={userBadges.earnedBadges} />
      </section>
    </div>
  )
}
