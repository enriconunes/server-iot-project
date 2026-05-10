"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Activity, Gauge, Clock, Database } from "lucide-react"

interface Reading {
  id: number
  distance: number
  unit: string
  createdAt: string
}

interface StatsCardsProps {
  readings: Reading[]
}

export function StatsCards({ readings }: StatsCardsProps) {
  const totalReadings = readings.length
  const avgDistance = readings.length > 0
    ? readings.reduce((acc, r) => acc + r.distance, 0) / readings.length
    : 0
  const minDistance = readings.length > 0
    ? Math.min(...readings.map((r) => r.distance))
    : 0
  const maxDistance = readings.length > 0
    ? Math.max(...readings.map((r) => r.distance))
    : 0

  const stats = [
    {
      label: "Total de Leituras",
      value: totalReadings,
      icon: Database,
      suffix: "",
    },
    {
      label: "Distância Média",
      value: avgDistance.toFixed(1),
      icon: Activity,
      suffix: "cm",
    },
    {
      label: "Mínima",
      value: minDistance.toFixed(1),
      icon: Gauge,
      suffix: "cm",
    },
    {
      label: "Máxima",
      value: maxDistance.toFixed(1),
      icon: Clock,
      suffix: "cm",
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="bg-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  {stat.label}
                </p>
                <p className="text-xl font-bold text-foreground">
                  {stat.value}
                  {stat.suffix && (
                    <span className="text-sm text-muted-foreground ml-1">
                      {stat.suffix}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
