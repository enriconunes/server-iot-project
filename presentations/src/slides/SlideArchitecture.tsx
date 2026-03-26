import { useTheme } from '../ThemeContext'

export function SlideArchitecture() {
  const { theme } = useTheme()
  const d = theme === 'dark'

  /* ── colour helpers ── */
  const box = (accent: string) =>
    `flex flex-col items-center justify-center gap-1 rounded-xl border px-4 py-3 text-center backdrop-blur ${accent}`

  const arrow = (
    <svg width="28" height="16" viewBox="0 0 28 16" fill="none" className="shrink-0 mx-0.5">
      <path d="M0 8h24M18 2l6 6-6 6" stroke={d ? '#6b7280' : '#9ca3af'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )

  const arrowDown = (
    <svg width="16" height="22" viewBox="0 0 16 22" fill="none" className="mx-auto shrink-0">
      <path d="M8 0v18M2 12l6 8 6-8" stroke={d ? '#6b7280' : '#9ca3af'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )

  const label = `text-xs font-semibold ${d ? 'text-white' : 'text-gray-800'}`
  const sub = `text-[10px] ${d ? 'text-gray-400' : 'text-gray-500'}`

  return (
    <div className="flex flex-col items-center justify-center h-full px-14">
      <p className={`text-xs uppercase tracking-widest mb-2 animate-fade-in-up ${d ? 'text-emerald-500' : 'text-emerald-600'}`}>
        05 — Diagrama &amp; Arquitetura
      </p>
      <h2 className={`text-4xl font-bold mb-8 animate-fade-in-up delay-100 ${d ? 'text-white' : 'text-gray-900'}`}>
        Pipeline Completo do Sensor ao Browser
      </h2>

      {/* Main pipeline row */}
      <div className="flex items-center justify-center flex-wrap gap-0 animate-fade-in-up delay-200 w-full max-w-5xl">

        {/* Hardware */}
        <div className={box(`border-red-500/35 ${d ? 'bg-red-500/10' : 'bg-red-50'} min-w-[110px]`)}>
          <span className="text-xl">📡</span>
          <span className={label}>HC-SR04</span>
          <span className={sub}>+ Servo Motor</span>
          <span className={`text-[10px] mt-1 px-2 py-0.5 rounded-full ${d ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'}`}>Hardware</span>
        </div>

        {arrow}

        {/* Raspberry Pi */}
        <div className={box(`border-orange-500/35 ${d ? 'bg-orange-500/10' : 'bg-orange-50'} min-w-[120px]`)}>
          <span className="text-xl">🍓</span>
          <span className={label}>Raspberry Pi</span>
          <span className={sub}>Python · GPIO</span>
          <span className={`text-[10px] mt-1 px-2 py-0.5 rounded-full ${d ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-600'}`}>Edge</span>
        </div>

        {arrow}

        {/* MQTT */}
        <div className={box(`border-yellow-500/35 ${d ? 'bg-yellow-500/10' : 'bg-yellow-50'} min-w-[110px]`)}>
          <span className="text-xl">📨</span>
          <span className={label}>Mosquitto</span>
          <span className={sub}>MQTT Broker</span>
          <span className={`text-[10px] mt-1 px-2 py-0.5 rounded-full ${d ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-600'}`}>Broker</span>
        </div>

        {arrow}

        {/* Worker */}
        <div className={box(`border-blue-500/35 ${d ? 'bg-blue-500/10' : 'bg-blue-50'} min-w-[120px]`)}>
          <span className="text-xl">⚙️</span>
          <span className={label}>MQTT Worker</span>
          <span className={sub}>Python Subscriber</span>
          <span className={`text-[10px] mt-1 px-2 py-0.5 rounded-full ${d ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>Worker</span>
        </div>

        {arrow}

        {/* API */}
        <div className={box(`border-emerald-500/40 ${d ? 'bg-emerald-500/12' : 'bg-emerald-50'} min-w-[120px] ring-1 ${d ? 'ring-emerald-500/25' : 'ring-emerald-400/30'}`)}>
          <span className="text-xl">🖥️</span>
          <span className={label}>Next.js API</span>
          <span className={sub}>REST + SSE</span>
          <span className={`text-[10px] mt-1 px-2 py-0.5 rounded-full ${d ? 'bg-emerald-500/25 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>Backend</span>
        </div>
      </div>

      {/* From API downward: DB + SMS + Dashboard */}
      <div className="mt-2 animate-fade-in-up delay-400 w-full max-w-5xl">
        {arrowDown}
        <div className="flex items-start justify-center gap-8 mt-2">

          {/* PostgreSQL */}
          <div className="flex flex-col items-center gap-2">
            <div className={box(`border-purple-500/35 ${d ? 'bg-purple-500/10' : 'bg-purple-50'} min-w-[120px]`)}>
              <span className="text-xl">🗄️</span>
              <span className={label}>PostgreSQL</span>
              <span className={sub}>sensor_readings · sms_log</span>
            </div>
          </div>

          {/* SMS */}
          <div className="flex flex-col items-center gap-2">
            <div className={box(`border-pink-500/35 ${d ? 'bg-pink-500/10' : 'bg-pink-50'} min-w-[120px]`)}>
              <span className="text-xl">📱</span>
              <span className={label}>SMS (Twilio)</span>
              <span className={sub}>Log automático / envio</span>
            </div>
          </div>

          {/* Dashboard */}
          <div className="flex flex-col items-center gap-2">
            <div className={box(`border-teal-500/35 ${d ? 'bg-teal-500/10' : 'bg-teal-50'} min-w-[140px] ring-1 ${d ? 'ring-teal-500/25' : 'ring-teal-400/30'}`)}>
              <span className="text-xl">📊</span>
              <span className={label}>Dashboard</span>
              <span className={sub}>Radar · Heatmap · KDE · SMS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transport labels */}
      <div className={`mt-6 flex flex-wrap justify-center gap-4 animate-fade-in-up delay-600 text-xs ${d ? 'text-gray-500' : 'text-gray-400'}`}>
        <span>GPIO → MQTT publish <code className="font-mono text-emerald-500 text-[10px]">radar/distance</code></span>
        <span>·</span>
        <span>Worker → HTTP <code className="font-mono text-emerald-500 text-[10px]">POST /api/sensor</code></span>
        <span>·</span>
        <span>Browser ← <code className="font-mono text-emerald-500 text-[10px]">SSE /api/sse</code></span>
        <span>·</span>
        <span>Nginx reverse proxy (Docker)</span>
      </div>
    </div>
  )
}
