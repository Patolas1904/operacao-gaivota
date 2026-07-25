const MAX_VERDICTS = 10;
const MAX_TEXT_LENGTH = 160;

function cleanText(value) {
  return typeof value === "string" ? value.trim().slice(0, MAX_TEXT_LENGTH) : "";
}

function cleanVerdicts(value) {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, MAX_VERDICTS)
    .map(cleanText)
    .filter(Boolean);
}

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { ok: false, error: "method_not_allowed" });
  }

  const allowedOrigin = process.env.ALLOWED_ORIGIN?.trim();
  const requestOrigin = req.headers.origin;
  if (allowedOrigin && requestOrigin && requestOrigin !== allowedOrigin) {
    return sendJson(res, 403, { ok: false, error: "origin_not_allowed" });
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL?.trim();
  if (!webhookUrl) {
    return sendJson(res, 503, { ok: false, error: "webhook_not_configured" });
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  } catch {
    return sendJson(res, 400, { ok: false, error: "invalid_json" });
  }

  if (body.consent !== true) {
    return sendJson(res, 400, { ok: false, error: "consent_required" });
  }

  const verdicts = cleanVerdicts(body.verdicts);
  const selectedResponse = cleanText(body.selectedResponse);
  const submissionId = cleanText(body.submissionId) || "sem-id";

  if (!selectedResponse) {
    return sendJson(res, 400, { ok: false, error: "missing_response" });
  }

  const payload = {
    username: "Operação Gaivota",
    allowed_mentions: { parse: [] },
    embeds: [
      {
        title: "Nova decisão recebida 🕊️",
        color: 12071724,
        fields: [
          {
            name: "Conclusões selecionadas",
            value: verdicts.length ? verdicts.map((item) => `• ${item}`).join("\n").slice(0, 1024) : "Nenhuma opção selecionada",
          },
          {
            name: "Sentença final",
            value: selectedResponse,
          },
          {
            name: "Referência",
            value: `\`${submissionId}\``,
          },
        ],
        footer: {
          text: "Conteúdo enviado: apenas escolhas feitas no site",
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  try {
    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!webhookResponse.ok) {
      console.error("Discord webhook error", webhookResponse.status, await webhookResponse.text());
      return sendJson(res, 502, { ok: false, error: "webhook_failed" });
    }

    return sendJson(res, 200, { ok: true });
  } catch (error) {
    console.error("Submission error", error);
    return sendJson(res, 500, { ok: false, error: "submission_failed" });
  }
};
