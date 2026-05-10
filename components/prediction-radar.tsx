"use client"

import { useEffect, useMemo, useRef } from "react"

export interface PredictionReading {
  sensor: number
  distance: number
  angle: number
  createdAt: string
}

interface PredictionRadarProps {
  readings?: PredictionReading[]
  maxDistance?: number
  size?: number
  /** Spatial bandwidth in cm. */
  sigma?: number
  /** Recency half-life in milliseconds. */
  halfLifeMs?: number
  angleBins?: number
  radialBins?: number
}

function predictionColor(t: number): string {
  const x = Math.min(Math.max(t, 0), 1)
  // Cool dark → violet → magenta → orange → bright yellow
  const stops: [number, [number, number, number]][] = [
    [0.0, [12, 10, 36]],
    [0.25, [70, 30, 130]],
    [0.5, [180, 50, 130]],
    [0.75, [240, 130, 50]],
    [1.0, [255, 230, 90]],
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
  return "rgb(255,230,90)"
}

export interface PredictionResult {
  topProbability: number
  topAngleDeg: number
  topDistanceCm: number
  effectiveN: number
  totalWeight: number
}

export function computePrediction(
  readings: PredictionReading[],
  opts: { maxDistance: number; sigma: number; halfLifeMs: number; angleBins: number; radialBins: number }
) {
  const { maxDistance, sigma, halfLifeMs, angleBins, radialBins } = opts
  const now = Date.now()
  const lambda = Math.log(2) / halfLifeMs // decay rate from half-life

  // Pre-compute weighted points in cartesian
  const pts: { x: number; y: number; w: number }[] = []
  let totalW = 0
  for (const r of readings) {
    const age = now - new Date(r.createdAt).getTime()
    const w = Math.exp(-lambda * Math.max(age, 0))
    if (w <= 1e-6) continue
    const rad = (r.angle * Math.PI) / 180
    const x = Math.cos(rad) * r.distance
    const y = Math.sin(rad) * r.distance
    pts.push({ x, y, w })
    totalW += w
  }

  const grid: number[][] = Array.from({ length: angleBins }, () =>
    new Array(radialBins).fill(0)
  )

  if (pts.length === 0 || totalW === 0) {
    return {
      grid,
      probabilities: grid,
      max: 0,
      result: {
        topProbability: 0,
        topAngleDeg: 0,
        topDistanceCm: 0,
        effectiveN: 0,
        totalWeight: 0,
      } as PredictionResult,
    }
  }

  const twoSigmaSq = 2 * sigma * sigma
  let max = 0

  for (let ai = 0; ai < angleBins; ai++) {
    const aMid = ((ai + 0.5) / angleBins) * 2 * Math.PI
    const cosA = Math.cos(aMid)
    const sinA = Math.sin(aMid)
    for (let ri = 0; ri < radialBins; ri++) {
      const rMid = ((ri + 0.5) / radialBins) * maxDistance
      const cx = cosA * rMid
      const cy = sinA * rMid
      let f = 0
      for (const p of pts) {
        const dx = cx - p.x
        const dy = cy - p.y
        f += p.w * Math.exp(-(dx * dx + dy * dy) / twoSigmaSq)
      }
      grid[ai][ri] = f
      if (f > max) max = f
    }
  }

  // Normalize to probabilities (cell area-weighted)
  // Cell area in polar approx = (Δr) * r_mid * Δθ. We'll just normalize raw f to sum=1.
  let sum = 0
  for (let ai = 0; ai < angleBins; ai++)
    for (let ri = 0; ri < radialBins; ri++) sum += grid[ai][ri]

  const probabilities: number[][] = grid.map((row) => row.map((v) => (sum > 0 ? v / sum : 0)))

  let topP = 0
  let topAi = 0
  let topRi = 0
  for (let ai = 0; ai < angleBins; ai++) {
    for (let ri = 0; ri < radialBins; ri++) {
      if (probabilities[ai][ri] > topP) {
        topP = probabilities[ai][ri]
        topAi = ai
        topRi = ri
      }
    }
  }

  const topAngleDeg = ((topAi + 0.5) / angleBins) * 360
  const topDistanceCm = ((topRi + 0.5) / radialBins) * maxDistance

  return {
    grid,
    probabilities,
    max,
    result: {
      topProbability: topP,
      topAngleDeg,
      topDistanceCm,
      effectiveN: pts.length,
      totalWeight: totalW,
    } as PredictionResult,
  }
}

export function PredictionRadar({
  readings = [],
  maxDistance = 30,
  size = 420,
  sigma = 3,
  halfLifeMs = 30 * 60 * 1000,
  angleBins = 72,
  radialBins = 12,
}: PredictionRadarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const data = useMemo(
    () => computePrediction(readings, { maxDistance, sigma, halfLifeMs, angleBins, radialBins }),
    [readings, maxDistance, sigma, halfLifeMs, angleBins, radialBins]
  )

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

      ctx.fillStyle = "rgba(12, 10, 36, 1)"
      ctx.beginPath()
      ctx.arc(cx, cy, maxRadius, 0, Math.PI * 2)
      ctx.fill()

      const { probabilities, result } = data
      const peak = result.topProbability || 1

      // Draw cells colored by probability (relative to peak so the hotspot pops)
      for (let ai = 0; ai < angleBins; ai++) {
        const a0 = (ai / angleBins) * Math.PI * 2
        const a1 = ((ai + 1) / angleBins) * Math.PI * 2
        for (let ri = 0; ri < radialBins; ri++) {
          const p = probabilities[ai][ri]
          if (p <= 0) continue
          const t = p / peak
          if (t < 0.02) continue
          const r0 = (ri / radialBins) * maxRadius
          const r1 = ((ri + 1) / radialBins) * maxRadius
          ctx.fillStyle = predictionColor(t)
          ctx.globalAlpha = Math.min(0.25 + t * 0.75, 0.95)
          ctx.beginPath()
          ctx.arc(cx, cy, r1, a0, a1)
          ctx.arc(cx, cy, r0, a1, a0, true)
          ctx.closePath()
          ctx.fill()
        }
      }
      ctx.globalAlpha = 1

      // Highlight top-3 hotspots
      const flat: { ai: number; ri: number; p: number }[] = []
      for (let ai = 0; ai < angleBins; ai++)
        for (let ri = 0; ri < radialBins; ri++)
          flat.push({ ai, ri, p: probabilities[ai][ri] })
      flat.sort((x, y) => y.p - x.p)
      const top = flat.slice(0, 3).filter((c) => c.p > 0)

      top.forEach((cell, idx) => {
        const aMid = ((cell.ai + 0.5) / angleBins) * 2 * Math.PI
        const rMid = ((cell.ri + 0.5) / radialBins) * maxRadius
        const px = cx + Math.cos(aMid) * rMid
        const py = cy + Math.sin(aMid) * rMid
        const ringR = 14 - idx * 3
        ctx.strokeStyle = idx === 0 ? "rgba(255, 230, 90, 0.95)" : "rgba(255, 230, 90, 0.55)"
        ctx.lineWidth = idx === 0 ? 2.5 : 1.5
        ctx.beginPath()
        ctx.arc(px, py, ringR, 0, Math.PI * 2)
        ctx.stroke()
        if (idx === 0) {
          ctx.fillStyle = "rgba(255, 230, 90, 1)"
          ctx.font = "bold 11px ui-monospace, monospace"
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillText(`${(cell.p * 100).toFixed(1)}%`, px, py - ringR - 8)
        }
      })

      // Rings + cross
      ctx.strokeStyle = "rgba(226, 232, 240, 0.16)"
      ctx.lineWidth = 1
      for (let i = 1; i <= radialBins / 2; i++) {
        ctx.beginPath()
        ctx.arc(cx, cy, (maxRadius / (radialBins / 2)) * i, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.strokeStyle = "rgba(226, 232, 240, 0.10)"
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
      const ringsShown = radialBins / 2
      for (let i = 1; i <= ringsShown; i++) {
        const r = (maxRadius / ringsShown) * i
        const cm = (maxDistance / ringsShown) * i
        const label = `${cm.toFixed(0)} cm`
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

      // Center
      ctx.fillStyle = "rgba(226, 232, 240, 0.9)"
      ctx.beginPath()
      ctx.arc(cx, cy, 3, 0, Math.PI * 2)
      ctx.fill()
    }

    setup()
    const ro = new ResizeObserver(setup)
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [data, size, maxDistance, angleBins, radialBins])

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
