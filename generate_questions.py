#!/usr/bin/env python3
"""Generuje questions_data.js z arkusza Excel (openpyxl)."""
import json
import sys
from pathlib import Path

try:
    import openpyxl
except ImportError:
    print("Zainstaluj: pip install openpyxl", file=sys.stderr)
    sys.exit(1)


def main():
    default = (
        Path.home()
        / "Downloads"
        / "Konfiguracja testu AI z bazą pytań.xlsx"
    )
    xlsx = Path(sys.argv[1]) if len(sys.argv) > 1 else default
    if not xlsx.is_file():
        print(f"Brak pliku: {xlsx}", file=sys.stderr)
        sys.exit(1)

    out_js = Path(__file__).resolve().parent / "questions_data.js"

    wb = openpyxl.load_workbook(xlsx, read_only=True, data_only=True)
    ws = wb.active
    rows = list(ws.iter_rows(values_only=True))
    wb.close()

    out = []
    for row in rows[1:]:
        if not row or row[0] is None:
            continue
        nr, pytanie, opcje, klucz, sugestia, wyjas = row[:6]
        out.append(
            {
                "id": int(nr) if not isinstance(nr, int) else nr,
                "text": str(pytanie).strip(),
                "options": str(opcje).strip() if opcje else "",
                "key": str(klucz).strip().upper()[:1],
                "suggestion": str(sugestia).strip().upper()[:1]
                if sugestia
                else "",
                "explanation": str(wyjas).strip() if wyjas else "",
            }
        )

    with open(out_js, "w", encoding="utf-8") as f:
        f.write(
            "/** Wygenerowane — nie edytuj ręcznie; uruchom: python3 generate_questions.py [ścieżka.xlsx] */\n"
        )
        f.write("export const QUESTIONS = ")
        f.write(json.dumps(out, ensure_ascii=False, indent=2))
        f.write(";\n")

    print(f"OK: {len(out)} pytań -> {out_js}")


if __name__ == "__main__":
    main()
