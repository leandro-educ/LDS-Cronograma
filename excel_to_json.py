# excel_to_json.py
# Convierte Cronograma_y_plan_de_clases.xlsx -> base.json (misma carpeta)
#
# Requisitos:
#   pip install pandas openpyxl
#
# Uso:
#   python excel_to_json.py

import json
from pathlib import Path
import pandas as pd

EXCEL_FILE = "Cronograma_y_plan_de_clases.xlsx"
SHEET_NAME = "Cronograma"
HEADER_ROW = 1  # porque la fila 1 (0-index) contiene los headers reales

def main():
    here = Path(__file__).resolve().parent
    excel_path = here / EXCEL_FILE
    if not excel_path.exists():
        raise SystemExit(f"No encuentro {EXCEL_FILE} en {here}")

    df = pd.read_excel(excel_path, sheet_name=SHEET_NAME, header=HEADER_ROW)

    # Ajustá estos nombres si tu Excel cambia
    cols = ["Semana", "Fecha", "Módulo", "Temas (secuencia)", "Tipo"]
    df = df[cols]
    df = df[df["Semana"].notna()].copy()
    df["Semana"] = df["Semana"].astype(int)

    def fmt_date(x):
        if pd.isna(x):
            return None
        return pd.to_datetime(x).date().isoformat()

    items = []
    for _, row in df.iterrows():
        items.append({
            "semana": int(row["Semana"]),
            "fecha": fmt_date(row["Fecha"]),
            "modulo": str(row["Módulo"]) if not pd.isna(row["Módulo"]) else None,
            "tipo": str(row["Tipo"]) if not pd.isna(row["Tipo"]) else None,
            "tema_secuencia": str(row["Temas (secuencia)"]) if not pd.isna(row["Temas (secuencia)"]) else None,
        })

    out_path = here / "base.json"
    out_path.write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"OK -> {out_path}")

if __name__ == "__main__":
    main()
