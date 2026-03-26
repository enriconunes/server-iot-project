import { Database, Radio } from 'lucide-react'
import { useTheme } from '../ThemeContext'

function IconBadge({ children, name }: { children: React.ReactNode; name: string }) {
  const { theme } = useTheme()
  const d = theme === 'dark'
  return (
    <div className={`flex items-center gap-3 p-2 rounded-lg transition ${d ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'}`}>
      {children}
      <span className={`text-sm ${d ? 'text-gray-300' : 'text-gray-700'}`}>{name}</span>
    </div>
  )
}

export function SlideTechnologies() {
  const { theme } = useTheme()
  const d = theme === 'dark'

  const categories = [
    {
      title: 'Frontend',
      color: 'from-blue-500 to-cyan-400',
      border: d ? 'border-blue-500/30' : 'border-blue-200',
      techs: [
        { name: 'Next.js 16', icon: 'https://img.icons8.com/fluency/48/nextjs.png' },
        { name: 'React 19', icon: 'https://img.icons8.com/plasticine/48/react.png' },
        { name: 'TypeScript', icon: 'https://img.icons8.com/fluency/48/typescript--v1.png' },
        { name: 'Tailwind CSS', icon: 'https://img.icons8.com/fluency/48/tailwind_css.png' },
      ],
    },
    {
      title: 'Backend & Dados',
      color: 'from-purple-500 to-pink-400',
      border: d ? 'border-purple-500/30' : 'border-purple-200',
      techs: [
        { name: 'Node.js 22', icon: 'https://img.icons8.com/fluency/48/node-js.png' },
        { name: 'PostgreSQL 16', lucide: Database, lucideColor: 'text-blue-500' },
        { name: 'Zod', icon: 'https://img.icons8.com/ios-filled/48/00BFFF/security-checked.png' },
        { name: 'SSE', lucide: Radio, lucideColor: 'text-purple-500' },
      ],
    },
    {
      title: 'IoT & Hardware',
      color: 'from-emerald-500 to-teal-400',
      border: d ? 'border-emerald-500/30' : 'border-emerald-200',
      techs: [
        { name: 'Python 3.12', icon: 'https://img.icons8.com/fluency/48/python.png' },
        { name: 'Raspberry Pi', icon: 'https://img.icons8.com/color/48/raspberry-pi.png' },
        { name: 'MQTT', icon: 'https://img.icons8.com/fluency/48/wifi.png' },
        { name: 'HC-SR04', icon: 'https://img.icons8.com/fluency/48/sensor.png' },
      ],
    },
    {
      title: 'Infraestrutura',
      color: 'from-orange-500 to-yellow-400',
      border: d ? 'border-orange-500/30' : 'border-orange-200',
      techs: [
        { name: 'Docker', icon: 'https://img.icons8.com/fluency/48/docker.png' },
        { name: 'Nginx', icon: 'https://img.icons8.com/color/48/nginx.png' },
        { name: 'Mosquitto', icon: 'https://img.icons8.com/fluency/48/radio-tower.png' },
        { name: 'Compose', icon: 'https://img.icons8.com/fluency/48/docker.png' },
      ],
    },
  ]

  return (
    <div className="flex flex-col items-center justify-center h-full px-16">
      <h2 className={`text-4xl font-bold mb-2 animate-fade-in-up ${d ? 'text-white' : 'text-gray-900'}`}>
        Stack de Tecnologias
      </h2>
      <p className={`mb-10 animate-fade-in-up delay-100 ${d ? 'text-gray-400' : 'text-gray-500'}`}>
        Tecnologias modernas para cada camada do sistema
      </p>

      <div className="grid grid-cols-2 gap-6 max-w-5xl w-full">
        {categories.map((cat, ci) => (
          <div
            key={cat.title}
            className={`animate-fade-in-up delay-${(ci + 2) * 100} rounded-xl border p-6 backdrop-blur ${cat.border} ${
              d ? 'bg-white/5' : 'bg-white shadow-sm'
            }`}
          >
            <h3 className={`text-lg font-bold mb-4 bg-gradient-to-r ${cat.color} bg-clip-text text-transparent`}>
              {cat.title}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {cat.techs.map(tech => (
                <IconBadge key={tech.name} name={tech.name}>
                  {'lucide' in tech && tech.lucide ? (
                    <tech.lucide size={28} className={tech.lucideColor} />
                  ) : (
                    <img src={'icon' in tech ? tech.icon : ''} alt={tech.name} className="w-8 h-8" loading="lazy" />
                  )}
                </IconBadge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
