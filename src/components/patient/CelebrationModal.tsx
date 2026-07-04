import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Award, Sparkles } from 'lucide-react'

interface CelebrationModalProps {
  open: boolean
  onClose: () => void
  title?: string
  message?: string
  points?: number
}

const MESSAGES = [
  'Parabéns! Você está cuidando da sua saúde!',
  'Incrível! Continue assim!',
  'Você está investindo no seu bem-estar!',
  'Mais um passo rumo ao equilíbrio!',
  'Excelente! Sua constância faz a diferença!',
]

export function CelebrationModal({
  open,
  onClose,
  title = 'Muito bem!',
  message,
  points,
}: CelebrationModalProps) {
  const displayMessage = message || MESSAGES[Math.floor(Math.random() * MESSAGES.length)]
  const confettiPieces = Array.from({ length: 14 }, (_, i) => ({
    left: `${(i / 14) * 100}%`,
    delay: `${(i % 5) * 0.15}s`,
    color: ['#fbbf24', '#f59e0b', '#fcd34d', '#fde68a', '#d97706'][i % 5],
  }))

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm border-amber-200 bg-gradient-to-b from-white to-amber-50/50 p-8 text-center overflow-hidden">
        <div className="celebration-confetti">
          {confettiPieces.map((p, i) => (
            <span
              key={i}
              style={{ left: p.left, animationDelay: p.delay, backgroundColor: p.color }}
            />
          ))}
        </div>
        <div className="relative z-10 space-y-4">
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30 animate-bounce">
            <Award className="w-10 h-10 text-white drop-shadow" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
            <p className="text-slate-600 mt-2 flex items-center justify-center gap-1">
              <Sparkles className="w-4 h-4 text-amber-500" />
              {displayMessage}
            </p>
          </div>
          {points !== undefined && points > 0 && (
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full font-semibold">
              <Sparkles className="w-4 h-4" />+{points} pontos
            </div>
          )}
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
          >
            Continuar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
