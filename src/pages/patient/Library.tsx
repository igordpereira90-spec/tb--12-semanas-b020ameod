import { useState } from 'react'
import { LIBRARY_MOCK } from '@/lib/mock'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { BookOpen, Info } from 'lucide-react'

export default function PatientLibrary() {
  const [library, setLibrary] = useState(LIBRARY_MOCK)

  const toggleRead = (id: number) => {
    setLibrary((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: !item.read } : item)),
    )
  }

  const readCount = library.filter((i) => i.read).length

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Biblioteca de Apoio</h1>
          <p className="text-slate-600">A psicoeducação é parte fundamental do seu tratamento.</p>
        </div>
        <Badge
          variant="secondary"
          className="w-fit text-sm py-1.5 px-3 bg-indigo-50 text-indigo-700"
        >
          <BookOpen className="w-4 h-4 mr-2" /> {readCount} de {library.length} lidos
        </Badge>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          Leia os materiais sugeridos para desbloquear a medalha de <strong>Autocuidado</strong>.
          Entender o seu diagnóstico ajuda a prevenir crises.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {library.map((item) => (
          <Card
            key={item.id}
            className="overflow-hidden border-slate-100 hover:shadow-lg transition-all group flex flex-col"
          >
            <div className="h-40 overflow-hidden relative">
              <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors z-10" />
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              <Badge className="absolute top-3 right-3 z-20 bg-white/90 text-slate-800 hover:bg-white backdrop-blur-sm shadow-sm">
                {item.category}
              </Badge>
            </div>
            <div className="p-5 flex flex-col flex-1">
              <h3 className="font-semibold text-lg text-slate-800 mb-4 line-clamp-2 leading-tight">
                {item.title}
              </h3>
              <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-600 hover:text-primary transition-colors">
                  <Checkbox
                    checked={item.read}
                    onCheckedChange={() => toggleRead(item.id)}
                    className={
                      item.read
                        ? 'data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500'
                        : ''
                    }
                  />
                  {item.read ? 'Marcado como lido' : 'Marcar como lido'}
                </label>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
