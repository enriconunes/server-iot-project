import { Bell, BellRing, Ruler, Cpu } from 'lucide-react'
import { useTheme } from '../ThemeContext'

export function SlideBell() {
  const { theme } = useTheme()
  const d = theme === 'dark'

  return (
    <div className="flex flex-col items-center justify-center h-full px-16">
      <h2 className={`text-4xl font-bold mb-2 animate-fade-in-up ${d ? 'text-white' : 'text-gray-900'}`}>
        Sistema de Alarme
      </h2>
      <p className={`mb-10 animate-fade-in-up delay-100 ${d ? 'text-gray-400' : 'text-gray-500'}`}>
        Sino automático baseado na distância do sensor
      </p>

      <div className="grid grid-cols-3 gap-6 max-w-5xl w-full">
        {/* Logic */}
        <div className={`animate-fade-in-up delay-200 rounded-xl border border-orange-500/30 p-6 backdrop-blur ${d ? 'bg-white/5' : 'bg-white shadow-sm'}`}>
          <div className="flex items-center gap-2 mb-4">
            <Ruler size={20} className="text-orange-400" />
            <h3 className="font-bold text-orange-400">Lógica</h3>
          </div>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
              <div className="flex items-center gap-2 mb-2">
                <BellRing size={20} className="text-red-400 animate-blink" />
                <span className="font-bold text-red-400 text-sm">ATIVO</span>
              </div>
              <p className={`text-xs ${d ? 'text-gray-400' : 'text-gray-500'}`}>Distância &lt; 20cm</p>
              <p className={`text-xs mt-1 ${d ? 'text-gray-500' : 'text-gray-400'}`}>Objeto detectado próximo</p>
            </div>
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Bell size={20} className="text-emerald-400" />
                <span className="font-bold text-emerald-400 text-sm">INATIVO</span>
              </div>
              <p className={`text-xs ${d ? 'text-gray-400' : 'text-gray-500'}`}>Distância ≥ 20cm</p>
              <p className={`text-xs mt-1 ${d ? 'text-gray-500' : 'text-gray-400'}`}>Nada detectado</p>
            </div>
          </div>
        </div>

        {/* Flow */}
        <div className={`animate-fade-in-up delay-300 rounded-xl border border-blue-500/30 p-6 backdrop-blur ${d ? 'bg-white/5' : 'bg-white shadow-sm'}`}>
          <h3 className="font-bold text-blue-400 mb-4">Fluxo</h3>
          <div className="space-y-3 text-sm">
            {[
              { step: '1', text: 'Sensor lê distância', color: 'bg-red-500/20 border-red-500/40' },
              { step: '2', text: 'POST /api/sensor recebe', color: 'bg-blue-500/20 border-blue-500/40' },
              { step: '3', text: 'Checa: distance < 20?', color: 'bg-yellow-500/20 border-yellow-500/40' },
              { step: '4', text: 'UPDATE bell_state', color: 'bg-purple-500/20 border-purple-500/40' },
              { step: '5', text: 'SSE broadcast para UI', color: 'bg-emerald-500/20 border-emerald-500/40' },
              { step: '6', text: 'Dashboard anima o sino', color: 'bg-orange-500/20 border-orange-500/40' },
            ].map(s => (
              <div key={s.step} className={`flex items-center gap-3 p-2 rounded-lg border ${s.color}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${d ? 'bg-white/10' : 'bg-black/5'}`}>{s.step}</span>
                <span className={`text-xs ${d ? 'text-gray-300' : 'text-gray-600'}`}>{s.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Physical button */}
        <div className={`animate-fade-in-up delay-400 rounded-xl border border-purple-500/30 p-6 backdrop-blur ${d ? 'bg-white/5' : 'bg-white shadow-sm'}`}>
          <div className="flex items-center gap-2 mb-4">
            <Cpu size={20} className="text-purple-400" />
            <h3 className="font-bold text-purple-400">Botão Físico</h3>
          </div>
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${d ? 'bg-black/30' : 'bg-gray-50'}`}>
              <p className={`text-xs mb-2 ${d ? 'text-gray-400' : 'text-gray-500'}`}>GPIO 27 — Pull-up</p>
              <p className={`text-xs mb-2 ${d ? 'text-gray-400' : 'text-gray-500'}`}>Debounce: 300ms</p>
              <pre className="text-xs font-mono text-purple-400 mt-3 leading-relaxed">
{`button = Button(
  pin=27,
  pull_up=True,
  bounce_time=0.3
)
button.when_pressed =
  toggle_bell`}
              </pre>
            </div>
            <p className={`text-xs text-center ${d ? 'text-gray-500' : 'text-gray-400'}`}>
              Permite toggle manual do alarme diretamente no Raspberry Pi
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
