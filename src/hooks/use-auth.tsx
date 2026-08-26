import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import pb from '@/lib/pocketbase/client'

type Role = 'patient' | 'professional'

interface AuthContextType {
  user: any
  isAuthenticated: boolean
  role: Role | null
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => void
  acceptConsent: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(pb.authStore.isValid ? pb.authStore.record : null)
  const [isAuthenticated, setIsAuthenticated] = useState(pb.authStore.isValid)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange((_token, record) => {
      setUser(pb.authStore.isValid ? record : null)
      setIsAuthenticated(pb.authStore.isValid)
    })
    if (pb.authStore.isValid) {
      pb.collection('users')
        .authRefresh()
        .then((authData) => {
          setUser(authData.record)
          setIsAuthenticated(true)
        })
        .catch((err: any) => {
          console.warn('[use-auth] authRefresh failed:', err?.status, err?.message)
          // Se for erro definitivo de autorização (401/403 token expirado ou revogado), limpa o store.
          // Se for erro de rede, timeout (status 0) ou servidor temporário (status >= 500),
          // NÃO limpa o token armazenado para não deslogar o usuário prematuramente.
          if (err?.status === 401 || err?.status === 403) {
            pb.authStore.clear()
            setUser(null)
            setIsAuthenticated(false)
          }
        })
        .finally(() => setLoading(false))
    } else {
      if (pb.authStore.record && !pb.authStore.isValid) pb.authStore.clear()
      setLoading(false)
    }
    return () => {
      unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, name: string) => {
    try {
      await pb.collection('users').create({
        email,
        password,
        passwordConfirm: password,
        role: 'patient',
        name,
        points: 0,
        badges: { earnedBadges: [], readMaterials: [] },
        consent_accepted: false,
      })
      await pb.collection('users').authWithPassword(email, password)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      // Se for o Dr. Igor ou profissional, faz chamada para garantir que a conta existe e está configurada
      if (email.trim().toLowerCase() === 'igordpereira90@gmail.com') {
        try {
          await pb.send('/backend/v1/ensure-user', { method: 'POST' })
        } catch (e) {
          console.warn('[use-auth] ensure-user check fallback:', e)
        }
      }
      await pb.collection('users').authWithPassword(email, password)
      return { error: null }
    } catch (error: any) {
      // Se a autenticação falhou para o Dr. Igor, tenta re-chamar ensure-user e tentar mais uma vez
      if (email.trim().toLowerCase() === 'igordpereira90@gmail.com') {
        try {
          await pb.send('/backend/v1/ensure-user', { method: 'POST' })
          await pb.collection('users').authWithPassword(email, password)
          return { error: null }
        } catch {
          /* intentionally ignored */
        }
      }

      if (error?.status === 400 || error?.status === 401) {
        return {
          error: {
            status: 401,
            message: 'Credenciais inválidas. Por favor, tente novamente.',
          },
        }
      }
      return { error }
    }
  }

  const signOut = () => {
    pb.authStore.clear()
  }

  const acceptConsent = async () => {
    if (!user?.id) return
    await pb.collection('users').update(user.id, {
      consent_accepted: true,
      consent_date: new Date().toISOString(),
    })
    await pb.collection('users').authRefresh()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        role: user?.role ?? null,
        signUp,
        signIn,
        signOut,
        acceptConsent,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
