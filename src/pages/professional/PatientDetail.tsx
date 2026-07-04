import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PRO_MOCK } from '@/lib/mock'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ArrowLeft, AlertTriangle, TrendingUp, Save } from 'lucide-react'
import { PatientChart } from '@/components/professional/PatientChart'
import { useToast } from '@/hooks/use-toast'

export default function PatientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [notes, setNotes] = useState('')

  const patient = PRO_MOCK.patients.find((p) => p.id === id) || PRO_MOCK.patients[0]

  const handleSave = () => {
    toast({
      title: 'Notas salvas',
      description: 'As observações clínicas foram atualizadas com sucesso.',
    })
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-800">{patient.name}</h1>
            {patient.status === 'attention' && (
              <Badge variant="destructive" className="animate-pulse">
                Atenção Requerida
              </Badge>
            )}
          </div>
          <p className="text-slate-500">
            Semana atual: {patient.week} de 12 • Última atividade: {patient.lastActive}
          </p>
        </div>
      </div>

      {patient.status === 'attention' && (
        <Alert variant="destructive" className="bg-rose-50 border-rose-200 text-rose-900">
          <AlertTriangle className="h-5 w-5 !text-rose-600" />
          <AlertTitle className="text-rose-800 font-semibold">Alerta Clínico - Semana 4</AlertTitle>
          <AlertDescription className="text-rose-700 mt-1">
            Paciente reportou piora significativa na qualidade do sono (score: 4) e aumento da
            irritabilidade (score: 7). Risco moderado de virada maníaca.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 p-6">
          <h2 className="text-lg font-semibold mb-6 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-primary" /> Evolução Clínica (Scores 0-10)
          </h2>
          <PatientChart />
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-slate-800">
              Comparativo S0 vs Atual (S4)
            </h2>
            <div className="space-y-4">
              {[
                { label: 'Humor', s0: 4, s4: 5, status: 'up' },
                { label: 'Sono', s0: 3, s4: 4, status: 'up' },
                { label: 'Energia', s0: 5, s4: 8, status: 'attention' },
                { label: 'Irritabilidade', s0: 8, s4: 7, status: 'down' },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className="flex justify-between items-center border-b border-slate-100 pb-2 last:border-0 last:pb-0"
                >
                  <span className="text-sm font-medium text-slate-600">{metric.label}</span>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-slate-400">{metric.s0}</span>
                    <ArrowLeft className="w-3 h-3 text-slate-300 rotate-180" />
                    <span
                      className={`font-bold ${metric.status === 'attention' ? 'text-amber-500' : 'text-slate-800'}`}
                    >
                      {metric.s4}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-slate-50 rounded-lg text-sm text-slate-700 leading-relaxed border border-slate-100">
              <strong className="block mb-1 text-slate-900">Insight Automático:</strong>
              Paciente apresenta melhora sutil em sono e humor, porém o salto abrupto de energia (5
              para 8) requer monitoramento de sinais hipomaníacos.
            </div>
          </Card>
        </div>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 text-slate-800">Notas Profissionais (Privado)</h2>
        <Textarea
          placeholder="Registre aqui suas observações clínicas para a consulta da Semana 6..."
          className="min-h-[150px] mb-4 bg-slate-50/50"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <div className="flex justify-end">
          <Button onClick={handleSave} className="bg-slate-800 hover:bg-slate-900">
            <Save className="w-4 h-4 mr-2" /> Salvar Notas
          </Button>
        </div>
      </Card>
    </div>
  )
}
