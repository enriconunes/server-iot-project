"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ReadingsTable } from "@/components/readings-table"
import { SearchControls } from "@/components/search-controls"
import { StatsCards } from "@/components/stats-cards"
import { RadarAnimation } from "@/components/radar-animation"
import { PredictionRadar, computePrediction } from "@/components/prediction-radar"
import { SmsPanel } from "@/components/sms-panel"
import { Switch } from "@/components/ui/switch"
import { Power, Sparkles, Lightbulb, Siren } from "lucide-react"

interface SensorConfig {
  sensor: number
  enabled: boolean
  updatedAt: string
}

interface ActuatorConfig {
  id: number
  enabled: boolean
  updatedAt: string
}
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Radio, Wifi, Signal } from "lucide-react"

const TIME_WINDOWS: { value: string; label: string }[] = [
  { value: "60000",    label: "Último minuto"  },
  { value: "600000",   label: "Últimos 10 min" },
  { value: "1800000",  label: "Últimos 30 min" },
  { value: "3600000",  label: "Última hora"    },
  { value: "86400000", label: "Último dia"     },
  { value: "all",      label: "Sempre"         },
]

function inWindow(createdAt: string, windowValue: string, now: number): boolean {
  if (windowValue === "all") return true
  const ms = Number(windowValue)
  if (!Number.isFinite(ms)) return true
  return now - new Date(createdAt).getTime() <= ms
}

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
  const [refreshInterval, setRefreshInterval] = useState("3000")
  const [windowMs, setWindowMs] = useState("600000")
  const [predWindowMs, setPredWindowMs] = useState("3600000")
  const [liveFadeSec, setLiveFadeSec] = useState(5)
  const [sensorConfig, setSensorConfig] = useState<SensorConfig[]>([])
  const [togglingSensor, setTogglingSensor] = useState<number | null>(null)
  const [actuator, setActuator] = useState<ActuatorConfig | null>(null)
  const [togglingActuator, setTogglingActuator] = useState(false)
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 15

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

  const fetchSensorConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/sensors/config", { headers: apiHeaders })
      if (res.ok) setSensorConfig(await res.json())
    } catch (e) {
      console.error("Erro ao buscar config:", e)
    }
  }, [apiHeaders])

  useEffect(() => {
    fetchSensorConfig()
    const id = setInterval(fetchSensorConfig, 10000)
    return () => clearInterval(id)
  }, [fetchSensorConfig])

  const fetchActuator = useCallback(async () => {
    try {
      const res = await fetch("/api/actuators/config", { headers: apiHeaders })
      if (res.ok) setActuator(await res.json())
    } catch (e) {
      console.error("Erro ao buscar atuador:", e)
    }
  }, [apiHeaders])

  useEffect(() => {
    fetchActuator()
    const id = setInterval(fetchActuator, 10000)
    return () => clearInterval(id)
  }, [fetchActuator])

  const toggleActuator = useCallback(
    async (enabled: boolean) => {
      setTogglingActuator(true)
      setActuator((prev) => (prev ? { ...prev, enabled } : prev))
      try {
        const res = await fetch("/api/actuators/config", {
          method: "PATCH",
          headers: { ...apiHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({ enabled }),
        })
        if (!res.ok) await fetchActuator()
      } catch (e) {
        console.error("Erro ao alternar atuador:", e)
        await fetchActuator()
      } finally {
        setTogglingActuator(false)
      }
    },
    [apiHeaders, fetchActuator]
  )

  const toggleSensor = useCallback(
    async (sensor: number, enabled: boolean) => {
      setTogglingSensor(sensor)
      setSensorConfig((prev) =>
        prev.map((c) => (c.sensor === sensor ? { ...c, enabled } : c))
      )
      try {
        const res = await fetch("/api/sensors/config", {
          method: "PATCH",
          headers: { ...apiHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({ sensor, enabled }),
        })
        if (!res.ok) await fetchSensorConfig()
      } catch (e) {
        console.error("Erro ao alternar sensor:", e)
        await fetchSensorConfig()
      } finally {
        setTogglingSensor(null)
      }
    },
    [apiHeaders, fetchSensorConfig]
  )

  useEffect(() => {
    if (!autoRefresh) return
    const ms = Math.max(Number(refreshInterval), 100)
    const id = setInterval(fetchReadings, ms)
    return () => clearInterval(id)
  }, [autoRefresh, refreshInterval, fetchReadings])

  const liveReadings = useMemo(() => {
    const now = Date.now()
    const ms = Math.max(liveFadeSec, 0) * 1000
    return readings.filter(
      (r) => now - new Date(r.createdAt).getTime() <= ms
    )
  }, [readings, liveFadeSec])

  const windowedReadings = useMemo(() => {
    const now = Date.now()
    return readings.filter((r) => inWindow(r.createdAt, windowMs, now))
  }, [readings, windowMs])

  const predReadings = useMemo(() => {
    const now = Date.now()
    return readings.filter((r) => inWindow(r.createdAt, predWindowMs, now))
  }, [readings, predWindowMs])

  const PRED_SIGMA = 3
  const PRED_HALF_LIFE_MS = 30 * 60 * 1000
  const PRED_ANG_BINS = 72
  const PRED_RAD_BINS = 12

  const predResult = useMemo(
    () =>
      computePrediction(predReadings, {
        maxDistance: 30,
        sigma: PRED_SIGMA,
        halfLifeMs: PRED_HALF_LIFE_MS,
        angleBins: PRED_ANG_BINS,
        radialBins: PRED_RAD_BINS,
      }).result,
    [predReadings]
  )

  const totalPages = Math.max(1, Math.ceil(readings.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pagedReadings = useMemo(
    () => readings.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [readings, safePage]
  )

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [totalPages, page])

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

        {/* Controles: sensores (esq.) + atuador (dir.) lado a lado em telas grandes */}
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        {/* Sensor toggles */}
        <Card className="h-full bg-card border-border/50">
          <CardHeader className="border-b border-border/30">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Power className="w-4 h-4 text-primary" />
              Controle de Sensores
              <span className="ml-auto text-xs font-normal text-muted-foreground">
                ESP32 lê a cada 5s
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-2 gap-3">
              {SENSOR_IDS.map((id) => {
                const cfg = sensorConfig.find((c) => c.sensor === id)
                const enabled = cfg?.enabled ?? false
                const tone = SENSOR_TONE[id]
                return (
                  <div
                    key={id}
                    className={`rounded-lg border p-4 transition-colors ${enabled ? tone.bg : "bg-background/40 border-border/50"}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${enabled ? tone.dot : "bg-muted-foreground"} ${enabled ? "animate-pulse" : ""}`} />
                          Sensor {id}
                        </p>
                        <p className={`text-base font-bold mt-1 ${enabled ? tone.text : "text-muted-foreground"}`}>
                          {enabled ? "Ativo" : "Desativado"}
                        </p>
                      </div>
                      <Switch
                        checked={enabled}
                        disabled={togglingSensor === id}
                        onCheckedChange={(v) => toggleSensor(id, v)}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Actuator (LED) control */}
        {(() => {
          const on = actuator?.enabled ?? false
          return (
            <Card
              className={`h-full overflow-hidden transition-colors duration-500 ${
                on
                  ? "bg-amber-500/5 border-amber-500/40"
                  : "bg-card border-border/50"
              }`}
            >
              <CardHeader className="border-b border-border/30">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Siren
                    className={`w-4 h-4 transition-colors ${
                      on ? "text-amber-400" : "text-muted-foreground"
                    }`}
                  />
                  Atuador de Alerta
                  <span className="ml-auto text-xs font-normal text-muted-foreground">
                    LED · ESP32 lê a cada 5s
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div
                  role="button"
                  tabIndex={togglingActuator ? -1 : 0}
                  onClick={() => !togglingActuator && toggleActuator(!on)}
                  onKeyDown={(e) => {
                    if (togglingActuator) return
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      toggleActuator(!on)
                    }
                  }}
                  aria-pressed={on}
                  aria-disabled={togglingActuator}
                  className={`group w-full text-left rounded-xl border p-5 flex items-center gap-5 transition-colors duration-300 ${
                    togglingActuator ? "cursor-wait" : "cursor-pointer"
                  } ${
                    on
                      ? "border-amber-500/30 bg-amber-500/10"
                      : "border-border/50 bg-background/40 hover:border-border"
                  }`}
                >
                  {/* Ring with the LED icon */}
                  <div className="relative shrink-0">
                    <div
                      className={`relative w-16 h-16 rounded-full border flex items-center justify-center transition-colors duration-300 ${
                        on
                          ? "border-amber-400/40 bg-amber-500/10"
                          : "border-border/60 bg-background"
                      }`}
                    >
                      <Lightbulb
                        className={`w-7 h-7 transition-colors duration-300 ${
                          on ? "text-amber-300" : "text-muted-foreground"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Label + state */}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          on ? "bg-amber-400 animate-pulse" : "bg-muted-foreground"
                        }`}
                      />
                      LED de alerta
                    </p>
                    <p
                      className={`text-base font-bold mt-1 transition-colors duration-500 ${
                        on ? "text-amber-300" : "text-muted-foreground"
                      }`}
                    >
                      {on ? "Aceso" : "Apagado"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {on
                        ? "Algo foi detetado a ≤30 cm. Desligue aqui para repor o LED."
                        : "Acende automaticamente quando algo é detetado a ≤30 cm."}
                    </p>
                  </div>

                  {/* Switch (visual; whole card is clickable) */}
                  <div className="shrink-0 pointer-events-none">
                    <Switch checked={on} disabled={togglingActuator} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })()}
        </div>

        {/* Radars */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-card border-border/50">
            <CardHeader className="border-b border-border/30">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  Visualização ao Vivo
                </CardTitle>
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  fade
                  <input
                    type="number"
                    min={1}
                    max={120}
                    step={1}
                    value={liveFadeSec}
                    onChange={(e) =>
                      setLiveFadeSec(Math.max(1, Math.min(120, Number(e.target.value) || 1)))
                    }
                    className="h-8 w-16 rounded-md border border-border/50 bg-background px-2 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <span>s</span>
                </label>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 flex items-center justify-center">
              <RadarAnimation
                readings={liveReadings}
                maxDistance={30}
                fadeMs={liveFadeSec * 1000}
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

        {/* Prediction section */}
        <Card className="mb-8 bg-card border-border/50">
          <CardHeader className="border-b border-border/30">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                Previsão — Onde um Próximo Objeto Tem Mais Chance de Aparecer
              </CardTitle>
              <Select value={predWindowMs} onValueChange={setPredWindowMs}>
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
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3 flex flex-col items-center gap-2">
                <PredictionRadar
                  readings={predReadings}
                  maxDistance={30}
                  sigma={PRED_SIGMA}
                  halfLifeMs={PRED_HALF_LIFE_MS}
                  angleBins={PRED_ANG_BINS}
                  radialBins={PRED_RAD_BINS}
                  size={420}
                />
                <p className="text-[11px] text-muted-foreground text-center">
                  Anel destacado = região com maior probabilidade prevista (top-3 marcados).
                </p>
              </div>

              <div className="lg:col-span-2 flex flex-col gap-3">
                <div className="rounded-lg border border-yellow-400/30 bg-yellow-500/5 p-4">
                  <p className="text-xs text-yellow-300 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Predição Mais Provável
                  </p>
                  {predResult.effectiveN > 0 ? (
                    <>
                      <p className="text-3xl font-bold text-yellow-300 tabular-nums">
                        {(predResult.topProbability * 100).toFixed(1)}%
                      </p>
                      <p className="text-sm text-foreground mt-1 font-mono">
                        ∠ {predResult.topAngleDeg.toFixed(1)}° · {predResult.topDistanceCm.toFixed(1)} cm
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Sem dados na janela selecionada.</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border/50 bg-background/40 p-4">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
                      Amostras (N)
                    </p>
                    <p className="text-2xl font-bold text-foreground tabular-nums">
                      {predResult.effectiveN}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/50 bg-background/40 p-4">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
                      Peso Total Σwᵢ
                    </p>
                    <p className="text-2xl font-bold text-foreground tabular-nums">
                      {predResult.totalWeight.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-border/50 bg-background/40 p-4 text-xs">
                  <p className="text-muted-foreground uppercase tracking-widest mb-2 text-[10px]">
                    Parâmetros
                  </p>
                  <ul className="space-y-1 font-mono text-foreground/80">
                    <li>σ (banda espacial) = <span className="text-yellow-300">{PRED_SIGMA} cm</span></li>
                    <li>t½ (meia-vida) = <span className="text-yellow-300">{PRED_HALF_LIFE_MS / 60000} min</span></li>
                    <li>grade = {PRED_ANG_BINS} × {PRED_RAD_BINS} células</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Logic explanation (collapsible) */}
            <details className="group mt-6 rounded-lg border border-border/50 bg-background/30 overflow-hidden">
              <summary className="cursor-pointer select-none list-none p-4 text-sm font-semibold text-foreground flex items-center gap-2 hover:bg-background/50 transition-colors">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                Como a previsão é calculada
                <span className="ml-auto text-xs font-normal text-muted-foreground group-open:hidden">
                  clique para expandir ▾
                </span>
                <span className="ml-auto text-xs font-normal text-muted-foreground hidden group-open:inline">
                  clique para recolher ▴
                </span>
              </summary>
              <div className="p-5 pt-2 text-sm leading-relaxed border-t border-border/30">
              <p className="text-muted-foreground mb-3">
                Aplicamos uma <strong className="text-foreground">Estimativa de Densidade por Kernel (KDE)</strong> Gaussiana 2D
                sobre as detecções, ponderando cada amostra pela sua recência (decaimento exponencial).
                A probabilidade é então normalizada sobre a grade polar (raio × ângulo).
              </p>

              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>
                  <strong className="text-foreground">Conversão para coordenadas cartesianas:</strong>{" "}
                  cada leitura <code className="font-mono">(angle, distance)</code> vira um ponto{" "}
                  <code className="font-mono">pᵢ = (dᵢ·cos θᵢ, dᵢ·sin θᵢ)</code>.
                </li>
                <li>
                  <strong className="text-foreground">Peso por recência</strong> (decaimento exponencial com meia-vida t½):
                  <div className="mt-1 ml-4 font-mono text-yellow-300">
                    wᵢ = exp(−λ · Δtᵢ),  com λ = ln(2) / t½
                  </div>
                  <span className="block ml-4 text-xs">
                    Isso significa que uma detecção de {PRED_HALF_LIFE_MS / 60000} min atrás contribui com metade do peso de uma detecção atual.
                  </span>
                </li>
                <li>
                  <strong className="text-foreground">Densidade Gaussiana</strong> avaliada no centro de cada célula{" "}
                  <code className="font-mono">c</code> da grade:
                  <div className="mt-1 ml-4 font-mono text-yellow-300">
                    f(c) = Σᵢ wᵢ · exp(−‖c − pᵢ‖² / (2σ²))
                  </div>
                  <span className="block ml-4 text-xs">
                    σ = {PRED_SIGMA} cm define o quão localizada é a influência de cada ponto.
                  </span>
                </li>
                <li>
                  <strong className="text-foreground">Normalização</strong> em uma distribuição de probabilidade discreta:
                  <div className="mt-1 ml-4 font-mono text-yellow-300">
                    P(c) = f(c) / Σ_c f(c),    com Σ_c P(c) = 1
                  </div>
                </li>
                <li>
                  <strong className="text-foreground">Predição</strong>: a célula com maior <code className="font-mono">P(c)</code>{" "}
                  é onde um próximo objeto tem mais chance de aparecer.
                  {predResult.effectiveN > 0 && (
                    <div className="mt-1 ml-4 font-mono text-yellow-300">
                      argmax<sub>c</sub> P(c) ≈ ({predResult.topAngleDeg.toFixed(1)}°,{" "}
                      {predResult.topDistanceCm.toFixed(1)} cm) · P = {(predResult.topProbability * 100).toFixed(2)}%
                    </div>
                  )}
                </li>
              </ol>

              <p className="text-xs text-muted-foreground/80 mt-4 italic">
                Observação: trata-se de um modelo não-paramétrico simples — assume que o futuro segue a distribuição recente.
                Não captura periodicidade nem trajetórias. Mais amostras (N maior) ⇒ predição mais estável.
              </p>
              </div>
            </details>
          </CardContent>
        </Card>

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
            <ReadingsTable readings={pagedReadings} isLoading={initialLoad} />
          </CardContent>
          {readings.length > PAGE_SIZE && (
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-border/30 flex-wrap">
              <span className="text-xs text-muted-foreground font-mono">
                {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, readings.length)} de {readings.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage(1)}
                  disabled={safePage === 1}
                  className="h-8 px-2 rounded-md border border-border/50 text-xs hover:bg-primary/10 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  «
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="h-8 px-3 rounded-md border border-border/50 text-xs hover:bg-primary/10 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="px-3 text-xs font-mono text-muted-foreground">
                  {safePage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="h-8 px-3 rounded-md border border-border/50 text-xs hover:bg-primary/10 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Próxima
                </button>
                <button
                  type="button"
                  onClick={() => setPage(totalPages)}
                  disabled={safePage === totalPages}
                  className="h-8 px-2 rounded-md border border-border/50 text-xs hover:bg-primary/10 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  »
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* SMS: toggle de envio + histórico de mensagens */}
        <div className="mt-8">
          <SmsPanel />
        </div>

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
