"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ReadingsTable } from "@/components/readings-table"
import { SearchControls } from "@/components/search-controls"
import { StatsCards } from "@/components/stats-cards"
import { RadarAnimation } from "@/components/radar-animation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Radio, Wifi, Signal } from "lucide-react"

const TIME_WINDOWS: { value: string; label: string; ms: number }[] = [
  { value: "60000",    label: "Último minuto",    ms: 60_000 },
  { value: "600000",   label: "Últimos 10 min",   ms: 600_000 },
  { value: "1800000",  label: "Últimos 30 min",   ms: 1_800_000 },
  { value: "3600000",  label: "Última hora",      ms: 3_600_000 },
  { value: "86400000", label: "Último dia",       ms: 86_400_000 },
]

interface Reading {
  id: number
  sensor: number
  distance: number
  angle: number
  unit: string
  createdAt: string
}

const SENSOR_IDS = [1, 2, 3, 4] as const

const SENSOR_TONE: Record<number, { text: string; bg: string; dot: string }> = {
  1: { text: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", dot: "bg-emerald-400" },
  2: { text: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/20",       dot: "bg-blue-400" },
  3: { text: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20",     dot: "bg-amber-400" },
  4: { text: "text-pink-400",    bg: "bg-pink-500/10 border-pink-500/20",       dot: "bg-pink-400" },
}

export default function DashboardPage() {
  const [readings, setReadings] = useState<Reading[]>([])
  const [limit, setLimit] = useState("50")
  const [isLoading, setIsLoading] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState("2000")
  const [windowMs, setWindowMs] = useState("600000")

  const apiHeaders = useMemo(
    () => ({ "x-api-key": process.env.NEXT_PUBLIC_API_KEY ?? "" }),
    []
  )

  const fetchReadings = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/readings?limit=${limit}`, {
        headers: apiHeaders,
      })
      if (response.ok) {
        const data = await response.json()
        setReadings(data)
        setInitialLoad(false)
      }
    } catch (error) {
      console.error("Erro ao buscar leituras:", error)
    } finally {
      setIsLoading(false)
    }
  }, [limit, apiHeaders])

  useEffect(() => {
    fetchReadings()
  }, [fetchReadings])

  useEffect(() => {
    if (!autoRefresh) return
    const ms = Math.max(Number(refreshInterval), 100)
    const id = setInterval(fetchReadings, ms)
    return () => clearInterval(id)
  }, [autoRefresh, refreshInterval, fetchReadings])

  const liveReadings = useMemo(() => {
    const now = Date.now()
    return readings.filter(
      (r) => now - new Date(r.createdAt).getTime() <= 5000
    )
  }, [readings])

  const windowedReadings = useMemo(() => {
    const now = Date.now()
    const ms = Number(windowMs)
    return readings.filter(
      (r) => now - new Date(r.createdAt).getTime() <= ms
    )
  }, [readings, windowMs])

  const latestPerSensor = useMemo(() => {
    const map = new Map<number, Reading>()
    for (const r of readings) {
      if (!map.has(r.sensor)) map.set(r.sensor, r)
    }
    return map
  }, [readings])

  const formatRelative = (dateString: string) => {
    const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000)
    if (diff < 5) return "agora mesmo"
    if (diff < 60) return `há ${diff}s`
    if (diff < 3600) return `há ${Math.floor(diff / 60)}min`
    return `há ${Math.floor(diff / 3600)}h`
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Radio className="w-5 h-5 text-primary" />
                </div>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Projeto IOT</h1>
                <p className="text-xs text-muted-foreground">Radar Multi-Sensor (4× HC-SR04)</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-primary" />
                <span className="text-xs">Conectado</span>
              </div>
              <div className="flex items-center gap-2">
                <Signal className="w-4 h-4 text-primary" />
                <span className="text-xs">Ativo</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Hero */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3 text-balance">
            Dashboard de Leituras
          </h2>
          <p className="text-muted-foreground text-lg mb-6">
            Monitoramento em tempo real de 4 sensores HC-SR04 com varredura angular completa (0–360°).
          </p>
          <SearchControls
            limit={limit}
            onLimitChange={setLimit}
            onSearch={fetchReadings}
            isLoading={isLoading && initialLoad}
            autoRefresh={autoRefresh}
            refreshInterval={refreshInterval}
            onRefreshIntervalChange={setRefreshInterval}
            onAutoRefreshToggle={() => setAutoRefresh((prev) => !prev)}
          />
        </div>

        {/* Radars */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-card border-border/50">
            <CardHeader className="border-b border-border/30">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Visualização ao Vivo
                <span className="ml-auto text-xs font-normal text-muted-foreground">
                  fade 5s · alcance 30cm
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 flex items-center justify-center">
              <RadarAnimation
                readings={liveReadings}
                maxDistance={30}
                fadeMs={5000}
                size={360}
              />
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50">
            <CardHeader className="border-b border-border/30">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full" />
                  Histórico
                </CardTitle>
                <Select value={windowMs} onValueChange={setWindowMs}>
                  <SelectTrigger className="h-8 w-[180px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_WINDOWS.map((w) => (
                      <SelectItem key={w.value} value={w.value} className="text-xs">
                        {w.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 flex items-center justify-center">
              <RadarAnimation
                readings={windowedReadings}
                maxDistance={30}
                fadeMs={0}
                showSweep={false}
                size={360}
              />
            </CardContent>
          </Card>
        </div>

        {/* Per-sensor live cards */}
        <div className="mb-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {SENSOR_IDS.map((id) => {
              const r = latestPerSensor.get(id)
              const tone = SENSOR_TONE[id]
              return (
                <Card
                  key={id}
                  className={`border transition-colors duration-500 ${r ? tone.bg : "bg-card border-border/50"}`}
                >
                  <CardContent className="p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${r ? tone.dot : "bg-muted-foreground"} ${r ? "animate-pulse" : ""}`} />
                        Sensor {id}
                      </span>
                    </div>
                    <div className="flex items-end gap-1">
                      <span className={`text-3xl font-bold tabular-nums ${r ? tone.text : "text-muted-foreground"}`}>
                        {r ? r.distance.toFixed(1) : "—"}
                      </span>
                      {r && (
                        <span className="text-xs text-muted-foreground mb-1">{r.unit}</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {r ? `∠ ${r.angle.toFixed(1)}°` : "sem dados"}
                    </div>
                    {r && (
                      <div className="text-[10px] text-muted-foreground">
                        {formatRelative(r.createdAt)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <StatsCards readings={readings} />
        </div>

        {/* Table */}
        <Card className="bg-card border-border/50">
          <CardHeader className="border-b border-border/30">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Leituras Recentes
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                {readings.length} {readings.length === 1 ? "registro" : "registros"}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ReadingsTable readings={readings} isLoading={initialLoad} />
          </CardContent>
        </Card>

        {/* Footer legend */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
          {SENSOR_IDS.map((id) => (
            <div key={id} className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${SENSOR_TONE[id].dot}`} />
              Sensor {id}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
