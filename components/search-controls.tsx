"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, RefreshCw, Play, Square, Timer } from "lucide-react"

interface SearchControlsProps {
  limit: string
  onLimitChange: (value: string) => void
  onSearch: () => void
  isLoading: boolean
  autoRefresh: boolean
  refreshInterval: string
  onRefreshIntervalChange: (value: string) => void
  onAutoRefreshToggle: () => void
}

export function SearchControls({
  limit,
  onLimitChange,
  onSearch,
  isLoading,
  autoRefresh,
  refreshInterval,
  onRefreshIntervalChange,
  onAutoRefreshToggle,
}: SearchControlsProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch()
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Row 1: limit + search */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Input
            type="number"
            min="1"
            max="500"
            value={limit}
            onChange={(e) => onLimitChange(e.target.value)}
            placeholder="Limite de resultados"
            className="bg-secondary/50 border-border/50 focus:border-primary h-11 pl-4 pr-4"
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading || autoRefresh}
          className="h-11 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-medium gap-2"
        >
          {isLoading && !autoRefresh ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Buscando...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Pesquisar
            </>
          )}
        </Button>
      </form>

      {/* Row 2: auto refresh */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <Timer className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="number"
            min="100"
            step="100"
            value={refreshInterval}
            onChange={(e) => onRefreshIntervalChange(e.target.value)}
            placeholder="Intervalo (ms)"
            disabled={autoRefresh}
            className="bg-secondary/50 border-border/50 focus:border-primary h-11 pl-10 pr-4 disabled:opacity-50"
          />
        </div>
        <Button
          type="button"
          onClick={onAutoRefreshToggle}
          className={`h-11 px-6 font-medium gap-2 transition-all duration-300 ${
            autoRefresh
              ? "bg-green-600 hover:bg-green-700 text-white shadow-[0_0_12px_rgba(34,197,94,0.4)]"
              : "bg-secondary hover:bg-secondary/80 text-foreground border border-border/50"
          }`}
        >
          {autoRefresh ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-200" />
              </span>
              <Square className="w-4 h-4" />
              Desligar
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Ligar
            </>
          )}
        </Button>
      </div>

      {/* Status indicator */}
      {autoRefresh && (
        <p className="text-xs text-green-500 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          Atualização automática ativa — a cada {Number(refreshInterval) >= 1000
            ? `${Number(refreshInterval) / 1000}s`
            : `${refreshInterval}ms`}
        </p>
      )}
    </div>
  )
}
