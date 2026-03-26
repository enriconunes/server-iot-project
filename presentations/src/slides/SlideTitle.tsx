import { Radar, Wifi, Activity } from 'lucide-react'
import { useTheme } from '../ThemeContext'

export function SlideTitle() {
  const { theme } = useTheme()
  const d = theme === 'dark'

  return (
    <div className="flex flex-col items-center justify-center h-full px-8">
      {/* Radar animation */}
      <div className="relative w-40 h-40 mb-8 animate-fade-in-up">
        <div className={`absolute inset-0 rounded-full border-2 ${d ? 'border-emerald-500/20' : 'border-emerald-500/30'}`} />
        <div className={`absolute inset-4 rounded-full border ${d ? 'border-emerald-500/15' : 'border-emerald-500/25'}`} />
        <div className={`absolute inset-8 rounded-full border ${d ? 'border-emerald-500/10' : 'border-emerald-500/20'}`} />
        <div className="absolute top-1/2 left-1/2 w-0 h-0 animate-sweep">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-[70px] bg-gradient-to-t from-transparent to-emerald-500 rounded-full" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse-glow" />
        </div>
      </div>

      <h1 className="text-6xl font-bold bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 bg-clip-text text-transparent animate-fade-in-up delay-200 mb-4">
        IoT Radar System
      </h1>

      <p className={`text-xl animate-fade-in-up delay-300 mb-2 ${d ? 'text-gray-400' : 'text-gray-600'}`}>
        Sistema de Monitoramento com Sensor Ultrassônico
      </p>
      <p className={`text-sm animate-fade-in-up delay-400 mb-12 ${d ? 'text-gray-500' : 'text-gray-400'}`}>
        HC-SR04 + Raspberry Pi + Docker + Next.js
      </p>

      <div className="flex gap-8 animate-fade-in-up delay-500">
        {[
          { icon: Radar, label: 'Radar em Tempo Real' },
          { icon: Wifi, label: 'MQTT Protocol' },
          { icon: Activity, label: 'Live Dashboard' },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className={`flex items-center gap-2 ${d ? 'text-emerald-400/60' : 'text-emerald-600/70'}`}>
            <Icon size={18} />
            <span className="text-sm">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
