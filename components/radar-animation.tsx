"use client"

import { useEffect, useRef } from "react"

export function RadarAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number
    let angle = 0

    const draw = () => {
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const maxRadius = Math.min(centerX, centerY) - 10

      // Clear canvas with fade effect
      ctx.fillStyle = "rgba(18, 20, 30, 0.1)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw circles
      ctx.strokeStyle = "rgba(52, 211, 153, 0.2)"
      ctx.lineWidth = 1
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath()
        ctx.arc(centerX, centerY, (maxRadius / 4) * i, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Draw cross lines
      ctx.strokeStyle = "rgba(52, 211, 153, 0.15)"
      ctx.beginPath()
      ctx.moveTo(centerX, centerY - maxRadius)
      ctx.lineTo(centerX, centerY + maxRadius)
      ctx.moveTo(centerX - maxRadius, centerY)
      ctx.lineTo(centerX + maxRadius, centerY)
      ctx.stroke()

      // Draw sweep line (radar beam)
      ctx.save()
      ctx.strokeStyle = "rgba(52, 211, 153, 0.8)"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      const endX = centerX + Math.cos(angle) * maxRadius
      const endY = centerY + Math.sin(angle) * maxRadius
      ctx.lineTo(endX, endY)
      ctx.stroke()
      
      // Draw sweep area with radial gradient
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, maxRadius, angle - 0.5, angle)
      ctx.closePath()
      
      const sweepGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius)
      sweepGradient.addColorStop(0, "rgba(52, 211, 153, 0.4)")
      sweepGradient.addColorStop(0.5, "rgba(52, 211, 153, 0.2)")
      sweepGradient.addColorStop(1, "rgba(52, 211, 153, 0.05)")
      ctx.fillStyle = sweepGradient
      ctx.fill()
      ctx.restore()

      // Draw center dot
      ctx.fillStyle = "rgba(52, 211, 153, 1)"
      ctx.beginPath()
      ctx.arc(centerX, centerY, 4, 0, Math.PI * 2)
      ctx.fill()

      // Draw some blips
      const blips = [
        { r: 0.6, a: angle - 0.3 },
        { r: 0.4, a: angle - 0.8 },
        { r: 0.8, a: angle - 1.5 },
      ]

      blips.forEach((blip) => {
        const x = centerX + Math.cos(blip.a) * maxRadius * blip.r
        const y = centerY + Math.sin(blip.a) * maxRadius * blip.r
        const opacity = Math.max(0, 1 - Math.abs(angle - blip.a) / 2)

        ctx.fillStyle = `rgba(52, 211, 153, ${opacity})`
        ctx.beginPath()
        ctx.arc(x, y, 3, 0, Math.PI * 2)
        ctx.fill()
      })

      angle += 0.02
      if (angle > Math.PI * 2) angle = 0

      animationId = requestAnimationFrame(draw)
    }

    draw()

    return () => cancelAnimationFrame(animationId)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={200}
      className="opacity-60"
    />
  )
}
