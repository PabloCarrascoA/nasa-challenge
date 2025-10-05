# __init__.py — API con doble catálogo: cumulative.csv (nombres) + cleanedData.csv (pipeline)
import os, json, difflib
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

# Tu pipeline
import data_cleaning_test as data_mod
import model_use_case as model_mod

# -------------------- Config --------------------
MAIN_CSV_PATH   = os.getenv("EXO_MAIN_CSV",   "RawDatasete/cleanedData.csv")  # dataset del pipeline
NAMES_CSV_PATH  = os.getenv("EXO_NAMES_CSV",  "cumulative.csv")               # catálogo para resolver Kepler/KOI
NAME_COLS       = ["kepler_name", "kepoi_name"]
ID_COL          = "kepid"

# Mapa de clases del modelo (índice -> etiqueta en inglés y ES)
CLASS_MAP_EN = {0: "candidate", 1: "confirmed", 2: "false_positive"}
CLASS_MAP_ES = {"candidate": "Candidato", "confirmed": "Confirmado", "false_positive": "Falso positivo"}

# Categoría del CSV (koi_disposition) -> ES
CSV_DISPO_ES = {"CONFIRMED": "Confirmado", "CANDIDATE": "Candidato", "FALSE POSITIVE": "Falso positivo"}

# Qué características enseñar (desde el CSV)
FEATURE_EXPORT_COLUMNS = [
    "koi_period", "koi_duration", "koi_depth", "koi_prad",
    "koi_teq", "koi_slogg", "koi_srad", "koi_steff",
    "koi_smass", "koi_kepmag", "koi_snr", "koi_impact"
]

# -------------------- App -----------------------
app = Flask(__name__)
CORS(app)

# -------------------- Carga CSVs ----------------
errors = []
def load_csv(path):
    if not os.path.exists(path):
        return None, f"CSV no encontrado: {path}"
    try:
        return pd.read_csv(path), None
    except Exception as e:
        return None, f"Error cargando '{path}': {e}"

df_main, e1 = load_csv(MAIN_CSV_PATH)
if e1: errors.append(e1)
df_names, e2 = load_csv(NAMES_CSV_PATH)
# 'names' es opcional: si falla, seguimos, pero sin soporte extendido de Kepler
if e2: df_names = None  # no lo marcamos como error fatal

def _norm(s: str) -> str:
    return (s or "").strip().lower().replace("–", "-").replace("—", "-")

def _build_name_index(_df: pd.DataFrame):
    idx = {}
    if _df is None: return idx
    for i, row in _df.iterrows():
        for col in NAME_COLS:
            if col in _df.columns:
                val = row.get(col)
                if pd.notna(val) and str(val).strip():
                    idx[_norm(str(val))] = ("df", i)  # ("df", index) para distinguir origen
    return idx

# Índices por catálogo
index_main  = _build_name_index(df_main)
index_names = _build_name_index(df_names)

def _lookup_name(query: str):
    """Busca primero en df_names (Kepler/KOI), luego en df_main. Retorna (source, idx, row)."""
    qn = _norm(query)

    # exacto
    if qn in index_names: 
        _, i = index_names[qn]; return "names", i, df_names.loc[i]
    if qn in index_main:
        _, i = index_main[qn];  return "main",  i, df_main.loc[i]

    # fuzzy
    keys = list(index_names.keys()) + list(index_main.keys())
    match = difflib.get_close_matches(qn, keys, n=1, cutoff=0.8)
    if match:
        m = match[0]
        if m in index_names:
            _, i = index_names[m]; return "names", i, df_names.loc[i]
        else:
            _, i = index_main[m];  return "main",  i, df_main.loc[i]

    # contains
    for (src_df, df) in (("names", df_names), ("main", df_main)):
        if df is None: continue
        mask = None
        for col in NAME_COLS:
            if col in df.columns:
                m = df[col].astype(str).str.lower().str.contains(qn, na=False)
                mask = m if mask is None else (mask | m)
        if mask is not None:
            subset = df[mask]
            if not subset.empty:
                i = subset.index[0]
                return src_df, i, df.loc[i]

    return None, None, None

def _ensure_koi_for_pipeline(src: str, row: pd.Series):
    """
    Devuelve (kepid, kepoi_name) buscando, si hace falta, en el otro catálogo por kepid.
    Necesario porque get_element() requiere KOI.
    """
    if row is None: return None, None
    def _get_id_koi(r):
        pid = int(r[ID_COL]) if (ID_COL in r and pd.notna(r[ID_COL])) else None
        koi = str(r["kepoi_name"]) if ("kepoi_name" in r and pd.notna(r["kepoi_name"]) and str(r["kepoi_name"]).strip()) else None
        return pid, koi

    pid, koi = _get_id_koi(row)
    if koi: return pid, koi

    # buscar en el otro df por mismo kepid
    if pid is not None:
        other = df_main if src == "names" else df_names
        if other is not None and ID_COL in other.columns:
            cand = other[(other[ID_COL] == pid) & other["kepoi_name"].notna() & (other["kepoi_name"].astype(str).str.strip() != "")]
            if not cand.empty:
                return pid, str(cand.iloc[0]["kepoi_name"])
    return None, None

def _csv_disposition_es(row: pd.Series):
    if row is None: return None, None
    col = "koi_disposition" if "koi_disposition" in row.index else None
    if not col: return None, None
    raw = str(row[col]).strip().upper() if pd.notna(row[col]) else None
    return raw, (CSV_DISPO_ES.get(raw) if raw else None)

def _csv_features_from_row(row: pd.Series):
    out = {}
    if row is None: return out
    for col in FEATURE_EXPORT_COLUMNS:
        if col in row and pd.notna(row[col]):
            try:
                out[col] = float(row[col])
            except Exception:
                out[col] = str(row[col])
    return out

# -------------------- Endpoints -----------------
@app.get("/health")
def health():
    return jsonify({
        "status": "ok" if not errors else "error",
        "errors": errors,
        "main_csv": MAIN_CSV_PATH,
        "names_csv": NAMES_CSV_PATH if df_names is not None else None,
        "rows_main": int(len(df_main)) if df_main is not None else 0,
        "rows_names": int(len(df_names)) if df_names is not None else 0,
        "main_has_kepler_name": (df_main is not None and "kepler_name" in df_main.columns),
        "names_has_kepler_name": (df_names is not None and "kepler_name" in df_names.columns),
        "name_columns": NAME_COLS,
        "id_column_present": (df_main is not None and ID_COL in df_main.columns) or (df_names is not None and ID_COL in df_names.columns),
        "feature_export_columns": FEATURE_EXPORT_COLUMNS,
        "class_map_en": CLASS_MAP_EN,
        "class_map_es": CLASS_MAP_ES,
        "pipeline": "data_cleaning_test.get_element -> model_use_case.get_prediction",
    })

@app.get("/search")
def search():
    q = request.args.get("q", "").strip()
    if not q:
        return jsonify({"error": "Falta 'q'."}), 400
    ql = q.lower()
    results = []

    def collect(df):
        if df is None: return []
        cols = [c for c in NAME_COLS if c in df.columns]
        if not cols: return []
        mask = None
        for c in cols:
            m = df[c].astype(str).str.lower().str.contains(ql, na=False)
            mask = m if mask is None else (mask | m)
        subset = df[mask].head(50)
        out = []
        for _, r in subset.iterrows():
            out.append({
                "kepid": int(r[ID_COL]) if ID_COL in df.columns and pd.notna(r[ID_COL]) else None,
                "kepoi_name": str(r["kepoi_name"]) if "kepoi_name" in df.columns and pd.notna(r["kepoi_name"]) else None,
                "kepler_name": str(r["kepler_name"]) if "kepler_name" in df.columns and pd.notna(r["kepler_name"]) else None,
            })
        return out

    # prioriza catálogo de nombres
    results.extend(collect(df_names))
    # añade del main evitando duplicados exactos
    seen = {json.dumps(r, sort_keys=True) for r in results}
    for r in collect(df_main):
        k = json.dumps(r, sort_keys=True)
        if k not in seen:
            results.append(r); seen.add(k)

    return jsonify({"query": q, "count": len(results), "results": results})

@app.get("/predict")
def predict():
    name = request.args.get("name", "").strip()
    if not name:
        return jsonify({"error": "Falta el parámetro 'name'."}), 400

    src, idx, row = _lookup_name(name)
    if row is None:
        return jsonify({"query": name, "error": "No encontrado en ninguno de los catálogos (prueba /search)."}), 404

    # Resolver KOI para el pipeline
    planet_id, planet_koi = _ensure_koi_for_pipeline(src, row)
    if planet_id is None or not planet_koi:
        return jsonify({
            "query": name,
            "matched": {
                "kepid": int(row[ID_COL]) if ID_COL in row and pd.notna(row[ID_COL]) else None,
                "kepoi_name": str(row["kepoi_name"]) if "kepoi_name" in row and pd.notna(row["kepoi_name"]) else None,
                "kepler_name": str(row["kepler_name"]) if "kepler_name" in row and pd.notna(row["kepler_name"]) else None,
                "source": src
            },
            "error": "No pude asociar un KOI (kepoi_name) a este registro; el pipeline requiere KOI."
        }), 422

    # Predicción con tu pipeline
    try:
        X = data_mod.get_element(planet_id, planet_koi, None)
        y_idx = int(model_mod.get_prediction(X)[0])
        probs = model_mod.model.predict(np.array(X), verbose=0)[0].tolist()
    except Exception as e:
        return jsonify({"error": f"Fallo en el pipeline/modelo: {e}"}), 500

    label_en = CLASS_MAP_EN.get(y_idx, str(y_idx))
    label_es = CLASS_MAP_ES.get(label_en, label_en)
    proba = {CLASS_MAP_EN.get(i, str(i)): float(p) for i, p in enumerate(probs)}

    # Para mostrar categoría/características, usa la fila del catálogo donde se halló; si falta, intenta en el otro por kepid
    disp_raw, disp_es = _csv_disposition_es(row)
    show_row = row
    if (not disp_raw or len(_csv_features_from_row(row)) == 0) and (df_main is not None and df_names is not None):
        other = df_main if src == "names" else df_names
        try:
            alt = other[other[ID_COL] == int(planet_id)]
            if not alt.empty:
                show_row = alt.iloc[0]
                disp_raw, disp_es = _csv_disposition_es(show_row)
        except Exception:
            pass

    features_csv = _csv_features_from_row(show_row)

    # --- campos extra solicitados (seguros ante NaN)
    name_val = str(show_row["kepoi_name"]) if "kepoi_name" in show_row and pd.notna(show_row["kepoi_name"]) else None
    koi_disposition_val = str(show_row["koi_disposition"]) if "koi_disposition" in show_row and pd.notna(show_row["koi_disposition"]) else None
    koi_prad_val   = float(show_row["koi_prad"])   if "koi_prad"   in show_row and pd.notna(show_row["koi_prad"])   else None
    koi_period_val = float(show_row["koi_period"]) if "koi_period" in show_row and pd.notna(show_row["koi_period"]) else None
    koi_teq_val    = float(show_row["koi_teq"])    if "koi_teq"    in show_row and pd.notna(show_row["koi_teq"])    else None
    koi_insol_val  = float(show_row["koi_insol"])  if "koi_insol"  in show_row and pd.notna(show_row["koi_insol"])  else None
    ra_val         = float(show_row["ra"])         if "ra"         in show_row and pd.notna(show_row["ra"])         else None

    return jsonify({
        "query": name,
        "matched": {
            "kepid": planet_id,
            "kepoi_name": planet_koi,
            "kepler_name": str(show_row["kepler_name"]) if "kepler_name" in show_row and pd.notna(show_row["kepler_name"]) else None,
            "source": src
        },
        "prediction": label_en,
        "prediction_es": label_es,
        "proba": proba,
        "csv_category_raw": disp_raw,
        "csv_category_es": disp_es,
        "features": features_csv,

        # --- campos extra solicitados (a nivel raíz) ---
        "name": name_val,
        "koi_disposition": koi_disposition_val,
        "koi_prad": koi_prad_val,
        "koi_period": koi_period_val,
        "koi_teq": koi_teq_val,
        "koi_insol": koi_insol_val,
        "ra": ra_val,

        "pipeline": "data_cleaning_test.get_element -> model_use_case.get_prediction"
    })

# -------------------- Main ----------------------
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=int(os.getenv("PORT", "5050")), debug=True, threaded=True)
