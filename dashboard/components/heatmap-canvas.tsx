"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { RefreshCw } from "lucide-react"

const SIZE = 400
const CX = SIZE / 2
const CY = SIZE / 2
const MAX_RANGE_PX = SIZE / 2 - 20
const MAX_RANGE_CM = 400
const ANGLE_STEP = 10
const DIST_STEP = 50
const RING_COUNT = MAX_RANGE_CM / DIST_STEP // 8

interface HeatCell {
  angleBucket: number
  distBucket: number
  count: number
}

interface HeatmapData {
  angleStep: number
  distStep: number
  maxDist: number
  maxCount: number
  cells: HeatCell[]
}

interface Prediction {
  angle: number
  distance: number
  probability: number
}

interface HeatmapCanvasProps {
  apiKey: string
}

/** Maps a normalized intensity [0,1] to an RGB color: dark → green → yellow → red */
function heatColor(t: number): [number, number, number] {
  if (t <= 0) return [20, 40, 20]
  if (t < 0.5) {
    const s = t * 2
    return [Math.round(s * 220), Math.round(80 + s * 150), 0]
  }
  const s = (t - 0.5) * 2
  return [255, Math.round(230 * (1 - s)), 0]
}

export function HeatmapCanvas({ apiKey }: HeatmapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [heatmap, setHeatmap] = useState<HeatmapData | null>(null)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [lastFetch, setLastFetch] = useState<Date | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const headers = { "x-api-key": apiKey }
      const [hmRes, prRes] = await Promise.all([
        fetch("/api/heatmap", { headers }),
        fetch("/api/predict", { headers }),
      ])
      if (hmRes.ok) setHeatmap(await hmRes.json())
      if (prRes.ok) {
        const pr = await prRes.json()
        setPredictions(pr.predictions)
      }
      setLastFetch(new Date())
    } finally {
      setLoading(false)
    }
  }, [apiKey])

  useEffect(() => {
    fetchData()
    const id = setInterval(fetchData, 15_000)
    return () => clearInterval(id)
  }, [fetchData])

  // Redraw canvas whenever data changes
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Background
    ctx.fillStyle = "rgba(10, 15, 10, 1)"
    ctx.fillRect(0, 0, SIZE, SIZE)

    // Grid rings + distance labels
    for (let i = 1; i <= RING_COUNT; i++) {
      const r = (MAX_RANGE_PX / RING_COUNT) * i
      ctx.strokeStyle = "rgba(52, 211, 153, 0.15)"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(CX, CY, r, 0, Math.PI * 2)
      ctx.stroke()

      ctx.fillStyle = "rgba(52, 211, 153, 0.35)"
      ctx.font = "10px monospace"
      ctx.fillText(`${(MAX_RANGE_CM / RING_COUNT) * i}cm`, CX + 4, CY - r + 12)
    }

    // Radial lines every 45°
    for (let a = 0; a < 360; a += 45) {
      const rad = (a * Math.PI) / 180
      ctx.strokeStyle = "rgba(52, 211, 153, 0.08)"
      ctx.beginPath()
      ctx.moveTo(CX, CY)
      ctx.lineTo(CX + Math.cos(rad) * MAX_RANGE_PX, CY - Math.sin(rad) * MAX_RANGE_PX)
      ctx.stroke()
    }

    // Angle labels every 45°
    ctx.fillStyle = "rgba(52, 211, 153, 0.4)"
    ctx.font = "9px monospace"
    const labelR = MAX_RANGE_PX + 12
    for (let a = 0; a < 360; a += 45) {
      const rad = (a * Math.PI) / 180
      const lx = CX + Math.cos(rad) * labelR - 8
      const ly = CY - Math.sin(rad) * labelR + 4
      ctx.fillText(`${a}°`, lx, ly)
    }

    if (!heatmap || heatmap.maxCount === 0) return

    // Draw heatmap sectors
    for (const cell of heatmap.cells) {
      const t = cell.count / heatmap.maxCount
      const [r, g, b] = heatColor(t)
      const alpha = 0.12 + t * 0.68

      const innerR = (cell.distBucket / MAX_RANGE_CM) * MAX_RANGE_PX
      const outerR = Math.min(((cell.distBucket + DIST_STEP) / MAX_RANGE_CM) * MAX_RANGE_PX, MAX_RANGE_PX)
      const startRad = (cell.angleBucket * Math.PI) / 180
      const endRad = ((cell.angleBucket + ANGLE_STEP) * Math.PI) / 180

      ctx.beginPath()
      // Outer arc CW in canvas (= CCW in standard math because y is flipped)
      ctx.arc(CX, CY, outerR, -endRad, -startRad)
      // Inner arc CCW in canvas to close the annular sector
      ctx.arc(CX, CY, innerR > 0 ? innerR : 0.5, -startRad, -endRad, true)
      ctx.closePath()
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
      ctx.fill()
    }

    // Prediction overlays (yellow rings)
    for (let i = 0; i < predictions.length; i++) {
      const pred = predictions[i]
      const distPx = Math.min((pred.distance / MAX_RANGE_CM) * MAX_RANGE_PX, MAX_RANGE_PX)
      const rad = (pred.angle * Math.PI) / 180
      const px = CX + Math.cos(rad) * distPx
      const py = CY - Math.sin(rad) * distPx

      const intensity = pred.probability * 4
      const ringR = 10 + (1 - i / predictions.length) * 8

      // Glow
      ctx.beginPath()
      ctx.arc(px, py, ringR + 4, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(250, 204, 21, ${Math.min(intensity * 0.15, 0.25)})`
      ctx.fill()

      // Ring
      ctx.beginPath()
      ctx.arc(px, py, ringR, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(250, 204, 21, ${Math.min(0.4 + intensity, 0.95)})`
      ctx.lineWidth = i === 0 ? 2.5 : 1.5
      ctx.stroke()

      // Fill
      ctx.fillStyle = `rgba(250, 204, 21, ${Math.min(intensity * 0.12, 0.2)})`
      ctx.fill()

      // Probability label
      ctx.fillStyle = "rgba(250, 204, 21, 0.9)"
      ctx.font = `bold ${i === 0 ? 10 : 9}px monospace`
      ctx.fillText(`${(pred.probability * 100).toFixed(1)}%`, px + ringR + 3, py + 4)
    }

    // Center dot
    ctx.fillStyle = "rgba(52, 211, 153, 1)"
    ctx.beginPath()
    ctx.arc(CX, CY, 3, 0, Math.PI * 2)
    ctx.fill()
  }, [heatmap, predictions])

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas
        ref={canvasRef}
        width={SIZE}
        height={SIZE}
        className="rounded-xl border border-emerald-900/30"
      />

      {/* Controls + timestamp */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        {lastFetch && <span>Atualizado: {lastFetch.toLocaleTimeString("pt-BR")}</span>}
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-1 text-primary hover:text-primary/80 disabled:opacity-50 transition-opacity"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap justify-center">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm inline-block" style={{ background: "rgba(0,180,0,0.7)" }} />
          Baixa freq.
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm inline-block" style={{ background: "rgba(255,200,0,0.7)" }} />
          Média
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm inline-block" style={{ background: "rgba(255,30,0,0.7)" }} />
          Alta freq.
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full border-2 border-yellow-400 inline-block" />
          Previsão KDE
        </div>
      </div>
    </div>
  )
}
