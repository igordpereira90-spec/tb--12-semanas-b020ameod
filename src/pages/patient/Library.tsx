import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useUnlocks } from '@/hooks/use-unlocks'
import { useToast } from '@/hooks/use-toast'
import { getEducationalMaterials } from '@/services/educational_materials'
import { parseUserBadges, recordMaterialRead, refreshAuthUser } from '@/services/gamification'
import { MAX_XP } from '@/lib/scoring'
import type { EducationalMaterial } from '@/services/educational_materials'
import { getQuestionnaires } from '@/services/questionnaires'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Star, CheckCircle2 } from 'lucide-react'

export default function PatientLibrary() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [materials, setMaterials] = useState<EducationalMaterial[]>([])
  const [programWeek, setProgramWeek] = useState(0)
  const [reading, setReading] = useState<EducationalMaterial | null>(null)
  const [readMaterials, setReadMaterials] = useState<string[]>([])
  const { unlockedWeeks } = useUnlocks(user?.id)

  useEffect(() => {
    async function load() {
      if (!user?.id) return
      const [mats, qs] = await Promise.all([getEducationalMaterials(), getQuestionnaires(user.id)])
      let pWeek = 0
      if (qs.length > 0) {
        const sorted = [...qs].sort((a, b) => a.week_number - b.week_number)
        const start = new Date(sorted[0].created).getTime()
        const diff = Math.floor((Date.now() - start) / (1000 * 60 * 60 * 24 * 7))
        pWeek = Math.max(0, diff)
      }
      setProgramWeek(pWeek)
      setMaterials(mats)
    }
    load()
  }, [user?.id])

  useEffect(() => {
    const badges = parseUserBadges(user?.badges)
    setReadMaterials(badges.readMaterials)
  }, [user?.badges])

  const visibleMaterials = materials.filter(
    (m) => m.week_number <= programWeek || unlockedWeeks.includes(m.week_number),
  )

  const handleOpenMaterial = async (material: EducationalMaterial) => {
    setReading(material)
    if (readMaterials.indexOf(material.id) === -1) {
      setReadMaterials((prev) => [...prev, material.id])
      try {
        await recordMaterialRead(material.id)
        await refreshAuthUser()
        toast({ title: '+5 pontos!', description: 'Material lido — parabéns!', duration: 3000 })
      } catch {
        /* silently ignore */
      }
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Material Educativo</h1>
          <p className="text-slate-600">A psicoeducação é parte fundamental do seu tratamento.</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full">
          <Star className="w-4 h-4" />
          <span className="text-sm font-bold">
            {user?.points ?? 0} / {MAX_XP} XP
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleMaterials.map((item) => {
          const isRead = readMaterials.includes(item.id)
          return (
            <Card
              key={item.id}
              className="overflow-hidden border-slate-100 hover:shadow-lg transition-all group flex flex-col p-6 cursor-pointer relative"
              onClick={() => handleOpenMaterial(item)}
            >
              {isRead && (
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-amber-500" />
                </div>
              )}
              <Badge className="w-fit mb-4 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors">
                Semana {item.week_number}
              </Badge>
              <h3 className="font-semibold text-lg text-slate-800 mb-2 line-clamp-2">
                {item.title}
              </h3>
              <p className="text-sm text-slate-500 line-clamp-3">{item.objective}</p>
              {isRead && (
                <p className="text-xs text-amber-600 font-medium mt-3 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> Material lido
                </p>
              )}
            </Card>
          )
        })}
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
                className="prose prose-slate max-w-none text-sm md:text-base prose-headings:text-amber-900 prose-headings:font-bold prose-h3:text-lg prose-p:leading-relaxed prose-li:leading-relaxed prose-a:text-amber-600 pb-8"
                dangerouslySetInnerHTML={{ __html: reading.content }}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
