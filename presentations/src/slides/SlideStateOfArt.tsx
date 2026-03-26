import { useTheme } from '../ThemeContext'
import { BookOpen, Cpu, Wifi, TrendingUp } from 'lucide-react'

export function SlideStateOfArt() {
  const { theme } = useTheme()
  const d = theme === 'dark'

  const context = [
    {
      icon: Cpu,
      color: 'text-blue-400',
      border: 'border-blue-500/25',
      bg: d ? 'bg-blue-500/8' : 'bg-blue-50',
      title: 'Sensores Ultrassónicos em IoT Educacional',
      body: 'O HC-SR04 é um dos sensores mais utilizados em projetos académicos de IoT e robótica. A maioria das implementações aborda medição de distância simples com Arduino ou Raspberry Pi, sem rotação nem análise histórica.',
    },
    {
      icon: Wifi,
      color: 'text-yellow-400',
      border: 'border-yellow-500/25',
      bg: d ? 'bg-yellow-500/8' : 'bg-yellow-50',
      title: 'Protocolos IoT e Comunicação Pub/Sub',
      body: 'MQTT (Message Queuing Telemetry Transport) é um protocolo padrão em sistemas IoT de baixo consumo. Projetos educacionais raramente combinam MQTT com uma API REST e streaming em tempo real num mesmo sistema.',
    },
    {
      icon: TrendingUp,
      color: 'text-emerald-400',
      border: 'border-emerald-500/25',
      bg: d ? 'bg-emerald-500/8' : 'bg-emerald-50',
      title: 'Visualização e Análise em Sistemas de Sensores',
      body: 'Dashboards web para dados de sensores são comuns em plataformas comerciais (Grafana, ThingSpeak). Em projetos académicos de pequena escala, é menos habitual integrar visualização polar, heatmaps e modelos estatísticos no mesmo sistema.',
    },
    {
      icon: BookOpen,
      color: 'text-purple-400',
      border: 'border-purple-500/25',
      bg: d ? 'bg-purple-500/8' : 'bg-purple-50',
      title: 'Posicionamento deste Projeto',
      body: 'Este projeto aplica, num contexto introdutório e académico, práticas e ferramentas utilizadas na indústria IoT — MQTT, Docker, SSE, análise estatística — para consolidar competências numa implementação funcional de ponta a ponta.',
    },
  ]

  return (
    <div className="flex flex-col items-center justify-center h-full px-16">
      <p className={`text-xs uppercase tracking-widest mb-2 animate-fade-in-up ${d ? 'text-emerald-500' : 'text-emerald-600'}`}>
        02 — Estado da Arte
      </p>
      <h2 className={`text-4xl font-bold mb-2 animate-fade-in-up delay-100 ${d ? 'text-white' : 'text-gray-900'}`}>
        Contexto e Trabalho Relacionado
      </h2>
      <p className={`mb-9 text-center max-w-xl animate-fade-in-up delay-200 ${d ? 'text-gray-400' : 'text-gray-500'}`}>
        Enquadramento académico do projeto no domínio de IoT com sensores ultrassónicos
      </p>

      <div className="grid grid-cols-2 gap-4 max-w-5xl w-full">
        {context.map((c, i) => (
          <div
            key={c.title}
            className={`animate-fade-in-up flex gap-4 p-5 rounded-xl border ${c.border} ${c.bg} backdrop-blur`}
            style={{ animationDelay: `${(i + 3) * 0.1}s` }}
          >
            <c.icon size={22} className={`${c.color} shrink-0 mt-0.5`} />
            <div>
              <h3 className={`font-semibold text-sm mb-1.5 ${d ? 'text-white' : 'text-gray-900'}`}>{c.title}</h3>
              <p className={`text-xs leading-relaxed ${d ? 'text-gray-400' : 'text-gray-500'}`}>{c.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
