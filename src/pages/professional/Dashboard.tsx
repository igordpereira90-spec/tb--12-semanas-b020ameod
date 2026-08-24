import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRealtime } from '@/hooks/use-realtime'
import { getPatients } from '@/services/users'
import { getQuestionnaires } from '@/services/questionnaires'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Search,
  AlertCircle,
  Clock,
  CheckCircle2,
  ArrowRight,
  Loader2,
  RefreshCw,
  WifiOff,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import pb from '@/lib/pocketbase/client'
import { getPatientStatus, getCurrentWeek } from '@/lib/patient-utils'
import { QUESTIONNAIRE_WEEKS } from '@/lib/questionnaire-config'
import type { AppUser } from '@/services/users'
import type { Questionnaire } from '@/services/questionnaires'

/** Tempo máximo aceitável para uma chamada de API antes de desistir. */
const API_TIMEOUT_MS = 15000

/**
 * Envolta uma promise com um timeout. Garante que a promise sempre settle
 * (resolve ou reject) mesmo quando o backend não responde, evitando loading
 * eterno. O timer é limpo em qualquer caminho para não vazar.
 */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let settled = false
    const timer = setTimeout(() => {
      if (settled) return
      settled = true
      reject(new Error(`${label}: tempo limite excedido (${ms / 1000}s).`))
    }, ms)
    promise.then(
      (value) => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        resolve(value)
      },
      (err) => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        reject(err)
      },
    )
  })
}

/** Extrai uma mensagem de erro legível a partir de qualquer erro de rede/API. */
function describeError(err: any): string {
  if (err?.status) {
    if (err.status === 401) return 'Sessão expirada ou não autenticada (401).'
    if (err.status === 403) return 'Acesso não autorizado para visualizar pacientes (403).'
    if (err.status === 0) return 'Erro de rede ou conexão recusada (status 0).'
    return `Erro do servidor (${err.status}): ${err.message || 'Falha na requisição'}`
  }
  if (err instanceof Error && err.message) return err.message
  if (typeof err === 'string' && err) return err
  return 'Não foi possível conectar ao servidor.'
}

export default function ProDashboard() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [patients, setPatients] = useState<AppUser[]>([])
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  const loadData = useCallback(async (opts: { silent?: boolean } = {}) => {
    const { silent = false } = opts
    // Recargas em tempo real (silent) não reexibem o spinner nem apagam a
    // tela — apenas atualizam os dados em segundo plano.
    if (!silent) setLoading(true)
    if (!silent) setError(null)
    try {
      console.log(
        '[Dashboard] Loading data. Auth isValid:',
        pb.authStore.isValid,
        'Role:',
        (pb.authStore.record as any)?.role,
      )
      const [pats, qs] = await Promise.all([
        withTimeout(getPatients(), API_TIMEOUT_MS, 'Pacientes'),
        withTimeout(getQuestionnaires(), API_TIMEOUT_MS, 'Questionários'),
      ])
      if (!mountedRef.current) return
      console.log('[Dashboard] Loaded successfully:', {
        patientsCount: pats.length,
        questionnairesCount: qs.length,
      })
      setPatients(pats)
      setQuestionnaires(qs)
      setError(null)
    } catch (err: any) {
      console.error('[Dashboard] Erro ao carregar dados:', err, {
        status: err?.status,
        message: err?.message,
        data: err?.data,
        isAuthValid: pb.authStore.isValid,
        authRecord: pb.authStore.record,
      })
      if (!mountedRef.current) return
      if (!silent) {
        // Falha no carregamento inicial: limpa dados e mostra erro amigável.
        setPatients([])
        setQuestionnaires([])
        setError(describeError(err))
      }
      // Em recarga silenciosa mantemos os dados atuais já em tela.
    } finally {
      if (mountedRef.current && !silent) setLoading(false)
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    loadData()
    return () => {
      mountedRef.current = false
    }
  }, [loadData])

  useRealtime('questionnaires', () => {
    loadData({ silent: true })
  })

  const getPatientQs = (pid: string) => questionnaires.filter((q) => q.patient === pid)

  const filteredPatients = patients.filter((p) => {
    const status = getPatientStatus(getPatientQs(p.id))
    if (filter !== 'all' && status !== filter) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-slate-500">Carregando pacientes e questionários...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Painel de Acompanhamento</h1>
          <p className="text-slate-600">
            Monitore a evolução dos seus pacientes no ciclo de 12 semanas.
          </p>
        </div>
        <Card className="p-8 border-rose-200 bg-white shadow-sm">
          <div className="flex flex-col items-center text-center gap-4 py-6 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center">
              <WifiOff className="w-7 h-7 text-rose-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Não foi possível carregar os dados
              </h2>
              <p className="text-sm text-slate-500 mt-1.5">
                Houve um problema de comunicação com o servidor. Verifique sua conexão com a
                internet e tente novamente. Se o problema persistir, o serviço pode estar
                temporariamente indisponível.
              </p>
            </div>
            {error && <p className="text-xs text-slate-400 break-words w-full">{error}</p>}
            <Button
              onClick={() => loadData()}
              disabled={loading}
              className="bg-gradient-to-r from-[#C5A028] to-[#D4AF37] hover:from-[#B8941F] hover:to-[#C5A028] text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Tentar novamente
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const statusBadge = (status: string) => {
    if (status === 'attention')
      return (
        <Badge className="bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 shadow-sm">
          <AlertCircle className="w-3 h-3 mr-1" /> Atenção
        </Badge>
      )
    if (status === 'pending')
      return (
        <Badge className="bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200 shadow-sm">
          <Clock className="w-3 h-3 mr-1" /> Pendente
        </Badge>
      )
    return (
      <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 shadow-sm">
        <CheckCircle2 className="w-3 h-3 mr-1" /> Em dia
      </Badge>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Painel de Acompanhamento</h1>
        <p className="text-slate-600">
          Monitore a evolução dos seus pacientes no ciclo de 12 semanas.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-primary/20 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
          <p className="text-sm text-slate-500 font-medium ml-2">Total Ativos</p>
          <p className="text-2xl font-bold text-slate-800 ml-2">{patients.length}</p>
        </Card>
        <Card className="p-4 bg-white border border-rose-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
          <p className="text-sm text-slate-500 font-medium ml-2">Em Atenção</p>
          <p className="text-2xl font-bold text-slate-800 ml-2">
            {patients.filter((p) => getPatientStatus(getPatientQs(p.id)) === 'attention').length}
          </p>
        </Card>
        <Card className="p-4 bg-white border border-amber-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
          <p className="text-sm text-slate-500 font-medium ml-2">Pendentes</p>
          <p className="text-2xl font-bold text-slate-800 ml-2">
            {patients.filter((p) => getPatientStatus(getPatientQs(p.id)) === 'pending').length}
          </p>
        </Card>
        <Card className="p-4 bg-white border border-emerald-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
          <p className="text-sm text-slate-500 font-medium ml-2">Em Dia</p>
          <p className="text-2xl font-bold text-slate-800 ml-2">
            {patients.filter((p) => getPatientStatus(getPatientQs(p.id)) === 'ok').length}
          </p>
        </Card>
      </div>

      <Card className="p-6 border border-primary/10 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar paciente..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Tabs
            defaultValue="all"
            onValueChange={setFilter}
            className="w-full md:w-auto overflow-x-auto"
          >
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="attention">Atenção</TabsTrigger>
              <TabsTrigger value="pending">Pendentes</TabsTrigger>
              <TabsTrigger value="ok">Em dia</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/5 hover:bg-primary/5 border-primary/10">
                <TableHead className="text-primary font-semibold">Paciente</TableHead>
                <TableHead className="text-primary font-semibold">E-mail</TableHead>
                <TableHead className="text-primary font-semibold">Semana Atual</TableHead>
                <TableHead className="text-primary font-semibold">Questionários</TableHead>
                <TableHead className="text-primary font-semibold">Status</TableHead>
                <TableHead className="text-right text-primary font-semibold">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => {
                const pQs = getPatientQs(patient.id)
                const status = getPatientStatus(pQs)
                return (
                  <TableRow
                    key={patient.id}
                    className="cursor-pointer hover:bg-slate-50/50 transition-colors"
                    onClick={() => navigate(`/pro/patient/${patient.id}`)}
                  >
                    <TableCell className="font-medium text-slate-800">{patient.name}</TableCell>
                    <TableCell className="text-slate-500 text-sm">{patient.email}</TableCell>
                    <TableCell>Semana {getCurrentWeek(pQs)}</TableCell>
                    <TableCell className="text-slate-500">
                      {pQs.length} de {QUESTIONNAIRE_WEEKS.length}
                    </TableCell>
                    <TableCell>{statusBadge(status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-primary">
                        Ver detalhes <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
              {filteredPatients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    Nenhum paciente encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
