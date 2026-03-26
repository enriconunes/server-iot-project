import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react'
import { useTheme } from './ThemeContext'
import { SlideTitle } from './slides/SlideTitle'
import { SlideOverview } from './slides/SlideOverview'
import { SlideTechnologies } from './slides/SlideTechnologies'
import { SlideArchitecture } from './slides/SlideArchitecture'
import { SlideDataFlow } from './slides/SlideDataFlow'
import { SlideSensor } from './slides/SlideSensor'
import { SlideDocker } from './slides/SlideDocker'
import { SlideDashboard } from './slides/SlideDashboard'
import { SlideAPI } from './slides/SlideAPI'
import { SlideDatabase } from './slides/SlideDatabase'
import { SlideMQTT } from './slides/SlideMQTT'
import { SlideBell } from './slides/SlideBell'
import { SlideEnd } from './slides/SlideEnd'

const slides = [
  SlideTitle,
  SlideOverview,
  SlideTechnologies,
  SlideArchitecture,
  SlideDataFlow,
  SlideSensor,
  SlideDocker,
  SlideDashboard,
  SlideAPI,
  SlideDatabase,
  SlideMQTT,
  SlideBell,
  SlideEnd,
]

export default function App() {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState<'left' | 'right'>('right')
  const { theme, toggle } = useTheme()

  const goNext = useCallback(() => {
    if (current < slides.length - 1) {
      setDirection('right')
      setCurrent(c => c + 1)
    }
  }, [current])

  const goPrev = useCallback(() => {
    if (current > 0) {
      setDirection('left')
      setCurrent(c => c - 1)
    }
  }, [current])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        goNext()
      }
      if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
        e.preventDefault()
        goPrev()
      }
      if (e.key === 'Home') {
        e.preventDefault()
        setDirection('left')
        setCurrent(0)
      }
      if (e.key === 'End') {
        e.preventDefault()
        setDirection('right')
        setCurrent(slides.length - 1)
      }
      if (e.key === 'd' || e.key === 'D') {
        toggle()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [goNext, goPrev, toggle])

  const CurrentSlide = slides[current]
  const dark = theme === 'dark'

  return (
    <div className={`relative w-screen h-screen overflow-hidden select-none transition-colors duration-500 ${
      dark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Background gradient */}
      <div className={`absolute inset-0 transition-colors duration-500 ${
        dark
          ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-emerald-950/30'
          : 'bg-gradient-to-br from-white via-gray-50 to-emerald-50'
      }`} />

      {/* Grid pattern */}
      <div
        className={`absolute inset-0 ${dark ? 'opacity-5' : 'opacity-[0.08]'}`}
        style={{
          backgroundImage: `radial-gradient(circle, ${dark ? '#10b981' : '#059669'} 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Slide content */}
      <div
        key={current}
        className={`relative z-10 w-full h-full ${
          direction === 'right' ? 'animate-fade-in-right' : 'animate-fade-in-left'
        }`}
      >
        <CurrentSlide />
      </div>

      {/* Theme toggle */}
      <button
        onClick={toggle}
        className={`absolute top-4 right-4 z-20 p-2.5 rounded-full backdrop-blur border transition-all hover:scale-110 ${
          dark
            ? 'bg-white/5 border-white/10 text-yellow-400 hover:bg-white/10'
            : 'bg-black/5 border-black/10 text-gray-600 hover:bg-black/10'
        }`}
        title="Toggle tema (D)"
      >
        {dark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* Navigation arrows */}
      <button
        onClick={goPrev}
        className={`absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full backdrop-blur border transition-all hover:scale-110 ${
          dark
            ? 'bg-white/5 border-white/10 hover:bg-white/10'
            : 'bg-black/5 border-black/10 hover:bg-black/10'
        } ${current === 0 ? 'opacity-20 cursor-not-allowed' : 'opacity-60 hover:opacity-100'}`}
        disabled={current === 0}
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={goNext}
        className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full backdrop-blur border transition-all hover:scale-110 ${
          dark
            ? 'bg-white/5 border-white/10 hover:bg-white/10'
            : 'bg-black/5 border-black/10 hover:bg-black/10'
        } ${current === slides.length - 1 ? 'opacity-20 cursor-not-allowed' : 'opacity-60 hover:opacity-100'}`}
        disabled={current === slides.length - 1}
      >
        <ChevronRight size={24} />
      </button>

      {/* Progress bar */}
      <div className={`absolute bottom-0 left-0 right-0 z-20 h-1 ${dark ? 'bg-white/5' : 'bg-black/5'}`}>
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500 ease-out"
          style={{ width: `${((current + 1) / slides.length) * 100}%` }}
        />
      </div>

      {/* Slide counter */}
      <div className={`absolute bottom-4 right-6 z-20 text-xs font-mono ${dark ? 'text-white/30' : 'text-black/30'}`}>
        {current + 1} / {slides.length}
      </div>

      {/* Keyboard hint */}
      <div className={`absolute bottom-4 left-6 z-20 flex items-center gap-2 text-xs ${dark ? 'text-white/20' : 'text-black/20'}`}>
        <kbd className={`px-1.5 py-0.5 rounded border text-[10px] ${dark ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'}`}>←</kbd>
        <kbd className={`px-1.5 py-0.5 rounded border text-[10px] ${dark ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'}`}>→</kbd>
        <span>navegar</span>
      </div>

      {/* Dot navigation */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setDirection(i > current ? 'right' : 'left')
              setCurrent(i)
            }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === current
                ? 'bg-emerald-500 w-6'
                : dark ? 'bg-white/20 hover:bg-white/40' : 'bg-black/15 hover:bg-black/30'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
