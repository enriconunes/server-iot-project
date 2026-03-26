import { Target, Server, Monitor, Bell, Database, Radio } from 'lucide-react'
import { useTheme } from '../ThemeContext'

export function SlideOverview() {
  const { theme } = useTheme()
  const d = theme === 'dark'

  const items = [
    { icon: Target, label: 'Sensor HC-SR04', desc: 'Mede distância com ultrassom', color: 'text-red-400' },
    { icon: Radio, label: 'MQTT Broker', desc: 'Comunicação pub/sub em tempo real', color: 'text-yellow-500' },
    { icon: Server, label: 'API Next.js', desc: 'REST API + Server-Side Rendering', color: 'text-blue-400' },
    { icon: Database, label: 'PostgreSQL', desc: 'Armazenamento persistente', color: 'text-purple-400' },
    { icon: Monitor, label: 'Dashboard', desc: 'Visualização radar + tabelas', color: 'text-emerald-500' },
    { icon: Bell, label: 'Alarme Automático', desc: 'Sino ativa quando distância < 20cm', color: 'text-orange-400' },
  ]

  return (
    <div className="flex flex-col items-center justify-center h-full px-16">
      <h2 className={`text-4xl font-bold mb-2 animate-fade-in-up ${d ? 'text-white' : 'text-gray-900'}`}>
        Visão Geral do Sistema
      </h2>
      <p className={`mb-12 animate-fade-in-up delay-100 ${d ? 'text-gray-400' : 'text-gray-500'}`}>
        Um ecossistema completo de IoT — do hardware ao frontend
      </p>

      <div className="grid grid-cols-3 gap-6 max-w-4xl w-full">
        {items.map((item, i) => (
          <div
            key={item.label}
            className={`animate-fade-in-up delay-${(i + 2) * 100} flex flex-col items-center gap-3 p-6 rounded-xl border backdrop-blur transition-all hover:scale-105 ${
              d ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-gray-200 hover:bg-gray-50 shadow-sm'
            }`}
          >
            <item.icon size={36} className={item.color} />
            <h3 className={`font-semibold ${d ? 'text-white' : 'text-gray-900'}`}>{item.label}</h3>
            <p className={`text-sm text-center ${d ? 'text-gray-400' : 'text-gray-500'}`}>{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
