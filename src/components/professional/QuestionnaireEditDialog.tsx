import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { QuestionnaireForm } from '@/components/patient/QuestionnaireForm'
import type { Questionnaire } from '@/services/questionnaires'

interface Props {
  questionnaire: Questionnaire | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Record<string, unknown>) => Promise<void>
}

export function QuestionnaireEditDialog({ questionnaire, open, onOpenChange, onSubmit }: Props) {
  if (!questionnaire) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Editar Questionário — Semana {questionnaire.week_number}
          </DialogTitle>
        </DialogHeader>
        <QuestionnaireForm
          week={questionnaire.week_number}
          onSubmit={onSubmit}
          initialData={questionnaire as Record<string, unknown>}
          submitLabel="Salvar Alterações"
          isEditing
        />
      </DialogContent>
    </Dialog>
  )
}
