"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Radio, Activity } from "lucide-react"

interface Reading {
  id: number
  sensor: number
  distance: number
  angle: number
  unit: string
  createdAt: string
}

interface ReadingsTableProps {
  readings: Reading[]
  isLoading: boolean
}

const SENSOR_BADGE: Record<number, string> = {
  1: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  2: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  3: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  4: "bg-pink-500/10 text-pink-400 border-pink-500/20",
}

export function ReadingsTable({ readings, isLoading }: ReadingsTableProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "medium",
    }).format(date)
  }

  const getDistanceColor = (distance: number) => {
    if (distance < 20) return "text-red-400"
    if (distance < 50) return "text-yellow-400"
    return "text-primary"
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-primary/30 rounded-full animate-ping absolute" />
          <Radio className="w-12 h-12 text-primary animate-pulse" />
        </div>
        <p className="text-muted-foreground">Escaneando dados...</p>
      </div>
    )
  }

  if (readings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <Activity className="w-12 h-12 text-muted-foreground" />
        <p className="text-muted-foreground">Nenhuma leitura encontrada</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border/50 hover:bg-transparent">
            <TableHead className="text-muted-foreground font-medium">ID</TableHead>
            <TableHead className="text-muted-foreground font-medium">Sensor</TableHead>
            <TableHead className="text-muted-foreground font-medium">Distância</TableHead>
            <TableHead className="text-muted-foreground font-medium">Ângulo</TableHead>
            <TableHead className="text-muted-foreground font-medium">Unidade</TableHead>
            <TableHead className="text-muted-foreground font-medium text-right">Data/Hora</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {readings.map((reading) => (
            <TableRow
              key={reading.id}
              className="border-border/30 hover:bg-primary/5 transition-colors"
            >
              <TableCell className="font-mono text-muted-foreground">
                #{reading.id.toString().padStart(4, "0")}
              </TableCell>
              <TableCell>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${SENSOR_BADGE[reading.sensor] ?? "bg-muted text-muted-foreground border-border"}`}>
                  S{reading.sensor}
                </span>
              </TableCell>
              <TableCell>
                <span className={`font-bold text-lg ${getDistanceColor(reading.distance)}`}>
                  {reading.distance.toFixed(1)}
                </span>
              </TableCell>
              <TableCell className="font-mono text-sm text-muted-foreground">
                {reading.angle.toFixed(1)}°
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                  {reading.unit}
                </span>
              </TableCell>
              <TableCell className="text-right text-muted-foreground font-mono text-sm">
                {formatDate(reading.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
