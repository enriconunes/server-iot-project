"use client"

import { useEffect, useRef } from "react"

const SIZE = 400
const CX = SIZE / 2
const CY = SIZE / 2
const MAX_RANGE_PX = SIZE / 2 - 20
const MAX_RANGE_CM = 400
const PX_PER_CM = MAX_RANGE_PX / MAX_RANGE_CM
const RING_COUNT = 4
const BLIP_LIFETIME_MS = 3000
const SWEEP_SPEED = 0.4

interface Blip {
  x: number
  y: number
  time: number
}

interface RadarCanvasProps {
  lastReading: { distance: number; angle: number } | null
}

export function RadarCanvas({ lastReading }: RadarCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const blipsRef = useRef<Blip[]>([])
  const sweepAngleRef = useRef(0)
  const lastDistRef = useRef<number | null>(null)

  // Convert new reading into a blip using real angle
  useEffect(() => {
    if (lastReading === null || lastReading.distance === lastDistRef.current) return
    lastDistRef.current = lastReading.distance

    const angleDeg = lastReading.angle
    const distancePx = Math.min(lastReading.distance * PX_PER_CM, MAX_RANGE_PX)
    const rad = (angleDeg * Math.PI) / 180

    const blip: Blip = {
      x: CX + Math.cos(rad) * distancePx,
      y: CY - Math.sin(rad) * distancePx,
      time: Date.now(),
    }

    blipsRef.current = [...blipsRef.current, blip].slice(-200)
  }, [lastReading])

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animId: number

    function draw() {
      const now = Date.now()

      ctx!.fillStyle = "rgba(10, 15, 10, 1)"
      ctx!.fillRect(0, 0, SIZE, SIZE)

      // Grid rings
      ctx!.strokeStyle = "rgba(52, 211, 153, 0.15)"
      ctx!.lineWidth = 1
      for (let i = 1; i <= RING_COUNT; i++) {
        const r = (MAX_RANGE_PX / RING_COUNT) * i
        ctx!.beginPath()
        ctx!.arc(CX, CY, r, 0, Math.PI * 2)
        ctx!.stroke()

        ctx!.fillStyle = "rgba(52, 211, 153, 0.3)"
        ctx!.font = "10px monospace"
        const label = Math.round((MAX_RANGE_CM / RING_COUNT) * i) + "cm"
        ctx!.fillText(label, CX + 4, CY - r + 12)
      }

      // Grid lines
      ctx!.strokeStyle = "rgba(52, 211, 153, 0.08)"
      for (let a = 0; a < 360; a += 45) {
        const rad = (a * Math.PI) / 180
        ctx!.beginPath()
        ctx!.moveTo(CX, CY)
        ctx!.lineTo(CX + Math.cos(rad) * MAX_RANGE_PX, CY - Math.sin(rad) * MAX_RANGE_PX)
        ctx!.stroke()
      }

      // Sweep
      sweepAngleRef.current = (sweepAngleRef.current + SWEEP_SPEED) % 360
      const sweepRad = (sweepAngleRef.current * Math.PI) / 180

      // Sweep trail
      for (let i = 0; i < 30; i++) {
        const trailAngle = sweepAngleRef.current - i * 0.8
        const trailRad = (trailAngle * Math.PI) / 180
        const alpha = 0.06 * (1 - i / 30)
        ctx!.strokeStyle = `rgba(52, 211, 153, ${alpha})`
        ctx!.lineWidth = 2
        ctx!.beginPath()
        ctx!.moveTo(CX, CY)
        ctx!.lineTo(CX + Math.cos(trailRad) * MAX_RANGE_PX, CY - Math.sin(trailRad) * MAX_RANGE_PX)
        ctx!.stroke()
      }

      // Sweep line
      ctx!.strokeStyle = "rgba(52, 211, 153, 0.6)"
      ctx!.lineWidth = 2
      ctx!.beginPath()
      ctx!.moveTo(CX, CY)
      ctx!.lineTo(CX + Math.cos(sweepRad) * MAX_RANGE_PX, CY - Math.sin(sweepRad) * MAX_RANGE_PX)
      ctx!.stroke()

      // Blips
      blipsRef.current = blipsRef.current.filter((b) => now - b.time < BLIP_LIFETIME_MS)
      for (const blip of blipsRef.current) {
        const age = (now - blip.time) / BLIP_LIFETIME_MS
        const alpha = 1 - age

        // Glow
        ctx!.fillStyle = `rgba(52, 211, 153, ${alpha * 0.2})`
        ctx!.beginPath()
        ctx!.arc(blip.x, blip.y, 8 + age * 4, 0, Math.PI * 2)
        ctx!.fill()

        // Core
        ctx!.fillStyle = `rgba(52, 211, 153, ${alpha})`
        ctx!.beginPath()
        ctx!.arc(blip.x, blip.y, 3, 0, Math.PI * 2)
        ctx!.fill()
      }

      // Center dot
      ctx!.fillStyle = "rgba(52, 211, 153, 1)"
      ctx!.beginPath()
      ctx!.arc(CX, CY, 3, 0, Math.PI * 2)
      ctx!.fill()

      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={SIZE}
      height={SIZE}
      className="rounded-xl border border-emerald-900/30"
    />
  )
}
