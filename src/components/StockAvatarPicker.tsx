import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ImageIcon, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const STOCK_AVATARS = [
  'https://img.usecurling.com/ppl/large?gender=male&seed=201',
  'https://img.usecurling.com/ppl/large?gender=female&seed=202',
  'https://img.usecurling.com/ppl/large?gender=male&seed=203',
  'https://img.usecurling.com/ppl/large?gender=female&seed=204',
  'https://img.usecurling.com/ppl/large?gender=male&seed=205',
  'https://img.usecurling.com/ppl/large?gender=female&seed=206',
  'https://img.usecurling.com/ppl/large?gender=male&seed=207',
  'https://img.usecurling.com/ppl/large?gender=female&seed=208',
]

interface StockAvatarPickerProps {
  onSelect: (file: File, previewUrl: string) => void
}

export function StockAvatarPicker({ onSelect }: StockAvatarPickerProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)

  const handleSelect = async (url: string) => {
    setLoading(url)
    try {
      const res = await fetch(url)
      const blob = await res.blob()
      const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })
      onSelect(file, url)
      setOpen(false)
    } catch {
      setLoading(null)
    } finally {
      setLoading(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-amber-200 text-amber-700 hover:bg-amber-50"
        >
          <ImageIcon className="w-4 h-4 mr-2" /> Usar imagem padrão
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Escolha uma imagem</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-3 pt-2">
          {STOCK_AVATARS.map((url) => (
            <button
              key={url}
              onClick={() => handleSelect(url)}
              disabled={loading !== null}
              className={cn(
                'rounded-full overflow-hidden ring-2 ring-slate-200 hover:ring-amber-400 transition-all aspect-square',
                loading === url && 'opacity-50',
              )}
            >
              {loading === url ? (
                <div className="w-full h-full flex items-center justify-center bg-slate-100">
                  <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                </div>
              ) : (
                <img src={url} alt="Opção de avatar" className="w-full h-full object-cover" />
              )}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
