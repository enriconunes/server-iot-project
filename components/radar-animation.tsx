"use client"

import { useEffect, useRef } from "react"

export interface RadarReading {
  id: number
  sensor: number
  distance: number
  angle: number
  createdAt: string
}

interface RadarAnimationProps {
  readings?: RadarReading[]
  maxDistance?: number
  size?: number
  /** Milliseconds over which a blip fades to nothing. 0 = no fade (persistent). */
  fadeMs?: number
  /** Show rotating sweep beam. */
  showSweep?: boolean
}

// Distance → color gradient: closer = redder, farther = greener.
function distanceColor(distance: number, maxDistance: number) {
  const norm = Math.min(Math.max(distance / maxDistance, 0), 1)
  const hue = norm * 140 // 0 = red, 140 ~ green
  return `${hue}, 80%, 55%`
}

export function RadarAnimation({
  readings = [],
  maxDistance = 30,
  size = 320,
  fadeMs = 5000,
  showSweep = true,
}: RadarAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const readingsRef = useRef<RadarReading[]>(readings)
  const propsRef = useRef({ maxDistance, fadeMs, showSweep })

  useEffect(() => {
    readingsRef.current = readings
  }, [readings])

  useEffect(() => {
    propsRef.current = { maxDistance, fadeMs, showSweep }
  }, [maxDistance, fadeMs, showSweep])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number
    let sweepAngle = 0

    const draw = () => {
      const w = canvas.width
      const h = canvas.height
      const centerX = w / 2
      const centerY = h / 2
      const maxRadius = Math.min(centerX, centerY) - 12
      const { maxDistance: maxD, fadeMs: fade, showSweep: sweep } = propsRef.current

      // Background fade — heavier when sweep is on so trails clear
      ctx.fillStyle = sweep ? "rgba(18, 20, 30, 0.18)" : "rgba(18, 20, 30, 1)"
      ctx.fillRect(0, 0, w, h)

      // Range circles (with labels at cardinal radii)
      ctx.strokeStyle = "rgba(52, 211, 153, 0.18)"
      ctx.lineWidth = 1
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath()
        ctx.arc(centerX, centerY, (maxRadius / 4) * i, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.fillStyle = "rgba(148, 163, 184, 0.4)"
      ctx.font = "9px ui-monospace, monospace"
      ctx.textAlign = "left"
      for (let i = 1; i <= 4; i++) {
        const r = (maxRadius / 4) * i
        ctx.fillText(`${((maxD / 4) * i).toFixed(0)}cm`, centerX + 4, centerY - r + 10)
      }

      // Quadrant lines
      ctx.strokeStyle = "rgba(52, 211, 153, 0.12)"
      ctx.beginPath()
      ctx.moveTo(centerX, centerY - maxRadius)
      ctx.lineTo(centerX, centerY + maxRadius)
      ctx.moveTo(centerX - maxRadius, centerY)
      ctx.lineTo(centerX + maxRadius, centerY)
      ctx.stroke()

      // Quadrant labels
      ctx.fillStyle = "rgba(148, 163, 184, 0.55)"
      ctx.font = "10px ui-monospace, monospace"
      ctx.textAlign = "center"
      ctx.fillText("S1", centerX + maxRadius * 0.7, centerY - maxRadius * 0.7)
      ctx.fillText("S2", centerX - maxRadius * 0.7, centerY - maxRadius * 0.7)
      ctx.fillText("S3", centerX - maxRadius * 0.7, centerY + maxRadius * 0.7)
      ctx.fillText("S4", centerX + maxRadius * 0.7, centerY + maxRadius * 0.7)

      // Sweep
      if (sweep) {
        ctx.save()
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.arc(centerX, centerY, maxRadius, sweepAngle - 0.5, sweepAngle)
        ctx.closePath()
        const sweepGradient = ctx.createRadialGradient(
          centerX,
          centerY,
          0,
          centerX,
          centerY,
          maxRadius
        )
        sweepGradient.addColorStop(0, "rgba(52, 211, 153, 0.32)")
        sweepGradient.addColorStop(1, "rgba(52, 211, 153, 0.02)")
        ctx.fillStyle = sweepGradient
        ctx.fill()
        ctx.restore()
      }

      // Plot blips
      const now = Date.now()
      const data = readingsRef.current
      for (const r of data) {
        const ageMs = now - new Date(r.createdAt).getTime()
        const opacity = fade > 0 ? Math.max(0, 1 - ageMs / fade) : 1
        if (opacity <= 0) continue

        const rad = (r.angle * Math.PI) / 180
        const norm = Math.min(r.distance / maxD, 1)
        const x = centerX + Math.cos(rad) * maxRadius * norm
        const y = centerY + Math.sin(rad) * maxRadius * norm

        const hsl = distanceColor(r.distance, maxD)

        // Glow
        ctx.fillStyle = `hsla(${hsl}, ${0.22 * opacity})`
        ctx.beginPath()
        ctx.arc(x, y, 11, 0, Math.PI * 2)
        ctx.fill()

        // Blip
        ctx.fillStyle = `hsla(${hsl}, ${opacity})`
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fill()
      }

      // Center dot
      ctx.fillStyle = "rgba(52, 211, 153, 1)"
      ctx.beginPath()
      ctx.arc(centerX, centerY, 4, 0, Math.PI * 2)
      ctx.fill()

      if (sweep) {
        sweepAngle += 0.025
        if (sweepAngle > Math.PI * 2) sweepAngle = 0
      }

      animationId = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animationId)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="w-full h-auto max-w-full"
      style={{ aspectRatio: "1 / 1" }}
    />
  )
}
