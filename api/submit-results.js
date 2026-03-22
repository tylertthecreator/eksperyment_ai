/**
 * Vercel Serverless: przyjmuje CSV z przeglądarki i przekazuje do Google Apps Script
 * (omija CORS — bezpośrednie POST z przeglądarki do Apps Script bywa zablokowane).
 *
 * W Vercel: zmienna środowiskowa APPS_SCRIPT_URL = URL wdrożenia Web App (Apps Script).
 */

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

module.exports = async (req, res) => {
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  if (req.method !== "POST") {
    res.status(405).setHeader("Allow", "POST").end("Method Not Allowed");
    return;
  }

  const url = process.env.APPS_SCRIPT_URL;
  if (!url || String(url).trim() === "") {
    res.status(503).json({
      error:
        "Brak APPS_SCRIPT_URL — ustaw w Vercel → Settings → Environment Variables",
    });
    return;
  }

  let body;
  try {
    body = await readBody(req);
  } catch (e) {
    res.status(400).json({ error: "read body" });
    return;
  }

  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain; charset=utf-8" },
      body,
      redirect: "follow",
    });
    const text = await r.text();
    if (!r.ok) {
      res.status(502).json({
        error: "apps_script",
        status: r.status,
        detail: text.slice(0, 800),
      });
      return;
    }
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(502).json({ error: String(e.message || e) });
  }
};
