import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'

export default function Index() {
  const { role, user } = useAuth()
  const isProfessional =
    role === 'professional' || user?.email?.toLowerCase() === 'igordpereira90@gmail.com'
  return <Navigate to={isProfessional ? '/pro' : '/patient'} replace />
}
