import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ImageIcon, Loader2, Sparkles, Users, Leaf, Palette } from 'lucide-react'
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

const NATURE_AVATARS = [
  'https://img.usecurling.com/p/300/300?q=mountain%20landscape',
  'https://img.usecurling.com/p/300/300?q=ocean%20sunset',
  'https://img.usecurling.com/p/300/300?q=forest%20trees',
  'https://img.usecurling.com/p/300/300?q=desert%20dunes',
  'https://img.usecurling.com/p/300/300?q=waterfall%20nature',
  'https://img.usecurling.com/p/300/300?q=flowers%20garden',
  'https://img.usecurling.com/p/300/300?q=autumn%20leaves',
  'https://img.usecurling.com/p/300/300?q=snow%20mountain%20peak',
]

const MINIMALIST_AVATARS = [
  'https://img.usecurling.com/p/300/300?q=minimalist%20avatar',
  'https://img.usecurling.com/p/300/300?q=geometric%20pattern',
  'https://img.usecurling.com/p/300/300?q=abstract%20art%20minimal',
  'https://img.usecurling.com/p/300/300?q=gradient%20abstract',
  'https://img.usecurling.com/p/300/300?q=minimalist%20illustration',
  'https://img.usecurling.com/p/300/300?q=abstract%20shapes%20colorful',
  'https://img.usecurling.com/p/300/300?q=modern%20abstract%20design',
  'https://img.usecurling.com/p/300/300?q=flat%20design%20pattern',
]

type AvatarTab = 'people' | 'anime' | 'nature' | 'minimalist'

const TAB_CONFIG: Record<
  AvatarTab,
  {
    label: string
    icon: typeof Users
    activeClass: string
    avatars: string[]
    ringHover: string
    description: string
  }
> = {
  people: {
    label: 'Profissional',
    icon: Users,
    activeClass: 'bg-primary text-white shadow-md',
    avatars: PEOPLE_AVATARS,
    ringHover: 'hover:ring-amber-400',
    description: 'Retratos profissionais para seu perfil',
  },
  anime: {
    label: 'Anime Style',
    icon: Sparkles,
    activeClass: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md',
    avatars: ANIME_AVATARS,
    ringHover: 'hover:ring-purple-400',
    description: 'Avatares estilo anime para um toque criativo',
  },
  nature: {
    label: 'Natureza',
    icon: Leaf,
    activeClass: 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-md',
    avatars: NATURE_AVATARS,
    ringHover: 'hover:ring-green-400',
    description: 'Paisagens naturais como foto de perfil',
  },
  minimalist: {
    label: 'Minimalista',
    icon: Palette,
    activeClass: 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md',
    avatars: MINIMALIST_AVATARS,
    ringHover: 'hover:ring-indigo-400',
    description: 'Padrões abstratos e minimalistas',
  },
}

interface StockAvatarPickerProps {
  onSelect: (file: File, previewUrl: string) => void
}

export function StockAvatarPicker({ onSelect }: StockAvatarPickerProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<AvatarTab>('people')
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null)

  const handleSelect = async (url: string) => {
    setLoading(url)
    setSelectedUrl(url)
    try {
      const res = await fetch(url)
      const blob = await res.blob()
      const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })
      onSelect(file, url)
      setOpen(false)
    } catch {
      setLoading(null)
      setSelectedUrl(null)
    } finally {
      setLoading(null)
    }
  }

  const config = TAB_CONFIG[activeTab]
  const tabs = Object.entries(TAB_CONFIG) as [AvatarTab, (typeof TAB_CONFIG)[AvatarTab]][]
  const TabIcon = config.icon

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
        <div className="flex flex-wrap gap-2 pt-2">
          {tabs.map(([tabKey, tabConfig]) => {
            const Icon = tabConfig.icon
            return (
              <button
                key={tabKey}
                onClick={() => setActiveTab(tabKey)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  activeTab === tabKey
                    ? tabConfig.activeClass
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                )}
              >
                <Icon className="w-4 h-4" /> {tabConfig.label}
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-2 pt-2 text-xs text-slate-500">
          <TabIcon className="w-3.5 h-3.5" />
          <span>{config.description}</span>
        </div>
        <ScrollArea className="h-[320px] w-full pr-4">
          <div className="grid grid-cols-4 gap-3 pt-3 pb-2">
            {config.avatars.map((url) => (
              <button
                key={url}
                onClick={() => handleSelect(url)}
                disabled={loading !== null}
                className={cn(
                  'rounded-full overflow-hidden ring-2 ring-slate-200 transition-all duration-200 aspect-square',
                  config.ringHover,
                  'hover:scale-105',
                  selectedUrl === url && 'ring-4 ring-purple-500 scale-105',
                  loading === url && 'opacity-50',
                  loading !== null && loading !== url && 'opacity-60',
                )}
              >
                {loading === url ? (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100">
                    <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                  </div>
                ) : (
                  <img
                    src={url}
                    alt="Avatar option"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
