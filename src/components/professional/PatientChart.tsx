import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { PRO_MOCK } from '@/lib/mock'

const chartConfig = {
  humor: { label: 'Humor', color: 'hsl(var(--chart-1))' },
  sono: { label: 'Sono', color: 'hsl(var(--chart-2))' },
  energia: { label: 'Energia', color: 'hsl(var(--chart-3))' },
  irritabilidade: { label: 'Irritabilidade', color: 'hsl(var(--chart-4))' },
}

export function PatientChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={PRO_MOCK.chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis
            dataKey="week"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b' }}
            dy={10}
          />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} domain={[0, 10]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Line
            type="monotone"
            dataKey="humor"
            stroke="var(--color-humor)"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="sono"
            stroke="var(--color-sono)"
            strokeWidth={3}
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="energia"
            stroke="var(--color-energia)"
            strokeWidth={3}
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="irritabilidade"
            stroke="var(--color-irritabilidade)"
            strokeWidth={3}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
