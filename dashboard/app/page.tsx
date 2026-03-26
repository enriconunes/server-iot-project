"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ReadingsTable } from "@/components/readings-table"
import { SearchControls } from "@/components/search-controls"
import { StatsCards } from "@/components/stats-cards"
import { RadarCanvas } from "@/components/radar-canvas"
import { HeatmapCanvas } from "@/components/heatmap-canvas"
import { SmsLogTable } from "@/components/sms-log-table"
import { Radio, Wifi, WifiOff, Signal, MessageSquare } from "lucide-react"

interface Reading {
  id: string
  distance: number
  angle: number
  unit: string
  createdAt: string
}

export default function DashboardPage() {
  const [readings, setReadings] = useState<Reading[]>([])
  const [limit, setLimit] = useState("20")
  const [isLoading, setIsLoading] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState("2000")
  const [sseConnected, setSseConnected] = useState(false)
  const [lastSseReading, setLastSseReading] = useState<{ distance: number; angle: number } | null>(null)

  const apiKey = process.env.NEXT_PUBLIC_API_KEY ?? ""
  const apiHeaders = { "x-api-key": apiKey }

  // SSE connection for real-time radar
  useEffect(() => {
    const es = new EventSource(`/api/sse?key=${apiKey}`)

    es.onopen = () => setSseConnected(true)
    es.onerror = () => setSseConnected(false)

    es.onmessage = (event) => {
      try {
        const reading: Reading = JSON.parse(event.data)
        setLastSseReading({ distance: reading.distance, angle: reading.angle })
        setReadings((prev) => {
          const updated = [reading, ...prev.filter((r) => r.id !== reading.id)]
          return updated.slice(0, Math.max(Number(limit), 50))
        })
        setInitialLoad(false)
      } catch {
        // ignore
      }
    }

    return () => es.close()
  }, [apiKey, limit])

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit])

  const fetchAll = useCallback(async () => {
    await fetchReadings()
  }, [fetchReadings])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  useEffect(() => {
    if (!autoRefresh) return
    const ms = Math.max(Number(refreshInterval), 100)
    const id = setInterval(fetchAll, ms)
    return () => clearInterval(id)
  }, [autoRefresh, refreshInterval, fetchAll])

  const latest = readings[0] ?? null

  const latestColor =
    latest === null
      ? "text-muted-foreground"
      : latest.distance < 20
      ? "text-red-400"
      : latest.distance < 50
      ? "text-yellow-400"
      : "text-primary"

  const latestBg =
    latest === null
      ? "bg-muted/20"
      : latest.distance < 20
      ? "bg-red-500/10 border-red-500/20"
      : latest.distance < 50
      ? "bg-yellow-500/10 border-yellow-500/20"
      : "bg-primary/10 border-primary/20"

  const latestLabel =
    latest === null
      ? "Aguardando leitura"
      : latest.distance < 20
      ? "Muito Próximo"
      : latest.distance < 50
      ? "Próximo"
      : "Normal"

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
                <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${sseConnected ? "bg-primary animate-pulse" : "bg-red-500"}`} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Projeto IOT</h1>
                <p className="text-xs text-muted-foreground">Sistema de Monitoramento de Sensores</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                {sseConnected ? (
                  <Wifi className="w-4 h-4 text-primary" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-400" />
                )}
                <span className="text-xs">{sseConnected ? "SSE Conectado" : "SSE Desconectado"}</span>
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
        {/* Hero Section */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Dashboard de Leituras
          </h2>
          <p className="text-muted-foreground text-lg mb-6">
            Monitore as deteções do radar em tempo real. Visualize o heatmap histórico e as previsões estatísticas.
          </p>
          <SearchControls
            limit={limit}
            onLimitChange={setLimit}
            onSearch={fetchAll}
            isLoading={isLoading && initialLoad}
            autoRefresh={autoRefresh}
            refreshInterval={refreshInterval}
            onRefreshIntervalChange={setRefreshInterval}
            onAutoRefreshToggle={() => setAutoRefresh((prev) => !prev)}
          />
        </div>

        {/* Live Display */}
        <div className="mb-8">
          <Card className={`border ${latestBg} transition-colors duration-500`}>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-6">
                <div className="flex flex-col items-center sm:items-start justify-center flex-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${sseConnected ? "animate-pulse bg-green-500" : "bg-muted-foreground"}`} />
                    Leitura Atual
                  </p>
                  <div className="flex items-end gap-2">
                    <span className={`text-6xl font-bold tabular-nums transition-all duration-300 ${latestColor}`}>
                      {latest !== null ? latest.distance.toFixed(1) : "—"}
                    </span>
                    {latest !== null && (
                      <span className="text-2xl text-muted-foreground mb-2">{latest.unit}</span>
                    )}
                  </div>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end justify-center gap-4 sm:gap-2 text-right">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${latestBg} ${latestColor}`}>
                    {latestLabel}
                  </span>
                  {latest !== null && (
                    <span className="text-xs text-muted-foreground">
                      {formatRelative(latest.createdAt)}
                    </span>
                  )}
                  {latest !== null && (
                    <span className="text-xs text-muted-foreground font-mono">
                      {latest.id.slice(0, 8)}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Stats Cards */}
        <div className="mb-8">
          <StatsCards readings={readings} />
        </div>

        {/* Heatmap + Prediction */}
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <Card className="bg-card border-border/50">
            <CardHeader className="border-b border-border/30">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-400 rounded-full" />
                Heatmap de Deteções
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Frequência de deteções por ângulo e distância. Círculos amarelos indicam zonas de maior probabilidade previstas pelo modelo KDE.
              </p>
            </CardHeader>
            <CardContent className="p-4 flex justify-center">
              <HeatmapCanvas apiKey={apiKey} />
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50">
            <CardHeader className="border-b border-border/30">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Radar em Tempo Real
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Vista ao vivo das deteções via SSE. Os blips desaparecem após 3 segundos.
              </p>
            </CardHeader>
            <CardContent className="p-4 flex flex-col items-center gap-2">
              <RadarCanvas lastReading={lastSseReading} />
              <span className="text-xs text-muted-foreground font-mono">
                {sseConnected ? "RADAR LIVE" : "RADAR OFFLINE"}
              </span>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <Card className="bg-card border-border/50 mb-8">
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

        {/* SMS Log */}
        <Card className="bg-card border-border/50">
          <CardHeader className="border-b border-border/30">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Histórico de SMS
              </CardTitle>
              <span className="text-xs text-muted-foreground">Atualiza a cada 30s</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <SmsLogTable apiKey={apiKey} />
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full" />
            Normal (50+ cm)
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-400 rounded-full" />
            Próximo (20-50 cm)
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-400 rounded-full" />
            Muito Próximo (&lt;20 cm)
          </div>
        </div>
      </div>
    </main>
  )
}
