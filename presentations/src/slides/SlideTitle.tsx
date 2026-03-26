import { useTheme } from '../ThemeContext'

export function SlideTitle() {
  const { theme } = useTheme()
  const d = theme === 'dark'

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 gap-0">
      {/* Radar icon */}
      <div className="relative w-28 h-28 mb-8 animate-fade-in-up">
        <div className={`absolute inset-0 rounded-full border-2 ${d ? 'border-emerald-500/25' : 'border-emerald-500/35'}`} />
        <div className={`absolute inset-5 rounded-full border ${d ? 'border-emerald-500/18' : 'border-emerald-500/28'}`} />
        <div className={`absolute inset-10 rounded-full border ${d ? 'border-emerald-500/12' : 'border-emerald-500/20'}`} />
        <div className="absolute top-1/2 left-1/2 animate-sweep" style={{ transformOrigin: '0 0' }}>
          <div
            className="absolute rounded-full"
            style={{
              width: 2,
              height: 50,
              bottom: 0,
              left: -1,
              background: d
                ? 'linear-gradient(to top, rgba(52,211,153,0), rgba(52,211,153,0.7))'
                : 'linear-gradient(to top, rgba(16,185,129,0), rgba(16,185,129,0.8))',
            }}
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse-glow" />
        </div>
      </div>

      <h1 className="text-6xl font-bold bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 bg-clip-text text-transparent animate-fade-in-up delay-100 mb-3 text-center">
        IoT Radar System
      </h1>

      <p className={`text-xl animate-fade-in-up delay-200 mb-2 text-center ${d ? 'text-gray-300' : 'text-gray-700'}`}>
        Sistema de Deteção e Mapeamento por Sensor Ultrassónico
      </p>

      <p className={`text-sm animate-fade-in-up delay-300 mb-10 ${d ? 'text-gray-500' : 'text-gray-400'}`}>
        UC — Internet das Coisas &nbsp;·&nbsp; UBI 2025 / 2026
      </p>

      <div className={`flex gap-6 animate-fade-in-up delay-400 text-sm ${d ? 'text-gray-400' : 'text-gray-500'}`}>
        <span>HC-SR04</span>
        <span className="opacity-30">|</span>
        <span>Raspberry Pi</span>
        <span className="opacity-30">|</span>
        <span>MQTT</span>
        <span className="opacity-30">|</span>
        <span>Next.js</span>
        <span className="opacity-30">|</span>
        <span>PostgreSQL</span>
        <span className="opacity-30">|</span>
        <span>Docker</span>
      </div>
    </div>
  )
}
