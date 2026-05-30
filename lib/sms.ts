// Lightweight Twilio SMS sender using the Twilio REST API directly (no SDK
// dependency). Best-effort by design: every function here catches its own
// errors and returns a result object instead of throwing, so a failed SMS can
// never break the request that triggered it.
//
// Throttling and audit are DB-backed (table sms_log): every dispatched SMS is
// recorded, and a new one is only sent if the latest record is >=30s old.

import { prisma } from "@/lib/prisma";

const TWILIO_API_BASE = "https://api.twilio.com/2010-04-01";

export interface SmsResult {
  ok: boolean;
  sid?: string;
  error?: string;
  skipped?: boolean;
}

function getTwilioConfig() {
  return {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    from: process.env.TWILIO_FROM, // Twilio phone number or Messaging Service SID
  };
}

/** Sends a single SMS. Returns { ok:false, skipped:true } if Twilio isn't configured. */
export async function sendSms(to: string, body: string): Promise<SmsResult> {
  const { accountSid, authToken, from } = getTwilioConfig();

  if (!accountSid || !authToken || !from) {
    console.warn("[sms] Twilio não configurado (faltam env vars) — SMS ignorado.");
    return { ok: false, skipped: true, error: "twilio_not_configured" };
  }

  const params = new URLSearchParams({ To: to, From: from, Body: body });
  const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

  try {
    const res = await fetch(
      `${TWILIO_API_BASE}/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const msg = data?.message ?? `HTTP ${res.status}`;
      console.error("[sms] Falha ao enviar via Twilio:", msg);
      return { ok: false, error: msg };
    }

    return { ok: true, sid: data.sid };
  } catch (e) {
    console.error("[sms] Erro de rede ao enviar SMS:", e);
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

// --- Proximity alert -------------------------------------------------------

// Destination number (E.164). Defaults to the prototype's demo number but can
// be overridden via env without touching code.
const ALERT_TO = process.env.ALERT_SMS_TO ?? "+351932106457";

// Minimum gap between any two SMS, enforced against the DB. The sensor reports
// every ~5s, so without this a single close object would spam many texts.
// 30s => at most 2 SMS per minute.
const SMS_COOLDOWN_MS = Number(process.env.SMS_COOLDOWN_MS ?? 30_000);

export interface ProximityAlertInput {
  sensor: number;
  distance: number;
  unit: string;
}

/**
 * Sends the personalised "object got very close" alert.
 * Flow: (1) DB throttle — skip if the latest sms_log row is younger than
 * SMS_COOLDOWN_MS; (2) send via Twilio; (3) record the SMS in sms_log.
 * The <=5cm decision is made by the caller (the sensor route).
 */
export async function sendProximityAlert(
  input: ProximityAlertInput
): Promise<SmsResult> {
  // (0) Global kill-switch (DB). When SMS is disabled we send/record nothing.
  const config = await prisma.smsConfig.findUnique({ where: { id: 1 } });
  if (config && !config.enabled) {
    return { ok: false, skipped: true, error: "sms_disabled" };
  }

  // (1) DB-backed throttle — has enough time passed since the last SMS?
  const last = await prisma.smsLog.findFirst({
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  if (last && Date.now() - last.createdAt.getTime() < SMS_COOLDOWN_MS) {
    return { ok: false, skipped: true, error: "cooldown" };
  }

  const when = new Date().toLocaleString("pt-PT", {
    timeZone: "Europe/Lisbon",
  });

  const body =
    `⚠️ ALERTA DE PROXIMIDADE\n` +
    `Algo aproximou-se muito do radar!\n` +
    `Sensor ${input.sensor} · ${input.distance.toFixed(1)} ${input.unit}\n` +
    `${when}`;

  // (2) Dispatch.
  const result = await sendSms(ALERT_TO, body);

  // Twilio not configured: nothing was sent, so don't log (keeps the throttle
  // and the audit trail honest).
  if (result.skipped) return result;

  // (3) Record the attempt (sent or failed) — this row also drives the throttle.
  await prisma.smsLog
    .create({
      data: {
        recipient: ALERT_TO,
        body,
        sensor: input.sensor,
        distance: input.distance,
        status: result.ok ? "sent" : "failed",
        sid: result.sid ?? null,
        error: result.ok ? null : result.error ?? null,
      },
    })
    .catch((e: unknown) => console.error("[sms] Falha ao registar SMS na BD:", e));

  return result;
}
