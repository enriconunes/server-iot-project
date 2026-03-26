# IoT Radar System — Relatório Técnico

**Unidade Curricular:** Internet das Coisas
**Instituição:** Universidade da Beira Interior (UBI)
**Ano letivo:** 2025 / 2026

---

## Índice

1. [Introdução e Objetivo do Projeto](#1-introdução-e-objetivo-do-projeto)
2. [Estado da Arte](#2-estado-da-arte)
3. [Problemas e Contribuições](#3-problemas-e-contribuições)
4. [Engenharia de Software](#4-engenharia-de-software)
5. [Diagrama e Arquitetura do Sistema](#5-diagrama-e-arquitetura-do-sistema)

---

## 1. Introdução e Objetivo do Projeto

### 1.1 Contexto

A Internet das Coisas (IoT) descreve um ecossistema onde dispositivos físicos — sensores, atuadores, microcontroladores — estão interligados através de redes de comunicação e produzem dados que podem ser recolhidos, processados e apresentados em tempo real. No domínio académico, estes sistemas são frequentemente construídos com componentes de baixo custo (Arduino, Raspberry Pi, sensores HC-SR04, DHT22, PIR) e protocolos leves como MQTT, CoAP ou HTTP.

Este projeto insere-se nesse contexto educacional e tem como objetivo a construção de um **sistema de radar IoT** capaz de detetar objetos num espaço bidimensional, registar cada deteção com distância e ângulo, e apresentar os dados num dashboard web com funcionalidades de visualização em tempo real, análise histórica e previsão estatística.

### 1.2 Motivação

A maior parte dos projetos introdutórios de IoT com sensores ultrassónicos limita-se à leitura de distância num eixo único — o sensor aponta numa direção e mede a distância a um objeto. Este projeto parte dessa base e acrescenta uma dimensão angular (rotação 360°), transformando um sensor simples numa solução de mapeamento de espaço. A motivação principal é aplicar, num contexto controlado e educacional, o conjunto completo de práticas utilizadas em sistemas IoT de produção: protocolo de mensagens pub/sub, API REST, streaming em tempo real, persistência relacional, containerização e análise de dados.

### 1.3 Objetivos

Os objetivos do projeto organizam-se em três níveis:

**Objetivos funcionais:**
- Ler distância e ângulo de um sensor HC-SR04 acoplado a um servo motor com rotação de 360°
- Publicar cada leitura via MQTT e persistir os dados numa base de dados relacional
- Disponibilizar uma API REST autenticada para consulta e registo de leituras
- Apresentar um dashboard web com radar em tempo real, heatmap histórico polar e tabela de leituras
- Calcular e visualizar previsões estatísticas sobre as zonas do espaço com maior probabilidade de deteção futura
- Registar automaticamente um alerta SMS por cada deteção, com histórico visível no dashboard

**Objetivos técnicos:**
- Implementar o módulo sensor com arquitetura hexagonal (Ports & Adapters), permitindo trocar o hardware real por um simulador sem alterar a lógica de domínio
- Utilizar Server-Sent Events (SSE) para push de dados ao browser sem polling
- Containerizar todo o sistema com Docker Compose para garantir reprodutibilidade

**Objetivos de aprendizagem:**
- Compreender e aplicar o protocolo MQTT numa cadeia IoT completa
- Integrar um serviço de backend (Next.js) com uma base de dados relacional (PostgreSQL) via SQL direto
- Aplicar técnicas de estimação de densidade (KDE 2D Gaussiano) para análise exploratória de dados de sensores

---

## 2. Estado da Arte

### 2.1 Sensores Ultrassónicos em IoT Educacional

O sensor **HC-SR04** é um dos componentes mais utilizados em projetos académicos e de prototipagem no domínio de IoT e robótica. Opera por emissão de um pulso ultrassónico a 40 kHz e medição do tempo de retorno do eco, permitindo calcular distâncias entre aproximadamente 2 cm e 400 cm com resolução de cerca de 3 mm. A interface é simples: dois pinos GPIO (TRIGGER e ECHO), compatível com Arduino, Raspberry Pi e a maioria dos microcontroladores.

Na literatura educacional e em plataformas como GitHub e Instructables, a utilização típica deste sensor cobre:
- Medição de distância simples (e.g., sensor de estacionamento)
- Deteção de presença ou obstáculos em robótica
- Sensor de nível em recipientes

A maioria destas implementações é **unidirecional** (eixo fixo) e não inclui persistência de dados, dashboard ou qualquer análise temporal.

### 2.2 Protocolo MQTT

O **MQTT (Message Queuing Telemetry Transport)** é um protocolo de mensagens pub/sub de camada de aplicação projetado para ambientes com recursos limitados e conectividade instável. Foi desenvolvido originalmente pela IBM nos anos 1990 para monitorização de oleodutos por satélite e tornou-se um padrão de facto em IoT.

Características principais:
- **Modelo publish/subscribe:** os publishers enviam mensagens para tópicos; os subscribers recebem mensagens dos tópicos a que estão subscritos, sem comunicação direta entre si
- **Broker centralizado:** toda a comunicação passa por um broker (neste projeto, Eclipse Mosquitto)
- **QoS (Quality of Service):** três níveis — 0 (at most once), 1 (at least once), 2 (exactly once)
- **Leveza:** cabeçalho mínimo de 2 bytes, adequado para redes de baixa largura de banda

No contexto deste projeto, o sensor publica leituras no tópico `radar/distance` e um worker Python subscrito nesse tópico reencaminha os dados para a API REST via HTTP.

### 2.3 Arquiteturas IoT

As arquiteturas IoT são tipicamente descritas em camadas:

| Camada | Descrição | Neste projeto |
|---|---|---|
| **Perceção** | Hardware de sensing e atuação | HC-SR04 + servo motor |
| **Edge/Fog** | Processamento local antes de enviar para a nuvem | Raspberry Pi com Python |
| **Transporte** | Protocolo de comunicação entre camadas | MQTT (paho-mqtt) |
| **Backend** | Processamento, persistência e exposição de dados | Next.js 16 + PostgreSQL |
| **Aplicação** | Interface de utilizador e analytics | Dashboard React + Canvas |

Este projeto implementa todas as camadas num ambiente local containerizado, o que é uma prática comum em desenvolvimento e prototipagem IoT antes de migrar para infraestrutura de nuvem.

### 2.4 Trabalho Relacionado

Existem projetos académicos e open-source que abordam problemáticas semelhantes:

- **Arduino Radar com HC-SR04 + servo:** implementação muito comum, com visualização num sketch Processing. Cobre a parte de hardware e visualização básica, mas não inclui persistência, MQTT, dashboard web nem análise histórica.

- **ThingSpeak / Grafana para IoT:** plataformas de visualização de dados de sensores muito utilizadas. Oferecem dashboards ricos mas são genéricas e não fornecem visualização polar nativa nem análise KDE sobre dados espaciais de radar.

- **Projetos Pi Radar:** existem implementações em Python que usam o HC-SR04 com rotação manual ou por servo, visualizando num canvas local. Geralmente são projetos standalone sem API, sem base de dados e sem streaming web.

O que diferencia este projeto dessas implementações não é superioridade técnica, mas sim a integração de um conjunto mais completo de práticas: MQTT + REST + SSE + PostgreSQL + Docker num único sistema coerente, com fins educacionais.

### 2.5 Estimação de Densidade por Kernel (KDE)

A **Kernel Density Estimation (KDE)** é uma técnica não paramétrica de estimação da função de densidade de probabilidade de uma variável aleatória a partir de uma amostra de dados. Em vez de construir um histograma (estimador rígido por células), o KDE coloca um kernel (função suave, tipicamente Gaussiana) em cada ponto de dado e soma as contribuições.

No contexto deste projeto, aplica-se uma variante 2D no espaço polar (ângulo × distância):

1. As leituras históricas são agregadas num grid polar (36 sectores de 10° × 8 anéis de 50 cm)
2. Aplica-se uma convolução com um kernel Gaussiano 5×5 (σ ≈ 1.4 células) para suavizar o histograma
3. O resultado é normalizado para produzir uma distribuição de probabilidade
4. Os K=5 pontos com maior densidade são apresentados no heatmap como previsões

Esta abordagem é computacionalmente leve (operação matricial sobre um grid 36×8), adequada para execução síncrona na API sem necessidade de bibliotecas de machine learning.

---

## 3. Problemas e Contribuições

### 3.1 Questões que Motivaram o Projeto

O projeto foi orientado pelas seguintes questões:

1. **Como aplicar o padrão pub/sub (MQTT) numa cadeia IoT completa**, desde o sensor físico até ao browser do utilizador?
2. **Como representar dados de um sensor rotativo** de forma significativa — não apenas como uma lista de valores, mas como uma mapa espacial 2D?
3. **Como construir um dashboard web em tempo real** sem polling agressivo, usando tecnologias web modernas (SSE)?
4. **Como extrair valor adicional dos dados históricos** através de análise estatística simples?
5. **Como tornar o sistema reprodutível e independente de ambiente** através de containerização?

### 3.2 Limitações das Implementações Educacionais Típicas

As implementações educacionais mais comuns com HC-SR04 apresentam limitações que este projeto procura superar no seu escopo:

| Característica | Implementação típica | Este projeto |
|---|---|---|
| Direção de deteção | Eixo fixo | 360° (servo motor) |
| Persistência | Nenhuma / ficheiro local | PostgreSQL relacional |
| Protocolo de comunicação | Serial / HTTP direto | MQTT pub/sub + REST + SSE |
| Visualização | Terminal / Processing local | Dashboard web (browser) |
| Análise histórica | Nenhuma | Heatmap polar + KDE |
| Alertas | Nenhum | Log SMS com histórico |
| Reprodutibilidade | Manual (dependente do SO) | Docker Compose |

### 3.3 Contribuições do Projeto

As contribuições deste projeto são as seguintes, tendo em conta o seu carácter académico introdutório:

**1. Pipeline IoT completo end-to-end**
Do sensor físico (HC-SR04 + servo) ao browser do utilizador, passando por GPIO → Python → MQTT → Worker → REST API → SSE → React. Cada etapa utiliza ferramentas e práticas reconhecidas na indústria IoT.

**2. Módulo sensor com arquitetura hexagonal**
O código Python do sensor está organizado segundo o padrão Ports & Adapters: a lógica de domínio é independente do hardware. É possível substituir o adaptador real (HC-SR04 via gpiozero) por um simulador sem alterar nenhuma outra parte do sistema — útil para desenvolvimento e testes sem hardware físico.

**3. Radar 360° com registo de ângulo**
Cada leitura armazena não só a distância mas também o ângulo, permitindo representar as deteções num espaço polar 2D. O dashboard inclui um canvas animado com varrimento rotativo e blips posicionados pelo ângulo real da leitura.

**4. Heatmap polar histórico**
Visualização acumulada de todas as deteções num grid polar colorido por frequência (verde → amarelo → vermelho), atualizado periodicamente a partir da API.

**5. Previsão estatística por KDE 2D**
A API `/api/predict` aplica um KDE 2D Gaussiano sobre o histórico de leituras e devolve as 5 zonas mais prováveis de deteção futura, sobrepostas no heatmap como marcadores amarelos com percentagem de probabilidade.

**6. Log de alertas SMS com relação à leitura**
A tabela `sms_log` tem uma foreign key para `sensor_readings`, garantindo integridade referencial. O dashboard apresenta o histórico de SMS com o status de envio, distância, ângulo e timestamp de cada alerta.

**7. Sistema containerizado**
Cinco serviços Docker Compose (sensor/simulador, MQTT worker, MQTT broker, dashboard Next.js, PostgreSQL) orquestrados por um Nginx como reverse proxy. O sistema arranca completo com `docker compose up`.

---

## 4. Engenharia de Software

### 4.1 Visão Geral da Arquitetura de Software

O sistema é composto por três subsistemas principais com responsabilidades claras:

- **Subsistema de sensing (Python):** leitura do sensor, publicação MQTT, reencaminhamento HTTP
- **Subsistema de backend (Next.js):** API REST autenticada, SSE, lógica de análise estatística
- **Subsistema de frontend (React):** dashboard web com visualização em tempo real e histórica

A comunicação entre subsistemas segue o princípio de **acoplamento fraco**: o sensor não conhece o dashboard; o dashboard não conhece o sensor. Toda a comunicação passa pela API REST e pelo broker MQTT.

### 4.2 Módulo Sensor — Arquitetura Hexagonal (Python)

O módulo sensor (`sensor/src/sensor/`) está organizado segundo o padrão **Ports & Adapters** (também conhecido como Arquitetura Hexagonal, proposta por Alistair Cockburn):

```
sensor/
├── domain/
│   └── ports.py          # Interface SensorPort (abstração pura)
├── adapters/
│   ├── hcsr04.py         # Adaptador real: lê GPIO com gpiozero
│   ├── simulated.py      # Adaptador simulado: gera dados sintéticos
│   ├── mqtt_publisher.py # Publisher MQTT (paho-mqtt)
│   └── http_publisher.py # Publisher HTTP (requests)
├── app.py                # Factory: cria o sensor correto (real/simulado)
├── main_rpi.py           # Entry point para Raspberry Pi
└── mqtt_worker.py        # Worker MQTT → HTTP
```

**`SensorPort`** é uma interface Python que define o contrato de leitura:
```python
class SensorPort(ABC):
    @abstractmethod
    def read_distance(self) -> float: ...
```

**`RealHCSR04Adapter`** implementa esta interface usando a biblioteca `gpiozero` para controlo GPIO.
**`SimulatedSensorAdapter`** implementa a mesma interface gerando valores aleatórios, permitindo desenvolvimento e testes sem hardware.

Esta separação permite que toda a lógica de publicação (MQTT ou HTTP) seja testada e executada independentemente do hardware físico.

### 4.3 MQTT Worker

O `mqtt_worker.py` é um processo Python independente que:

1. Subscreve o tópico `radar/distance` no broker MQTT
2. Para cada mensagem recebida, desserializa o payload JSON (`{ distance, angle }`)
3. Chama `HttpPublisher.post_reading()` para persistir via `POST /api/sensor`

```
[Broker MQTT] --subscribe--> [mqtt_worker] --HTTP POST--> [/api/sensor]
```

A separação entre publisher MQTT (no Raspberry Pi) e worker MQTT (no servidor) segue o padrão de **desacoplamento temporal** do MQTT: o sensor pode publicar mesmo que a API esteja temporariamente indisponível, e o worker processa as mensagens quando a conexão é restabelecida.

### 4.4 API REST — Next.js 16 App Router

A API é implementada com **Next.js 16 App Router** usando Route Handlers TypeScript. Todas as rotas requerem o header `x-api-key` com o valor configurado na variável de ambiente `API_KEY`.

#### Rotas disponíveis

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/sensor` | Regista uma nova leitura (distance, angle, unit). Cria automaticamente um registo em `sms_log`. |
| `GET` | `/api/readings?limit=N` | Retorna as N leituras mais recentes, ordenadas por data decrescente. |
| `GET` | `/api/sse?key=<API_KEY>` | Stream SSE de novas leituras em tempo real (polling interno a cada 500 ms). |
| `GET` | `/api/heatmap` | Retorna o grid polar agregado (36 × 8 células com contagem). |
| `GET` | `/api/predict` | Aplica KDE 2D e retorna as 5 zonas mais prováveis de deteção. |
| `GET` | `/api/sms?limit=N` | Retorna o histórico de SMS com JOIN na leitura associada. |

#### Server-Sent Events (SSE)

O endpoint `/api/sse` mantém uma conexão HTTP de longa duração com o browser. A cada 500 ms faz um query à base de dados por leituras com UUID maior que o último ID visto (aproveitando a propriedade de ordenação temporal do UUID v7) e envia cada nova leitura como evento SSE:

```
data: {"id":"...","distance":45.2,"angle":127.5,...}\n\n
```

O browser recebe estes eventos via `EventSource` sem necessidade de polling ou WebSockets.

### 4.5 Base de Dados — PostgreSQL com SQL Direto

A camada de dados usa **PostgreSQL** acessado via `pg` (driver Node.js nativo), sem ORM. Esta escolha é intencional: permite escrever SQL expressivo e ter controlo total sobre as queries, especialmente as de agregação usadas no heatmap e no KDE.

#### Schema

```sql
CREATE TABLE sensor_readings (
  id         UUID PRIMARY KEY,          -- UUID v7 (ordenação temporal)
  distance   DOUBLE PRECISION NOT NULL, -- distância em cm
  angle      DOUBLE PRECISION NOT NULL DEFAULT 0, -- ângulo em graus (0-360)
  unit       VARCHAR(10) NOT NULL DEFAULT 'cm',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sms_log (
  id          UUID PRIMARY KEY,
  reading_id  UUID NOT NULL REFERENCES sensor_readings(id) ON DELETE CASCADE,
  phone_to    VARCHAR(30) NOT NULL DEFAULT '',
  message     TEXT NOT NULL,
  status      VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending' | 'sent' | 'failed'
  sid         VARCHAR(64),  -- Twilio Message SID (preenchido após envio)
  sent_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### Decisões de design

- **UUID v7** como chave primária: combina unicidade global com ordenação temporal. O endpoint SSE usa a comparação `id > $1` para encontrar leituras novas de forma eficiente, sem necessidade de um índice adicional em `created_at`.
- **Foreign key com ON DELETE CASCADE:** se uma leitura for eliminada, o registo SMS associado é eliminado automaticamente, mantendo a integridade referencial.
- **SQL direto para heatmap:** a query de agregação do heatmap usa `FLOOR()` e `LEAST()` diretamente no SQL, aproveitando o motor do PostgreSQL para processar potencialmente milhares de leituras de forma eficiente antes de enviar os dados ao servidor Node.

### 4.6 Frontend — React 19 com Canvas API

O dashboard é uma aplicação **React 19** com **Next.js App Router** em modo `"use client"`. Os componentes principais são:

#### `RadarCanvas`
Canvas animado com `requestAnimationFrame` que simula um radar militar clássico:
- Varrimento rotativo com trail de degradê
- Blips posicionados pelas coordenadas polares reais (ângulo + distância) de cada leitura SSE
- Os blips desvanecem após 3 000 ms (simulando o comportamento de um radar real)
- Escala: 1 pixel ≈ 2.2 cm (MAX_RANGE_PX / MAX_RANGE_CM)

#### `HeatmapCanvas`
Canvas estático (redesenhado quando os dados mudam) que mostra:
- O mesmo grid polar de fundo (anéis + linhas radiais)
- Setores preenchidos com cor proporcional à frequência de deteções (verde → amarelo → vermelho)
- Overlays amarelos para as previsões KDE (círculos com percentagem de probabilidade)
- Polling da API a cada 15 segundos

#### `SmsLogTable`
Tabela com o histórico de SMS, polling a cada 30 segundos, com badges de status coloridos (`pending` / `sent` / `failed`) e dados da leitura associada (distância, ângulo, timestamp).

### 4.7 Modelo Estatístico — KDE 2D Gaussiano

O endpoint `/api/predict` implementa um KDE 2D simplificado diretamente em TypeScript, sem dependências externas:

**Passo 1 — Agregação:** query SQL que agrupa as leituras num grid polar 36 × 8 (mesmo grid do heatmap).

**Passo 2 — Construção do grid:** os resultados SQL são mapeados para uma matriz `number[36][8]`.

**Passo 3 — Suavização Gaussiana:** convolução com um kernel 5×5:

```
weight(Δa, Δd) = exp(-(Δa² + Δd²) / 2)
```

O kernel é aplicado com wrap-around no eixo angular (porque 0° e 360° são o mesmo ângulo) e clamp no eixo de distância.

**Passo 4 — Normalização e ranking:** os valores suavizados são somados, divididos pelo total para obter probabilidades, e ordenados descrescentemente. Os top 5 são devolvidos com ângulo e distância centrais da célula.

### 4.8 Containerização — Docker Compose

O sistema completo é orquestrado por Docker Compose com os seguintes serviços:

| Serviço | Imagem base | Função |
|---|---|---|
| `postgres` | `postgres:16-alpine` | Base de dados PostgreSQL |
| `mosquitto` | `eclipse-mosquitto:2` | MQTT Broker (Eclipse Mosquitto) |
| `dashboard` | `node:22-alpine` | Next.js dashboard + API |
| `sensor-simulator` | `python:3.12-slim` | Simulador do sensor (sem hardware) |
| `mqtt-worker` | `python:3.12-slim` | Worker MQTT → HTTP |
| `nginx` | `nginx:alpine` | Reverse proxy |

O Nginx expõe um único ponto de entrada HTTP e faz routing por subdomínio/path para os serviços internos. A base de dados é inicializada pelo script `database/init.sql` no primeiro arranque.

### 4.9 Autenticação e Segurança

Todas as rotas da API requerem o header `x-api-key`. A validação é feita na função `validateApiKey()` em `lib/auth.ts`, que compara o valor do header com a variável de ambiente `API_KEY`. Caso a chave seja inválida ou ausente, a API retorna `401 Unauthorized`.

O endpoint SSE usa o parâmetro de query `?key=` (em vez do header) por limitação da API `EventSource` do browser, que não suporta headers customizados.

As variáveis sensíveis (`DATABASE_URL`, `API_KEY`, credenciais Twilio) são geridas via ficheiros `.env` e `.env.local`, nunca comprometidos no repositório (listados em `.gitignore`).

---

## 5. Diagrama e Arquitetura do Sistema

### 5.1 Visão Geral — Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────────┐
│                        HARDWARE (Edge)                          │
│                                                                 │
│   HC-SR04 ──GPIO──▶ Raspberry Pi (Python)                       │
│   Servo Motor ◀──── gpiozero / PWM                              │
└───────────────────────────┬─────────────────────────────────────┘
                            │ MQTT publish "radar/distance"
                            │ { distance: 45.2, angle: 127.5 }
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BROKER (Eclipse Mosquitto)                     │
│                   Porta 1883 (MQTT)                             │
└───────────────────────────┬─────────────────────────────────────┘
                            │ MQTT subscribe "radar/distance"
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MQTT WORKER (Python)                         │
│                                                                 │
│   paho-mqtt subscriber ──▶ HttpPublisher                        │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTP POST /api/sensor
                            │ { distance, angle, unit }
                            │ x-api-key: <API_KEY>
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                  BACKEND (Next.js 16 — Docker)                  │
│                                                                 │
│   POST /api/sensor ──▶ INSERT sensor_readings                   │
│                    └──▶ INSERT sms_log (status: pending)        │
│                                                                 │
│   GET  /api/readings   ◀── browser (fetch)                      │
│   GET  /api/heatmap    ◀── browser (fetch, 15s)                 │
│   GET  /api/predict    ◀── browser (fetch, 15s)                 │
│   GET  /api/sms        ◀── browser (fetch, 30s)                 │
│   GET  /api/sse        ◀── browser (EventSource, persistent)    │
│                         └──▶ SSE push de novas leituras         │
└──────────┬──────────────────────────────────────────────────────┘
           │ SQL (pg Pool)
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                  BASE DE DADOS (PostgreSQL 16)                  │
│                                                                 │
│   sensor_readings (id UUID v7, distance, angle, unit, created_at)│
│   sms_log (id, reading_id FK, message, status, sid, sent_at)    │
└─────────────────────────────────────────────────────────────────┘

           ▲  SSE stream (EventSource)
           │  fetch /api/heatmap, /api/predict, /api/sms
┌─────────────────────────────────────────────────────────────────┐
│                    DASHBOARD (Browser — React 19)               │
│                                                                 │
│   RadarCanvas    ── blips em tempo real via SSE                 │
│   HeatmapCanvas  ── grid polar colorido por frequência + KDE    │
│   ReadingsTable  ── leituras recentes (distance + angle)        │
│   SmsLogTable    ── histórico de SMS com status                 │
│   StatsCards     ── métricas agregadas (média, min, max)        │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Diagrama de Componentes

```
┌──────────────────────────────────────────────────────────────────┐
│  sensor/ (Python)                                                │
│                                                                  │
│  ┌─────────────┐    ┌──────────────────────────────────────┐    │
│  │ SensorPort  │    │           Adapters                   │    │
│  │  (interface)│◀───│  RealHCSR04Adapter (gpiozero/GPIO)   │    │
│  └─────────────┘    │  SimulatedSensorAdapter (random)     │    │
│                     └──────────────────────────────────────┘    │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           Publishers                                     │   │
│  │  MqttPublisher  ──▶ Eclipse Mosquitto (MQTT)             │   │
│  │  HttpPublisher  ──▶ /api/sensor (REST)                   │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  dashboard/ (Next.js — TypeScript)                               │
│                                                                  │
│  lib/auth.ts      ── validação x-api-key                         │
│  lib/db.ts        ── pg.Pool singleton                           │
│  lib/env.ts       ── variáveis de ambiente tipadas (t3-env)      │
│                                                                  │
│  app/api/                                                        │
│  ├── sensor/route.ts   ── POST: INSERT reading + sms_log         │
│  ├── readings/route.ts ── GET:  SELECT sensor_readings           │
│  ├── sse/route.ts      ── GET:  ReadableStream (SSE)             │
│  ├── heatmap/route.ts  ── GET:  Agregação polar (SQL FLOOR)      │
│  ├── predict/route.ts  ── GET:  KDE 2D Gaussiano (TypeScript)    │
│  └── sms/route.ts      ── GET:  JOIN sms_log + sensor_readings   │
│                                                                  │
│  components/                                                     │
│  ├── radar-canvas.tsx      ── Canvas animado (requestAnimFrame)  │
│  ├── heatmap-canvas.tsx    ── Canvas estático + KDE overlay      │
│  ├── readings-table.tsx    ── Tabela de leituras                 │
│  ├── sms-log-table.tsx     ── Tabela de histórico SMS            │
│  ├── stats-cards.tsx       ── Cards de métricas                  │
│  └── search-controls.tsx   ── Filtros e auto-refresh             │
└──────────────────────────────────────────────────────────────────┘
```

### 5.3 Esquema da Base de Dados

```
sensor_readings
───────────────────────────────────────────────
id          UUID (PK)    — UUID v7 (temporal)
distance    FLOAT8       — distância em cm
angle       FLOAT8       — ângulo em graus (0–359.9)
unit        VARCHAR(10)  — unidade (default: 'cm')
created_at  TIMESTAMPTZ  — timestamp UTC

sms_log
───────────────────────────────────────────────
id          UUID (PK)
reading_id  UUID (FK) ──▶ sensor_readings.id
                          ON DELETE CASCADE
phone_to    VARCHAR(30)  — número de destino
message     TEXT         — corpo do SMS
status      VARCHAR(20)  — 'pending' | 'sent' | 'failed'
sid         VARCHAR(64)  — Twilio Message SID (nullable)
sent_at     TIMESTAMPTZ  — timestamp UTC

Relação: sensor_readings 1 ──── 0..1 sms_log
```

### 5.4 Fluxo de Dados da API SSE

O mecanismo de SSE merece atenção especial por ser menos convencional:

```
Browser                          Next.js /api/sse
   │                                    │
   │─── GET /api/sse?key=... ──────────▶│
   │                                    │ inicializa lastId = UUID mais recente
   │◀── HTTP 200 text/event-stream ─────│
   │◀── : connected\n\n ────────────────│
   │                                    │
   │                          ┌─────────┴──────────┐
   │                          │  loop (cada 500ms) │
   │                          │  SELECT WHERE id > lastId │
   │                          │  para cada novo:   │
   │◀── data: {reading}\n\n ──┤  envia SSE event   │
   │                          │  lastId = id novo  │
   │                          └─────────┬──────────┘
   │                                    │
   │─── (browser fecha / navega) ──────▶│ cancel() → closed = true → loop para
```

### 5.5 Docker Compose — Rede de Serviços

```
                    ┌────────────────┐
                    │     Nginx      │ :80
                    │ reverse proxy  │
                    └───────┬────────┘
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
        ┌──────────┐  ┌──────────┐  (outros paths)
        │dashboard │  │  (static)│
        │  :3000   │  │          │
        └────┬─────┘  └──────────┘
             │ SQL
             ▼
        ┌──────────┐        ┌────────────────┐
        │postgres  │        │   mosquitto    │
        │  :5432   │        │   :1883        │
        └──────────┘        └───────┬────────┘
                                    │ subscribe
                            ┌───────▼────────┐
                            │  mqtt-worker   │
                            │  Python        │
                            └───────┬────────┘
                                    │ HTTP POST
                                    ▼
                            ┌───────────────┐
                            │sensor-simulator│
                            │  (sem RPi)    │
                            └───────────────┘
```

### 5.6 Fluxo de Integração SMS (Estado Atual e Futuro)

```
POST /api/sensor
       │
       ├──▶ INSERT sensor_readings  (leitura persistida)
       │
       ├──▶ INSERT sms_log          (status = 'pending')
       │         reading_id = leitura.id
       │         message = "Radar IoT — Deteção em {ts} | ..."
       │
       │    [FUTURO — Twilio]
       │    ├──▶ Twilio REST API (POST /Messages)
       │    │         ├── success: UPDATE sms_log SET status='sent', sid=<SID>
       │    │         └── error:   UPDATE sms_log SET status='failed'
       │
       └──▶ Response 201 { id, distance, angle, ... }
```

O design foi pensado para que a integração Twilio seja adicionada sem alterar o schema da base de dados — a coluna `sid` e os estados `'sent'`/`'failed'` já existem.

---

*Documento gerado como parte do relatório técnico da UC Internet das Coisas — UBI 2025/2026.*
