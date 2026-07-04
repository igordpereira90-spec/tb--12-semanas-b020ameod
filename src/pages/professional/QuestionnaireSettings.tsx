import { Card } from '@/components/ui/card'
import { SLIDER_FIELDS, FREQUENCY_FIELDS } from '@/lib/questionnaire-config'

export default function ProQuestionnaireSettings() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Estrutura do Questionário</h1>
        <p className="text-slate-600">
          Visualização de todos os campos avaliados pelos pacientes quinzenalmente.
        </p>
      </div>

      <Card className="p-6 md:p-8">
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">
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
            <h2 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">
              Áreas de Melhora (Múltipla escolha)
            </h2>
            <ul className="space-y-3">
              <li className="flex flex-col bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-700">
                  Em quais áreas você teve melhora essa semana?
                </span>
                <span className="text-sm text-slate-500">
                  Humor, Energia/disposição, Sono, Ansiedade, Outro
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">
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

          <div>
            <h2 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">
              Campos Adicionais
            </h2>
            <ul className="space-y-3">
              <li className="flex flex-col bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-700">
                  Tem apresentado alteração do apetite ou do peso?
                </span>
                <span className="text-sm text-slate-500">Sem alteração, Aumento, Diminuição</span>
              </li>
              <li className="flex flex-col bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-700">
                  Tem apresentado prejuízo importante do seu funcionamento?
                </span>
                <span className="text-sm text-slate-500">Sem prejuízo, Social, Profissional</span>
              </li>
              <li className="flex flex-col bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-700">
                  Qual evolução específica você teve essa semana?
                </span>
                <span className="text-sm text-slate-500">Texto aberto</span>
              </li>
              <li className="flex flex-col bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-700">
                  O que você espera que melhore nas próximas semanas?
                </span>
                <span className="text-sm text-slate-500">Texto aberto</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}
