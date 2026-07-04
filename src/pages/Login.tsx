import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { validatePassword } from '@/lib/password-validation'
import { logAction } from '@/services/audit_logs'
import { Brain, ArrowRight, CheckCircle2, XCircle, ShieldAlert } from 'lucide-react'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sessionExpired = searchParams.get('expired') === 'true'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [pwValidation, setPwValidation] = useState(validatePassword(''))

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const { error } = await signIn(email, password)
    if (error) {
      setError(getErrorMessage(error))
      return
    }
    logAction('LOGIN').catch(() => {})
    navigate('/', { replace: true })
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!pwValidation.valid) {
      setError('A senha não atende aos requisitos de complexidade.')
      return
    }
    const { error } = await signUp(email, password, name || undefined)
    if (error) {
      setError(getErrorMessage(error))
      return
    }
    logAction('LOGIN').catch(() => {})
    navigate('/', { replace: true })
  }

  const handlePasswordChange = (val: string) => {
    setPassword(val)
    setPwValidation(validatePassword(val))
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

          {sessionExpired && (
            <Alert className="mb-4 bg-amber-50 border-amber-200 text-amber-900">
              <ShieldAlert className="h-4 w-4 !text-amber-600" />
              <AlertDescription className="text-amber-700 text-sm">
                Sua sessão expirou por inatividade. Faça login novamente para continuar.
              </AlertDescription>
            </Alert>
          )}

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
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                  />
                  {password.length > 0 && (
                    <div className="space-y-1 mt-2">
                      {pwValidation.checks.map((check) => (
                        <div key={check.label} className="flex items-center gap-1.5 text-xs">
                          {check.passed ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <XCircle className="w-3 h-3 text-slate-300" />
                          )}
                          <span className={check.passed ? 'text-emerald-600' : 'text-slate-400'}>
                            {check.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {error && <p className="text-sm text-rose-600">{error}</p>}
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={password.length > 0 && !pwValidation.valid}
                >
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
