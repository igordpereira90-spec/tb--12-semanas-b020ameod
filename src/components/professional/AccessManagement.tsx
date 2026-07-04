import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Lock, Unlock, Loader2 } from 'lucide-react'
import { getUnlockedWeeks, unlockWeek, lockWeek } from '@/services/patient_unlocks'
import { useToast } from '@/hooks/use-toast'

const PROGRAM_WEEKS = Array.from({ length: 13 }, (_, i) => i)

interface Props {
  patientId: string
}

export function AccessManagement({ patientId }: Props) {
  const { toast } = useToast()
  const [unlockedWeeks, setUnlockedWeeks] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<number | null>(null)

  const loadUnlocks = useCallback(async () => {
    try {
      const weeks = await getUnlockedWeeks(patientId)
      setUnlockedWeeks(weeks)
    } catch {
      setUnlockedWeeks([])
    } finally {
      setLoading(false)
    }
  }, [patientId])

  useEffect(() => {
    loadUnlocks()
  }, [loadUnlocks])

  const handleToggle = async (week: number) => {
    setToggling(week)
    try {
      if (unlockedWeeks.includes(week)) {
        await lockWeek(patientId, week)
        setUnlockedWeeks((prev) => prev.filter((w) => w !== week))
        toast({ title: 'Conteúdo bloqueado', description: `Semana ${week} bloqueada.` })
      } else {
        await unlockWeek(patientId, week)
        setUnlockedWeeks((prev) => [...prev, week].sort((a, b) => a - b))
        toast({ title: 'Conteúdo liberado', description: `Semana ${week} liberada com sucesso.` })
      }
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o acesso.',
        variant: 'destructive',
      })
    } finally {
      setToggling(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {PROGRAM_WEEKS.map((week) => {
        const isUnlocked = unlockedWeeks.includes(week)
        return (
          <div
            key={week}
            className={`flex flex-col gap-2 p-3 rounded-lg border transition-colors ${
              isUnlocked ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isUnlocked ? (
                  <Unlock className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Lock className="w-4 h-4 text-slate-400" />
                )}
                <span className="text-sm font-medium text-slate-700">Semana {week}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Badge
                className={
                  isUnlocked
                    ? 'bg-emerald-100 text-emerald-700 border-none text-xs'
                    : 'bg-slate-200 text-slate-500 border-none text-xs'
                }
              >
                {isUnlocked ? 'Liberado' : 'Bloqueado'}
              </Badge>
              <Button
                size="sm"
                variant={isUnlocked ? 'outline' : 'default'}
                disabled={toggling === week}
                onClick={() => handleToggle(week)}
                className="h-7 px-3 text-xs"
              >
                {toggling === week ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : isUnlocked ? (
                  'Bloquear'
                ) : (
                  'Liberar'
                )}
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
