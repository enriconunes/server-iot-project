import { useTheme } from '../ThemeContext'
import { HelpCircle, Lightbulb } from 'lucide-react'

export function SlideProblems() {
  const { theme } = useTheme()
  const d = theme === 'dark'

  const questions = [
    'Como aplicar um protocolo pub/sub (MQTT) numa cadeia IoT completa?',
    'Como persistir e visualizar dados de um sensor rotativo em tempo real?',
    'Como construir um dashboard web funcional para dados de sensores?',
    'Como aplicar análise estatística simples para extrair valor dos dados recolhidos?',
  ]

  const contributions = [
    { label: 'Pipeline IoT completo', desc: 'Do sensor físico ao browser, passando por MQTT, REST e SSE' },
    { label: 'Radar 360° com histórico', desc: 'Registo de distância + ângulo, visualizado como radar e heatmap polar' },
    { label: 'Dashboard web em tempo real', desc: 'Atualização via SSE sem polling; dados persistidos em PostgreSQL' },
    { label: 'Análise KDE 2D', desc: 'Estimativa de zonas com maior probabilidade de deteção futura' },
    { label: 'Registo de alertas SMS', desc: 'Log de notificações associado a cada deteção, visível no dashboard' },
    { label: 'Infraestrutura containerizada', desc: 'Todo o sistema reprodutível com um único comando Docker Compose' },
  ]

  return (
    <div className="flex flex-col items-center justify-center h-full px-16">
      <p className={`text-xs uppercase tracking-widest mb-2 animate-fade-in-up ${d ? 'text-emerald-500' : 'text-emerald-600'}`}>
        03 — Problemas &amp; Contribuições
      </p>
      <h2 className={`text-4xl font-bold mb-10 animate-fade-in-up delay-100 ${d ? 'text-white' : 'text-gray-900'}`}>
        O que queríamos aprender e o que implementámos
      </h2>

      <div className="grid grid-cols-2 gap-8 max-w-5xl w-full">
        {/* Questões de investigação */}
        <div className="animate-fade-in-up delay-200">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle size={18} className="text-blue-400" />
            <h3 className={`font-bold ${d ? 'text-white' : 'text-gray-900'}`}>Questões que motivaram o projeto</h3>
          </div>
          <div className="space-y-3">
            {questions.map((q, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-lg border border-blue-500/20 ${d ? 'bg-blue-500/8' : 'bg-blue-50'}`}
              >
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  {i + 1}
                </span>
                <p className={`text-sm ${d ? 'text-gray-300' : 'text-gray-600'}`}>{q}</p>
              </div>
            ))}
          </div>
        </div>

        {/* O que implementámos */}
        <div className="animate-fade-in-up delay-300">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={18} className="text-emerald-400" />
            <h3 className={`font-bold ${d ? 'text-white' : 'text-gray-900'}`}>O que foi implementado</h3>
          </div>
          <div className="space-y-2.5">
            {contributions.map((c, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-lg border border-emerald-500/20 ${d ? 'bg-emerald-500/6' : 'bg-emerald-50'}`}
                style={{ animationDelay: `${(i + 4) * 0.08}s` }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                <div>
                  <span className={`text-sm font-semibold ${d ? 'text-emerald-400' : 'text-emerald-700'}`}>{c.label}</span>
                  <span className={`text-sm ${d ? 'text-gray-400' : 'text-gray-500'}`}> — {c.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
