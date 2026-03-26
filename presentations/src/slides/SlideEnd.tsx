import { Rocket } from 'lucide-react'
import { useTheme } from '../ThemeContext'

export function SlideEnd() {
  const { theme } = useTheme()
  const d = theme === 'dark'

  return (
    <div className="flex flex-col items-center justify-center h-full px-8">
      <div className="animate-fade-in-up mb-8">
        <Rocket size={64} className="text-emerald-500 animate-float" />
      </div>

      <h2 className="text-5xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent animate-fade-in-up delay-200 mb-4">
        Obrigado!
      </h2>

      <p className={`text-xl animate-fade-in-up delay-300 mb-12 ${d ? 'text-gray-400' : 'text-gray-500'}`}>
        IoT Radar System — Do sensor ao pixel
      </p>

      <div className="flex flex-wrap justify-center gap-3 animate-fade-in-up delay-400 mb-12 max-w-2xl">
        {[
          'HC-SR04', 'Raspberry Pi', 'Python', 'MQTT', 'Mosquitto',
          'Docker', 'PostgreSQL', 'Next.js 16', 'React 19', 'TypeScript',
          'Tailwind CSS', 'shadcn/ui', 'Nginx', 'SSE', 'UUID v7',
        ].map(tech => (
          <span
            key={tech}
            className={`px-3 py-1.5 rounded-full text-xs font-mono border ${
              d ? 'bg-white/5 border-white/10 text-gray-300' : 'bg-gray-100 border-gray-200 text-gray-600'
            }`}
          >
            {tech}
          </span>
        ))}
      </div>

    </div>
  )
}
