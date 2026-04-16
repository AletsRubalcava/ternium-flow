const MODEL_API_URL = process.env.MODEL_API_URL || "http://127.0.0.1:8010/recommend-config";
const MODEL_API_TIMEOUT_MS = Number(process.env.MODEL_API_TIMEOUT_MS || 12000);

function normalizePayload(body = {}) {
  return {
    consignatario: String(body.consignatario ?? body.consignee ?? "").trim(),
    numero_parte: String(body.numero_parte ?? body.partNumber ?? "").trim(),
    espesor: body.espesor ?? body.thickness ?? null,
    ancho: body.ancho ?? body.width ?? null,
    largo: body.largo ?? body.length ?? null,
    peso: body.peso ?? body.weight ?? null,
    ubicacion: String(body.ubicacion ?? body.location ?? "").trim(),
    embalaje: String(body.embalaje ?? "").trim(),
  };
}

export async function getRecommendationHandler(req, res) {
  const payload = normalizePayload(req.body);

  if (!payload.consignatario || !payload.numero_parte) {
    return res.status(400).json({
      error: "MISSING_REQUIRED_FIELDS",
      message: "consignatario y numero_parte son obligatorios.",
    });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), MODEL_API_TIMEOUT_MS);

  try {
    const response = await fetch(MODEL_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return res.status(502).json({
        error: "MODEL_API_ERROR",
        status: response.status,
        message: data?.error || "El servicio de prediccion devolvio un error.",
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    if (error.name === "AbortError") {
      return res.status(504).json({
        error: "MODEL_API_TIMEOUT",
        message: "El servicio de prediccion no respondio a tiempo.",
      });
    }

    return res.status(502).json({
      error: "MODEL_API_UNAVAILABLE",
      message: "No se pudo conectar con el servicio de prediccion.",
    });
  } finally {
    clearTimeout(timeoutId);
  }
}
