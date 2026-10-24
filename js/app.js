// ============================================================
// El Almanaque de Maomao — lógica de contadores
// Carga los datos desde ./data/birthdays.json (sin backend)
// y muestra, para cada persona, cuánto falta para su próximo
// cumpleaños en días, horas, minutos y segundos.
// ============================================================

const DATA_URL = './data/birthdays.json';

const fmt2 = (n) => String(n).padStart(2, '0');

const ESCAPE = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ESCAPE[c]);

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const monthName = (m) => MESES[m - 1];

// Parsea "YYYY-MM-DD" -> { year|null, month, day }
function parseBD(iso) {
  const parts = String(iso).trim().split('-').map(Number);
  return { year: parts[0] || null, month: parts[1], day: parts[2] };
}

const startOfDay = (dt) => new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());

// Próxima fecha de cumpleaños (hoy inclusive).
function nextOccurrence(bd, now) {
  const today = startOfDay(now);
  let y = now.getFullYear();
  let cand = new Date(y, bd.month - 1, bd.day, 0, 0, 0);
  if (cand < today) {
    y += 1;
    cand = new Date(y, bd.month - 1, bd.day, 0, 0, 0);
  }
  return { date: cand, year: y };
}

// Calcula el conteo regresivo hacia el próximo cumpleaños.
function compute(bd, now) {
  const { date, year } = nextOccurrence(bd, now);
  // "Hoy" = mismo día calendario que la próxima ocurrencia (no depende de la
  // diferencia en ms, que sería negativa si ya pasó la medianoche de hoy).
  const isToday = date.getTime() === startOfDay(now).getTime();
  const diff = date.getTime() - now.getTime();
  const safe = Math.max(diff, 0);
  return {
    date, year, isToday,
    days: Math.floor(safe / 86400000),
    hours: Math.floor((safe % 86400000) / 3600000),
    mins: Math.floor((safe % 3600000) / 60000),
    secs: Math.floor((safe % 60000) / 1000),
    age: bd.year ? year - bd.year : null,
  };
}

const relacionTxt = (r) => (r ? r.charAt(0).toUpperCase() + r.slice(1) : '');

function renderCard(p, now) {
  const bd = parseBD(p.fecha);
  const c = compute(bd, now);
  const li = document.createElement('li');
  li.className = 'card' + (c.isToday ? ' today' : '');
  li.innerHTML = `
    <div class="card-body">
      <p class="card-relation">${relacionTxt(p.relacion || '')}</p>
      <h2 class="card-name">${escapeHtml(p.nombre)}</h2>
      ${c.age !== null ? `<span class="card-age">Cumple ${c.age} años</span>` : ''}
      <div class="countdown" data-target="${escapeHtml(p.fecha)}">
        <div class="unit"><span class="num" data-u="days">${fmt2(c.days)}</span><span class="lbl">Días</span></div>
        <div class="unit"><span class="num" data-u="hours">${fmt2(c.hours)}</span><span class="lbl">Horas</span></div>
        <div class="unit"><span class="num" data-u="mins">${fmt2(c.mins)}</span><span class="lbl">Min</span></div>
        <div class="unit secs"><span class="num" data-u="secs">${fmt2(c.secs)}</span><span class="lbl">Seg</span></div>
      </div>
    </div>
    <div class="card-foot">
      <span class="date">${c.date.getDate()} de ${monthName(bd.month)} de ${c.year}</span>
      ${p.nota ? `<span class="nota">“${escapeHtml(p.nota)}”</span>` : ''}
    </div>`;
  return { li, meta: c };
}

async function load() {
  const res = await fetch(DATA_URL, { cache: 'no-store' });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return await res.json();
}

function renderAll(data, now) {
  const personas = (data.personas || []).slice();

  const conMeta = personas.map((p) => ({ p, meta: compute(parseBD(p.fecha), now) }))
    .sort((a, b) => (a.meta.days - b.meta.days) || a.p.nombre.localeCompare(b.p.nombre));

  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  conMeta.forEach(({ p, meta }) => grid.appendChild(renderCard(p, now).li));

  // Banner: próximo cumpleaños
  if (conMeta.length) {
    const n = conMeta[0].meta;
    const texto = n.isToday
      ? 'menos de un día'
      : `en ${n.days} día${n.days === 1 ? '' : 's'}, ${fmt2(n.hours)}h ${fmt2(n.mins)}m`;
    document.getElementById('next-text').textContent = `${conMeta[0].p.nombre} — ${texto}`;
    document.getElementById('next-banner').hidden = false;
  }

  // Banner: cumpleaños de hoy
  const hoy = conMeta.find((x) => x.meta.isToday);
  if (hoy) {
    document.getElementById('today-text').textContent = `¡Hoy es el cumpleaños de ${hoy.p.nombre}! 🎉`;
    document.getElementById('today-banner').hidden = false;
  }

  document.getElementById('empty').hidden = personas.length > 0;
}

// Actualiza solo los números cada segundo (sin re-renderizar todo).
function tick() {
  const now = new Date();
  document.querySelectorAll('.countdown').forEach((box) => {
    const c = compute(parseBD(box.dataset.target), now);
    box.querySelector('[data-u="days"]').textContent = fmt2(c.days);
    box.querySelector('[data-u="hours"]').textContent = fmt2(c.hours);
    box.querySelector('[data-u="mins"]').textContent = fmt2(c.mins);
    const s = box.querySelector('[data-u="secs"]');
    s.textContent = fmt2(c.secs);
    s.classList.remove('pulse'); void s.offsetWidth; s.classList.add('pulse');
  });
}

(async function boot() {
  try {
    const data = await load();
    if (data.titulo) document.title = data.titulo;
    if (data.subtitulo) document.getElementById('hero-sub').textContent = data.subtitulo;
    renderAll(data, new Date());
    tick();
    setInterval(tick, 1000);
  } catch (err) {
    console.error('[Maomao] Error al cargar los datos:', err);
    document.getElementById('error').hidden = false;
  }
})();
