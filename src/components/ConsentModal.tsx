import { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ShieldCheck, Loader2, CheckCircle2, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

const TCLE_SECTIONS = [
  {
    title: '1. Objeto do Programa',
    text: 'O presente Termo de Consentimento Livre e Esclarecido (TCLE) refere-se à participação no Programa de Acompanhamento de Transtorno Bipolar de 12 semanas, conduzido sob supervisão profissional. O programa utiliza plataforma digital para coleta de dados através de questionários semanais, fornecimento de material psicoeducativo e monitoramento de evolução clínica.',
  },
  {
    title: '2. Dados Coletados',
    text: 'Durante o programa, serão coletados os seguintes dados: nome, e-mail, respostas a questionários de autorrelato (humor, energia, sono, ansiedade, comportamento, apetite, entre outros), evolução específica relatada, expectativas futuras, registros de acesso à plataforma, e dados de gamificação (pontos e conquistas). Os dados são armazenados em servidor seguro com criptografia.',
  },
  {
    title: '3. Finalidade do Tratamento',
    text: 'Os dados coletados têm como finalidade: (a) monitoramento da evolução clínica do paciente ao longo das 12 semanas; (b) fornecimento de material educativo personalizado; (c) geração de relatórios para o profissional responsável; (d) manutenção de trilha de auditoria conforme exigido pelo Conselho Federal de Medicina (CFM) para prontuários eletrônicos.',
  },
  {
    title: '4. Compartilhamento de Dados',
    text: 'Os dados serão acessíveis exclusivamente pelo paciente e pelo profissional de saúde responsável pelo programa. Não há compartilhamento com terceiros. Os dados não serão utilizados para pesquisa sem consentimento específico adicional. O acesso é controlado por regras rigorosas de controle de acesso baseado em papéis (RBAC).',
  },
  {
    title: '5. Direitos do Titular (LGPD)',
    text: 'Conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), o titular dos dados tem direito a: (a) confirmação da existência de tratamento; (b) acesso aos dados; (c) correção de dados incompletos, inexatos ou desatualizados; (d) anonimização, bloqueio ou eliminação de dados desnecessários; (e) portabilidade dos dados; (f) eliminação dos dados tratados com consentimento; (g) revogação do consentimento.',
  },
  {
    title: '6. Segurança da Informação',
    text: 'A plataforma implementa: criptografia de dados em trânsito (HTTPS/TLS), controle de acesso baseado em papéis, trilha de auditoria de todas as ações sensíveis, timeout de sessão por inatividade (30 minutos), e complexidade de senha obrigatória. O prazo de retenção dos dados segue as normas do CFM para prontuários médicos eletrônicos.',
  },
  {
    title: '7. Participação Voluntária',
    text: 'A participação no programa é voluntária. O paciente pode desistir a qualquer momento, sem prejuízo a qualquer atendimento. A revogação do consentimento implica na interrupção do uso da plataforma, mas os dados já coletados podem ser mantidos conforme exigências legais do CFM para registros médicos.',
  },
  {
    title: '8. Política de Privacidade',
    text: 'A Política de Privacidade completa está disponível e descreve em detalhes como coletamos, usamos, armazenamos e protegemos seus dados pessoais. Ao aceitar este termo, você declara ter lido e compreendido todos os termos aqui descritos, estando ciente de seus direitos e deveres no âmbito do programa.',
  },
]

interface Props {
  open: boolean
  onAccept: () => Promise<void>
}

export function ConsentModal({ open, onAccept }: Props) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const [accepting, setAccepting] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 20
    if (isAtBottom && !hasScrolledToBottom) setHasScrolledToBottom(true)
  }

  const handleAccept = async () => {
    setAccepting(true)
    try {
      await onAccept()
    } catch {
      setAccepting(false)
    }
  }

  return (
    <Dialog open={open}>
      <DialogContent
        className="max-w-2xl max-h-[92vh] flex flex-col p-0"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-6 pt-6 pb-2 shrink-0 border-b border-slate-100">
          <DialogTitle className="text-xl text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Termo de Consentimento Livre e Esclarecido
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Para continuar, leia e aceite o TCLE e a Política de Privacidade (LGPD).
          </DialogDescription>
        </DialogHeader>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
        >
          {TCLE_SECTIONS.map((section, i) => (
            <div key={i}>
              <h3 className="text-sm font-bold text-slate-800 mb-1">{section.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{section.text}</p>
            </div>
          ))}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-400 italic">
              Ao clicar em "Aceitar e Continuar", você concorda com todos os termos acima descritos,
              confirmando seu consentimento livre e esclarecido para o tratamento de seus dados
              pessoais no âmbito deste programa.
            </p>
          </div>
        </div>

        <div className="shrink-0 px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-lg">
          <div className="flex items-center gap-2 mb-3">
            {hasScrolledToBottom ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-xs text-emerald-600 font-medium">
                  Você leu todo o termo. Pode aceitar agora.
                </span>
              </>
            ) : (
              <>
                <Circle className="w-4 h-4 text-slate-300" />
                <span className="text-xs text-slate-400">
                  Role até o final para habilitar o botão de aceitação.
                </span>
              </>
            )}
          </div>
          <Button
            disabled={!hasScrolledToBottom || accepting}
            onClick={handleAccept}
            className={cn('w-full', hasScrolledToBottom && 'bg-primary hover:bg-primary/90')}
            size="lg"
          >
            {accepting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processando...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 mr-2" /> Aceitar e Continuar
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
