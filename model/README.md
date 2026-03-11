# Model MVP: Recomendacion de configuracion

Este modulo implementa una solucion MVP, sin LLM, para recomendar configuraciones de despacho basadas en historico.

## Estructura

- `recommender.py`: motor principal de recomendacion
  - Match exacto por `CONSIGNATARIO + NUMERO_PARTE_HIJO`
  - Fallback por similitud (dimensiones/ubicacion)
  - Confianza global y por campo
  - Imputacion de campos faltantes (`imputed_fields`)
  - Marca de revision (`requires_review`)
- `risk_model.py`: score heuristico de riesgo
  - `probabilidad_desarme`
  - `nivel_riesgo` (`bajo`, `medio`, `alto`)
  - Explicacion simple del score
- `api.py`: endpoint HTTP para consumo desde backend/frontend/unity
  - `POST /recommend-config`

## Requisitos

- Python 3.9+ (solo librerias estandar)
- CSV historico en `model/data/historical_data.csv`

## Uso del recomendador (CLI)

Ejemplo:

```bash
python3 model/recommender.py \
  --data model/data/historical_data.csv \
  --consignatario 4800002797 \
  --numero-parte 948-0270-00 \
  --espesor 3.1 \
  --ancho 363.5 \
  --largo 220 \
  --peso-salida 1950 \
  --ubicacion Guerrero \
  --pretty
```

Tambien se puede usar `--input-json` con un archivo de entrada.

## Uso de la API

Levantar servidor:

```bash
python3 model/api.py --data model/data/historical_data.csv --host 127.0.0.1 --port 8010
```

Probar endpoint:

```bash
curl -X POST "http://127.0.0.1:8010/recommend-config" \
  -H "Content-Type: application/json" \
  -d '{
    "consignatario": "4800002797",
    "numero_parte": "948-0270-00",
    "espesor": 3.1,
    "ancho": 363.5,
    "largo": 220,
    "peso": 1950,
    "ubicacion": "Guerrero"
  }'
```

## Contrato basico de respuesta

Campos principales:

- `embalaje_recomendado`
- `piezas_por_paquete`
- `peso_maximo`
- `riesgo_desarme`
- `confianza`
- `casos_similares`
- `imputed_fields`
- `requires_review`

## Notas de alcance

- Este MVP prioriza trazabilidad y ejecucion segura.
- No usa LLM en decisiones.
- El riesgo es heuristico en esta etapa (no clasificador entrenado).
