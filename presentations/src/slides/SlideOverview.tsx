import { Target, MapPin, BarChart2, MessageSquare, Radio } from 'lucide-react'
import { useTheme } from '../ThemeContext'

export function SlideOverview() {
  const { theme } = useTheme()
  const d = theme === 'dark'

  const objectives = [
    {
      icon: Radio,
      color: 'text-emerald-400',
      border: 'border-emerald-500/30',
      bg: d ? 'bg-emerald-500/8' : 'bg-emerald-50',
      title: 'Deteção em Tempo Real',
      desc: 'Sensor HC-SR04 rotativo (360°) que mede distância e ângulo de objetos dentro de um raio configurável.',
    },
    {
      icon: MapPin,
      color: 'text-blue-400',
      border: 'border-blue-500/30',
      bg: d ? 'bg-blue-500/8' : 'bg-blue-50',
      title: 'Mapeamento 2D',
      desc: 'Cada deteção (distância + ângulo + timestamp) é persistida. O dashboard visualiza um radar live e um heatmap histórico polar.',
    },
    {
      icon: BarChart2,
      color: 'text-yellow-400',
      border: 'border-yellow-500/30',
      bg: d ? 'bg-yellow-500/8' : 'bg-yellow-50',
      title: 'Análise Estatística',
      desc: 'Modelo KDE 2D (Kernel Density Estimation) Gaussiano estima as zonas de maior probabilidade de deteção futura.',
    },
    {
      icon: MessageSquare,
      color: 'text-purple-400',
      border: 'border-purple-500/30',
      bg: d ? 'bg-purple-500/8' : 'bg-purple-50',
      title: 'Alertas por SMS',
      desc: 'Cada deteção regista automaticamente uma entrada de SMS (Twilio) com horário, distância e ângulo. Histórico visível no dashboard.',
    },
  ]

  return (
    <div className="flex flex-col items-center justify-center h-full px-16">
      <p className={`text-xs uppercase tracking-widest mb-2 animate-fade-in-up ${d ? 'text-emerald-500' : 'text-emerald-600'}`}>
        01 — Introdução &amp; Objetivo
      </p>
      <h2 className={`text-4xl font-bold mb-2 animate-fade-in-up delay-100 ${d ? 'text-white' : 'text-gray-900'}`}>
        O que queremos resolver?
      </h2>
      <p className={`mb-10 text-center max-w-xl animate-fade-in-up delay-200 ${d ? 'text-gray-400' : 'text-gray-500'}`}>
        Monitorar um espaço físico 360° de forma económica, em tempo real e com análise histórica — sem câmaras e sem equipamento industrial caro.
      </p>

      <div className="grid grid-cols-2 gap-5 max-w-4xl w-full">
        {objectives.map((o, i) => (
          <div
            key={o.title}
            className={`animate-fade-in-up flex gap-4 p-5 rounded-xl border ${o.border} ${o.bg} backdrop-blur`}
            style={{ animationDelay: `${(i + 3) * 0.1}s` }}
          >
            <o.icon size={24} className={`${o.color} shrink-0 mt-0.5`} />
            <div>
              <h3 className={`font-semibold mb-1 ${d ? 'text-white' : 'text-gray-900'}`}>{o.title}</h3>
              <p className={`text-sm leading-relaxed ${d ? 'text-gray-400' : 'text-gray-500'}`}>{o.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={`mt-8 flex items-center gap-2 animate-fade-in-up delay-700 text-xs ${d ? 'text-gray-500' : 'text-gray-400'}`}>
        <Target size={13} />
        <span>Hardware: HC-SR04 (~3 €) + Servo motor + Raspberry Pi</span>
      </div>
    </div>
  )
}
