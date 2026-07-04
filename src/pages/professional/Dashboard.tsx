import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PRO_MOCK } from '@/lib/mock'
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
import { Search, AlertCircle, Clock, CheckCircle2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ProDashboard() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filteredPatients = PRO_MOCK.patients.filter((p) => {
    if (filter !== 'all' && p.status !== filter) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'attention':
        return (
          <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200 border-none">
            <AlertCircle className="w-3 h-3 mr-1" /> Atenção
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none">
            <Clock className="w-3 h-3 mr-1" /> Pendente
          </Badge>
        )
      case 'ok':
        return (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Em dia
          </Badge>
        )
      default:
        return null
    }
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
          <p className="text-2xl font-bold text-slate-800">{PRO_MOCK.patients.length}</p>
        </Card>
        <Card className="p-4 bg-white border-l-4 border-l-rose-500">
          <p className="text-sm text-slate-500 font-medium">Em Atenção</p>
          <p className="text-2xl font-bold text-slate-800">
            {PRO_MOCK.patients.filter((p) => p.status === 'attention').length}
          </p>
        </Card>
        <Card className="p-4 bg-white border-l-4 border-l-amber-500">
          <p className="text-sm text-slate-500 font-medium">Pendentes</p>
          <p className="text-2xl font-bold text-slate-800">
            {PRO_MOCK.patients.filter((p) => p.status === 'pending').length}
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
                <TableHead>Última Atividade</TableHead>
                <TableHead>Risco</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow
                  key={patient.id}
                  className="cursor-pointer hover:bg-slate-50/50 transition-colors"
                  onClick={() => navigate(`/pro/patient/${patient.id}`)}
                >
                  <TableCell className="font-medium text-slate-800">{patient.name}</TableCell>
                  <TableCell>Semana {patient.week}</TableCell>
                  <TableCell className="text-slate-500">{patient.lastActive}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${
                        patient.risk === 'Alto'
                          ? 'text-rose-700 bg-rose-50'
                          : patient.risk === 'Médio'
                            ? 'text-amber-700 bg-amber-50'
                            : 'text-emerald-700 bg-emerald-50'
                      }`}
                    >
                      {patient.risk}
                    </span>
                  </TableCell>
                  <TableCell>{getStatusBadge(patient.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-primary">
                      Ver detalhes <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredPatients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    Nenhum paciente encontrado com estes filtros.
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
