(() => {
  const canvas = document.getElementById("radar-canvas");
  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;
  const CX = W / 2;
  const CY = H / 2;
  const MAX_RANGE_PX = Math.min(W, H) / 2 - 20;
  const MAX_RANGE_CM = 400;
  const PX_PER_CM = MAX_RANGE_PX / MAX_RANGE_CM;
  const BEAM_THRESHOLD_PX = 12;
  const RING_COUNT = 4;

  const hudAngle = document.getElementById("hud-angle");
  const hudDistance = document.getElementById("hud-distance");
  const hudHits = document.getElementById("hud-hits");
  const mqttStatus = document.getElementById("mqtt-status");

  let beamAngleDeg = 0;
  let mouseX = 0;
  let mouseY = 0;
  let isDragging = false;
  let hitCount = 0;
  let lastHit = null;
  let blips = [];

  // --- MQTT ---
  let mqttClient = null;
  const MQTT_TOPIC = "radar/distance";

  function connectMqtt() {
    try {
      mqttClient = mqtt.connect("ws://localhost:9001");
      mqttClient.on("connect", () => {
        mqttStatus.textContent = "MQTT: connected";
        mqttStatus.className = "status connected";
      });
      mqttClient.on("error", () => {
        mqttStatus.textContent = "MQTT: error";
        mqttStatus.className = "status";
      });
      mqttClient.on("close", () => {
        mqttStatus.textContent = "MQTT: disconnected";
        mqttStatus.className = "status";
      });
    } catch {
      mqttStatus.textContent = "MQTT: connection failed";
    }
  }

  function publishReading(distance, angle) {
    if (!mqttClient || !mqttClient.connected) return;
    const payload = JSON.stringify({
      distance: Math.round(distance * 100) / 100,
      angle: Math.round(angle * 100) / 100,
      timestamp: new Date().toISOString(),
      source: "canvas-simulator",
    });
    mqttClient.publish(MQTT_TOPIC, payload, { qos: 1 });
  }

  // --- Geometry ---
  function beamEndpoint(angleDeg, length) {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: CX + Math.cos(rad) * length,
      y: CY - Math.sin(rad) * length,
    };
  }

  function pointToBeamDistance(px, py, angleDeg) {
    const rad = (angleDeg * Math.PI) / 180;
    const dx = px - CX;
    const dy = -(py - CY);
    const projection = dx * Math.cos(rad) + dy * Math.sin(rad);
    const perpendicular = Math.abs(-dx * Math.sin(rad) + dy * Math.cos(rad));
    return { projection, perpendicular };
  }

  // --- Drawing ---
  function drawGrid() {
    ctx.strokeStyle = "#0d2a0d";
    ctx.lineWidth = 1;
    for (let i = 1; i <= RING_COUNT; i++) {
      const r = (MAX_RANGE_PX / RING_COUNT) * i;
      ctx.beginPath();
      ctx.arc(CX, CY, r, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = "#1a3a1a";
      ctx.font = "11px Courier New";
      const label = Math.round((MAX_RANGE_CM / RING_COUNT) * i) + "cm";
      ctx.fillText(label, CX + r + 4, CY - 4);
    }

    ctx.strokeStyle = "#0d2a0d";
    for (let a = 0; a < 360; a += 45) {
      const end = beamEndpoint(a, MAX_RANGE_PX);
      ctx.beginPath();
      ctx.moveTo(CX, CY);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    }
  }

  function drawSensor() {
    ctx.fillStyle = "#00ff41";
    ctx.beginPath();
    ctx.arc(CX, CY, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#0a0a0a";
    ctx.beginPath();
    ctx.arc(CX, CY, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawBeam() {
    const end = beamEndpoint(beamAngleDeg, MAX_RANGE_PX);

    const grad = ctx.createLinearGradient(CX, CY, end.x, end.y);
    grad.addColorStop(0, "rgba(0, 255, 65, 0.9)");
    grad.addColorStop(1, "rgba(0, 255, 65, 0.1)");

    ctx.strokeStyle = grad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(CX, CY);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    // beam cone (faint)
    const coneAngle = 5;
    const endL = beamEndpoint(beamAngleDeg - coneAngle, MAX_RANGE_PX);
    const endR = beamEndpoint(beamAngleDeg + coneAngle, MAX_RANGE_PX);
    ctx.fillStyle = "rgba(0, 255, 65, 0.03)";
    ctx.beginPath();
    ctx.moveTo(CX, CY);
    ctx.lineTo(endL.x, endL.y);
    ctx.lineTo(endR.x, endR.y);
    ctx.closePath();
    ctx.fill();
  }

  function drawBlips() {
    const now = Date.now();
    blips = blips.filter((b) => now - b.time < 3000);

    for (const blip of blips) {
      const age = (now - blip.time) / 3000;
      const alpha = 1 - age;
      const pos = beamEndpoint(blip.angle, blip.distancePx);

      ctx.fillStyle = `rgba(0, 255, 65, ${alpha})`;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 4 + (1 - alpha) * 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(0, 255, 65, ${alpha * 0.3})`;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 10 + (1 - alpha) * 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawHitIndicator() {
    if (!lastHit || Date.now() - lastHit.time > 500) return;

    const pos = beamEndpoint(lastHit.angle, lastHit.distancePx);
    ctx.strokeStyle = "#00ff41";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(CX, CY);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = "rgba(0, 255, 65, 0.5)";
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 14, 0, Math.PI * 2);
    ctx.stroke();
  }

  function render() {
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, W, H);

    drawGrid();
    drawBlips();
    drawBeam();
    drawHitIndicator();
    drawSensor();

    requestAnimationFrame(render);
  }

  // --- Mouse interaction ---
  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;

    if (isDragging) {
      const dx = mouseX - CX;
      const dy = -(mouseY - CY);
      beamAngleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
      if (beamAngleDeg < 0) beamAngleDeg += 360;
      hudAngle.textContent = Math.round(beamAngleDeg) + "°";
      return;
    }

    // Check beam intersection
    const { projection, perpendicular } = pointToBeamDistance(mouseX, mouseY, beamAngleDeg);
    if (perpendicular < BEAM_THRESHOLD_PX && projection > 10 && projection < MAX_RANGE_PX) {
      const distanceCm = projection / PX_PER_CM;
      hudDistance.textContent = distanceCm.toFixed(1) + " cm";

      hitCount++;
      hudHits.textContent = hitCount;

      lastHit = {
        angle: beamAngleDeg,
        distancePx: projection,
        distanceCm,
        time: Date.now(),
      };

      blips.push({
        angle: beamAngleDeg,
        distancePx: projection,
        time: Date.now(),
      });

      publishReading(distanceCm, beamAngleDeg);
    }
  });

  canvas.addEventListener("mousedown", (e) => {
    const dx = mouseX - CX;
    const dy = mouseY - CY;
    if (Math.sqrt(dx * dx + dy * dy) < 30) {
      isDragging = true;
    }
  });

  canvas.addEventListener("mouseup", () => {
    isDragging = false;
  });

  canvas.addEventListener("mouseleave", () => {
    isDragging = false;
  });

  // --- Init ---
  connectMqtt();
  render();
})();
