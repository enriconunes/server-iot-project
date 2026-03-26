import { Radar, BarChart3, Table2, Bell, Palette } from 'lucide-react'
import { useTheme } from '../ThemeContext'

export function SlideDashboard() {
  const { theme } = useTheme()
  const d = theme === 'dark'

  return (
    <div className="flex flex-col items-center justify-center h-full px-16">
      <h2 className={`text-4xl font-bold mb-2 animate-fade-in-up ${d ? 'text-white' : 'text-gray-900'}`}>
        Dashboard em Tempo Real
      </h2>
      <p className={`mb-10 animate-fade-in-up delay-100 ${d ? 'text-gray-400' : 'text-gray-500'}`}>
        Interface rica com React 19 + Canvas HTML5
      </p>

      <div className="grid grid-cols-2 gap-6 max-w-5xl w-full">
        {/* Radar Canvas */}
        <div className={`animate-fade-in-left delay-200 rounded-xl border border-emerald-500/30 p-6 ${d ? 'bg-white/5' : 'bg-white shadow-sm'}`}>
          <div className="flex items-center gap-2 mb-4">
            <Radar size={20} className="text-emerald-500" />
            <h3 className="font-bold text-emerald-500">Radar Canvas</h3>
          </div>
          <div className="relative w-48 h-48 mx-auto mb-4">
            <div className={`absolute inset-0 rounded-full border ${d ? 'border-emerald-500/20' : 'border-emerald-500/30'}`} />
            <div className={`absolute inset-6 rounded-full border ${d ? 'border-emerald-500/15' : 'border-emerald-500/25'}`} />
            <div className={`absolute inset-12 rounded-full border ${d ? 'border-emerald-500/10' : 'border-emerald-500/20'}`} />
            <div className="absolute top-1/2 left-1/2 w-0 h-0 animate-sweep">
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-[85px] bg-gradient-to-t from-transparent to-emerald-500/80 rounded-full" />
            </div>
            <div className="absolute top-8 right-12 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <div className="absolute bottom-16 left-10 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            <div className="absolute top-20 left-20 w-2 h-2 bg-red-400 rounded-full animate-blink" />
          </div>
          <ul className={`text-xs space-y-1 ${d ? 'text-gray-400' : 'text-gray-500'}`}>
            <li>400x400px com animação contínua</li>
            <li>Blips com fade de 3 segundos</li>
            <li>Linha de varredura rotativa</li>
          </ul>
        </div>

        {/* Features */}
        <div className="space-y-4 animate-fade-in-right delay-300">
          {[
            { icon: BarChart3, title: 'Cards de Estatísticas', desc: 'Total, média, mínima e máxima distância', color: 'text-blue-400', border: 'border-blue-500/30' },
            { icon: Table2, title: 'Tabela de Leituras', desc: 'Paginada, ordenável, com tempo relativo', color: 'text-purple-400', border: 'border-purple-500/30' },
            { icon: Bell, title: 'Estado do Sino', desc: 'Animação + glow quando ativo', color: 'text-orange-400', border: 'border-orange-500/30' },
            { icon: Palette, title: 'Zonas de Cor', desc: 'Verde (>50cm) · Amarelo (20-50) · Vermelho (<20)', color: 'text-emerald-500', border: 'border-emerald-500/30' },
          ].map(f => (
            <div key={f.title} className={`flex items-start gap-4 p-4 rounded-xl border ${f.border} backdrop-blur ${
              d ? 'bg-white/5' : 'bg-white shadow-sm'
            }`}>
              <f.icon size={24} className={f.color} />
              <div>
                <h4 className={`font-semibold text-sm ${d ? 'text-white' : 'text-gray-900'}`}>{f.title}</h4>
                <p className={`text-xs mt-0.5 ${d ? 'text-gray-400' : 'text-gray-500'}`}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
