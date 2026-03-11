#!/usr/bin/env python3
"""
Heuristic risk scoring for pallet recommendation outputs.

This module intentionally avoids complex ML to keep the MVP predictable
and easy to validate with current data quality.
"""

from __future__ import annotations

from typing import Any, Dict, List


def _clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
    return max(low, min(high, value))


def _risk_level(score: float) -> str:
    if score < 0.33:
        return "bajo"
    if score < 0.66:
        return "medio"
    return "alto"


def _build_explanation(source: str, requires_review: bool, imputed_fields: List[str], confidence: float) -> str:
    reasons: List[str] = []
    if source == "exact_match":
        reasons.append("coincidencia exacta en historico")
    elif source == "similarity":
        reasons.append("estimacion por similitud")
    else:
        reasons.append("sin soporte historico suficiente")

    if imputed_fields:
        reasons.append(f"campos imputados: {', '.join(imputed_fields)}")
    if requires_review:
        reasons.append("requiere revision manual")

    reasons.append(f"confianza global {round(confidence, 3)}")
    return "; ".join(reasons)


def calculate_risk(recommendation_result: Dict[str, Any]) -> Dict[str, Any]:
    """
    Build a risk estimate from recommendation metadata.

    Returns:
      - probabilidad_desarme: heuristic value 0..1
      - score_riesgo: same numeric value (alias for UI/API)
      - nivel_riesgo: bajo/medio/alto
      - explicacion_simple: human-readable summary
    """
    source = str(recommendation_result.get("source", "fallback_none"))
    confidence = float(recommendation_result.get("confidence", 0.0) or 0.0)
    requires_review = bool(recommendation_result.get("requires_review", True))
    imputed_fields = recommendation_result.get("imputed_fields", []) or []
    recommendation = recommendation_result.get("recommendation", {}) or {}

    if source == "fallback_none":
        score = 0.95
    else:
        score = 1.0 - confidence
        if source == "similarity":
            score += 0.15
        if requires_review:
            score += 0.12
        if imputed_fields:
            score += min(0.15, 0.05 * len(imputed_fields))

        missing_outputs = 0
        for field in (
            "embalaje_recomendado",
            "piezas_por_paquete_recomendadas",
            "peso_maximo_sugerido",
        ):
            value = recommendation.get(field)
            if value in ("", None):
                missing_outputs += 1
        score += 0.08 * missing_outputs

        if source == "exact_match" and confidence >= 0.9 and not requires_review:
            score -= 0.1

    score = round(_clamp(score), 4)
    return {
        "probabilidad_desarme": score,
        "score_riesgo": score,
        "nivel_riesgo": _risk_level(score),
        "explicacion_simple": _build_explanation(source, requires_review, imputed_fields, confidence),
    }

