import { useState, useEffect, useCallback } from 'react'
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
import { Search, AlertCircle, Clock, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getPatientStatus, getCurrentWeek } from '@/lib/patient-utils'
import type { AppUser } from '@/services/users'
import type { Questionnaire } from '@/services/questionnaires'

export default function ProDashboard() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [patients, setPatients] = useState<AppUser[]>([])
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const [pats, qs] = await Promise.all([getPatients(), getQuestionnaires()])
      setPatients(pats)
      setQuestionnaires(qs)
    } catch {
      setPatients([])
      setQuestionnaires([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('questionnaires', () => {
    loadData()
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
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const statusBadge = (status: string) => {
    if (status === 'attention')
      return (
        <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200 border-none">
          <AlertCircle className="w-3 h-3 mr-1" /> Atenção
        </Badge>
      )
    if (status === 'pending')
      return (
        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none">
          <Clock className="w-3 h-3 mr-1" /> Pendente
        </Badge>
      )
    return (
      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none">
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
        <Card className="p-4 bg-white border-l-4 border-l-primary">
          <p className="text-sm text-slate-500 font-medium">Total Ativos</p>
          <p className="text-2xl font-bold text-slate-800">{patients.length}</p>
        </Card>
        <Card className="p-4 bg-white border-l-4 border-l-rose-500">
          <p className="text-sm text-slate-500 font-medium">Em Atenção</p>
          <p className="text-2xl font-bold text-slate-800">
            {patients.filter((p) => getPatientStatus(getPatientQs(p.id)) === 'attention').length}
          </p>
        </Card>
        <Card className="p-4 bg-white border-l-4 border-l-amber-500">
          <p className="text-sm text-slate-500 font-medium">Pendentes</p>
          <p className="text-2xl font-bold text-slate-800">
            {patients.filter((p) => getPatientStatus(getPatientQs(p.id)) === 'pending').length}
          </p>
        </Card>
        <Card className="p-4 bg-white border-l-4 border-l-emerald-500">
          <p className="text-sm text-slate-500 font-medium">Em Dia</p>
          <p className="text-2xl font-bold text-slate-800">
            {patients.filter((p) => getPatientStatus(getPatientQs(p.id)) === 'ok').length}
          </p>
        </Card>
      </div>

      <Card className="p-6">
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
              <TableRow className="bg-slate-50">
                <TableHead>Paciente</TableHead>
                <TableHead>Semana Atual</TableHead>
                <TableHead>Questionários</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ação</TableHead>
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
                    <TableCell>Semana {getCurrentWeek(pQs)}</TableCell>
                    <TableCell className="text-slate-500">{pQs.length} de 5</TableCell>
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
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">
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
