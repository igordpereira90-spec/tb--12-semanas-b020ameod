import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getAvatarUrl } from '@/lib/avatar'
import { getErrorMessage, extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'
import pb from '@/lib/pocketbase/client'
import { Loader2, Save, Camera, User, Mail, Calendar } from 'lucide-react'
import { parseUserBadges } from '@/services/gamification'

export default function Profile() {
  const { user } = useAuth()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [age, setAge] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setEmail(user.email || '')
      setAge(user.age != null ? String(user.age) : '')
      setAvatarPreview(getAvatarUrl(user))
    }
  }, [user])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione um arquivo de imagem.',
        variant: 'destructive',
      })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Erro',
        description: 'A imagem deve ter no máximo 5MB.',
        variant: 'destructive',
      })
      return
    }
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = () => setAvatarPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const validate = (): boolean => {
    const errors: FieldErrors = {}
    if (!name.trim()) errors.name = 'Nome é obrigatório.'
    if (!email.trim()) errors.email = 'E-mail é obrigatório.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Formato de e-mail inválido.'
    if (age && (isNaN(Number(age)) || Number(age) <= 0 || Number(age) > 150)) {
      errors.age = 'Idade deve ser um número positivo.'
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = async () => {
    if (!user) return
    if (!validate()) return
    setSaving(true)
    setFieldErrors({})
    try {
      const data: Record<string, unknown> = {
        name: name.trim(),
        email: email.trim(),
        age: age ? Number(age) : null,
      }
      if (avatarFile) {
        const formData = new FormData()
        formData.append('name', name.trim())
        formData.append('email', email.trim())
        formData.append('age', age ? String(Number(age)) : '')
        formData.append('avatar', avatarFile)
        await pb.collection('users').update(user.id, formData)
      } else {
        await pb.collection('users').update(user.id, data)
      }
      await pb.collection('users').authRefresh()
      toast({ title: 'Sucesso', description: 'Perfil atualizado com sucesso.' })
      setAvatarFile(null)
    } catch (err) {
      setFieldErrors(extractFieldErrors(err))
      toast({ title: 'Erro', description: getErrorMessage(err), variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const initials = (name || 'US')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Perfil</h1>
        <p className="text-sm text-slate-500 mt-1">Gerencie suas informações pessoais</p>
      </div>

      <Card className="border-amber-100/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-800">Foto de Perfil</CardTitle>
          <CardDescription className="text-slate-500">
            Clique na imagem para selecionar uma nova foto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div
              className="relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Avatar className="w-24 h-24 ring-4 ring-amber-100 ring-offset-2">
                <AvatarImage src={avatarPreview} />
                <AvatarFallback className="text-2xl bg-amber-50 text-amber-700">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="border-amber-200 text-amber-700 hover:bg-amber-50"
              >
                <Camera className="w-4 h-4 mr-2" /> Trocar foto
              </Button>
              {avatarFile && (
                <p className="text-xs text-slate-500">
                  {avatarFile.name} ({(avatarFile.size / 1024).toFixed(0)} KB)
                </p>
              )}
              <p className="text-xs text-slate-400">JPG, PNG. Máximo 5MB.</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-100/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-800">
            Informações Pessoais
          </CardTitle>
          <CardDescription className="text-slate-500">
            Atualize seus dados cadastrais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label
              htmlFor="profile-name"
              className="text-slate-700 font-medium flex items-center gap-2"
            >
              <User className="w-4 h-4 text-amber-600" /> Nome
            </Label>
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome completo"
              className="bg-slate-50 border-amber-100 focus:border-amber-400 focus:ring-amber-400/20"
            />
            {fieldErrors.name && <p className="text-xs text-rose-500">{fieldErrors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="profile-email"
              className="text-slate-700 font-medium flex items-center gap-2"
            >
              <Mail className="w-4 h-4 text-amber-600" /> E-mail
            </Label>
            <Input
              id="profile-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="bg-slate-50 border-amber-100 focus:border-amber-400 focus:ring-amber-400/20"
            />
            {fieldErrors.email && <p className="text-xs text-rose-500">{fieldErrors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="profile-age"
              className="text-slate-700 font-medium flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-amber-600" /> Idade
            </Label>
            <Input
              id="profile-age"
              type="number"
              min={0}
              max={150}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Sua idade"
              className="bg-slate-50 border-amber-100 focus:border-amber-400 focus:ring-amber-400/20 max-w-32"
            />
            {fieldErrors.age && <p className="text-xs text-rose-500">{fieldErrors.age}</p>}
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-[#C5A028] to-[#D4AF37] hover:from-[#B8941F] hover:to-[#C5A028] text-white shadow-lg shadow-amber-500/20 min-w-32"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> Salvar
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-100/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-800">🏆 Gamificação</CardTitle>
          <CardDescription className="text-slate-500">
            Seus pontos e conquistas no programa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⭐</span>
              <div>
                <p className="text-2xl font-bold text-slate-800">{user?.points ?? 0}</p>
                <p className="text-xs text-slate-500">pontos XP</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">🏅</span>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {parseUserBadges(user?.badges).earnedBadges.length}
                </p>
                <p className="text-xs text-slate-500">conquistas</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
