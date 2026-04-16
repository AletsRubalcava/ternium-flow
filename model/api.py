#!/usr/bin/env python3
"""
Minimal HTTP API for recommendation module.

Endpoint:
  POST /recommend-config
"""

from __future__ import annotations

import argparse
import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any, Dict, Tuple

from recommender import build_exact_index, load_rows, recommend
from risk_model import calculate_risk


def _to_internal_order(payload: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "CONSIGNATARIO": payload.get("consignatario", ""),
        "NUMERO_PARTE_HIJO": payload.get("numero_parte", ""),
        "ESPESOR_HIJO": payload.get("espesor"),
        "ANCHO_HIJO": payload.get("ancho"),
        "LARGO_HIJO": payload.get("largo"),
        "PESO_MATERIAL_SALIDA": payload.get("peso"),
        "D_UBICACION": payload.get("ubicacion", ""),
        "DESCRIPCION_EMBALAJE": payload.get("embalaje", ""),
    }


def _to_external_response(rec_result: Dict[str, Any], risk_result: Dict[str, Any]) -> Dict[str, Any]:
    rec = rec_result.get("recommendation", {})
    return {
        "embalaje_recomendado": rec.get("embalaje_recomendado", ""),
        "piezas_por_paquete": rec.get("piezas_por_paquete_recomendadas", ""),
        "peso_maximo": rec.get("peso_maximo_sugerido", ""),
        "riesgo_desarme": risk_result.get("probabilidad_desarme", 1.0),
        "score_riesgo": risk_result.get("score_riesgo", 1.0),
        "nivel_riesgo": risk_result.get("nivel_riesgo", "alto"),
        "explicacion_riesgo": risk_result.get("explicacion_simple", ""),
        "confianza": rec_result.get("confidence", 0.0),
        "requires_review": rec_result.get("requires_review", True),
        "imputed_fields": rec_result.get("imputed_fields", []),
        "casos_similares": rec_result.get("similar_cases", []),
        "source": rec_result.get("source", ""),
    }


class RecommenderHandler(BaseHTTPRequestHandler):
    rows = []
    exact_index = {}
    top_k = 40

    def _send_json(self, status: int, payload: Dict[str, Any]) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self) -> None:  # noqa: N802
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self) -> None:  # noqa: N802
        if self.path != "/recommend-config":
            self._send_json(404, {"error": "Endpoint not found"})
            return

        try:
            content_length = int(self.headers.get("Content-Length", "0"))
            if content_length <= 0:
                self._send_json(400, {"error": "Body is required"})
                return

            raw_body = self.rfile.read(content_length).decode("utf-8")
            payload = json.loads(raw_body)
            if not isinstance(payload, dict):
                self._send_json(400, {"error": "JSON body must be an object"})
                return

            internal_order = _to_internal_order(payload)
            rec_result = recommend(
                internal_order,
                rows=self.rows,
                exact_index=self.exact_index,
                top_k=self.top_k,
            )
            risk_result = calculate_risk(rec_result)
            response = _to_external_response(rec_result, risk_result)
            self._send_json(200, response)
        except json.JSONDecodeError:
            self._send_json(400, {"error": "Invalid JSON"})
        except Exception as exc:  # pragma: no cover - defensive guard
            self._send_json(500, {"error": f"Internal error: {exc}"})

    def log_message(self, fmt: str, *args: Any) -> None:
        # Quiet default HTTP access logs for cleaner local runs.
        return


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Recommendation API server")
    parser.add_argument(
        "--data",
        default="model/data/historical_data.csv",
        help="Path to historical CSV",
    )
    parser.add_argument("--host", default="0.0.0.0", help="Host to bind")
    parser.add_argument("--port", type=int, default=8000, help="Port to bind")
    parser.add_argument("--top-k", type=int, default=40, help="Top candidates for fallback")
    return parser.parse_args()


def _bootstrap(data_path: str, top_k: int) -> Tuple[list, dict]:
    rows = load_rows(data_path)
    exact_index = build_exact_index(rows)
    RecommenderHandler.rows = rows
    RecommenderHandler.exact_index = exact_index
    RecommenderHandler.top_k = top_k
    return rows, exact_index


def main() -> None:
    args = _parse_args()
    _bootstrap(args.data, args.top_k)
    server = ThreadingHTTPServer((args.host, args.port), RecommenderHandler)
    print(f"API listening on http://{args.host}:{args.port}")
    print("POST /recommend-config")
    server.serve_forever()


if __name__ == "__main__":
    main()

