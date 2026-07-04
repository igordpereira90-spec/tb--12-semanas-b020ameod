import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  Activity,
  User,
  Bell,
  ShieldAlert,
  LogOut,
  ArrowRightLeft,
} from 'lucide-react'
import useAppStore from '@/stores/main'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'

export default function Layout() {
  const { role, setRole } = useAppStore()
  const location = useLocation()
  const isMobile = useIsMobile()

  const toggleRole = () => setRole(role === 'patient' ? 'professional' : 'patient')

  const patientNav = [
    { path: '/patient', label: 'Evolução', icon: Activity },
    { path: '/patient/questionnaires', label: 'Questionários', icon: ClipboardList },
    { path: '/patient/library', label: 'Biblioteca', icon: BookOpen },
  ]

  const proNav = [{ path: '/pro', label: 'Dashboard', icon: LayoutDashboard }]

  const navItems = role === 'patient' ? patientNav : proNav

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 bg-white glass-panel rounded-none">
        <div className="p-6">
          <h1 className="text-xl font-bold text-slate-800 leading-tight">
            Programa <br />
            <span className="text-primary">Transtorno Bipolar</span>
          </h1>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              location.pathname === item.path ||
              (location.pathname.startsWith(item.path) &&
                item.path !== '/patient' &&
                item.path !== '/pro')
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'text-slate-600 hover:bg-slate-100',
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-slate-100">
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-500 hover:text-slate-800"
            onClick={toggleRole}
          >
            <ArrowRightLeft className="w-4 h-4 mr-2" />
            Ver como {role === 'patient' ? 'Profissional' : 'Paciente'}
          </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 md:px-8 bg-white/50 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20">
          <div className="md:hidden">
            <h2 className="font-bold text-slate-800 truncate">TB 12 Semanas</h2>
          </div>
          <div className="hidden md:flex items-center text-sm font-medium text-slate-500">
            {role === 'patient' ? 'Área do Paciente' : 'Área do Profissional'}
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative text-slate-500">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full"></span>
            </Button>
            <Avatar className="w-8 h-8 ring-2 ring-primary/20">
              <AvatarImage
                src={`https://img.usecurling.com/ppl/thumbnail?gender=${role === 'patient' ? 'male' : 'female'}&seed=1`}
              />
              <AvatarFallback>US</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto animate-fade-in-up">
          <div className="max-w-6xl mx-auto space-y-6">
            <Outlet />

            {/* Safety Footer */}
            {role === 'patient' && (
              <div className="mt-12 flex items-center justify-center p-4 bg-amber-50 rounded-2xl text-amber-800 text-sm text-center border border-amber-100/50">
                <ShieldAlert className="w-5 h-5 mr-3 flex-shrink-0" />
                <p>
                  Este programa não substitui consulta médica. Em caso de urgência, procure
                  emergência ou seu médico.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white/90 backdrop-blur-lg border-t border-slate-200 flex justify-around p-3 z-30 pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center space-y-1 w-16 transition-colors',
                isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-600',
              )}
            >
              <Icon className={cn('w-6 h-6', isActive && 'fill-primary/20')} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
        <button
          onClick={toggleRole}
          className="flex flex-col items-center justify-center space-y-1 w-16 text-slate-400"
        >
          <ArrowRightLeft className="w-6 h-6" />
          <span className="text-[10px] font-medium">Trocar</span>
        </button>
      </nav>
    </div>
  )
}
