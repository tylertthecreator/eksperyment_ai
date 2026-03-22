/**
 * Wysyłka CSV na backend (Vercel /api/submit-results → Google Arkusz).
 * Przy lokalnym `serve` endpointu brak — po cichu ignorujemy błąd (zostaje pobranie pliku).
 */

export async function submitResultsCsv(csv) {
  const sp = new URLSearchParams(window.location.search);
  if (sp.get("nosubmit") === "1") {
    return { skipped: true };
  }

  try {
    const r = await fetch("/api/submit-results", {
      method: "POST",
      headers: { "Content-Type": "text/csv; charset=utf-8" },
      body: csv,
    });

    if (r.status === 503) {
      return { skipped: true };
    }
    if (!r.ok) {
      return { error: true, status: r.status };
    }
    return { ok: true };
  } catch {
    return { error: true };
  }
}
