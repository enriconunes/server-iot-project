import { Radio, ArrowRight } from 'lucide-react'
import { useTheme } from '../ThemeContext'

export function SlideMQTT() {
  const { theme } = useTheme()
  const d = theme === 'dark'

  return (
    <div className="flex flex-col items-center justify-center h-full px-16">
      <div className="flex items-center gap-3 mb-2 animate-fade-in-up">
        <Radio size={32} className="text-yellow-500" />
        <h2 className={`text-4xl font-bold ${d ? 'text-white' : 'text-gray-900'}`}>Protocolo MQTT</h2>
      </div>
      <p className={`mb-10 animate-fade-in-up delay-100 ${d ? 'text-gray-400' : 'text-gray-500'}`}>
        Comunicação leve e assíncrona — padrão da indústria IoT
      </p>

      <div className="grid grid-cols-2 gap-8 max-w-5xl w-full">
        <div className="animate-fade-in-left delay-200 space-y-4">
          {/* Broker */}
          <div className={`rounded-xl border border-yellow-500/30 p-6 backdrop-blur ${d ? 'bg-white/5' : 'bg-white shadow-sm'}`}>
            <h3 className="text-lg font-bold text-yellow-500 mb-4">Eclipse Mosquitto 2</h3>
            <div className="space-y-3">
              {[
                ['Porta Nativa', '1883'],
                ['WebSocket', '9001'],
                ['Autenticação', 'Anônima'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className={d ? 'text-gray-400' : 'text-gray-500'}>{label}</span>
                  <span className={`font-mono ${d ? 'text-white' : 'text-gray-900'}`}>{value}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm">
                <span className={d ? 'text-gray-400' : 'text-gray-500'}>QoS</span>
                <span className="font-mono text-emerald-500">1 (at least once)</span>
              </div>
            </div>
          </div>

          {/* Topic */}
          <div className={`rounded-xl border border-emerald-500/30 p-6 backdrop-blur ${d ? 'bg-white/5' : 'bg-white shadow-sm'}`}>
            <h3 className="text-sm font-bold text-emerald-500 mb-3">Tópico</h3>
            <div className={`p-3 rounded-lg font-mono text-emerald-500 text-center text-lg ${d ? 'bg-black/30' : 'bg-emerald-50'}`}>
              radar/distance
            </div>
          </div>
        </div>

        <div className="animate-fade-in-right delay-300 space-y-4">
          {/* Message format */}
          <div className={`rounded-xl border border-blue-500/30 p-6 backdrop-blur ${d ? 'bg-white/5' : 'bg-white shadow-sm'}`}>
            <h3 className="text-lg font-bold text-blue-400 mb-4">Payload JSON</h3>
            <pre className={`p-4 rounded-lg text-sm font-mono leading-relaxed ${d ? 'bg-black/40' : 'bg-gray-50'}`}>
              <span className={d ? 'text-gray-500' : 'text-gray-400'}>{'{'}</span>{'\n'}
              <span className="text-purple-400">  "distance"</span>: <span className="text-emerald-500">15.5</span>,{'\n'}
              <span className="text-purple-400">  "angle"</span>: <span className="text-emerald-500">45.0</span>,{'\n'}
              <span className="text-purple-400">  "timestamp"</span>: <span className="text-yellow-500">"2026-03-26T..."</span>,{'\n'}
              <span className="text-purple-400">  "source"</span>: <span className="text-yellow-500">"hcsr04"</span>{'\n'}
              <span className={d ? 'text-gray-500' : 'text-gray-400'}>{'}'}</span>
            </pre>
          </div>

          {/* Pub/Sub flow */}
          <div className={`rounded-xl border p-5 backdrop-blur ${d ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
            <h3 className={`text-sm font-bold mb-3 ${d ? 'text-gray-300' : 'text-gray-700'}`}>Publish / Subscribe</h3>
            <div className="flex items-center justify-between text-xs">
              <div className="text-center">
                <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 mb-1">
                  <span className="text-red-400">Sensor</span>
                </div>
                <span className={d ? 'text-gray-500' : 'text-gray-400'}>Publisher</span>
              </div>
              <ArrowRight size={16} className={d ? 'text-gray-600' : 'text-gray-400'} />
              <div className="text-center">
                <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 mb-1">
                  <span className="text-yellow-500">Mosquitto</span>
                </div>
                <span className={d ? 'text-gray-500' : 'text-gray-400'}>Broker</span>
              </div>
              <ArrowRight size={16} className={d ? 'text-gray-600' : 'text-gray-400'} />
              <div className="text-center">
                <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/30 mb-1">
                  <span className="text-orange-400">Worker</span>
                </div>
                <span className={d ? 'text-gray-500' : 'text-gray-400'}>Subscriber</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
