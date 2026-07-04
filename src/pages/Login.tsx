import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { Brain, User, Stethoscope, ArrowRight } from 'lucide-react'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<'patient' | 'professional'>('patient')
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const { error } = await signIn(email, password)
    if (error) {
      setError(getErrorMessage(error))
      return
    }
    navigate('/', { replace: true })
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const { error } = await signUp(email, password, role, name || undefined)
    if (error) {
      setError(getErrorMessage(error))
      return
    }
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 items-center justify-center p-12">
        <div className="text-white max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Brain className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold">Programa Transtorno Bipolar</h1>
          </div>
          <p className="text-indigo-100 text-lg leading-relaxed">
            Um acompanhamento de 12 semanas para apoiar sua jornada de equilíbrio e bem-estar.
          </p>
          <div className="mt-12 space-y-4">
            {[
              'Questionários estruturados quinzenais',
              'Acompanhamento clínico profissional',
              'Conteúdo psicoeducativo',
              'Sistema de conquistas e motivação',
            ].map((f) => (
              <div key={f} className="flex items-center gap-3 text-indigo-100">
                <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <Card className="w-full max-w-md p-8 shadow-lg border-slate-100">
          <div className="md:hidden flex items-center gap-2 mb-6">
            <Brain className="w-6 h-6 text-primary" />
            <span className="font-bold text-slate-800">TB 12 Semanas</span>
          </div>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">E-mail</Label>
                  <Input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-pass">Senha</Label>
                  <Input
                    id="login-pass"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                {error && <p className="text-sm text-rose-600">{error}</p>}
                <Button type="submit" className="w-full" size="lg">
                  Entrar <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <p className="text-xs text-slate-400 text-center mt-2">
                  Demo: igordpereira90@gmail.com / Skip@Pass
                </p>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label>Eu sou</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {(
                      [
                        ['patient', 'Paciente', User],
                        ['professional', 'Profissional', Stethoscope],
                      ] as const
                    ).map(([val, label, Icon]) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setRole(val)}
                        className={cn(
                          'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                          role === val
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-slate-200 text-slate-500 hover:border-slate-300',
                        )}
                      >
                        <Icon className="w-6 h-6" />
                        <span className="text-sm font-medium">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-name">Nome</Label>
                  <Input
                    id="su-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-email">E-mail</Label>
                  <Input
                    id="su-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-pass">Senha</Label>
                  <Input
                    id="su-pass"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                  />
                </div>
                {error && <p className="text-sm text-rose-600">{error}</p>}
                <Button type="submit" className="w-full" size="lg">
                  Criar Conta
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}
