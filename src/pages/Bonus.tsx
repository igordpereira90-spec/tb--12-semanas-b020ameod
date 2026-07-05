import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PlayCircle, Moon, Brain } from 'lucide-react'

const sleepHygieneRecommendations = [
  'Manter um ritmo sono-vigília regular (horários consistentes para dormir e acordar).',
  'Crie no seu quarto um ambiente que induz ao sono (conforto, luz, ruído e temperatura adequados).',
  'Diminuição de estímulos por parte de dispositivos eletrônicos (limitar telas emissoras de luz 1h antes de dormir).',
  'Desenvolver atividades relaxantes antes de dormir (relaxamento, meditação, música calma).',
  'Evitar o uso de substâncias estimulantes (evitar cafeína/nicotina após as 14h).',
  'Evitar a ingestão de bebidas alcoólicas (o álcool altera as fases do sono).',
  'Manter a prática de atividade física regular (evitar atividade intensa 3h antes de dormir).',
  'Evitar refeições muito pesadas antes de dormir (refeições leves e ingestão controlada de líquidos).',
  'Evitar resolver problemas antes de ir para a cama (deixar as preocupações do dia fora da hora de dormir).',
  'Evitar cochilar durante o dia (garantir cansaço para o período noturno).',
]

const stimulusControlRecommendations = [
  'Ir para a cama apenas quando estiver sonolento.',
  'Utilizar a cama apenas para dormir, para atividade sexual ou para recuperar-se de alguma enfermidade.',
  'Caso não esteja sonolento ou não adormeça em até 20 minutos, sair da cama e retornar apenas quando se sentir sonolento.',
  'Acordar e levantar-se todos os dias no mesmo horário; não cochilar durante o dia.',
]

export default function Bonus() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">🎁 Bônus</h1>
        <p className="text-slate-600">
          Recursos complementares para apoiar o seu tratamento e bem-estar.
        </p>
      </div>

      <Card className="overflow-hidden border-slate-100 shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-rose-50">
              <PlayCircle className="w-6 h-6 text-rose-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Respiração Diafragmática</h2>
              <p className="text-sm text-slate-500">
                Técnica de relaxamento para reduzir ansiedade e melhorar o bem-estar.
              </p>
            </div>
          </div>
          <div
            className="relative w-full overflow-hidden rounded-xl bg-black shadow-md"
            style={{ aspectRatio: '16 / 9' }}
          >
            <iframe
              className="absolute inset-0 w-full h-full"
              src="https://www.youtube.com/embed/Px54tGh4Ub8"
              title="Respiração Diafragmática"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      </Card>

      <Card className="border-slate-100 shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-50">
              <Moon className="w-6 h-6 text-indigo-500" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 text-center w-full">
              TÉCNICAS PARA UMA BOA QUALIDADE DO SONO
            </h2>
          </div>

          <div className="space-y-8">
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100">Seção 1</Badge>
                <h3 className="text-base font-bold text-slate-700">HIGIENE DO SONO</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                A Higiene do Sono refere-se a um conjunto de medidas comportamentais e ambientais
                que visam promover a qualidade do sono. Estas recomendações ajudam a estabelecer
                hábitos saudáveis que facilitam o adormecer e a manutenção do sono ao longo da
                noite.
              </p>
              <ol className="space-y-3">
                {sleepHygieneRecommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-sm text-slate-600 leading-relaxed">{rec}</span>
                  </li>
                ))}
              </ol>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-purple-50 text-purple-700 hover:bg-purple-100">Seção 2</Badge>
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-500" />
                  <h3 className="text-base font-bold text-slate-700">CONTROLE DE ESTÍMULOS</h3>
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                O Controle de Estímulos trata da associação entre o quarto/cama e a dificuldade para
                dormir (insônia). Quando a pessoa passa muito tempo acordada na cama, o cérebro
                passa a associar o ambiente com frustração e vigília em vez de relaxamento e sono.
                Estas técnicas visam reverter essa associação.
              </p>
              <ol className="space-y-3">
                {stimulusControlRecommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-purple-50 text-purple-600 text-xs font-bold mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-sm text-slate-600 leading-relaxed">{rec}</span>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </div>
      </Card>
    </div>
  )
}
