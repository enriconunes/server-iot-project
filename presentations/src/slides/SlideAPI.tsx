import { Globe, Lock, ArrowRightLeft } from 'lucide-react'
import { useTheme } from '../ThemeContext'

export function SlideAPI() {
  const { theme } = useTheme()
  const d = theme === 'dark'

  const endpoints = [
    { method: 'POST', path: '/api/sensor', desc: 'Registrar nova leitura', body: '{ distance, angle?, unit? }', status: '201' },
    { method: 'GET', path: '/api/readings', desc: 'Listar leituras', body: '?limit=50', status: '200' },
    { method: 'GET', path: '/api/bell', desc: 'Estado do sino', body: '—', status: '200' },
    { method: 'POST', path: '/api/bell', desc: 'Toggle sino', body: '—', status: '200' },
    { method: 'GET', path: '/api/sse', desc: 'Stream em tempo real', body: 'EventStream', status: '200' },
  ]

  const methodColor: Record<string, string> = {
    GET: 'bg-emerald-500/20 text-emerald-500',
    POST: 'bg-blue-500/20 text-blue-500',
  }

  return (
    <div className="flex flex-col items-center justify-center h-full px-16">
      <div className="flex items-center gap-3 mb-2 animate-fade-in-up">
        <Globe size={32} className="text-blue-400" />
        <h2 className={`text-4xl font-bold ${d ? 'text-white' : 'text-gray-900'}`}>REST API</h2>
      </div>
      <p className={`mb-10 animate-fade-in-up delay-100 ${d ? 'text-gray-400' : 'text-gray-500'}`}>
        API Routes do Next.js — validação com Zod
      </p>

      <div className="max-w-4xl w-full space-y-3 mb-8">
        {endpoints.map((ep, i) => (
          <div
            key={ep.path + ep.method}
            className={`animate-fade-in-up delay-${(i + 2) * 100} flex items-center gap-4 p-4 rounded-xl border backdrop-blur ${
              d ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'
            }`}
          >
            <span className={`px-3 py-1 rounded-lg font-mono text-xs font-bold ${methodColor[ep.method]}`}>
              {ep.method}
            </span>
            <span className={`font-mono text-sm flex-1 ${d ? 'text-white' : 'text-gray-900'}`}>{ep.path}</span>
            <span className={`text-xs flex-1 ${d ? 'text-gray-400' : 'text-gray-500'}`}>{ep.desc}</span>
            <span className={`font-mono text-xs ${d ? 'text-gray-500' : 'text-gray-400'}`}>{ep.body}</span>
            <span className="font-mono text-xs text-emerald-500">{ep.status}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-6 animate-fade-in-up delay-700">
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
          <Lock size={16} className="text-yellow-500" />
          <div className="text-left">
            <p className="text-xs font-bold text-yellow-500">Autenticação</p>
            <p className={`text-xs font-mono ${d ? 'text-gray-500' : 'text-gray-400'}`}>x-api-key header</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/10 border border-purple-500/30">
          <ArrowRightLeft size={16} className="text-purple-400" />
          <div className="text-left">
            <p className="text-xs font-bold text-purple-400">Validação</p>
            <p className={`text-xs font-mono ${d ? 'text-gray-500' : 'text-gray-400'}`}>Zod + t3-env</p>
          </div>
        </div>
      </div>
    </div>
  )
}
