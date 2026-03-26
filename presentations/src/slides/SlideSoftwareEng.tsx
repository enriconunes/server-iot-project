import { useTheme } from '../ThemeContext'
import { Layers, GitBranch, Package, Cpu } from 'lucide-react'

export function SlideSoftwareEng() {
  const { theme } = useTheme()
  const d = theme === 'dark'

  const pillars = [
    {
      icon: Layers,
      color: 'text-blue-400',
      border: 'border-blue-500/30',
      bg: d ? 'bg-blue-500/8' : 'bg-blue-50',
      title: 'Arquitetura Hexagonal',
      items: [
        'Sensor Python isolado em Ports & Adapters',
        'Adapter real (HC-SR04) e simulado intercambiáveis',
        'Publisher HTTP e MQTT desacoplados',
      ],
    },
    {
      icon: GitBranch,
      color: 'text-purple-400',
      border: 'border-purple-500/30',
      bg: d ? 'bg-purple-500/8' : 'bg-purple-50',
      title: 'API & Tempo Real',
      items: [
        'Next.js 16 App Router — REST + SSE',
        'SSE push de leituras ao browser (sem polling)',
        'Auth por x-api-key em todas as rotas',
      ],
    },
    {
      icon: Package,
      color: 'text-orange-400',
      border: 'border-orange-500/30',
      bg: d ? 'bg-orange-500/8' : 'bg-orange-50',
      title: 'Containerização',
      items: [
        'Docker Compose com 5 serviços',
        'Nginx como reverse proxy',
        'Replicável em qualquer ambiente',
      ],
    },
    {
      icon: Cpu,
      color: 'text-emerald-400',
      border: 'border-emerald-500/30',
      bg: d ? 'bg-emerald-500/8' : 'bg-emerald-50',
      title: 'Frontend & Análise',
      items: [
        'React 19 + TypeScript + Canvas API',
        'KDE 2D Gaussiano para previsão (servidor)',
        'Heatmap polar e radar live no browser',
      ],
    },
  ]

  const stack = [
    { cat: 'Hardware', items: 'HC-SR04 · Servo · Raspberry Pi' },
    { cat: 'Edge', items: 'Python · paho-mqtt · gpiozero' },
    { cat: 'Broker', items: 'MQTT Broker (Eclipse Mosquitto)' },
    { cat: 'Backend', items: 'Next.js 16 · pg · uuid-v7' },
    { cat: 'BD', items: 'PostgreSQL 16' },
    { cat: 'Frontend', items: 'React 19 · Tailwind · shadcn/ui' },
    { cat: 'Infra', items: 'Docker · Nginx' },
  ]

  return (
    <div className="flex flex-col items-center justify-center h-full px-16">
      <p className={`text-xs uppercase tracking-widest mb-2 animate-fade-in-up ${d ? 'text-emerald-500' : 'text-emerald-600'}`}>
        04 — Engenharia de Software
      </p>
      <h2 className={`text-4xl font-bold mb-8 animate-fade-in-up delay-100 ${d ? 'text-white' : 'text-gray-900'}`}>
        Decisões de Desenho
      </h2>

      <div className="grid grid-cols-2 gap-4 max-w-5xl w-full mb-6">
        {pillars.map((p, i) => (
          <div
            key={p.title}
            className={`animate-fade-in-up rounded-xl border ${p.border} ${p.bg} p-4 backdrop-blur`}
            style={{ animationDelay: `${(i + 2) * 0.1}s` }}
          >
            <div className="flex items-center gap-2 mb-3">
              <p.icon size={18} className={p.color} />
              <h3 className={`font-semibold text-sm ${d ? 'text-white' : 'text-gray-900'}`}>{p.title}</h3>
            </div>
            <ul className="space-y-1.5">
              {p.items.map(item => (
                <li key={item} className={`flex items-start gap-2 text-xs ${d ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span className={`w-1 h-1 rounded-full ${p.color.replace('text-', 'bg-')} mt-1.5 shrink-0`} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Stack row */}
      <div className="flex flex-wrap justify-center gap-2 animate-fade-in-up delay-600 max-w-5xl">
        {stack.map(s => (
          <div
            key={s.cat}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs ${
              d ? 'border-white/10 bg-white/5 text-gray-300' : 'border-gray-200 bg-white text-gray-600 shadow-sm'
            }`}
          >
            <span className={`font-bold ${d ? 'text-emerald-400' : 'text-emerald-600'}`}>{s.cat}:</span>
            <span>{s.items}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
