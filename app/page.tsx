"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ReadingsTable } from "@/components/readings-table"
import { SearchControls } from "@/components/search-controls"
import { StatsCards } from "@/components/stats-cards"
import { RadarAnimation } from "@/components/radar-animation"
import { Radio, Wifi, Signal, Bell, BellOff } from "lucide-react"

interface Reading {
  id: number
  distance: number
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
  const [bellActive, setBellActive] = useState(false)
  const [bellUpdatedAt, setBellUpdatedAt] = useState<string | null>(null)

  const apiHeaders = { "x-api-key": process.env.NEXT_PUBLIC_API_KEY ?? "" }

  const fetchBell = useCallback(async () => {
    try {
      const res = await fetch("/api/bell", { headers: apiHeaders })
      if (res.ok) {
        const data = await res.json()
        setBellActive(data.active)
        setBellUpdatedAt(data.updatedAt)
      }
    } catch (error) {
      console.error("Erro ao buscar estado do sino:", error)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    await Promise.all([fetchReadings(), fetchBell()])
  }, [fetchReadings, fetchBell])

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
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Projeto IOT</h1>
                <p className="text-xs text-muted-foreground">Sistema de Monitoramento de Sensores</p>
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
        {/* Hero Section */}
        <div className="mb-8 flex flex-col lg:flex-row items-center gap-8">
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Dashboard de Leituras
            </h2>
            <p className="text-muted-foreground text-lg mb-6">
              Monitore as leituras de distância dos seus sensores em tempo real.
              Configure o limite de resultados e acompanhe as métricas.
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
          <div className="hidden lg:flex items-center justify-center">
            <RadarAnimation />
          </div>
        </div>

        {/* Live Display + Bell — side by side on md+ */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Live sensor reading */}
          <Card className={`md:col-span-2 border ${latestBg} transition-colors duration-500`}>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-6">
                <div className="flex flex-col items-center sm:items-start justify-center flex-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${autoRefresh ? "animate-pulse bg-green-500" : "bg-muted-foreground"}`} />
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
                      #{latest.id.toString().padStart(4, "0")}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bell state */}
          <Card className={`border transition-colors duration-500 ${
            bellActive
              ? "bg-yellow-500/10 border-yellow-500/30"
              : "bg-card border-border/50"
          }`}>
            <CardContent className="p-6 flex flex-col items-center justify-center gap-4 h-full">
              <p className="text-xs text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${bellActive ? "bg-yellow-400 animate-pulse" : "bg-muted-foreground"}`} />
                Estado do Sino
              </p>

              <div className="relative flex items-center justify-center">
                {bellActive && (
                  <span className="absolute w-16 h-16 rounded-full bg-yellow-400/20 animate-ping" />
                )}
                {bellActive ? (
                  <Bell
                    className="w-14 h-14 text-yellow-400 animate-bell-ring drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]"
                  />
                ) : (
                  <BellOff className="w-14 h-14 text-muted-foreground/40" />
                )}
              </div>

              <div className="text-center">
                <p className={`text-lg font-bold ${bellActive ? "text-yellow-400" : "text-muted-foreground"}`}>
                  {bellActive ? "Ligado" : "Desligado"}
                </p>
                {bellUpdatedAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatRelative(bellUpdatedAt)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="mb-8">
          <StatsCards readings={readings} />
        </div>

        {/* Data Table */}
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
