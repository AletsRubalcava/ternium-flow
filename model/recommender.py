#!/usr/bin/env python3
"""
Deterministic recommender for pallet/shipping configuration.

Approach:
1) Exact historical match by (CONSIGNATARIO, NUMERO_PARTE_HIJO).
2) Fallback to weighted similarity over logistics fields.
3) Return recommendation + confidence + traceable similar cases.
"""

from __future__ import annotations

import argparse
import csv
import json
from collections import Counter, defaultdict
from dataclasses import dataclass
from statistics import median
from typing import Any, Dict, Iterable, List, Optional, Tuple


TARGET_EMBALAJE = "DESCRIPCION_EMBALAJE"
TARGET_PIEZAS = "PIEZAS_POR_PAQ_HIJO"
TARGET_PESO_MAX = "PESO_MAX_DESPACHO_HIJO"

NUMERIC_FIELDS = {
    "ESPESOR_HIJO",
    "ANCHO_HIJO",
    "LARGO_HIJO",
    "PESO_MATERIAL_SALIDA",
    TARGET_PESO_MAX,
}

MISSING_TOKENS = {"", "NOA", "N/A", "NA", "NULL", "NONE", "-"}


@dataclass
class Row:
    raw: Dict[str, str]
    parsed: Dict[str, Any]


def normalize_text(value: Any) -> str:
    if value is None:
        return ""
    text = str(value).strip()
    if text.upper() in MISSING_TOKENS:
        return ""
    return text


def parse_float(value: Any) -> Optional[float]:
    text = normalize_text(value)
    if not text:
        return None
    text = text.replace(",", "")
    try:
        return float(text)
    except ValueError:
        return None


def safe_mode(values: Iterable[str]) -> Tuple[str, int, int]:
    cleaned = [v for v in values if normalize_text(v)]
    if not cleaned:
        return "", 0, 0
    counts = Counter(cleaned)
    label, count = counts.most_common(1)[0]
    return label, count, len(cleaned)


def confidence_from_support(winner_count: float, total_count: float) -> float:
    if total_count <= 0:
        return 0.0
    purity = winner_count / total_count
    support_factor = min(1.0, total_count / 20.0)
    return round(purity * support_factor, 4)


def load_rows(data_path: str) -> List[Row]:
    rows: List[Row] = []
    with open(data_path, newline="", encoding="utf-8-sig") as file:
        reader = csv.DictReader(file)
        for raw in reader:
            parsed: Dict[str, Any] = {}
            for key, value in raw.items():
                key = str(key).strip().replace("\ufeff", "")
                if key in NUMERIC_FIELDS:
                    parsed[key] = parse_float(value)
                else:
                    parsed[key] = normalize_text(value)
            rows.append(Row(raw=raw, parsed=parsed))
    return rows


def build_exact_index(rows: List[Row]) -> Dict[Tuple[str, str], List[Row]]:
    index: Dict[Tuple[str, str], List[Row]] = defaultdict(list)
    for row in rows:
        key = (
            normalize_text(row.parsed.get("CONSIGNATARIO", "")),
            normalize_text(row.parsed.get("NUMERO_PARTE_HIJO", "")),
        )
        if key[0] and key[1]:
            index[key].append(row)
    return index


def pick_weighted_mode(rows_with_weights: List[Tuple[Row, float]], field: str) -> Dict[str, Any]:
    weighted_counts: Dict[str, float] = defaultdict(float)
    plain_count = 0
    for row, weight in rows_with_weights:
        value = normalize_text(row.parsed.get(field, ""))
        if not value:
            continue
        plain_count += 1
        weighted_counts[value] += weight

    if not weighted_counts:
        return {"value": "", "confidence": 0.0, "support": 0}

    winner, winner_weight = sorted(weighted_counts.items(), key=lambda x: x[1], reverse=True)[0]
    total_weight = sum(weighted_counts.values())
    confidence = confidence_from_support(winner_weight, total_weight)
    return {"value": winner, "confidence": confidence, "support": plain_count}


def pick_weighted_numeric(rows_with_weights: List[Tuple[Row, float]], field: str) -> Dict[str, Any]:
    pairs: List[Tuple[float, float]] = []
    for row, weight in rows_with_weights:
        value = row.parsed.get(field)
        if isinstance(value, float):
            pairs.append((value, weight))

    if not pairs:
        return {"value": "", "confidence": 0.0, "support": 0}

    expanded: List[float] = []
    total_weight = 0.0
    for value, weight in pairs:
        repeat = max(1, int(weight * 10))
        expanded.extend([value] * repeat)
        total_weight += weight

    result_value = round(median(expanded), 4)
    confidence = confidence_from_support(sum(weight for _, weight in pairs), total_weight)
    return {"value": result_value, "confidence": confidence, "support": len(pairs)}


def similarity_score(order: Dict[str, Any], row: Row) -> float:
    score = 0.0
    denom = 0.0

    # Strong categorical anchors
    for field, weight in (
        ("CONSIGNATARIO", 4.0),
        ("D_UBICACION", 2.0),
        ("DESCRIPCION_EMBALAJE", 1.0),
    ):
        order_value = normalize_text(order.get(field, ""))
        row_value = normalize_text(row.parsed.get(field, ""))
        denom += weight
        if order_value and row_value and order_value == row_value:
            score += weight

    # Numeric proximity
    for field, weight, tolerance in (
        ("ESPESOR_HIJO", 2.0, 0.25),
        ("ANCHO_HIJO", 2.5, 40.0),
        ("LARGO_HIJO", 2.5, 80.0),
        ("PESO_MATERIAL_SALIDA", 2.0, 800.0),
    ):
        order_num = parse_float(order.get(field))
        row_num = row.parsed.get(field)
        denom += weight
        if order_num is None or not isinstance(row_num, float):
            continue
        diff = abs(order_num - row_num)
        contribution = max(0.0, 1.0 - (diff / tolerance))
        score += weight * contribution

    if denom == 0:
        return 0.0
    return score / denom


def prepare_order_from_args(args: argparse.Namespace) -> Dict[str, Any]:
    if args.input_json:
        with open(args.input_json, "r", encoding="utf-8") as file:
            payload = json.load(file)
        if not isinstance(payload, dict):
            raise ValueError("Input JSON must be an object with order fields.")
        return payload

    return {
        "CONSIGNATARIO": args.consignatario or "",
        "NUMERO_PARTE_HIJO": args.numero_parte or "",
        "ESPESOR_HIJO": args.espesor,
        "ANCHO_HIJO": args.ancho,
        "LARGO_HIJO": args.largo,
        "PESO_MATERIAL_SALIDA": args.peso_salida,
        "D_UBICACION": args.ubicacion or "",
    }


def recommend(order: Dict[str, Any], rows: List[Row], exact_index: Dict[Tuple[str, str], List[Row]], top_k: int) -> Dict[str, Any]:
    consignatario = normalize_text(order.get("CONSIGNATARIO", ""))
    numero_parte = normalize_text(order.get("NUMERO_PARTE_HIJO", ""))
    exact_key = (consignatario, numero_parte)

    source = "similarity"
    selected_rows: List[Tuple[Row, float]] = []

    if consignatario and numero_parte and exact_key in exact_index:
        candidates = exact_index[exact_key]
        selected_rows = [(row, 1.0) for row in candidates]
        source = "exact_match"
    else:
        scored: List[Tuple[Row, float]] = []
        for row in rows:
            sim = similarity_score(order, row)
            if sim > 0.35:
                scored.append((row, sim))
        scored.sort(key=lambda x: x[1], reverse=True)
        selected_rows = scored[:top_k]

    if not selected_rows:
        return {
            "source": "fallback_none",
            "recommendation": {},
            "confidence": 0.0,
            "requires_review": True,
            "imputed_fields": [],
            "similar_cases": [],
            "message": "No historical support found for this order.",
        }

    emb = pick_weighted_mode(selected_rows, TARGET_EMBALAJE)
    piezas = pick_weighted_mode(selected_rows, TARGET_PIEZAS)
    peso = pick_weighted_numeric(selected_rows, TARGET_PESO_MAX)

    field_confidences = [emb["confidence"], piezas["confidence"], peso["confidence"]]
    overall_conf = round(sum(field_confidences) / len(field_confidences), 4)

    # Impute missing user fields from neighbors (for RF-23 behavior)
    imputed_fields: List[str] = []
    for field in ("ESPESOR_HIJO", "ANCHO_HIJO", "LARGO_HIJO", "PESO_MATERIAL_SALIDA"):
        if parse_float(order.get(field)) is None:
            guessed = pick_weighted_numeric(selected_rows, field)
            if guessed["value"] != "":
                order[field] = guessed["value"]
                imputed_fields.append(field)

    similar_cases: List[Dict[str, Any]] = []
    for row, weight in selected_rows[:5]:
        similar_cases.append(
            {
                "score": round(weight, 4),
                "id_ode": normalize_text(row.parsed.get("ID_ODE", "")),
                "consignatario": normalize_text(row.parsed.get("CONSIGNATARIO", "")),
                "numero_parte_hijo": normalize_text(row.parsed.get("NUMERO_PARTE_HIJO", "")),
                "embalaje": normalize_text(row.parsed.get(TARGET_EMBALAJE, "")),
                "piezas_por_paq_hijo": normalize_text(row.parsed.get(TARGET_PIEZAS, "")),
                "peso_max_despacho_hijo": row.parsed.get(TARGET_PESO_MAX),
            }
        )

    low_support = min(emb["support"], piezas["support"], peso["support"]) < 5
    requires_review = overall_conf < 0.65 or low_support

    return {
        "source": source,
        "recommendation": {
            "embalaje_recomendado": emb["value"],
            "piezas_por_paquete_recomendadas": piezas["value"],
            "peso_maximo_sugerido": peso["value"],
        },
        "confidence": overall_conf,
        "confidence_breakdown": {
            "embalaje": emb["confidence"],
            "piezas_por_paquete": piezas["confidence"],
            "peso_maximo": peso["confidence"],
        },
        "requires_review": requires_review,
        "imputed_fields": imputed_fields,
        "similar_cases": similar_cases,
        "input_normalized": order,
    }


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Historical configuration recommender")
    parser.add_argument("--data", required=True, help="Path to historical CSV")
    parser.add_argument("--input-json", help="Input order as JSON file")

    parser.add_argument("--consignatario", help="CONSIGNATARIO")
    parser.add_argument("--numero-parte", help="NUMERO_PARTE_HIJO")
    parser.add_argument("--espesor", type=float, help="ESPESOR_HIJO")
    parser.add_argument("--ancho", type=float, help="ANCHO_HIJO")
    parser.add_argument("--largo", type=float, help="LARGO_HIJO")
    parser.add_argument("--peso-salida", type=float, help="PESO_MATERIAL_SALIDA")
    parser.add_argument("--ubicacion", help="D_UBICACION")
    parser.add_argument("--top-k", type=int, default=40, help="Top candidates for similarity fallback")
    parser.add_argument("--pretty", action="store_true", help="Pretty-print JSON output")
    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()

    order = prepare_order_from_args(args)
    rows = load_rows(args.data)
    exact_index = build_exact_index(rows)
    result = recommend(order, rows, exact_index, top_k=args.top_k)

    if args.pretty:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    main()
