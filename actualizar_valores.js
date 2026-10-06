// Consulta a Banxico (SIE) el valor más reciente de la UDI (SP68257) y del
// tipo de cambio FIX (SF43718) y los guarda en rates.json.
// Requiere la variable de entorno BANXICO_TOKEN (token gratuito de Banxico).
const fs = require('fs');

const BASE = process.env.BANXICO_BASE || 'https://www.banxico.org.mx/SieAPIRest/service/v1';
const TOKEN = process.env.BANXICO_TOKEN;
const SERIES = { udi: 'SP68257', usd: 'SF43718' };

if (!TOKEN) { console.error('Falta BANXICO_TOKEN'); process.exit(1); }

const pad = (n) => String(n).padStart(2, '0');
const iso = (d) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
const parseFecha = (s) => { const [d, m, y] = s.split('/').map(Number); return Date.UTC(y, m - 1, d); };

async function main() {
  const hoy = new Date();
  // "hoy" en hora de Ciudad de México (UTC-6)
  const hoyMx = new Date(hoy.getTime() - 6 * 3600 * 1000);
  const ini = new Date(hoyMx.getTime() - 20 * 86400 * 1000);
  const url = `${BASE}/series/${SERIES.udi},${SERIES.usd}/datos/${iso(ini)}/${iso(hoyMx)}`;

  const res = await fetch(url, { headers: { 'Bmx-Token': TOKEN, Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Banxico respondió ${res.status}`);
  const json = await res.json();
  const series = json?.bmx?.series || [];

  const limite = Date.UTC(hoyMx.getUTCFullYear(), hoyMx.getUTCMonth(), hoyMx.getUTCDate());
  const out = {};
  for (const [clave, id] of Object.entries(SERIES)) {
    const s = series.find((x) => x.idSerie === id);
    const datos = (s?.datos || [])
      .map((d) => ({ fecha: d.fecha, ms: parseFecha(d.fecha), valor: parseFloat(String(d.dato).replace(/,/g, '')) }))
      .filter((d) => Number.isFinite(d.valor) && d.valor > 0 && d.ms <= limite)
      .sort((a, b) => b.ms - a.ms);
    if (!datos.length) throw new Error(`Sin datos recientes para ${id}`);
    out[clave] = { valor: datos[0].valor, fecha: datos[0].fecha, serie: id };
  }
  out.actualizado = new Date().toISOString();

  // Si no cambió ningún valor, no se reescribe el archivo (evita commits vacíos).
  let previo = null;
  try { previo = JSON.parse(fs.readFileSync('rates.json', 'utf8')); } catch (e) {}
  const igual = previo && previo.udi?.valor === out.udi.valor && previo.udi?.fecha === out.udi.fecha &&
                previo.usd?.valor === out.usd.valor && previo.usd?.fecha === out.usd.fecha;
  if (igual) { console.log('Sin cambios:', JSON.stringify(out)); return; }
  fs.writeFileSync('rates.json', JSON.stringify(out, null, 2) + '\n');
  console.log('rates.json actualizado:', JSON.stringify(out));
}
main().catch((e) => { console.error('Error:', e.message); process.exit(1); });
