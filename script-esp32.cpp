// ========================== script teste sem wifi =========================
/*
#include <ESP32Servo.h>

#define TRIG_1 14
#define ECHO_1 34
#define TRIG_2 25
#define ECHO_2 33
#define TRIG_3 26
#define ECHO_3 35
#define TRIG_4 27
#define ECHO_4 32
#define SERVO_PIN 12

#define ANGULO_MAX 110 

Servo servo;
int angulo = 0;
int incremento = 4;

float ultimaDist[5]          = {-1, -1, -1, -1, -1};
unsigned long ultimoPrint[5] = {0, 0, 0, 0, 0};
const unsigned long INTERVALO_MS = 500;

float medirDistancia(int trig, int echo) {
  digitalWrite(trig, LOW);
  delayMicroseconds(2);
  digitalWrite(trig, HIGH);
  delayMicroseconds(10);
  digitalWrite(trig, LOW);
  long duracao = pulseIn(echo, HIGH, 30000);
  if (duracao == 0) return -1;
  return (duracao * 0.0343) / 2.0;
}

void printJSON(int sensor, float distancia, int angPolar) {
  Serial.print("{\"sensor\":");
  Serial.print(sensor);
  Serial.print(",\"distance\":");
  Serial.print(distancia, 1);
  Serial.print(",\"angle\":");
  Serial.print(angPolar);
  Serial.println("}");
}

void lerSensor(int sensor, int trig, int echo, int offset) {
  float dist = medirDistancia(trig, echo);
  unsigned long agora = millis();
  int angPolar = angulo + offset;

  if (dist > 0 && dist < 30.0) {
    bool variou = (ultimaDist[sensor] < 0 || abs(dist - ultimaDist[sensor]) >= 1.0);
    bool passou = (agora - ultimoPrint[sensor] >= INTERVALO_MS);
    if (variou && passou) {
      printJSON(sensor, dist, angPolar);
      ultimaDist[sensor]  = dist;
      ultimoPrint[sensor] = agora;
    }
  } else {
    ultimaDist[sensor] = -1;
  }
}

void setup() {
  Serial.begin(115200);

  pinMode(TRIG_1, OUTPUT); pinMode(ECHO_1, INPUT);
  pinMode(TRIG_2, OUTPUT); pinMode(ECHO_2, INPUT);
  pinMode(TRIG_3, OUTPUT); pinMode(ECHO_3, INPUT);
  pinMode(TRIG_4, OUTPUT); pinMode(ECHO_4, INPUT);

  ESP32PWM::allocateTimer(0);
  servo.setPeriodHertz(50);
  servo.attach(SERVO_PIN, 400, 2800);

  Serial.println("A calibrar: marco zero (0°)...");
  servo.write(0);
  delay(2000);
  Serial.println("Pronto. Varrimento 0°–ANGULO_MAX x 4 sensores = 360°");
}

void loop() {
  servo.write(angulo);

  lerSensor(1, TRIG_1, ECHO_1,   0);
  lerSensor(2, TRIG_2, ECHO_2,  90);
  lerSensor(3, TRIG_3, ECHO_3, 180);
  lerSensor(4, TRIG_4, ECHO_4, 270);

  angulo += incremento;
  if (angulo >= ANGULO_MAX) { angulo = ANGULO_MAX; incremento = -abs(incremento); }
  if (angulo <= 0)          { angulo = 0;          incremento =  abs(incremento); }

  delay(10);
}

*/


// ============= script principal ==================================
//
// Hardware: ESP32 + 4x HC-SR04 + 1 servo + 1 LED (atuador).
// (Sem buzzer e sem botão — removidos por falta de portas no hardware.)
//
// Sincronização com o servidor (Next.js / Vercel):
//   - POST  /api/sensor          -> envia cada leitura (sensor, distância, ângulo)
//   - GET   /api/sensors/config  -> sabe quais sensores estão ativos (toggle do dashboard)
//   - GET   /api/actuators/config-> sabe o estado do LED (para o desligar pelo dashboard)
//   - PATCH /api/actuators/config-> liga o LED quando deteta algo a <= 30 cm
//   - GET   /api/motor/config    -> sabe se o motor (servo) deve rodar ou ficar pausado
//
// Regra do LED (atuador): a variável booleana "atuadorLigado" fica TRUE assim que
// qualquer sensor ativo deteta um objeto a <= 30 cm, e só volta a FALSE através do
// toggle do dashboard. Todo o HTTP corre numa única task (serializado) para não
// abrir duas ligações TLS ao mesmo tempo.

#include <ESP32Servo.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>

#define TRIG_1 14
#define ECHO_1 34
#define TRIG_2 25
#define ECHO_2 33
#define TRIG_3 26
#define ECHO_3 35
#define TRIG_4 27
#define ECHO_4 32
#define SERVO_PIN 12
#define LED_PIN   13

#define ANGULO_MAX     90    
#define DIST_DETECAO   30.0    // distância (cm) que conta como deteção / aciona o LED

const char* WIFI_SSID     = "S24 FE de Enrico";
const char* WIFI_PASSWORD = "enrico123";
const char* SERVER_BASE   = "https://server-iot-project.vercel.app";
const char* API_KEY       = "iot2026-a7f3d2e1b8c94f5a0d6e2b1c3a4f7e9d";

const unsigned long INTERVALO_MS         = 1000;  // intervalo mínimo entre envios por sensor
const unsigned long INTERVALO_INTERATIVO = 1000;  // LED + motor: estados interativos -> lidos rápido (resposta ~1s)
const unsigned long INTERVALO_SENSORES   = 4000;  // sensores: configuras uma vez, mudam raramente -> lidos menos vezes

// Quantas leituras (POST) são enviadas, no MÁXIMO, em cada ciclo da task de HTTP.
// É a peça central que evita o bloqueio: mesmo que um sensor com um objeto fixo
// à frente inunde a fila de leituras, a task envia apenas algumas por ciclo e
// volta SEMPRE a tratar do atuador (PATCH) e da sincronização de config. Sem este
// limite, o while de envio podia nunca esvaziar e a config/LED nunca sincronizavam.
const int MAX_POSTS_POR_CICLO = 2;

// Ligação TLS PERSISTENTE reutilizada em todos os pedidos (keep-alive). Assim há
// apenas UM handshake TLS por ligação (poupa tempo e heap). Se um pedido falhar,
// fechamos a ligação (resetConexao) e o pedido seguinte recria-a limpa.
WiFiClientSecure secureClient;

Servo servo;
int angulo     = 0;
int incremento = 5;

float ultimaDist[5]          = {-1, -1, -1, -1, -1};
unsigned long ultimoPrint[5] = {0, 0, 0, 0, 0};

// Estado partilhado entre o loop (core 1) e a task de HTTP (core 0).
volatile bool sensorAtivo[5]    = {false, true, true, true, true}; // índice 1..4
volatile bool atuadorLigado     = false;  // espelha actuator_config.enabled (LED aceso?)
volatile bool pedirLigarAtuador = false;  // o loop pede à task para fazer PATCH (deteção)
volatile bool motorAtivo        = true;   // espelha motor_config.enabled (servo a rodar?)

struct PostData {
  int sensor;
  float distancia;
  int angulo;
};

QueueHandle_t filaPost;

// ----------------------------------------------------------------------------
// Helpers de parsing (a API devolve JSON simples; lemos só o campo "enabled").
// ----------------------------------------------------------------------------

// Lê o booleano de "enabled":true/false a partir de uma posição do texto.
bool lerEnabled(const String& payload, int fromIdx) {
  int e = payload.indexOf("\"enabled\":", fromIdx);
  if (e < 0) return false;
  return payload.substring(e + 10, e + 14) == "true"; // "enabled": tem 10 caracteres
}

// Estado de um sensor específico dentro do array devolvido por /api/sensors/config.
bool lerSensorEnabled(const String& payload, int sensor) {
  int idx = payload.indexOf("\"sensor\":" + String(sensor));
  if (idx < 0) return true;            // se não vier, assume ativo
  return lerEnabled(payload, idx);
}

// ----------------------------------------------------------------------------
// Camada HTTP — UMA ligação TLS reutilizada (keep-alive) + auto-recuperação.
// Tudo é chamado a partir da task taskHTTP (nunca em paralelo).
// ----------------------------------------------------------------------------

// Fecha a ligação TLS; o próximo pedido recria-a limpa (usado em falha/heap baixa).
void resetConexao() {
  secureClient.stop();
}

// Faz um pedido reutilizando a ligação. method: "GET" | "POST" | "PATCH".
// Devolve o código HTTP (<=0 = falha de ligação). Preenche *resp se code==200.
int pedidoHTTP(const char* method, const String& url, const String& body, String* resp) {
  if (WiFi.status() != WL_CONNECTED) return -100;

  HTTPClient http;
  http.setConnectTimeout(5000);
  http.setTimeout(5000);

  if (!http.begin(secureClient, url)) {
    resetConexao();
    return -101;
  }
  http.setReuse(true);            // mantém a ligação aberta para o próximo pedido (keep-alive)
  http.addHeader("x-api-key", API_KEY);
  if (body.length() > 0) http.addHeader("Content-Type", "application/json");

  int code;
  if (strcmp(method, "GET") == 0)       code = http.GET();
  else if (strcmp(method, "POST") == 0) code = http.POST(body);
  else                                  code = http.sendRequest(method, body);

  if (code > 0) {
    // Drena SEMPRE o corpo da resposta — essencial para reutilizar a ligação
    // (corpo por ler corrompe o próximo pedido).
    String corpo = http.getString();
    if (code == 200 && resp != nullptr) *resp = corpo;
  }
  http.end();

  if (code <= 0) resetConexao();  // ligação morreu -> próxima recria-a limpa
  return code;
}

// Envia uma leitura. Devolve o código HTTP.
int enviarReadingHTTP(const PostData& d) {
  String body = "{\"sensor\":";
  body += d.sensor;
  body += ",\"distance\":";
  body += String(d.distancia, 1);
  body += ",\"angle\":";
  body += d.angulo;
  body += "}";

  int code = pedidoHTTP("POST", String(SERVER_BASE) + "/api/sensor", body, nullptr);
  Serial.printf("POST sensor %d -> HTTP %d\n", d.sensor, code);
  return code;
}

// Liga/desliga o atuador (LED) no servidor.
bool patchAtuador(bool ligado) {
  String body = String("{\"enabled\":") + (ligado ? "true" : "false") + "}";
  int code = pedidoHTTP("PATCH", String(SERVER_BASE) + "/api/actuators/config", body, nullptr);
  Serial.printf("PATCH atuador (%s) -> HTTP %d\n", ligado ? "true" : "false", code);
  return code >= 200 && code < 300;
}

// Estados INTERATIVOS (LED + motor): são os toggles que mexes em demonstração, por
// isso lêem-se com frequência (INTERVALO_INTERATIVO) para a resposta ser quase imediata.
// São só 2 GETs, leves, na mesma ligação keep-alive.
void sincronizarAtuadorMotor() {
  // --- Atuador (LED): o dashboard pode desligá-lo ---
  String payload;
  int code = pedidoHTTP("GET", String(SERVER_BASE) + "/api/actuators/config", "", &payload);
  if (code == 200) {
    atuadorLigado = lerEnabled(payload, 0);
    digitalWrite(LED_PIN, atuadorLigado ? HIGH : LOW);
  } else {
    Serial.printf("GET actuators/config FALHOU -> HTTP %d\n", code);
  }

  // --- Motor (servo): o dashboard pode pausar/retomar a rotação ---
  payload = "";
  code = pedidoHTTP("GET", String(SERVER_BASE) + "/api/motor/config", "", &payload);
  if (code == 200) {
    motorAtivo = lerEnabled(payload, 0);
  } else {
    Serial.printf("GET motor/config FALHOU -> HTTP %d\n", code);
  }
}

// Sensores: configuram-se uma vez e mudam raramente, por isso lêem-se menos vezes
// (INTERVALO_SENSORES) para poupar pedidos. Aqui também imprimimos um resumo do estado.
void sincronizarSensores() {
  String payload;
  int code = pedidoHTTP("GET", String(SERVER_BASE) + "/api/sensors/config", "", &payload);
  if (code == 200) {
    for (int s = 1; s <= 4; s++) sensorAtivo[s] = lerSensorEnabled(payload, s);
    Serial.printf("Sensores -> S1:%d S2:%d S3:%d S4:%d | LED:%s Motor:%s | Heap:%u\n",
                  sensorAtivo[1], sensorAtivo[2], sensorAtivo[3], sensorAtivo[4],
                  atuadorLigado ? "ON" : "OFF", motorAtivo ? "ROT" : "PAUSA",
                  ESP.getFreeHeap());
  } else {
    Serial.printf("GET sensors/config FALHOU -> HTTP %d\n", code);
  }
}

// Task única responsável por TODO o tráfego HTTP (mantém uma só ligação TLS de cada vez).
//
// Ordem de PRIORIDADES por ciclo (esta ordem é o que corrige o bloqueio):
//   1º  PATCH do atuador (LED) — ação interativa, tem de ser imediata.
//   2º  Sincronizar LED + motor no INTERVALO_INTERATIVO (rápido) — toggles do dashboard.
//   3º  Sincronizar sensores no INTERVALO_SENSORES (mais lento, mudam raramente).
//   4º  Enviar leituras, mas NO MÁXIMO MAX_POSTS_POR_CICLO por ciclo (baixa
//       prioridade). Assim, mesmo com um sensor a inundar a fila, os passos 1-3
//       correm SEMPRE — nunca ficam reféns do envio de leituras.
void taskHTTP(void* param) {
  PostData dados;
  unsigned long ultimoInterativo = 0;
  unsigned long ultimoSensores   = 0;

  for (;;) {
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("WiFi desligado, a reconectar...");
      resetConexao();
      WiFi.reconnect();
      vTaskDelay(pdMS_TO_TICKS(3000));
      continue;
    }

    // 1) PRIORIDADE: se o loop detetou algo, reflete o LED no servidor (PATCH).
    if (pedirLigarAtuador) {
      if (patchAtuador(true)) pedirLigarAtuador = false;
    }

    // 2) PRIORIDADE: LED + motor (interativos) -> sincroniza com frequência.
    if (millis() - ultimoInterativo >= INTERVALO_INTERATIVO) {
      sincronizarAtuadorMotor();
      ultimoInterativo = millis();
    }

    // 3) Sensores (mudam raramente) -> sincroniza mais espaçado.
    if (millis() - ultimoSensores >= INTERVALO_SENSORES) {
      sincronizarSensores();
      ultimoSensores = millis();
    }

    // 4) BAIXA PRIORIDADE: envia leituras, mas no máximo MAX_POSTS_POR_CICLO por
    //    ciclo. O que não couber fica na fila para o próximo ciclo (ou é descartado
    //    se a fila encher — aceitável, são dados de log). É isto que impede um
    //    sensor "preso" de monopolizar a task e bloquear o LED e a config.
    int enviados = 0;
    while (enviados < MAX_POSTS_POR_CICLO &&
           xQueueReceive(filaPost, &dados, 0) == pdTRUE) {
      enviarReadingHTTP(dados);
      enviados++;
    }

    vTaskDelay(pdMS_TO_TICKS(100));
  }
}

// ----------------------------------------------------------------------------
// Sensores
// ----------------------------------------------------------------------------

float medirDistancia(int trig, int echo) {
  digitalWrite(trig, LOW);
  delayMicroseconds(2);
  digitalWrite(trig, HIGH);
  delayMicroseconds(10);
  digitalWrite(trig, LOW);
  long duracao = pulseIn(echo, HIGH, 30000);
  if (duracao == 0) return -1;
  return (duracao * 0.0343) / 2.0;
}

void enviarPost(int sensor, float distancia, int ang) {
  PostData dados = { sensor, distancia, ang };
  xQueueSend(filaPost, &dados, 0);
}

// Lê um sensor. Devolve true se detetou um objeto a <= DIST_DETECAO (para acionar o LED).
bool lerSensor(int sensor, int trig, int echo, int offset) {
  if (!sensorAtivo[sensor]) return false;   // sensor desativado no dashboard -> ignora

  float dist = medirDistancia(trig, echo);
  unsigned long agora = millis();
  int angPolar = angulo + offset;

  if (dist > 0 && dist <= DIST_DETECAO) {
    bool variou = (ultimaDist[sensor] < 0 || abs(dist - ultimaDist[sensor]) >= 1.0);
    bool passou = (agora - ultimoPrint[sensor] >= INTERVALO_MS);
    if (variou && passou) {
      enviarPost(sensor, dist, angPolar);
      ultimaDist[sensor]  = dist;
      ultimoPrint[sensor] = agora;
    }
    return true;   // houve deteção (<= 30 cm)
  } else {
    ultimaDist[sensor] = -1;
    return false;
  }
}

void setup() {
  Serial.begin(115200);

  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  Serial.println("A fazer scan de redes...");
  int n = WiFi.scanNetworks();
  for (int i = 0; i < n; i++) {
    Serial.print(WiFi.SSID(i));
    Serial.print(" (");
    Serial.print(WiFi.RSSI(i));
    Serial.println(" dBm)");
  }

  Serial.print("A ligar ao WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("WiFi ligado! IP: ");
  Serial.println(WiFi.localIP());

  // HTTPS sem validar certificado (suficiente para o protótipo).
  secureClient.setInsecure();

  pinMode(TRIG_1, OUTPUT); pinMode(ECHO_1, INPUT);
  pinMode(TRIG_2, OUTPUT); pinMode(ECHO_2, INPUT);
  pinMode(TRIG_3, OUTPUT); pinMode(ECHO_3, INPUT);
  pinMode(TRIG_4, OUTPUT); pinMode(ECHO_4, INPUT);

  ESP32PWM::allocateTimer(0);
  servo.setPeriodHertz(50);
  servo.attach(SERVO_PIN, 400, 2800);

  Serial.println("A calibrar: marco zero (0°)...");
  servo.write(0);
  delay(2000);
  Serial.println("Pronto. Varrimento 0°–ANGULO_MAX x 4 sensores = 360°");

  filaPost = xQueueCreate(10, sizeof(PostData));

  xTaskCreatePinnedToCore(
    taskHTTP,
    "taskHTTP",
    12288,
    NULL,
    1,
    NULL,
    0
  );
}

void loop() {
  // Só comanda o servo quando o motor está ativo. Quando pausado, NÃO escrevemos
  // no servo (mantém a última posição) nem avançamos o ângulo, para que ao reativar
  // retome a varredura exatamente a partir do mesmo ângulo.
  if (motorAtivo) {
    servo.write(angulo);
  }

  // Lê os 4 sensores; cada um devolve true se detetou algo a <= 30 cm.
  // (Os sensores continuam a medir mesmo com o motor pausado — só a rotação para.)
  bool detetouAlgo = false;
  if (lerSensor(1, TRIG_1, ECHO_1,   0)) detetouAlgo = true;
  if (lerSensor(2, TRIG_2, ECHO_2,  90)) detetouAlgo = true;
  if (lerSensor(3, TRIG_3, ECHO_3, 180)) detetouAlgo = true;
  if (lerSensor(4, TRIG_4, ECHO_4, 270)) detetouAlgo = true;

  // Atuador (LED): acende assim que algo é detetado e só se apaga pelo toggle do
  // dashboard. Aqui acendemos já localmente e pedimos à task para fazer o PATCH.
  if (detetouAlgo && !atuadorLigado) {
    atuadorLigado = true;
    digitalWrite(LED_PIN, HIGH);
    pedirLigarAtuador = true;
  }

  // Avança o ângulo apenas com o motor ativo (contagem de graus pausa junto).
  if (motorAtivo) {
    angulo += incremento;
    if (angulo >= ANGULO_MAX) { angulo = ANGULO_MAX; incremento = -abs(incremento); }
    if (angulo <= 0)          { angulo = 0;          incremento =  abs(incremento); }
  }

  delay(10);
}
