import { useState } from 'react'
import { PATIENT_MOCK } from '@/lib/mock'
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
import { CheckCircle2, Lock, Clock, PartyPopper } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function PatientQuestionnaires() {
  const [data, setData] = useState(PATIENT_MOCK.questionnaires)
  const [showReward, setShowReward] = useState(false)
  const { toast } = useToast()

  const handleFill = (week: number) => {
    // Mock completion
    setTimeout(() => {
      setData((prev) =>
        prev.map((q) =>
          q.week === week
            ? { ...q, status: 'completed', date: new Date().toLocaleDateString('pt-BR') }
            : q,
        ),
      )
      setShowReward(true)
      toast({
        title: 'Sucesso!',
        description: 'Questionário salvo com sucesso.',
        duration: 3000,
      })
    }, 800)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Acompanhamento</h1>
        <p className="text-slate-600">
          Preencha seus questionários quinzenais para acompanharmos sua evolução.
        </p>
      </div>

      <div className="grid gap-4">
        {data.map((q) => (
          <Card
            key={q.week}
            className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:shadow-md border-slate-100"
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                  q.status === 'completed'
                    ? 'bg-emerald-100 text-emerald-600'
                    : q.status === 'pending'
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-slate-100 text-slate-400'
                }`}
              >
                {q.status === 'completed' ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : q.status === 'pending' ? (
                  <Clock className="w-6 h-6 animate-pulse" />
                ) : (
                  <Lock className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-lg text-slate-800">
                  Semana {q.week} {q.week === 0 && '(Início)'}
                </h3>
                {q.date && <p className="text-sm text-slate-500">Preenchido em: {q.date}</p>}
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              {q.status === 'completed' && (
                <Badge
                  variant="outline"
                  className="bg-emerald-50 text-emerald-700 border-emerald-200 py-1"
                >
                  Concluído
                </Badge>
              )}
              {q.status === 'pending' && (
                <Badge
                  variant="outline"
                  className="bg-amber-50 text-amber-700 border-amber-200 py-1 animate-pulse"
                >
                  Pendente
                </Badge>
              )}
              {q.status === 'locked' && (
                <Badge
                  variant="outline"
                  className="bg-slate-50 text-slate-500 border-slate-200 py-1"
                >
                  Aguardando
                </Badge>
              )}

              {q.status === 'pending' && (
                <Button
                  onClick={() => handleFill(q.week)}
                  className="ml-auto md:ml-4 bg-primary hover:bg-primary/90"
                >
                  Preencher Agora
                </Button>
              )}
              {q.status === 'completed' && (
                <Button variant="ghost" className="ml-auto md:ml-4 text-primary">
                  Ver Resumo
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={showReward} onOpenChange={setShowReward}>
        <DialogContent className="sm:max-w-md text-center p-8">
          <DialogHeader>
            <div className="mx-auto w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
              <PartyPopper className="w-10 h-10 text-amber-500" />
            </div>
            <DialogTitle className="text-2xl mb-2">Excelente trabalho!</DialogTitle>
            <DialogDescription className="text-base">
              Você completou o questionário. Sua constância nos ajuda a entender melhor sua evolução
              e ajustar o que for preciso.
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
