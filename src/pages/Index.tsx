import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAppStore from '@/stores/main'

export default function Index() {
  const navigate = useNavigate()
  const { role } = useAppStore()

  useEffect(() => {
    if (role === 'patient') {
      navigate('/patient', { replace: true })
    } else {
      navigate('/pro', { replace: true })
    }
  }, [role, navigate])

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
}
