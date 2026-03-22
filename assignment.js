/**
 * Przydział warunku — osobny mały moduł, żeby `boot.js` mógł odpalić fetch
 * równolegle z ładowaniem ciężkiego grafu `experiment.js` (np. questions_data.js).
 */

/** Rotacja A→B→C przez /api/next-condition + Apps Script doGet; przy błędzie / timeoucie losowo. */
export async function fetchAssignedGroup() {
  const FETCH_TIMEOUT_MS = 5000;
  try {
    const r = await Promise.race([
      fetch("/api/next-condition"),
      new Promise(function (_, reject) {
        setTimeout(function () {
          reject(new Error("next-condition-timeout"));
        }, FETCH_TIMEOUT_MS);
      }),
    ]);
    const j = await r.json();
    if (
      j.group &&
      ["with_explanation", "without_explanation", "no_suggestion"].includes(
        j.group,
      )
    ) {
      return {
        group: j.group,
        source: j.fallback ? "fallback_random" : "server_rotacja",
      };
    }
  } catch {
    /* timeout, brak API, sieć */
  }
  const _r = Math.random();
  const group =
    _r < 1 / 3
      ? "with_explanation"
      : _r < 2 / 3
        ? "without_explanation"
        : "no_suggestion";
  return { group, source: "fallback_random" };
}
