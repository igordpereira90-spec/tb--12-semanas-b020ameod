import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ImageIcon, Loader2, Sparkles, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const PEOPLE_AVATARS = [
  'https://img.usecurling.com/ppl/large?gender=male&seed=201',
  'https://img.usecurling.com/ppl/large?gender=female&seed=202',
  'https://img.usecurling.com/ppl/large?gender=male&seed=203',
  'https://img.usecurling.com/ppl/large?gender=female&seed=204',
  'https://img.usecurling.com/ppl/large?gender=male&seed=205',
  'https://img.usecurling.com/ppl/large?gender=female&seed=206',
  'https://img.usecurling.com/ppl/large?gender=male&seed=207',
  'https://img.usecurling.com/ppl/large?gender=female&seed=208',
]

const ANIME_AVATARS = [
  'https://img.usecurling.com/p/300/300?q=anime%20portrait',
  'https://img.usecurling.com/p/300/300?q=anime%20character%20avatar',
  'https://img.usecurling.com/p/300/300?q=anime%20illustration',
  'https://img.usecurling.com/p/300/300?q=anime%20girl%20portrait',
  'https://img.usecurling.com/p/300/300?q=anime%20boy%20portrait',
  'https://img.usecurling.com/p/300/300?q=anime%20hero%20character',
  'https://img.usecurling.com/p/300/300?q=anime%20warrior%20portrait',
  'https://img.usecurling.com/p/300/300?q=anime%20fantasy%20character',
]

type AvatarTab = 'people' | 'anime'

interface StockAvatarPickerProps {
  onSelect: (file: File, previewUrl: string) => void
}

export function StockAvatarPicker({ onSelect }: StockAvatarPickerProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<AvatarTab>('people')

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

  const avatars = activeTab === 'anime' ? ANIME_AVATARS : PEOPLE_AVATARS

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
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => setActiveTab('people')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === 'people'
                ? 'bg-primary text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
            )}
          >
            <Users className="w-4 h-4" /> People
          </button>
          <button
            onClick={() => setActiveTab('anime')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === 'anime'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
            )}
          >
            <Sparkles className="w-4 h-4" /> Anime Style
          </button>
        </div>
        <div className="grid grid-cols-4 gap-3 pt-3">
          {avatars.map((url) => (
            <button
              key={url}
              onClick={() => handleSelect(url)}
              disabled={loading !== null}
              className={cn(
                'rounded-full overflow-hidden ring-2 ring-slate-200 hover:ring-amber-400 transition-all aspect-square',
                loading === url && 'opacity-50',
                activeTab === 'anime' && 'hover:ring-purple-400',
              )}
            >
              {loading === url ? (
                <div className="w-full h-full flex items-center justify-center bg-slate-100">
                  <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                </div>
              ) : (
                <img src={url} alt="Avatar option" className="w-full h-full object-cover" />
              )}
            </button>
          ))}
        </div>
        {activeTab === 'anime' && (
          <p className="text-xs text-slate-400 text-center pt-1">
            Choose Anime Avatar — browse and select your favorite anime style
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
