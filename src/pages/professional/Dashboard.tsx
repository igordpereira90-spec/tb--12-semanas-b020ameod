import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRealtime } from '@/hooks/use-realtime'
import { getPatientsList, getUser } from '@/services/users'
import {
  getQuestionnaires,
  updateQuestionnaire,
  getTotalQuestionnairesCount,
} from '@/services/questionnaires'
import { getNotes, createNote, updateNote } from '@/services/professional_notes'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { getAlerts, getCurrentWeek, getPatientStatus } from '@/lib/patient-utils'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { logAction } from '@/services/audit_logs'
import type { AppUser, PatientListItem } from '@/services/users'
import type { Questionnaire } from '@/services/questionnaires'
import type { ProfessionalNote } from '@/services/professional_notes'

import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UserAvatar } from '@/components/UserAvatar'
import { PatientChart } from '@/components/professional/PatientChart'
import { LongitudinalTable } from '@/components/professional/LongitudinalTable'
import { QuestionnaireHistory } from '@/components/professional/QuestionnaireHistory'
import { QuestionnaireEditDialog } from '@/components/professional/QuestionnaireEditDialog'
import { WeeklyEvolution } from '@/components/professional/WeeklyEvolution'
import { AccessManagement } from '@/components/professional/AccessManagement'

import {
  Search,
  AlertCircle,
  Clock,
  CheckCircle2,
  ArrowRight,
  Loader2,
  RefreshCw,
  WifiOff,
  UserCheck,
  TrendingUp,
  Table2,
  History,
  Lock,
  Save,
  AlertTriangle,
  Users,
  ExternalLink,
  ClipboardCheck,
  Activity,
} from 'lucide-react'

/** Tempo máximo aceitável para cada chamada de API sob demanda (15s). */
const API_TIMEOUT_MS = 15000

/** Número de tentativas automáticas antes de exibir o erro ao usuário. */
const MAX_ATTEMPTS = 2

/** Delay progressivo entre tentativas (ms). */
const RETRY_DELAYS_MS = [1500]

/** Executa uma função com retry automático e delay progressivo. */
async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  let lastErr: unknown
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastErr = err
      if (attempt < MAX_ATTEMPTS) {
        console.warn(
          `[ProDashboard] ${label}: tentativa ${attempt}/${MAX_ATTEMPTS} falhou, tentando de novo...`,
          err,
        )
        await new Promise((r) => setTimeout(r, RETRY_DELAYS_MS[attempt - 1] || 1500))
      }
    }
  }
  throw lastErr instanceof Error
    ? lastErr
    : new Error(`${label}: falhou após ${MAX_ATTEMPTS} tentativas.`)
}

/**
 * Envolve uma promise com timeout de 15s para garantir que nunca trave indefinidamente.
 */
function withTimeout<T>(
  promise: Promise<T>,
  ms = API_TIMEOUT_MS,
  label = 'Requisição',
): Promise<T> {
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
function describeError(err: any): { title: string; detail: string; status?: number } {
  if (err?.status) {
    if (err.status === 401) {
      return {
        title: 'Sessão expirada ou não autenticada',
        detail: 'Sua sessão expirou. Faça login novamente.',
        status: 401,
      }
    }
    if (err.status === 403) {
      return {
        title: 'Permissão negada',
        detail:
          'Seu usuário não possui permissão para visualizar pacientes (HTTP 403). Verifique se seu perfil tem o papel de profissional.',
        status: 403,
      }
    }
    if (err.status === 0) {
      return {
        title: 'Erro de comunicação de rede',
        detail: 'Não foi possível conectar ao servidor (HTTP 0). Verifique sua conexão.',
        status: 0,
      }
    }
    return {
      title: `Erro do servidor (HTTP ${err.status})`,
      detail:
        err.message ||
        (typeof err.data === 'object'
          ? JSON.stringify(err.data)
          : 'Falha na requisição ao servidor.'),
      status: err.status,
    }
  }

  if (err instanceof Error && err.message) {
    if (err.message.includes('tempo limite excedido')) {
      return {
        title: 'Tempo de resposta excedido',
        detail: `${err.message}. O servidor demorou mais do que o esperado para responder. Tente recarregar.`,
      }
    }
    return {
      title: 'Falha no carregamento',
      detail: err.message,
    }
  }

  return {
    title: 'Falha de comunicação',
    detail: 'Não foi possível conectar ao servidor ou receber a resposta.',
  }
}

export default function ProDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()

  // Lista leve de pacientes para dropdown e busca
  const [patientsList, setPatientsList] = useState<PatientListItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loadingList, setLoadingList] = useState(true)
  const [listError, setListError] = useState<{
    title: string
    detail: string
    status?: number
  } | null>(null)

  // Resumo geral carregado em paralelo de forma independente
  const [totalQuestionnairesCount, setTotalQuestionnairesCount] = useState<number | null>(null)
  const [loadingSummary, setLoadingSummary] = useState(true)

  // Paciente atualmente selecionado
  const [selectedPatientId, setSelectedPatientId] = useState<string>('')

  // Dados sob demanda do paciente selecionado
  const [selectedPatient, setSelectedPatient] = useState<AppUser | null>(null)
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([])
  const [notes, setNotes] = useState('')
  const [noteId, setNoteId] = useState<string | null>(null)
  const [loadingPatientData, setLoadingPatientData] = useState(false)
  const [patientDataError, setPatientDataError] = useState<string | null>(null)
  const [savingNotes, setSavingNotes] = useState(false)

  // Edição de questionário
  const [editingQ, setEditingQ] = useState<Questionnaire | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const mountedRef = useRef(true)

  // 1. Carregar lista leve de pacientes
  const loadPatientsList = useCallback(async () => {
    setLoadingList(true)
    setListError(null)
    try {
      const list = await withRetry(
        () => withTimeout(getPatientsList(), API_TIMEOUT_MS, 'Lista de Pacientes'),
        'Lista de Pacientes',
      )
      if (!mountedRef.current) return
      setPatientsList(list)
      setListError(null)
    } catch (err: any) {
      if (!mountedRef.current) return
      console.error('[ProDashboard] Erro ao carregar lista de pacientes:', err)
      setListError(describeError(err))
    } finally {
      if (mountedRef.current) setLoadingList(false)
    }
  }, [])

  // 1b. Carregar resumo geral em paralelo (total de questionários)
  const loadGlobalSummary = useCallback(async () => {
    setLoadingSummary(true)
    try {
      const count = await withRetry(
        () => withTimeout(getTotalQuestionnairesCount(), API_TIMEOUT_MS, 'Total de Questionários'),
        'Total de Questionários',
      )
      if (!mountedRef.current) return
      setTotalQuestionnairesCount(count)
    } catch (err) {
      console.warn('[ProDashboard] Erro ao carregar contagem geral de questionários:', err)
    } finally {
      if (mountedRef.current) setLoadingSummary(false)
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    loadPatientsList()
    loadGlobalSummary()
    return () => {
      mountedRef.current = false
    }
  }, [loadPatientsList, loadGlobalSummary])

  // 2. Carregar dados sob demanda quando um paciente for selecionado
  const loadPatientData = useCallback(
    async (patientId: string, opts: { silent?: boolean } = {}) => {
      if (!patientId) {
        setSelectedPatient(null)
        setQuestionnaires([])
        setNotes('')
        setNoteId(null)
        return
      }

      if (!opts.silent) {
        setLoadingPatientData(true)
        setPatientDataError(null)
      }

      try {
        const [patientObj, qs, notesList] = await Promise.all([
          withRetry(
            () => withTimeout(getUser(patientId), API_TIMEOUT_MS, 'Dados do Paciente'),
            'Dados do Paciente',
          ),
          withRetry(
            () => withTimeout(getQuestionnaires(patientId), API_TIMEOUT_MS, 'Questionários'),
            'Questionários',
          ),
          withRetry(
            () => withTimeout(getNotes(patientId), API_TIMEOUT_MS, 'Notas Clínicas'),
            'Notas Clínicas',
          ).catch((e) => {
            console.warn('[ProDashboard] Erro ao buscar notas (ignorado):', e)
            return [] as ProfessionalNote[]
          }),
        ])

        if (!mountedRef.current) return

        setSelectedPatient(patientObj)
        setQuestionnaires(qs)

        if (notesList && notesList.length > 0) {
          setNotes(notesList[0].content)
          setNoteId(notesList[0].id)
        } else {
          setNotes('')
          setNoteId(null)
        }

        setPatientDataError(null)
        logAction('ACCESS_PATIENT_DATA', patientId).catch(() => {})
      } catch (err: any) {
        if (!mountedRef.current) return
        console.error('[ProDashboard] Erro ao carregar dados do paciente selecionado:', err)
        if (!opts.silent) {
          const desc = describeError(err)
          setPatientDataError(`${desc.title}: ${desc.detail}`)
        }
      } finally {
        if (mountedRef.current && !opts.silent) {
          setLoadingPatientData(false)
        }
      }
    },
    [],
  )

  useEffect(() => {
    if (selectedPatientId) {
      loadPatientData(selectedPatientId)
    } else {
      setSelectedPatient(null)
      setQuestionnaires([])
      setNotes('')
      setNoteId(null)
    }
  }, [selectedPatientId, loadPatientData])

  // Realtime updates quando questionários ou notas mudarem
  useRealtime('questionnaires', () => {
    loadGlobalSummary()
    if (selectedPatientId) {
      loadPatientData(selectedPatientId, { silent: true })
    }
  })

  useRealtime('users', () => {
    loadPatientsList()
  })

  useRealtime('professional_notes', () => {
    if (selectedPatientId) {
      loadPatientData(selectedPatientId, { silent: true })
    }
  })

  // Salvar notas profissionais
  const handleSaveNotes = async () => {
    if (!selectedPatientId || !user?.id) return
    setSavingNotes(true)
    try {
      if (noteId) {
        await withTimeout(updateNote(noteId, notes), API_TIMEOUT_MS, 'Salvar Notas')
      } else {
        const created = await withTimeout(
          createNote(selectedPatientId, user.id, notes),
          API_TIMEOUT_MS,
          'Criar Nota',
        )
        setNoteId(created.id)
      }
      toast({ title: 'Notas salvas', description: 'Observações atualizadas com sucesso.' })
    } catch (err) {
      toast({ title: 'Erro ao salvar notas', description: getErrorMessage(err) })
    } finally {
      setSavingNotes(false)
    }
  }

  // Atualizar questionário editado
  const handleEditSubmit = async (data: Record<string, unknown>) => {
    if (!editingQ) return
    try {
      await withTimeout(
        updateQuestionnaire(editingQ.id, data),
        API_TIMEOUT_MS,
        'Atualizar Questionário',
      )
      setEditingQ(null)
      setEditDialogOpen(false)
      toast({ title: 'Sucesso!', description: 'Questionário atualizado com sucesso.' })
      if (selectedPatientId) {
        loadPatientData(selectedPatientId, { silent: true })
      }
    } catch (err) {
      toast({ title: 'Erro ao atualizar', description: getErrorMessage(err) })
    }
  }

  // Pacientes filtrados para a busca rápida no dropdown
  const filteredPatientsList = patientsList.filter((p) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return p.name.toLowerCase().includes(q) || (p.email && p.email.toLowerCase().includes(q))
  })

  // Cálculos do paciente selecionado
  const sortedQuestionnaires = [...questionnaires].sort((a, b) => a.week_number - b.week_number)
  const latestQ = sortedQuestionnaires[sortedQuestionnaires.length - 1]
  const alerts = latestQ ? getAlerts(latestQ) : { hasAlert: false, reasons: [] }
  const currentWeek = getCurrentWeek(questionnaires)
  const patientStatus = getPatientStatus(questionnaires)

  const statusBadge = (status: string) => {
    if (status === 'attention')
      return (
        <Badge className="bg-rose-50 text-rose-600 border border-rose-200 shadow-sm flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" /> Atenção
        </Badge>
      )
    if (status === 'pending')
      return (
        <Badge className="bg-amber-50 text-amber-600 border border-amber-200 shadow-sm flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" /> Pendente
        </Badge>
      )
    return (
      <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm flex items-center gap-1">
        <CheckCircle2 className="w-3.5 h-3.5" /> Em dia
      </Badge>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Painel de Acompanhamento</h1>
          <p className="text-slate-600 text-sm">
            Selecione um paciente para visualizar os dados clínicos e evolução sob demanda.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              loadPatientsList()
              loadGlobalSummary()
              if (selectedPatientId) loadPatientData(selectedPatientId)
            }}
            disabled={loadingList || loadingPatientData}
            className="text-slate-600 hover:text-slate-800"
          >
            <RefreshCw
              className={`w-4 h-4 mr-1.5 ${loadingList || loadingPatientData ? 'animate-spin' : ''}`}
            />
            Atualizar
          </Button>
        </div>
      </div>

      {/* CARDS DE RESUMO GERAL (Carregamento independente em paralelo) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4 bg-white border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
              Total de Pacientes
            </p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">
              {loadingList ? (
                <Loader2 className="w-5 h-5 animate-spin text-primary mt-1" />
              ) : (
                patientsList.length
              )}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Cadastrados no programa</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Users className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 bg-white border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
              Questionários Preenchidos
            </p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">
              {loadingSummary ? (
                <Loader2 className="w-5 h-5 animate-spin text-primary mt-1" />
              ) : (
                (totalQuestionnairesCount ?? '—')
              )}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Total acumulado no sistema</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ClipboardCheck className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 bg-white border-slate-200 shadow-sm flex items-center justify-between sm:col-span-2 lg:col-span-1">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
              Modo de Consulta
            </p>
            <h3 className="text-sm font-bold text-slate-800 mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Carregamento Sob Demanda
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Sem risco de travamento (15s timeout)</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* SELETOR DE PACIENTE NO TOPO */}
      <Card className="p-5 border-primary/20 shadow-sm bg-gradient-to-r from-amber-50/40 via-white to-amber-50/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold shadow-sm">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                Paciente em Acompanhamento
              </label>
              <span className="text-sm font-medium text-slate-700">
                {selectedPatient
                  ? `${selectedPatient.name} (${selectedPatient.email})`
                  : 'Nenhum paciente selecionado'}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* Input de filtro/busca rápida */}
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Filtrar por nome..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 bg-white"
              />
            </div>

            {/* Dropdown de seleção de paciente */}
            <div className="w-full sm:w-64">
              <Select
                value={selectedPatientId}
                onValueChange={(val) => setSelectedPatientId(val)}
                disabled={loadingList}
              >
                <SelectTrigger className="h-10 bg-white border-primary/30">
                  <SelectValue
                    placeholder={loadingList ? 'Carregando lista...' : 'Selecione um paciente...'}
                  />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {filteredPatientsList.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-800">{p.name}</span>
                        {p.email && <span className="text-xs text-slate-400">({p.email})</span>}
                      </div>
                    </SelectItem>
                  ))}
                  {filteredPatientsList.length === 0 && (
                    <div className="p-3 text-center text-xs text-slate-500">
                      Nenhum paciente encontrado.
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedPatientId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedPatientId('')}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                Limpar
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* ERRO NA CARGA DA LISTA DE PACIENTES */}
      {listError && (
        <Card className="p-6 border-rose-200 bg-white shadow-sm">
          <div className="flex flex-col items-center text-center gap-3 py-4 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center">
              {listError.status === 401 || listError.status === 403 ? (
                <AlertCircle className="w-6 h-6 text-rose-500" />
              ) : (
                <WifiOff className="w-6 h-6 text-rose-500" />
              )}
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">{listError.title}</h2>
              <p className="text-sm text-slate-600 mt-1">{listError.detail}</p>
            </div>
            {listError.status === 401 ? (
              <Button onClick={() => navigate('/login')} className="bg-primary text-white mt-2">
                Ir para o login
              </Button>
            ) : (
              <Button onClick={() => loadPatientsList()} className="bg-primary text-white mt-2">
                <RefreshCw className="w-4 h-4 mr-2" /> Tentar novamente
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* ESTADO 1: NENHUM PACIENTE SELECIONADO */}
      {!selectedPatientId && !listError && (
        <Card className="p-12 border-dashed border-2 border-primary/20 bg-white/70 text-center">
          <div className="max-w-md mx-auto flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <UserCheck className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">
                Selecione um paciente para visualizar o acompanhamento
              </h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Escolha um paciente no seletor acima para carregar instantaneamente o histórico
                completo de questionários, gráficos de evolução clínica, notas e gestão de acesso.
              </p>
            </div>

            {patientsList.length > 0 && (
              <div className="w-full mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Pacientes disponíveis:
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {patientsList.slice(0, 5).map((p) => (
                    <Button
                      key={p.id}
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPatientId(p.id)}
                      className="border-primary/20 hover:border-primary hover:bg-primary/5 text-slate-700 text-xs"
                    >
                      {p.name}
                      <ArrowRight className="w-3 h-3 ml-1 text-primary" />
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* ESTADO 2: CARREGANDO DADOS DO PACIENTE */}
      {selectedPatientId && loadingPatientData && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-xl border border-primary/10 shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-slate-600">
            Carregando dados clínicos do paciente...
          </p>
          <span className="text-xs text-slate-400">Carregamento sob demanda (timeout 15s)</span>
        </div>
      )}

      {/* ESTADO 3: ERRO AO CARREGAR PACIENTE ESPECÍFICO */}
      {selectedPatientId && !loadingPatientData && patientDataError && (
        <Card className="p-8 border-rose-200 bg-white shadow-sm">
          <div className="flex flex-col items-center text-center gap-3 py-4 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-rose-500" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">
                Não foi possível carregar os dados deste paciente
              </h2>
              <p className="text-sm text-slate-600 mt-1">{patientDataError}</p>
            </div>
            <Button
              onClick={() => loadPatientData(selectedPatientId)}
              className="bg-primary text-white mt-2"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Tentar novamente
            </Button>
          </div>
        </Card>
      )}

      {/* ESTADO 4: PACIENTE CARREGADO COM SUCESSO (DADOS COMPLETOS SOB DEMANDA) */}
      {selectedPatientId && !loadingPatientData && selectedPatient && !patientDataError && (
        <div className="space-y-6">
          {/* Card de resumo e métricas do paciente */}
          <Card className="p-6 border-primary/15 shadow-sm bg-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <UserAvatar user={selectedPatient} size="lg" />
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-xl font-bold text-slate-800">{selectedPatient.name}</h2>
                    {statusBadge(patientStatus)}
                    {alerts.hasAlert && (
                      <Badge variant="destructive" className="animate-pulse">
                        Atenção Requerida
                      </Badge>
                    )}
                  </div>
                  <p className="text-slate-500 text-sm mt-1">
                    {selectedPatient.email || 'Sem e-mail cadastrado'} • Semana atual:{' '}
                    <strong className="text-slate-700">{currentWeek} de 12</strong> •{' '}
                    {questionnaires.length} questionários preenchidos
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/pro/patient/${selectedPatient.id}`)}
                  className="text-primary hover:text-primary hover:bg-primary/5"
                >
                  Página Dedicada <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            </div>

            {/* Alerta clínico se houver */}
            {alerts.hasAlert && (
              <Alert
                variant="destructive"
                className="bg-rose-50 border-rose-200 text-rose-900 mt-6"
              >
                <AlertTriangle className="h-5 w-5 !text-rose-600" />
                <AlertTitle className="text-rose-800 font-semibold">
                  Alerta Clínico — Semana {latestQ?.week_number}
                </AlertTitle>
                <AlertDescription className="text-rose-700 mt-1">
                  {alerts.reasons.join('. ')}.
                </AlertDescription>
              </Alert>
            )}
          </Card>

          {/* Evolução Clínica (Gráfico) */}
          <Card className="p-6 border-primary/10 shadow-sm bg-white">
            <h2 className="text-lg font-semibold mb-6 flex items-center text-slate-800">
              <TrendingUp className="w-5 h-5 mr-2 text-primary" /> Evolução Clínica (Scores 0-10)
            </h2>
            <PatientChart questionnaires={sortedQuestionnaires} />
          </Card>

          {/* Resumo da Evolução Semanal com IA */}
          <WeeklyEvolution questionnaires={sortedQuestionnaires} patientId={selectedPatient.id} />

          {/* Comparativo Longitudinal */}
          <Card className="p-6 border-primary/10 shadow-sm bg-white">
            <h2 className="text-lg font-semibold mb-4 flex items-center text-slate-800">
              <Table2 className="w-5 h-5 mr-2 text-primary" /> Comparativo Longitudinal
            </h2>
            <LongitudinalTable questionnaires={sortedQuestionnaires} />
          </Card>

          {/* Histórico de Questionários */}
          <Card className="p-6 border-primary/10 shadow-sm bg-white">
            <h2 className="text-lg font-semibold mb-4 flex items-center text-slate-800">
              <History className="w-5 h-5 mr-2 text-primary" /> Histórico de Questionários
            </h2>
            <QuestionnaireHistory
              questionnaires={sortedQuestionnaires}
              onEdit={(q) => {
                setEditingQ(q)
                setEditDialogOpen(true)
              }}
            />
          </Card>

          {/* Gestão de Acesso / Desbloqueio de Semanas */}
          <Card className="p-6 border-primary/10 shadow-sm bg-primary/5">
            <h2 className="text-lg font-semibold mb-2 flex items-center text-slate-800">
              <Lock className="w-5 h-5 mr-2 text-primary" /> Gestão de Acesso
            </h2>
            <p className="text-sm text-slate-600 mb-6">
              Libere ou bloqueie manualmente semanas do programa para este paciente.
            </p>
            <AccessManagement patientId={selectedPatient.id} />
          </Card>

          {/* Notas Profissionais Privadas */}
          <Card className="p-6 border-primary/10 shadow-sm bg-white">
            <h2 className="text-lg font-semibold mb-4 text-slate-800 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-primary rounded-full inline-block"></span>
              Notas Profissionais (Privado)
            </h2>
            <Textarea
              placeholder="Registre aqui suas observações clínicas para este paciente..."
              className="min-h-[140px] mb-4 bg-slate-50/50"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20"
              >
                {savingNotes ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}{' '}
                Salvar Notas
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Diálogo de Edição de Questionário */}
      <QuestionnaireEditDialog
        questionnaire={editingQ}
        open={editDialogOpen}
        onOpenChange={(o) => {
          setEditDialogOpen(o)
          if (!o) setEditingQ(null)
        }}
        onSubmit={handleEditSubmit}
      />
    </div>
  )
}
