import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
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
  const { signIn, signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sessionExpired = searchParams.get('expired') === 'true'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)
  const [pwValidation, setPwValidation] = useState(validatePassword(''))

  const redirectToDashboard = () => {
    const record = pb.authStore.record as { role?: string } | null
    if (record?.role === 'professional') {
      navigate('/pro', { replace: true })
    } else {
      navigate('/patient', { replace: true })
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const { error } = await signIn(email, password)
    if (error) {
      setError(getErrorMessage(error))
      return
    }
    logAction('LOGIN').catch(() => {})
    redirectToDashboard()
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!pwValidation.valid) {
      setError('A senha não atende aos requisitos de complexidade.')
      return
    }
    const { error } = await signUp(email, password, name || '')
    if (error) {
      setError(getErrorMessage(error))
      return
    }
    logAction('LOGIN').catch(() => {})
    redirectToDashboard()
  }

  const handlePasswordChange = (val: string) => {
    setPassword(val)
    setPwValidation(validatePassword(val))
  }

  const handleGoogleLogin = async () => {
    setError('')
    setGoogleLoading(true)
    const { error } = await signInWithGoogle()
    setGoogleLoading(false)
    if (error) {
      setError(getErrorMessage(error))
      return
    }
    logAction('LOGIN').catch(() => {})
    redirectToDashboard()
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-amber-50 via-white to-yellow-50">
      <div className="hidden md:flex md:w-1/2 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#B8941F] via-[#C5A028] to-[#D4AF37]" />
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-20 left-20 w-48 h-48 rounded-full bg-yellow-200/20 blur-2xl" />

        <div className="relative z-10 text-white max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
              <Brain className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-amber-100/80 tracking-widest uppercase">Programa de</p>
              <p className="text-lg font-semibold">Acompanhamento</p>
            </div>
          </div>

          <h1 className="font-serif text-4xl font-bold leading-tight mb-4">
            Transtorno Bipolar
            <span className="block text-2xl font-normal text-amber-100/90 mt-1">12 Semanas</span>
          </h1>

          <p className="text-amber-50/80 text-lg leading-relaxed mb-12">
            Um acompanhamento clínico de excelência para apoiar sua jornada de equilíbrio e
            bem-estar.
          </p>

          <div className="space-y-3">
            {[
              'Questionários estruturados quinzenais',
              'Acompanhamento clínico profissional',
              'Conteúdo psicoeducativo exclusivo',
              'Sistema de conquistas e motivação',
            ].map((f) => (
              <div key={f} className="flex items-center gap-3 text-amber-50/90">
                <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-8 shadow-[0_20px_60px_-15px_rgba(180,148,31,0.15)] border-amber-100/50 bg-white">
          <div className="md:hidden flex flex-col items-center gap-2 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-[#C5A028] to-[#D4AF37] rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-serif text-xl font-bold text-amber-900">TB 12 Semanas</h1>
          </div>

          <div className="hidden md:block mb-6">
            <h2 className="font-serif text-2xl font-bold text-slate-800">Bem-vindo</h2>
            <p className="text-sm text-slate-500 mt-1">Acesse sua conta para continuar</p>
          </div>

          {sessionExpired && (
            <Alert className="mb-4 bg-amber-50 border-amber-200">
              <ShieldAlert className="h-4 w-4 !text-amber-600" />
              <AlertDescription className="text-amber-700 text-sm">
                Sua sessão expirou por inatividade. Faça login novamente para continuar.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="mb-4 bg-rose-50 border-rose-200">
              <XCircle className="h-4 w-4 !text-rose-500" />
              <AlertDescription className="text-rose-700 text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="button"
            variant="outline"
            className="w-full border-slate-200 hover:bg-slate-50 mb-4"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <span className="animate-pulse">Conectando...</span>
            ) : (
              <>
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Entrar com Google
              </>
            )}
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400">ou</span>
            </div>
          </div>

          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-amber-50/50">
              <TabsTrigger
                value="login"
                className="data-[state=active]:bg-white data-[state=active]:text-amber-800 data-[state=active]:shadow-sm"
              >
                Entrar
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="data-[state=active]:bg-white data-[state=active]:text-amber-800 data-[state=active]:shadow-sm"
              >
                Cadastrar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-slate-700 font-medium">
                    E-mail
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="border-amber-100 focus:border-amber-400 focus:ring-amber-400/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-pass" className="text-slate-700 font-medium">
                    Senha
                  </Label>
                  <Input
                    id="login-pass"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="border-amber-100 focus:border-amber-400 focus:ring-amber-400/20"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#C5A028] to-[#D4AF37] hover:from-[#B8941F] hover:to-[#C5A028] text-white shadow-lg shadow-amber-500/20"
                  size="lg"
                >
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
                  <Label htmlFor="su-name" className="text-slate-700 font-medium">
                    Nome
                  </Label>
                  <Input
                    id="su-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="border-amber-100 focus:border-amber-400 focus:ring-amber-400/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-email" className="text-slate-700 font-medium">
                    E-mail
                  </Label>
                  <Input
                    id="su-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="border-amber-100 focus:border-amber-400 focus:ring-amber-400/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-pass" className="text-slate-700 font-medium">
                    Senha
                  </Label>
                  <Input
                    id="su-pass"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="border-amber-100 focus:border-amber-400 focus:ring-amber-400/20"
                  />
                  {password.length > 0 && (
                    <div className="space-y-1 mt-2">
                      {pwValidation.checks.map((check) => (
                        <div key={check.label} className="flex items-center gap-1.5 text-xs">
                          {check.passed ? (
                            <CheckCircle2 className="w-3 h-3 text-amber-500" />
                          ) : (
                            <XCircle className="w-3 h-3 text-slate-300" />
                          )}
                          <span className={check.passed ? 'text-amber-700' : 'text-slate-400'}>
                            {check.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#C5A028] to-[#D4AF37] hover:from-[#B8941F] hover:to-[#C5A028] text-white shadow-lg shadow-amber-500/20"
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
