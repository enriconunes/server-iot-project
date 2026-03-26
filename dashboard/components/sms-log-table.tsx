"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MessageSquare, RefreshCw } from "lucide-react"

interface SmsEntry {
  id: string
  readingId: string
  phoneTo: string
  message: string
  status: "pending" | "sent" | "failed"
  sid: string | null
  sentAt: string
  distance: number
  angle: number
  unit: string
  readingAt: string
}

interface SmsLogTableProps {
  apiKey: string
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-muted/60 text-muted-foreground border-muted-foreground/30",
  sent:    "bg-green-500/10 text-green-400 border-green-500/30",
  failed:  "bg-red-500/10 text-red-400 border-red-500/30",
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  sent:    "Enviado",
  failed:  "Falhou",
}

export function SmsLogTable({ apiKey }: SmsLogTableProps) {
  const [entries, setEntries] = useState<SmsEntry[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSms = useCallback(async () => {
    try {
      const res = await fetch("/api/sms?limit=50", { headers: { "x-api-key": apiKey } })
      if (res.ok) setEntries(await res.json())
    } finally {
      setLoading(false)
    }
  }, [apiKey])

  useEffect(() => {
    fetchSms()
    const id = setInterval(fetchSms, 30_000)
    return () => clearInterval(id)
  }, [fetchSms])

  const formatDate = (s: string) =>
    new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "medium" }).format(new Date(s))

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 gap-3 text-muted-foreground">
        <RefreshCw className="w-4 h-4 animate-spin" />
        Carregando histórico SMS...
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
        <MessageSquare className="w-10 h-10 opacity-30" />
        <p>Nenhum SMS registado</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border/50 hover:bg-transparent">
            <TableHead className="text-muted-foreground font-medium">Horário</TableHead>
            <TableHead className="text-muted-foreground font-medium">Status</TableHead>
            <TableHead className="text-muted-foreground font-medium">Distância</TableHead>
            <TableHead className="text-muted-foreground font-medium">Ângulo</TableHead>
            <TableHead className="text-muted-foreground font-medium">Mensagem</TableHead>
            <TableHead className="text-muted-foreground font-medium">Leitura ID</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.id} className="border-border/30 hover:bg-primary/5 transition-colors">
              <TableCell className="font-mono text-muted-foreground text-sm whitespace-nowrap">
                {formatDate(entry.sentAt)}
              </TableCell>
              <TableCell>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[entry.status] ?? STATUS_STYLES.pending}`}>
                  {STATUS_LABELS[entry.status] ?? entry.status}
                </span>
              </TableCell>
              <TableCell>
                <span className={`font-bold ${entry.distance < 20 ? "text-red-400" : entry.distance < 50 ? "text-yellow-400" : "text-primary"}`}>
                  {entry.distance.toFixed(1)}
                  <span className="text-muted-foreground font-normal ml-0.5 text-xs">{entry.unit}</span>
                </span>
              </TableCell>
              <TableCell className="font-mono text-muted-foreground text-sm">
                {entry.angle.toFixed(1)}°
              </TableCell>
              <TableCell className="text-muted-foreground text-xs max-w-xs">
                <span className="truncate block" title={entry.message}>
                  {entry.message}
                </span>
              </TableCell>
              <TableCell className="font-mono text-muted-foreground text-xs">
                {entry.readingId.slice(0, 8)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
