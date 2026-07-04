import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useUnlocks } from '@/hooks/use-unlocks'
import { getEducationalMaterials } from '@/services/educational_materials'
import type { EducationalMaterial } from '@/services/educational_materials'
import { getQuestionnaires } from '@/services/questionnaires'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function PatientLibrary() {
  const { user } = useAuth()
  const [materials, setMaterials] = useState<EducationalMaterial[]>([])
  const [programWeek, setProgramWeek] = useState(0)
  const [reading, setReading] = useState<EducationalMaterial | null>(null)
  const { unlockedWeeks } = useUnlocks(user?.id)

  useEffect(() => {
    async function load() {
      if (!user?.id) return
      const [mats, qs] = await Promise.all([getEducationalMaterials(), getQuestionnaires(user.id)])

      let pWeek = 0
      if (qs.length > 0) {
        const start = new Date(qs[0].created).getTime()
        const diff = Math.floor((new Date().getTime() - start) / (1000 * 60 * 60 * 24 * 7))
        pWeek = Math.max(0, diff)
      }
      setProgramWeek(pWeek)
      setMaterials(mats)
    }
    load()
  }, [user?.id])

  const visibleMaterials = materials.filter(
    (m) => m.week_number <= programWeek || unlockedWeeks.includes(m.week_number),
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Material Educativo</h1>
        <p className="text-slate-600">A psicoeducação é parte fundamental do seu tratamento.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleMaterials.map((item) => (
          <Card
            key={item.id}
            className="overflow-hidden border-slate-100 hover:shadow-lg transition-all group flex flex-col p-6 cursor-pointer"
            onClick={() => setReading(item)}
          >
            <Badge className="w-fit mb-4 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors">
              Semana {item.week_number}
            </Badge>
            <h3 className="font-semibold text-lg text-slate-800 mb-2 line-clamp-2">{item.title}</h3>
            <p className="text-sm text-slate-500 line-clamp-3">{item.objective}</p>
          </Card>
        ))}
        {visibleMaterials.length === 0 && (
          <div className="col-span-full py-8 text-center text-slate-500">
            Nenhum material disponível no momento. Preencha seu primeiro questionário para liberar o
            conteúdo.
          </div>
        )}
      </div>

      <Dialog open={!!reading} onOpenChange={(o) => !o && setReading(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {reading && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl md:text-2xl text-slate-800">
                  {reading.title}
                </DialogTitle>
                <p className="text-slate-500 font-medium pt-3 pb-5 border-b">
                  Objetivo: {reading.objective}
                </p>
              </DialogHeader>
              <div
                className="prose prose-slate max-w-none text-sm md:text-base prose-headings:text-indigo-900 prose-headings:font-bold prose-h3:text-lg prose-p:leading-relaxed prose-li:leading-relaxed prose-a:text-indigo-600 pb-8"
                dangerouslySetInnerHTML={{ __html: reading.content }}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
