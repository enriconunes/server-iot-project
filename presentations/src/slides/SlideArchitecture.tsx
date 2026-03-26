import { Cpu, Wifi, Server, Database, Monitor, ArrowRight } from 'lucide-react'
import { useTheme } from '../ThemeContext'

export function SlideArchitecture() {
  const { theme } = useTheme()
  const d = theme === 'dark'

  const layers = [
    { icon: Cpu, label: 'Sensor HC-SR04', sub: 'Raspberry Pi + Python', color: 'bg-red-500/20 border-red-500/40 text-red-400' },
    { icon: Wifi, label: 'MQTT Broker', sub: 'Mosquitto', color: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400' },
    { icon: Server, label: 'MQTT Worker', sub: 'Python Subscriber', color: 'bg-orange-500/20 border-orange-500/40 text-orange-400' },
    { icon: Server, label: 'API Next.js', sub: 'REST + SSE', color: 'bg-blue-500/20 border-blue-500/40 text-blue-400' },
    { icon: Database, label: 'PostgreSQL', sub: 'Persistência', color: 'bg-purple-500/20 border-purple-500/40 text-purple-400' },
    { icon: Monitor, label: 'Dashboard', sub: 'React + Canvas', color: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' },
  ]

  return (
    <div className="flex flex-col items-center justify-center h-full px-16">
      <h2 className={`text-4xl font-bold mb-2 animate-fade-in-up ${d ? 'text-white' : 'text-gray-900'}`}>
        Arquitetura do Sistema
      </h2>
      <p className={`mb-12 animate-fade-in-up delay-100 ${d ? 'text-gray-400' : 'text-gray-500'}`}>
        Pipeline completo do sensor ao navegador
      </p>

      <div className="flex items-center gap-2 animate-fade-in-up delay-200">
        {layers.map((layer, i) => (
          <div key={layer.label} className="flex items-center gap-2">
            <div className={`flex flex-col items-center gap-2 p-5 rounded-xl border backdrop-blur ${layer.color} min-w-[130px]`}>
              <layer.icon size={28} />
              <span className={`text-sm font-semibold ${d ? 'text-white' : 'text-gray-900'}`}>{layer.label}</span>
              <span className="text-xs opacity-60">{layer.sub}</span>
            </div>
            {i < layers.length - 1 && (
              <ArrowRight size={20} className={d ? 'text-gray-600' : 'text-gray-400'} />
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 max-w-3xl w-full animate-fade-in-up delay-400">
        <div className={`rounded-xl border p-6 ${d ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
          <h3 className="text-sm font-bold text-emerald-500 mb-3">NGINX — Reverse Proxy</h3>
          <div className="grid grid-cols-4 gap-3">
            {[
              { sub: 'app.localhost', to: 'Dashboard (SSR)' },
              { sub: 'api.localhost', to: 'API Routes' },
              { sub: 'simulator.localhost', to: 'Canvas Simulator' },
              { sub: 'mqtt.localhost', to: 'WebSocket (9001)' },
            ].map(r => (
              <div key={r.sub} className={`text-center p-3 rounded-lg ${d ? 'bg-white/5' : 'bg-gray-50'}`}>
                <p className="text-xs font-mono text-emerald-500">{r.sub}</p>
                <p className={`text-xs mt-1 ${d ? 'text-gray-500' : 'text-gray-400'}`}>{r.to}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
