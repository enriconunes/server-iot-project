import { Cpu, Zap } from 'lucide-react'
import { useTheme } from '../ThemeContext'

export function SlideSensor() {
  const { theme } = useTheme()
  const d = theme === 'dark'

  return (
    <div className="flex flex-col items-center justify-center h-full px-16">
      <h2 className={`text-4xl font-bold mb-2 animate-fade-in-up ${d ? 'text-white' : 'text-gray-900'}`}>
        Sensor HC-SR04
      </h2>
      <p className={`mb-10 animate-fade-in-up delay-100 ${d ? 'text-gray-400' : 'text-gray-500'}`}>
        Sensor ultrassônico de distância
      </p>

      <div className="grid grid-cols-2 gap-8 max-w-5xl w-full">
        {/* Sensor image and specs */}
        <div className="animate-fade-in-left delay-200">
          <div className={`rounded-xl border border-emerald-500/30 p-6 backdrop-blur ${d ? 'bg-white/5' : 'bg-white shadow-sm'}`}>
            <div className="flex justify-center mb-6">
              <img
                src="https://img.icons8.com/fluency/96/sensor.png"
                alt="HC-SR04"
                className="animate-float"
              />
            </div>
            <h3 className="text-lg font-bold text-emerald-500 mb-4 text-center">Especificações</h3>
            <div className="space-y-3">
              {[
                ['Alcance', '2cm – 400cm'],
                ['Frequência', '40 kHz'],
                ['Precisão', '± 3mm'],
                ['Ângulo', '15°'],
                ['Trigger', 'Pulso 10µs'],
                ['Tensão', '5V DC'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className={d ? 'text-gray-400' : 'text-gray-500'}>{k}</span>
                  <span className={`font-mono ${d ? 'text-white' : 'text-gray-900'}`}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* GPIO Wiring */}
        <div className="animate-fade-in-right delay-300">
          <div className={`rounded-xl border border-purple-500/30 p-6 backdrop-blur ${d ? 'bg-white/5' : 'bg-white shadow-sm'}`}>
            <div className="flex items-center gap-2 mb-4">
              <Cpu size={20} className="text-purple-400" />
              <h3 className="text-lg font-bold text-purple-400">Raspberry Pi GPIO</h3>
            </div>
            <div className="space-y-3 mb-6">
              {[
                { pin: 'VCC', gpio: 'Pin 2 (5V)', color: 'text-red-400' },
                { pin: 'GND', gpio: 'Pin 6 (GND)', color: 'text-gray-400' },
                { pin: 'TRIG', gpio: 'Pin 7 (GPIO 4)', color: 'text-yellow-400' },
                { pin: 'ECHO', gpio: 'Pin 11 (GPIO 17)', color: 'text-blue-400' },
              ].map(w => (
                <div key={w.pin} className={`flex items-center gap-3 p-2 rounded-lg ${d ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <span className={`font-mono font-bold text-sm w-12 ${w.color}`}>{w.pin}</span>
                  <span className={d ? 'text-gray-500' : 'text-gray-400'}>→</span>
                  <span className={`text-sm ${d ? 'text-gray-300' : 'text-gray-600'}`}>{w.gpio}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 mb-3">
              <Zap size={16} className="text-yellow-400" />
              <span className="text-sm font-bold text-yellow-400">Divisor de Tensão (ECHO)</span>
            </div>
            <div className={`p-3 rounded-lg font-mono text-xs leading-relaxed ${d ? 'bg-black/30 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
              ECHO ──[1kΩ]──┬──→ GPIO 17 (3.3V)<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[2kΩ]<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;GND
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
