export const PATIENT_MOCK = {
  name: 'Rafael',
  currentWeek: 4,
  progress: 33,
  medals: [
    { id: 1, name: 'Início', desc: 'Completou a Semana 0', earned: true, icon: 'Award' },
    { id: 2, name: 'Constância', desc: '2 forms seguidos', earned: true, icon: 'Flame' },
    { id: 3, name: 'Autocuidado', desc: 'Leu 3 materiais', earned: false, icon: 'BookOpen' },
    { id: 4, name: 'Acompanhamento', desc: '12 semanas concluídas', earned: false, icon: 'Trophy' },
  ],
  questionnaires: [
    { week: 0, status: 'completed', date: '01/06/2026' },
    { week: 2, status: 'completed', date: '15/06/2026' },
    { week: 4, status: 'pending', date: null },
    { week: 6, status: 'locked', date: null },
    { week: 8, status: 'locked', date: null },
    { week: 10, status: 'locked', date: null },
    { week: 12, status: 'locked', date: null },
  ],
  library: [
    {
      id: 1,
      title: 'Entendendo as Mudanças de Humor',
      category: 'Básico',
      read: true,
      image: 'https://img.usecurling.com/p/400/200?q=mind&color=blue',
    },
    {
      id: 2,
      title: 'Higiene do Sono e Estabilidade',
      category: 'Rotina',
      read: true,
      image: 'https://img.usecurling.com/p/400/200?q=sleep&color=purple',
    },
    {
      id: 3,
      title: 'Gerenciando Gatilhos Comuns',
      category: 'Prevenção',
      read: false,
      image: 'https://img.usecurling.com/p/400/200?q=shield&color=green',
    },
  ],
}

export const PRO_MOCK = {
  patients: [
    {
      id: '1',
      name: 'Rafael Costa',
      week: 4,
      status: 'attention',
      lastActive: 'Hoje',
      risk: 'Alto',
    },
    { id: '2', name: 'Maria Souza', week: 8, status: 'ok', lastActive: 'Ontem', risk: 'Baixo' },
    {
      id: '3',
      name: 'João Silva',
      week: 2,
      status: 'pending',
      lastActive: 'Há 3 dias',
      risk: 'Médio',
    },
    { id: '4', name: 'Ana Pereira', week: 12, status: 'ok', lastActive: 'Hoje', risk: 'Baixo' },
  ],
  chartData: [
    { week: 'S0', humor: 4, sono: 3, energia: 5, irritabilidade: 8 },
    { week: 'S2', humor: 6, sono: 5, energia: 6, irritabilidade: 6 },
    { week: 'S4', humor: 5, sono: 4, energia: 8, irritabilidade: 7 },
  ],
}
