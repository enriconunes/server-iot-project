import { Container, Play, Square } from 'lucide-react'
import { useTheme } from '../ThemeContext'

export function SlideDocker() {
  const { theme } = useTheme()
  const d = theme === 'dark'

  const services = [
    { name: 'postgres', tech: 'PostgreSQL 16', port: '5432', color: 'bg-purple-500/20 border-purple-500/40', dot: 'bg-purple-400' },
    { name: 'mosquitto', tech: 'Eclipse Mosquitto 2', port: '1883, 9001', color: 'bg-yellow-500/20 border-yellow-500/40', dot: 'bg-yellow-400' },
    { name: 'dashboard', tech: 'Next.js 16 + Node 22', port: '3000', color: 'bg-blue-500/20 border-blue-500/40', dot: 'bg-blue-400' },
    { name: 'sensor', tech: 'Python 3.12', port: '—', color: 'bg-red-500/20 border-red-500/40', dot: 'bg-red-400' },
    { name: 'mqtt-worker', tech: 'Python 3.12', port: '—', color: 'bg-orange-500/20 border-orange-500/40', dot: 'bg-orange-400' },
    { name: 'simulator', tech: 'Python + Canvas', port: '8080', color: 'bg-teal-500/20 border-teal-500/40', dot: 'bg-teal-400' },
    { name: 'nginx', tech: 'Nginx Alpine', port: '80', color: 'bg-emerald-500/20 border-emerald-500/40', dot: 'bg-emerald-400' },
  ]

  return (
    <div className="flex flex-col items-center justify-center h-full px-16">
      <div className="flex items-center gap-3 mb-2 animate-fade-in-up">
        <Container size={36} className="text-blue-400" />
        <h2 className={`text-4xl font-bold ${d ? 'text-white' : 'text-gray-900'}`}>Docker Compose</h2>
      </div>
      <p className={`mb-8 animate-fade-in-up delay-100 ${d ? 'text-gray-400' : 'text-gray-500'}`}>
        7 serviços orquestrados em containers
      </p>

      <div className="grid grid-cols-4 gap-3 max-w-5xl w-full mb-8">
        {services.map((svc, i) => (
          <div
            key={svc.name}
            className={`animate-fade-in-up delay-${(i + 2) * 100} p-4 rounded-xl border backdrop-blur ${svc.color} ${
              i === 6 ? 'col-span-4 flex items-center justify-between' : ''
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${svc.dot} animate-pulse`} />
              <span className={`font-mono text-sm font-bold ${d ? 'text-white' : 'text-gray-900'}`}>{svc.name}</span>
            </div>
            <p className={`text-xs ${d ? 'text-gray-400' : 'text-gray-500'}`}>{svc.tech}</p>
            {svc.port !== '—' && (
              <p className={`text-xs font-mono mt-1 ${d ? 'text-gray-500' : 'text-gray-400'}`}>:{svc.port}</p>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-6 animate-fade-in-up delay-800">
        <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
          <Play size={18} className="text-emerald-400" />
          <div className="text-left">
            <p className="text-sm font-mono text-emerald-500">./start.sh</p>
            <p className={`text-xs ${d ? 'text-gray-500' : 'text-gray-400'}`}>modo real (HC-SR04)</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
          <Play size={18} className="text-yellow-400" />
          <div className="text-left">
            <p className="text-sm font-mono text-yellow-500">./start.sh --fake</p>
            <p className={`text-xs ${d ? 'text-gray-500' : 'text-gray-400'}`}>modo simulado</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-red-500/10 border border-red-500/30">
          <Square size={18} className="text-red-400" />
          <div className="text-left">
            <p className="text-sm font-mono text-red-500">./stop.sh</p>
            <p className={`text-xs ${d ? 'text-gray-500' : 'text-gray-400'}`}>para tudo + limpa volumes</p>
          </div>
        </div>
      </div>
    </div>
  )
}
