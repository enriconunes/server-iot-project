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

    const dpr = Math.min(window.devicePixelRatio || 1, 3)
    let cssSize = size

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const measured = Math.min(rect.width, rect.height) || size
      cssSize = measured
      canvas.width = Math.round(cssSize * dpr)
      canvas.height = Math.round(cssSize * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    let animationId: number
    let sweepAngle = 0

    const draw = () => {
      const w = cssSize
      const h = cssSize
      const centerX = w / 2
      const centerY = h / 2
      const maxRadius = Math.min(centerX, centerY) - 28
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
      ctx.fillStyle = "rgba(203, 213, 225, 0.85)"
      ctx.font = "bold 13px ui-monospace, monospace"
      ctx.textAlign = "left"
      ctx.textBaseline = "middle"
      for (let i = 1; i <= 4; i++) {
        const r = (maxRadius / 4) * i
        const label = `${((maxD / 4) * i).toFixed(0)} cm`
        const tx = centerX + 6
        const ty = centerY - r
        const tw = ctx.measureText(label).width
        ctx.fillStyle = "rgba(15, 23, 42, 0.7)"
        ctx.fillRect(tx - 3, ty - 9, tw + 6, 18)
        ctx.fillStyle = "rgba(226, 232, 240, 0.95)"
        ctx.fillText(label, tx, ty)
      }
      ctx.textBaseline = "alphabetic"

      // Quadrant lines
      ctx.strokeStyle = "rgba(52, 211, 153, 0.12)"
      ctx.beginPath()
      ctx.moveTo(centerX, centerY - maxRadius)
      ctx.lineTo(centerX, centerY + maxRadius)
      ctx.moveTo(centerX - maxRadius, centerY)
      ctx.lineTo(centerX + maxRadius, centerY)
      ctx.stroke()

      // Cardinal angle labels (canvas: 0° = right, +90° = down because Y is inverted)
      ctx.fillStyle = "rgba(125, 211, 252, 0.95)"
      ctx.font = "bold 13px ui-monospace, monospace"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      const off = 14
      ctx.fillText("0°",   centerX + maxRadius + off, centerY)
      ctx.fillText("90°",  centerX,                   centerY + maxRadius + off)
      ctx.fillText("180°", centerX - maxRadius - off, centerY)
      ctx.fillText("270°", centerX,                   centerY - maxRadius - off)
      ctx.textBaseline = "alphabetic"

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
    return () => {
      cancelAnimationFrame(animationId)
      ro.disconnect()
    }
  }, [size])

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        maxWidth: `${size}px`,
        aspectRatio: "1 / 1",
        display: "block",
      }}
    />
  )
}
