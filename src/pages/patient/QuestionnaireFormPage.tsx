import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { createQuestionnaire } from '@/services/questionnaires'
import { QuestionnaireForm } from '@/components/patient/QuestionnaireForm'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ClipboardList } from 'lucide-react'
import type { Questionnaire } from '@/services/questionnaires'

export default function QuestionnaireFormPage() {
  const { week } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const weekNumber = Number(week) || 0

  const handleSubmit = async (data: Record<string, unknown>) => {
    if (!user?.id) return
    try {
      await createQuestionnaire({ ...data, patient: user.id } as Partial<Questionnaire>)
      toast({ title: 'Sucesso!', description: 'Questionário salvo com sucesso.', duration: 3000 })
      navigate('/patient')
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível salvar o questionário.' })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/patient/questionnaires')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Questionário — Semana {weekNumber}
            </h1>
            <p className="text-slate-600 text-sm">
              Responda com sinceridade. Suas respostas ajudam no seu tratamento.
            </p>
          </div>
        </div>
      </div>
      <QuestionnaireForm week={weekNumber} onSubmit={handleSubmit} />
    </div>
  )
}
