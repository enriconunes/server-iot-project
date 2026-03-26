import { Database, Table, Key, Clock } from 'lucide-react'
import { useTheme } from '../ThemeContext'

export function SlideDatabase() {
  const { theme } = useTheme()
  const d = theme === 'dark'

  return (
    <div className="flex flex-col items-center justify-center h-full px-16">
      <div className="flex items-center gap-3 mb-2 animate-fade-in-up">
        <Database size={32} className="text-purple-400" />
        <h2 className={`text-4xl font-bold ${d ? 'text-white' : 'text-gray-900'}`}>PostgreSQL 16</h2>
      </div>
      <p className={`mb-10 animate-fade-in-up delay-100 ${d ? 'text-gray-400' : 'text-gray-500'}`}>
        Modelagem simples e eficiente — SQL puro, sem ORM
      </p>

      <div className="grid grid-cols-2 gap-8 max-w-5xl w-full">
        {/* sensor_readings */}
        <div className={`animate-fade-in-left delay-200 rounded-xl border border-blue-500/30 p-6 backdrop-blur ${d ? 'bg-white/5' : 'bg-white shadow-sm'}`}>
          <div className="flex items-center gap-2 mb-4">
            <Table size={18} className="text-blue-400" />
            <h3 className="font-bold text-blue-400 font-mono">sensor_readings</h3>
          </div>
          <div className="space-y-2">
            {[
              { col: 'id', type: 'UUID (v7)', icon: Key, color: 'text-yellow-400' },
              { col: 'distance', type: 'DOUBLE PRECISION', icon: null, color: '' },
              { col: 'angle', type: 'DOUBLE PRECISION', icon: null, color: '' },
              { col: 'unit', type: "VARCHAR(10) = 'cm'", icon: null, color: '' },
              { col: 'created_at', type: 'TIMESTAMPTZ', icon: Clock, color: 'text-emerald-400' },
            ].map(row => (
              <div key={row.col} className={`flex items-center justify-between p-2 rounded-lg ${d ? 'bg-black/20' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2">
                  {row.icon && <row.icon size={12} className={row.color} />}
                  <span className={`font-mono text-sm ${d ? 'text-white' : 'text-gray-900'}`}>{row.col}</span>
                </div>
                <span className={`text-xs font-mono ${d ? 'text-gray-400' : 'text-gray-500'}`}>{row.type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* bell_state */}
        <div className="animate-fade-in-right delay-300">
          <div className={`rounded-xl border border-orange-500/30 p-6 backdrop-blur mb-6 ${d ? 'bg-white/5' : 'bg-white shadow-sm'}`}>
            <div className="flex items-center gap-2 mb-4">
              <Table size={18} className="text-orange-400" />
              <h3 className="font-bold text-orange-400 font-mono">bell_state</h3>
            </div>
            <div className="space-y-2">
              {[
                { col: 'id', type: 'INTEGER = 1', icon: Key, color: 'text-yellow-400' },
                { col: 'active', type: 'BOOLEAN = false', icon: null, color: '' },
                { col: 'updated_at', type: 'TIMESTAMPTZ', icon: Clock, color: 'text-emerald-400' },
              ].map(row => (
                <div key={row.col} className={`flex items-center justify-between p-2 rounded-lg ${d ? 'bg-black/20' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-2">
                    {row.icon && <row.icon size={12} className={row.color} />}
                    <span className={`font-mono text-sm ${d ? 'text-white' : 'text-gray-900'}`}>{row.col}</span>
                  </div>
                  <span className={`text-xs font-mono ${d ? 'text-gray-400' : 'text-gray-500'}`}>{row.type}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-xl border border-emerald-500/30 p-5 backdrop-blur ${d ? 'bg-white/5' : 'bg-white shadow-sm'}`}>
            <h3 className="text-sm font-bold text-emerald-500 mb-3">Decisões Técnicas</h3>
            <ul className={`space-y-2 text-xs ${d ? 'text-gray-400' : 'text-gray-500'}`}>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">•</span>
                <span><b className={d ? 'text-white' : 'text-gray-900'}>UUID v7</b> — ordenável cronologicamente, ideal para SSE polling</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">•</span>
                <span><b className={d ? 'text-white' : 'text-gray-900'}>SQL puro</b> — sem Prisma/ORM, queries parametrizadas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">•</span>
                <span><b className={d ? 'text-white' : 'text-gray-900'}>Connection Pool</b> — pg.Pool para performance</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
