import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useRealtime } from '@/hooks/use-realtime'
import { getUser } from '@/services/users'
import { getQuestionnaires } from '@/services/questionnaires'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  ArrowLeft,
  AlertTriangle,
  TrendingUp,
  Save,
  Loader2,
  Activity,
  Table2,
  History,
  Lock,
} from 'lucide-react'
import { PatientChart } from '@/components/professional/PatientChart'
import { LongitudinalTable } from '@/components/professional/LongitudinalTable'
import { QuestionnaireHistory } from '@/components/professional/QuestionnaireHistory'
import { useToast } from '@/hooks/use-toast'
import { getAlerts, generateSummary, getCurrentWeek } from '@/lib/patient-utils'
import type { AppUser } from '@/services/users'
import type { Questionnaire } from '@/services/questionnaires'

export default function PatientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [patient, setPatient] = useState<AppUser | null>(null)
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [editingQ, setEditingQ] = useState<Questionnaire | null>(null)

  const loadData = useCallback(async () => {
    if (!id) return
    try {
      const [p, qs] = await Promise.all([getUser(id), getQuestionnaires(id)])
      setPatient(p)
      setQuestionnaires(qs)
    } catch {
      setPatient(null)
      setQuestionnaires([])
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('questionnaires', () => {
    loadData()
  })

  const handleEditSubmit = async (data: Record<string, unknown>) => {
    if (!editingQ) return
    try {
      await updateQuestionnaire(editingQ.id, data)
      setEditingQ(null)
      toast({ title: 'Sucesso!', description: 'Questionário atualizado com sucesso.' })
      loadData()
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível atualizar o questionário.' })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!patient) {
    return <div className="text-center py-12 text-slate-500">Paciente não encontrado.</div>
  }

  const sorted = [...questionnaires].sort((a, b) => a.week_number - b.week_number)
  const baseline = sorted[0]
  const latest = sorted[sorted.length - 1]
  const alerts = latest ? getAlerts(latest) : { hasAlert: false, reasons: [] }
  const summary = generateSummary(sorted)
  const currentWeek = getCurrentWeek(questionnaires)

  const metrics =
    baseline && latest
      ? [
          { label: 'Humor', base: baseline.mood_score, curr: latest.mood_score },
          { label: 'Sono', base: baseline.sleep_score, curr: latest.sleep_score },
          { label: 'Energia', base: baseline.energy_score, curr: latest.energy_score },
          { label: 'Sensação Geral', base: baseline.overall_feeling, curr: latest.overall_feeling },
        ]
      : []

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-800">{patient.name}</h1>
            {alerts.hasAlert && (
              <Badge variant="destructive" className="animate-pulse">
                Atenção Requerida
              </Badge>
            )}
          </div>
          <p className="text-slate-500">
            Semana atual: {currentWeek} de 12 • {questionnaires.length} questionários preenchidos
          </p>
        </div>
      </div>

      {alerts.hasAlert && (
        <Alert variant="destructive" className="bg-rose-50 border-rose-200 text-rose-900">
          <AlertTriangle className="h-5 w-5 !text-rose-600" />
          <AlertTitle className="text-rose-800 font-semibold">
            Alerta Clínico — Semana {latest.week_number}
          </AlertTitle>
          <AlertDescription className="text-rose-700 mt-1">
            {alerts.reasons.join('. ')}.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 p-6">
          <h2 className="text-lg font-semibold mb-6 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-primary" /> Evolução Clínica (Scores 0-10)
          </h2>
          <PatientChart questionnaires={sorted} />
        </Card>
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-slate-800">Comparativo S0 vs Atual</h2>
          <div className="space-y-3">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="flex justify-between items-center border-b border-slate-100 pb-2 last:border-0 last:pb-0"
              >
                <span className="text-sm font-medium text-slate-600">{m.label}</span>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-slate-400">{m.base}</span>
                  <ArrowLeft className="w-3 h-3 text-slate-300 rotate-180" />
                  <span
                    className={`font-bold ${m.curr > m.base + 2 ? 'text-amber-500' : m.curr >= m.base ? 'text-emerald-600' : 'text-rose-500'}`}
                  >
                    {m.curr}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-slate-50 rounded-lg text-sm text-slate-700 leading-relaxed border border-slate-100">
            <strong className="block mb-1 text-slate-900 flex items-center gap-1">
              <Activity className="w-4 h-4" /> Resumo Automático:
            </strong>
            {summary}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center text-slate-800">
          <Table2 className="w-5 h-5 mr-2 text-primary" /> Comparativo Longitudinal (Semanas 0, 2,
          4, 8, 10)
        </h2>
        <LongitudinalTable questionnaires={sorted} />
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center text-slate-800">
          <History className="w-5 h-5 mr-2 text-primary" /> Histórico de Questionários
        </h2>
        <QuestionnaireHistory questionnaires={sorted} onEdit={(q) => setEditingQ(q)} />
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center text-slate-800">
          <Lock className="w-5 h-5 mr-2 text-primary" /> Gestão de Acesso
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          Libere manualmente semanas para este paciente, independente do progresso atual.
        </p>
        <AccessManagement patientId={patient.id} />
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 text-slate-800">Notas Profissionais (Privado)</h2>
        <Textarea
          placeholder="Registre aqui suas observações clínicas..."
          className="min-h-[150px] mb-4 bg-slate-50/50"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <div className="flex justify-end">
          <Button
            onClick={() =>
              toast({ title: 'Notas salvas', description: 'Observações atualizadas.' })
            }
            className="bg-slate-800 hover:bg-slate-900"
          >
            <Save className="w-4 h-4 mr-2" /> Salvar Notas
          </Button>
        </div>
      </Card>
      <QuestionnaireEditDialog
        questionnaire={editingQ}
        open={!!editingQ}
        onOpenChange={(o) => !o && setEditingQ(null)}
        onSubmit={handleEditSubmit}
      />
    </div>
  )
}
