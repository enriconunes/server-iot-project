import { ArrowDown } from 'lucide-react'
import { useTheme } from '../ThemeContext'

export function SlideDataFlow() {
  const { theme } = useTheme()
  const d = theme === 'dark'

  const steps = [
    { emoji: '📡', title: 'Leitura do Sensor', desc: 'HC-SR04 emite pulso ultrassônico e mede o eco', detail: 'Alcance: 2cm – 400cm | Frequência: 40kHz', color: 'border-red-500/40' },
    { emoji: '📤', title: 'Publicação MQTT', desc: 'Sensor publica no tópico radar/distance', detail: '{ distance, angle, timestamp, source }', color: 'border-yellow-500/40' },
    { emoji: '📥', title: 'MQTT Worker Recebe', desc: 'Subscriber Python consome a mensagem', detail: 'Ponte MQTT → HTTP (POST /api/sensor)', color: 'border-orange-500/40' },
    { emoji: '💾', title: 'Persistência', desc: 'API valida e salva no PostgreSQL', detail: 'UUID v7 + auto bell check (< 20cm)', color: 'border-blue-500/40' },
    { emoji: '📡', title: 'Broadcast SSE', desc: 'Server-Sent Events envia para o browser', detail: 'Polling a cada 500ms | id > lastId', color: 'border-purple-500/40' },
    { emoji: '🖥️', title: 'Renderização', desc: 'Dashboard atualiza radar canvas em tempo real', detail: 'Blips animados + cores por zona de distância', color: 'border-emerald-500/40' },
  ]

  return (
    <div className="flex flex-col items-center justify-center h-full px-16">
      <h2 className={`text-4xl font-bold mb-2 animate-fade-in-up ${d ? 'text-white' : 'text-gray-900'}`}>
        Fluxo de Dados
      </h2>
      <p className={`mb-8 animate-fade-in-up delay-100 ${d ? 'text-gray-400' : 'text-gray-500'}`}>
        Do mundo real ao pixel na tela
      </p>

      <div className="flex flex-col items-center gap-1 max-w-xl">
        {steps.map((step, i) => (
          <div key={step.title} className={`animate-fade-in-up delay-${(i + 2) * 100}`}>
            <div className={`flex items-start gap-4 p-4 rounded-xl border backdrop-blur w-[520px] ${step.color} ${
              d ? 'bg-white/5' : 'bg-white shadow-sm'
            }`}>
              <span className="text-2xl mt-0.5">{step.emoji}</span>
              <div>
                <h3 className={`font-semibold text-sm ${d ? 'text-white' : 'text-gray-900'}`}>{step.title}</h3>
                <p className={`text-xs ${d ? 'text-gray-400' : 'text-gray-500'}`}>{step.desc}</p>
                <p className={`text-xs font-mono mt-1 ${d ? 'text-gray-600' : 'text-gray-400'}`}>{step.detail}</p>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className="flex justify-center py-0.5">
                <ArrowDown size={16} className={d ? 'text-gray-600' : 'text-gray-400'} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
