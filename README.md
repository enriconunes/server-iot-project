# Projeto IoT — Radar HC-SR04

Sistema de monitoramento de distancia com sensor HC-SR04, Raspberry Pi, MQTT, PostgreSQL e dashboard web real-time.

## Arquitetura

```
[HC-SR04 / Simulador] --MQTT--> [Mosquitto] ---> [MQTT Worker] --HTTP POST--> [API Next.js] ---> [PostgreSQL]
                                     |                                              |
                                     +-- ws (9001) ------>  [Dashboard SSE Radar]   |
                                                             [Tabela + Stats] <-----+

                                 [Nginx :80]
                                  ├── app.localhost        → Dashboard
                                  ├── api.localhost        → API REST
                                  ├── simulator.localhost  → Canvas Simulator
                                  └── mqtt.localhost       → MQTT WebSocket
```

## Quick Start

```bash
./start.sh    # builda e inicia tudo via Docker
./stop.sh     # para tudo
```

URLs:
- **http://app.localhost** — Dashboard (radar real-time + tabela + stats)
- **http://api.localhost** — API REST (sensor, readings, bell, sse)
- **http://simulator.localhost** — Canvas Simulator (mouse no beam = leitura)
- **http://mqtt.localhost** — MQTT WebSocket

Infra:
- **localhost:1883** — MQTT Broker (nativo)
- **localhost:5432** — PostgreSQL

## Estrutura do Monorepo

```
.
├── dashboard/          # Next.js — dashboard web + API REST + SSE
│   ├── app/
│   │   ├── api/
│   │   │   ├── bell/       # GET/POST estado do sino
│   │   │   ├── readings/   # GET leituras do banco
│   │   │   ├── sensor/     # POST nova leitura
│   │   │   └── sse/        # GET Server-Sent Events (real-time)
│   │   └── page.tsx        # Dashboard principal
│   ├── components/         # UI components (shadcn/ui + radar canvas)
│   ├── lib/                # pg pool + auth + t3-env
│   └── Dockerfile
├── sensor/             # Python — leitura do sensor + publicacao
│   ├── src/sensor/
│   │   ├── domain/         # Ports (interfaces — hexagonal arch)
│   │   ├── adapters/       # HC-SR04, simulado, MQTT, HTTP
│   │   ├── web/            # Canvas simulator (HTML/JS)
│   │   ├── main_rpi.py     # Entry point do sensor
│   │   └── mqtt_worker.py  # Worker MQTT -> API
│   ├── Dockerfile          # Sensor
│   ├── Dockerfile.worker   # MQTT Worker
│   └── Dockerfile.simulator # Canvas simulator
├── database/           # SQL
│   └── init.sql            # Schema (auto-migra no docker start)
├── mosquitto/          # Config do Mosquitto
├── nginx/              # Reverse proxy config
├── docker-compose.yml  # Todos os servicos
├── start.sh
└── stop.sh
```

## Servicos Docker

| Servico | Imagem | Porta interna | Descricao |
|---------|--------|---------------|-----------|
| postgres | postgres:16-alpine | 5432 | Banco de dados |
| mosquitto | eclipse-mosquitto:2 | 1883, 9001 | Broker MQTT |
| dashboard | Node.js (build) | 3000 | Next.js app + API |
| sensor | Python 3.12 | — | Publica leituras (simulado/real) |
| mqtt-worker | Python 3.12 | — | MQTT subscriber -> API |
| simulator | Python 3.12 | 8080 | Canvas web interativo |
| nginx | nginx:alpine | 80 | Reverse proxy |

## Integracao com Raspberry Pi + Sensor Real

### Material necessario

- Raspberry Pi (qualquer modelo com GPIO)
- Sensor HC-SR04
- 2 resistores: 1k ohm e 2k ohm (divisor de tensao)
- Botao push (opcional — para toggle do sino)
- Jumpers / protoboard

### Ligacao dos fios

```
HC-SR04         Raspberry Pi
-------         ---------------
VCC    -------> Pin 2  (5V)
GND    -------> Pin 6  (GND)
TRIG   -------> Pin 7  (GPIO 4)
ECHO   --[1k]--+---> Pin 11 (GPIO 17)
                |
             [2k]
                |
               GND

Botao (opcional):
GPIO 27 ----[botao]---- GND
```

> **IMPORTANTE:** O pino ECHO retorna 5V. O GPIO do Raspberry Pi suporta 3.3V.
> O divisor de tensao (1k + 2k) reduz a voltagem para ~3.3V.
> **Sem o divisor de tensao, voce pode queimar o Raspberry Pi.**

### Rodar com sensor real

No Raspberry Pi, rode apenas o sensor apontando para o servidor:

```bash
cd sensor
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[hardware]"

SENSOR_MODE=real \
MQTT_BROKER=<IP_DO_SERVIDOR> \
API_BASE=http://<IP_DO_SERVIDOR>/api \
API_KEY=iot2026-a7f3d2e1b8c94f5a0d6e2b1c3a4f7e9d \
python -m sensor.main_rpi
```

No servidor (PC), rode o resto via Docker:

```bash
./start.sh
```

### Variaveis de ambiente do sensor

| Variavel | Default | Descricao |
|----------|---------|-----------|
| `SENSOR_MODE` | `simulated` | `simulated` = dados fake, `real` = HC-SR04 |
| `MQTT_BROKER` | `localhost` | IP/hostname do broker Mosquitto |
| `MQTT_PORT` | `1883` | Porta MQTT |
| `PUBLISH_INTERVAL` | `0.1` | Intervalo entre leituras (segundos) |
| `SENSOR_ANGLE` | `0` | Angulo fixo do sensor (graus) |
| `TRIG_PIN` | `4` | GPIO do pino TRIG |
| `ECHO_PIN` | `17` | GPIO do pino ECHO |
| `BUTTON_PIN` | `27` | GPIO do botao do sino |
| `MAX_DISTANCE_CM` | `20` | Distancia maxima para enviar (cm) |
| `TOLERANCE_CM` | `0.5` | Tolerancia entre leituras (cm) |
| `API_BASE` | — | URL base da API REST |
| `API_KEY` | — | Chave da API |

## API Endpoints

Todos os endpoints requerem header `x-api-key` ou query param `?key=`.

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| `POST` | `/api/sensor` | Registra nova leitura `{ distance, unit? }` |
| `GET` | `/api/readings?limit=50` | Lista leituras recentes |
| `GET` | `/api/bell` | Estado atual do sino |
| `POST` | `/api/bell` | Toggle on/off do sino |
| `GET` | `/api/sse` | Stream SSE de leituras em tempo real |
