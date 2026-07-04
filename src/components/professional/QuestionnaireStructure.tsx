import { Card } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { SLIDER_FIELDS, FREQUENCY_FIELDS } from '@/lib/questionnaire-config'

export function QuestionnaireStructure() {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="structure" className="border-slate-200">
        <AccordionTrigger className="text-lg font-bold text-slate-800">
          Estrutura do Questionário
        </AccordionTrigger>
        <AccordionContent>
          <Card className="p-6 md:p-8">
            <div className="space-y-8">
              <div>
                <h2 className="text-base font-bold text-slate-800 border-b pb-2 mb-4">
                  Campos Numéricos (0-10)
                </h2>
                <ul className="space-y-3">
                  {SLIDER_FIELDS.map((f) => (
                    <li
                      key={f.name}
                      className="flex flex-col bg-slate-50 p-3 rounded-lg border border-slate-100"
                    >
                      <span className="font-semibold text-slate-700">{f.label}</span>
                      <span className="text-sm text-slate-500">{f.hint}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800 border-b pb-2 mb-4">
                  Campos de Frequência
                </h2>
                <ul className="space-y-3">
                  {FREQUENCY_FIELDS.map((f) => (
                    <li
                      key={f.name}
                      className="flex flex-col bg-slate-50 p-3 rounded-lg border border-slate-100"
                    >
                      <span className="font-semibold text-slate-700">{f.label}</span>
                      <span className="text-sm text-slate-500">
                        Opções: Nunca, Só um pouco, Bastante, Demais
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
