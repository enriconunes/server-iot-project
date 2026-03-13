"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ReadingsTable } from "@/components/readings-table"
import { SearchControls } from "@/components/search-controls"
import { StatsCards } from "@/components/stats-cards"
import { RadarAnimation } from "@/components/radar-animation"
import { Radio, Wifi, Signal } from "lucide-react"

interface Reading {
  id: number
  distance: number
  unit: string
  createdAt: string
}

export default function DashboardPage() {
  const [readings, setReadings] = useState<Reading[]>([])
  const [limit, setLimit] = useState("20")
  const [isLoading, setIsLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState("2000")

  const fetchReadings = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/readings?limit=${limit}`, {
        headers: { "x-api-key": process.env.NEXT_PUBLIC_API_KEY ?? "" },
      })
      if (response.ok) {
        const data = await response.json()
        setReadings(data)
      }
    } catch (error) {
      console.error("Erro ao buscar leituras:", error)
    } finally {
      setIsLoading(false)
    }
  }, [limit])

  useEffect(() => {
    fetchReadings()
  }, [fetchReadings])

  useEffect(() => {
    if (!autoRefresh) return
    const ms = Math.max(Number(refreshInterval), 100)
    const id = setInterval(fetchReadings, ms)
    return () => clearInterval(id)
  }, [autoRefresh, refreshInterval, fetchReadings])

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
              onSearch={fetchReadings}
              isLoading={isLoading}
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
            <ReadingsTable readings={readings} isLoading={isLoading} />
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
