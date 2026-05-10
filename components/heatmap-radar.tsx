"use client"

import { useEffect, useMemo, useRef } from "react"

export interface HeatmapReading {
  sensor: number
  distance: number
  angle: number
  createdAt: string
}

interface HeatmapRadarProps {
  readings?: HeatmapReading[]
  maxDistance?: number
  size?: number
  /** Number of angular bins (default 36 → 10° each). */
  angleBins?: number
  /** Number of radial bins (default 6 → 5cm each at 30cm). */
  radialBins?: number
}

// Heat colormap (cool → hot): dark navy → blue → cyan → green → yellow → red
function heatColor(t: number): string {
  const x = Math.min(Math.max(t, 0), 1)
  const stops: [number, [number, number, number]][] = [
    [0.0, [10, 14, 39]],
    [0.2, [33, 87, 178]],
    [0.4, [40, 170, 200]],
    [0.6, [80, 200, 80]],
    [0.8, [240, 200, 40]],
    [1.0, [220, 50, 47]],
  ]
  for (let i = 0; i < stops.length - 1; i++) {
    const [t0, c0] = stops[i]
    const [t1, c1] = stops[i + 1]
    if (x >= t0 && x <= t1) {
      const f = (x - t0) / (t1 - t0)
      const r = Math.round(c0[0] + (c1[0] - c0[0]) * f)
      const g = Math.round(c0[1] + (c1[1] - c0[1]) * f)
      const b = Math.round(c0[2] + (c1[2] - c0[2]) * f)
      return `rgb(${r}, ${g}, ${b})`
    }
  }
  return "rgb(220,50,47)"
}

export function HeatmapRadar({
  readings = [],
  maxDistance = 30,
  size = 360,
  angleBins = 36,
  radialBins = 6,
}: HeatmapRadarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const grid = useMemo(() => {
    const g: number[][] = Array.from({ length: angleBins }, () =>
      new Array(radialBins).fill(0)
    )
    let max = 0
    for (const r of readings) {
      const ang = ((r.angle % 360) + 360) % 360
      const ai = Math.min(Math.floor((ang / 360) * angleBins), angleBins - 1)
      const norm = Math.min(r.distance / maxDistance, 0.9999)
      if (norm < 0) continue
      const ri = Math.min(Math.floor(norm * radialBins), radialBins - 1)
      g[ai][ri] += 1
      if (g[ai][ri] > max) max = g[ai][ri]
    }
    return { g, max }
  }, [readings, angleBins, radialBins, maxDistance])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 3)
    let cssSize = size

    const setup = () => {
      const rect = canvas.getBoundingClientRect()
      cssSize = Math.min(rect.width, rect.height) || size
      canvas.width = Math.round(cssSize * dpr)
      canvas.height = Math.round(cssSize * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      draw()
    }

    const draw = () => {
      const w = cssSize
      const h = cssSize
      const cx = w / 2
      const cy = h / 2
      const maxRadius = Math.min(cx, cy) - 28

      ctx.clearRect(0, 0, w, h)

      // Background
      ctx.fillStyle = "rgba(10, 14, 39, 1)"
      ctx.beginPath()
      ctx.arc(cx, cy, maxRadius, 0, Math.PI * 2)
      ctx.fill()

      const { g, max } = grid
      const safeMax = max > 0 ? max : 1

      // Draw cells as annular sectors
      for (let ai = 0; ai < angleBins; ai++) {
        const a0 = (ai / angleBins) * Math.PI * 2
        const a1 = ((ai + 1) / angleBins) * Math.PI * 2
        for (let ri = 0; ri < radialBins; ri++) {
          const count = g[ai][ri]
          if (count === 0) continue
          const r0 = (ri / radialBins) * maxRadius
          const r1 = ((ri + 1) / radialBins) * maxRadius
          const t = count / safeMax

          ctx.fillStyle = heatColor(t)
          ctx.globalAlpha = 0.85
          ctx.beginPath()
          ctx.arc(cx, cy, r1, a0, a1)
          ctx.arc(cx, cy, r0, a1, a0, true)
          ctx.closePath()
          ctx.fill()
        }
      }
      ctx.globalAlpha = 1

      // Range rings
      ctx.strokeStyle = "rgba(226, 232, 240, 0.18)"
      ctx.lineWidth = 1
      for (let i = 1; i <= radialBins; i++) {
        ctx.beginPath()
        ctx.arc(cx, cy, (maxRadius / radialBins) * i, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Cross
      ctx.strokeStyle = "rgba(226, 232, 240, 0.12)"
      ctx.beginPath()
      ctx.moveTo(cx, cy - maxRadius)
      ctx.lineTo(cx, cy + maxRadius)
      ctx.moveTo(cx - maxRadius, cy)
      ctx.lineTo(cx + maxRadius, cy)
      ctx.stroke()

      // Distance labels
      ctx.font = "bold 12px ui-monospace, monospace"
      ctx.textAlign = "left"
      ctx.textBaseline = "middle"
      const step = maxDistance / radialBins
      for (let i = 1; i <= radialBins; i++) {
        const r = (maxRadius / radialBins) * i
        const label = `${(step * i).toFixed(0)} cm`
        const tx = cx + 5
        const ty = cy - r
        const tw = ctx.measureText(label).width
        ctx.fillStyle = "rgba(15, 23, 42, 0.75)"
        ctx.fillRect(tx - 3, ty - 8, tw + 6, 16)
        ctx.fillStyle = "rgba(226, 232, 240, 0.95)"
        ctx.fillText(label, tx, ty)
      }

      // Cardinal angles
      ctx.fillStyle = "rgba(125, 211, 252, 0.95)"
      ctx.font = "bold 13px ui-monospace, monospace"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      const off = 14
      ctx.fillText("0°",   cx + maxRadius + off, cy)
      ctx.fillText("90°",  cx,                   cy + maxRadius + off)
      ctx.fillText("180°", cx - maxRadius - off, cy)
      ctx.fillText("270°", cx,                   cy - maxRadius - off)
      ctx.textBaseline = "alphabetic"

      // Center dot
      ctx.fillStyle = "rgba(226, 232, 240, 0.9)"
      ctx.beginPath()
      ctx.arc(cx, cy, 3, 0, Math.PI * 2)
      ctx.fill()
    }

    setup()
    const ro = new ResizeObserver(setup)
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [grid, size, maxDistance, angleBins, radialBins])

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

export function HeatLegend({ max }: { max: number }) {
  const stops = [0, 0.2, 0.4, 0.6, 0.8, 1]
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className="font-mono">0</span>
      <div
        className="h-2 flex-1 rounded-full overflow-hidden"
        style={{
          background: `linear-gradient(to right, ${stops
            .map((s) => heatColor(s))
            .join(", ")})`,
        }}
      />
      <span className="font-mono">{max}</span>
    </div>
  )
}
