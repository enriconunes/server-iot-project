import { useTheme } from '../ThemeContext'

export function SlideEnd() {
  const { theme } = useTheme()
  const d = theme === 'dark'

  const summary = [
    { icon: '📡', text: 'Radar 360° low-cost com HC-SR04' },
    { icon: '🗺️', text: 'Heatmap polar histórico no browser' },
    { icon: '📈', text: 'Previsão KDE 2D Gaussiana' },
    { icon: '📱', text: 'Alertas SMS com histórico no dashboard' },
    { icon: '🐳', text: 'Containerizado em Docker Compose' },
  ]

  return (
    <div className="flex flex-col items-center justify-center h-full px-8">
      <h2 className="text-6xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent animate-fade-in-up mb-3">
        Obrigado!
      </h2>
      <p className={`text-lg animate-fade-in-up delay-100 mb-10 ${d ? 'text-gray-400' : 'text-gray-500'}`}>
        IoT Radar System — UC Internet das Coisas · UBI 2025/2026
      </p>

      {/* Summary */}
      <div className="flex flex-col gap-3 max-w-lg w-full animate-fade-in-up delay-200 mb-10">
        {summary.map((s, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${
              d ? 'border-white/8 bg-white/4' : 'border-gray-200 bg-white shadow-sm'
            }`}
            style={{ animationDelay: `${(i + 2) * 0.08}s` }}
          >
            <span className="text-lg">{s.icon}</span>
            <span className={`text-sm ${d ? 'text-gray-300' : 'text-gray-700'}`}>{s.text}</span>
          </div>
        ))}
      </div>

      <p className={`text-sm animate-fade-in-up delay-700 ${d ? 'text-gray-600' : 'text-gray-400'}`}>
        Questões?
      </p>
    </div>
  )
}
