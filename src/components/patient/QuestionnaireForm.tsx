import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import {
  SLIDER_FIELDS,
  FREQUENCY_FIELDS,
  FREQ_OPTIONS,
  IMPROVEMENT_OPTIONS,
  APPETITE_OPTIONS,
  IMPAIRMENT_OPTIONS,
} from '@/lib/questionnaire-config'
import { Loader2 } from 'lucide-react'

interface Props {
  week: number
  onSubmit: (data: Record<string, unknown>) => Promise<void>
}

export function QuestionnaireForm({ week, onSubmit }: Props) {
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<Record<string, any>>({
    overall_feeling: 5,
    mood_score: 5,
    energy_score: 5,
    sleep_score: 5,
    improvement_areas: [],
    anxiety_freq: '',
    insomnia_freq: '',
    daytime_sleepiness: '',
    talkativeness: '',
    racing_thoughts: '',
    increased_goal_activity: '',
    risky_behavior: '',
    euphoria: '',
    depressed_mood: '',
    loss_of_interest: '',
    concentration_change: '',
    physical_activity: '',
    appetite_weight_change: '',
    functional_impairment: '',
    specific_evolution: '',
    future_expectations: '',
  })

  const update = (field: string, value: any) => setForm((p) => ({ ...p, [field]: value }))
  const toggleArea = (opt: string) => {
    const cur = form.improvement_areas as string[]
    update('improvement_areas', cur.includes(opt) ? cur.filter((a) => a !== opt) : [...cur, opt])
  }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      await onSubmit({ ...form, week_number: week })
    } finally {
      setSaving(false)
    }
  }

  const renderFreqSelect = (fieldName: string, label: string) => (
    <div key={fieldName} className="space-y-1.5">
      <Label className="text-sm font-medium text-slate-700">{label}</Label>
      <Select value={form[fieldName]} onValueChange={(v) => update(fieldName, v)}>
        <SelectTrigger className="h-10">
          <SelectValue placeholder="Selecione..." />
        </SelectTrigger>
        <SelectContent>
          {FREQ_OPTIONS.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Nome completo</Label>
        <Input
          value={user?.name || ''}
          readOnly
          placeholder="Nome do paciente"
          className="bg-slate-50"
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <div>
            <Label className="text-sm font-medium">{SLIDER_FIELDS[0].label}</Label>
            <span className="text-xs text-slate-400 block">{SLIDER_FIELDS[0].hint}</span>
          </div>
          <span className="text-sm font-bold text-primary">{form.overall_feeling}/10</span>
        </div>
        <Slider
          value={[form.overall_feeling]}
          onValueChange={(v) => update('overall_feeling', v[0])}
          max={10}
          step={1}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Áreas de melhoria percebida</Label>
        <div className="grid grid-cols-2 gap-2">
          {IMPROVEMENT_OPTIONS.map((opt) => (
            <div key={opt} className="flex items-center gap-2">
              <Checkbox
                checked={form.improvement_areas.includes(opt)}
                onCheckedChange={() => toggleArea(opt)}
              />
              <Label className="text-sm cursor-pointer" onClick={() => toggleArea(opt)}>
                {opt}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {SLIDER_FIELDS.slice(1).map((f) => (
          <div key={f.name} className="space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <Label className="text-sm font-medium">{f.label}</Label>
                <span className="text-xs text-slate-400 block">{f.hint}</span>
              </div>
              <span className="text-sm font-bold text-primary">{form[f.name]}/10</span>
            </div>
            <Slider
              value={[form[f.name]]}
              onValueChange={(v) => update(f.name, v[0])}
              max={10}
              step={1}
            />
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <Label className="text-sm font-medium block">Frequência dos sintomas</Label>
        {FREQUENCY_FIELDS.slice(0, 10).map((f) => renderFreqSelect(f.name, f.label))}
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-slate-700">Alteração de apetite/peso</Label>
        <Select
          value={form.appetite_weight_change}
          onValueChange={(v) => update('appetite_weight_change', v)}
        >
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            {APPETITE_OPTIONS.map((o) => (
              <SelectItem key={o} value={o}>
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {renderFreqSelect('concentration_change', FREQUENCY_FIELDS[10].label)}

      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-slate-700">
          Tem apresentado prejuízo importante do seu funcionamento?
        </Label>
        <Select
          value={form.functional_impairment}
          onValueChange={(v) => update('functional_impairment', v)}
        >
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            {IMPAIRMENT_OPTIONS.map((o) => (
              <SelectItem key={o} value={o}>
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {renderFreqSelect('physical_activity', FREQUENCY_FIELDS[11].label)}

      <div className="space-y-3">
        <div className="space-y-1">
          <Label className="text-sm font-medium">
            Qual evolução específica você teve essa semana?
          </Label>
          <Textarea
            value={form.specific_evolution}
            onChange={(e) => update('specific_evolution', e.target.value)}
            placeholder="Descreva sua evolução..."
            className="min-h-[80px]"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-sm font-medium">
            O que você espera que melhore nas próximas semanas?
          </Label>
          <Textarea
            value={form.future_expectations}
            onChange={(e) => update('future_expectations', e.target.value)}
            placeholder="Descreva suas expectativas..."
            className="min-h-[80px]"
          />
        </div>
      </div>

      <Button onClick={handleSubmit} disabled={saving} className="w-full" size="lg">
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...
          </>
        ) : (
          'Salvar Questionário'
        )}
      </Button>
    </div>
  )
}
