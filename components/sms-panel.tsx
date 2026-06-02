"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MessageSquare, MessageSquareOff, CheckCircle2, XCircle, Inbox } from "lucide-react"

interface SmsConfig {
  id: number
  enabled: boolean
  updatedAt: string
}

interface SmsLogEntry {
  id: number
  recipient: string
  body: string
  sensor: number | null
  distance: number | null
  status: string
  sid: string | null
  error: string | null
  createdAt: string
}

const SENSOR_BADGE: Record<number, string> = {
  1: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  2: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  3: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  4: "bg-pink-500/10 text-pink-400 border-pink-500/20",
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(dateString))
}

export function SmsPanel() {
  const [config, setConfig] = useState<SmsConfig | null>(null)
  const [toggling, setToggling] = useState(false)
  const [log, setLog] = useState<SmsLogEntry[]>([])

  const apiHeaders = useMemo(
    () => ({ "x-api-key": process.env.NEXT_PUBLIC_API_KEY ?? "" }),
    []
  )

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/sms/config", { headers: apiHeaders })
      if (res.ok) setConfig(await res.json())
    } catch (e) {
      console.error("Erro ao buscar config de SMS:", e)
    }
  }, [apiHeaders])

  const fetchLog = useCallback(async () => {
    try {
      const res = await fetch("/api/sms/log?limit=50", { headers: apiHeaders })
      if (res.ok) setLog(await res.json())
    } catch (e) {
      console.error("Erro ao buscar histórico de SMS:", e)
    }
  }, [apiHeaders])

  useEffect(() => {
    fetchConfig()
    fetchLog()
    const id = setInterval(() => {
      fetchConfig()
      fetchLog()
    }, 3000)
    return () => clearInterval(id)
  }, [fetchConfig, fetchLog])

  const toggle = useCallback(
    async (enabled: boolean) => {
      setToggling(true)
      setConfig((prev) => (prev ? { ...prev, enabled } : prev))
      try {
        const res = await fetch("/api/sms/config", {
          method: "PATCH",
          headers: { ...apiHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({ enabled }),
        })
        if (!res.ok) await fetchConfig()
      } catch (e) {
        console.error("Erro ao alternar SMS:", e)
        await fetchConfig()
      } finally {
        setToggling(false)
      }
    },
    [apiHeaders, fetchConfig]
  )

  const enabled = config?.enabled ?? false

  return (
    <Card className="bg-card border-border/50">
      <CardHeader className="border-b border-border/30">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          Alertas por SMS
          <span className="ml-auto text-xs font-normal text-muted-foreground">
            {log.length} {log.length === 1 ? "mensagem" : "mensagens"}
          </span>
        </CardTitle>
      </CardHeader>

      {/* Toggle (acima da tabela) */}
      <div className="p-4 sm:p-6 border-b border-border/30">
        <div
          role="button"
          tabIndex={toggling ? -1 : 0}
          onClick={() => !toggling && toggle(!enabled)}
          onKeyDown={(e) => {
            if (toggling) return
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              toggle(!enabled)
            }
          }}
          aria-pressed={enabled}
          aria-disabled={toggling}
          className={`w-full rounded-xl border p-4 flex items-center gap-4 transition-colors duration-300 ${
            toggling ? "cursor-wait" : "cursor-pointer"
          } ${
            enabled
              ? "border-emerald-500/30 bg-emerald-500/10"
              : "border-border/50 bg-background/40 hover:border-border"
          }`}
        >
          <div
            className={`w-11 h-11 rounded-full border flex items-center justify-center shrink-0 transition-colors duration-300 ${
              enabled
                ? "border-emerald-400/40 bg-emerald-500/10"
                : "border-border/60 bg-background"
            }`}
          >
            {enabled ? (
              <MessageSquare className="w-5 h-5 text-emerald-300" />
            ) : (
              <MessageSquareOff className="w-5 h-5 text-muted-foreground" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p
              className={`text-base font-bold transition-colors duration-300 ${
                enabled ? "text-emerald-300" : "text-muted-foreground"
              }`}
            >
              {enabled ? "Envio de SMS ativado" : "Envio de SMS desativado"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {enabled
                ? "Objetos a ≤5cm disparam um SMS de alerta (máx. 2/min)."
                : "Nenhum SMS será enviado."}
            </p>
          </div>

          <div className="shrink-0 pointer-events-none">
            <Switch checked={enabled} disabled={toggling} />
          </div>
        </div>
      </div>

      {/* Histórico de mensagens */}
      <CardContent className="p-0">
        {log.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
            <Inbox className="w-10 h-10 opacity-50" />
            <p className="text-sm">Nenhuma mensagem enviada ainda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/30 hover:bg-transparent">
                  <TableHead className="text-xs">Quando</TableHead>
                  <TableHead className="text-xs">Para</TableHead>
                  <TableHead className="text-xs">Mensagem</TableHead>
                  <TableHead className="text-xs">Sensor</TableHead>
                  <TableHead className="text-xs">Distância</TableHead>
                  <TableHead className="text-xs">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {log.map((m) => {
                  const ok = m.status === "sent"
                  return (
                    <TableRow key={m.id} className="border-border/20">
                      <TableCell className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                        {formatDate(m.createdAt)}
                      </TableCell>
                      <TableCell className="text-xs font-mono whitespace-nowrap">
                        {m.recipient}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[280px] whitespace-pre-line">
                        {m.body}
                      </TableCell>
                      <TableCell>
                        {m.sensor != null ? (
                          <span
                            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${
                              SENSOR_BADGE[m.sensor] ??
                              "bg-muted/10 text-muted-foreground border-border/30"
                            }`}
                          >
                            {m.sensor}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs font-mono whitespace-nowrap">
                        {m.distance != null ? `${m.distance.toFixed(1)} cm` : "—"}
                      </TableCell>
                      <TableCell>
                        {ok ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Enviado
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 text-xs text-red-400"
                            title={m.error ?? undefined}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Falhou
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
