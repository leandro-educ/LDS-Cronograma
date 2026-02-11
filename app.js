async function loadData() {
  const res = await fetch('./base.json', { cache: 'no-store' });
  if (!res.ok) throw new Error('No se pudo cargar base.json');
  return await res.json();
}

function splitTema(tema) {
  if (!tema) return [];
  // El Excel usa " · " como separador; también soportamos "|", "•" o saltos de línea.
  return tema
    .split(/\s*[·|•]\s*|\r?\n+/g)
    .map(s => s.trim())
    .filter(Boolean);
}

function cardTemplate(item) {
  const temas = splitTema(item.tema_secuencia);
  const temasHtml = temas.length
    ? `<ul class="topic">${temas.map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul>`
    : `<p class="small">Sin temas cargados.</p>`;

  const fecha = item.fecha ? new Date(item.fecha).toLocaleDateString('es-AR') : '—';
  const modulo = item.modulo || '—';
  const tipo = item.tipo || '—';

  return `
    <article class="card">
      <div class="card__meta">
        <span class="badge">📅 ${escapeHtml(fecha)}</span>
        <span class="badge">🧩 ${escapeHtml(modulo)}</span>
      </div>

      <h3 class="week">Semana ${item.semana}</h3>
      <p class="small">Tipo: ${escapeHtml(tipo)}</p>

      ${temasHtml}
    </article>
  `;
}

function render(items, query) {
  const grid = document.getElementById('grid');
  const q = (query || '').trim().toLowerCase();

  const filtered = !q ? items : items.filter(it => {
    const blob = [
      it.semana,
      it.fecha,
      it.modulo,
      it.tipo,
      it.tema_secuencia
    ].join(' ').toLowerCase();
    return blob.includes(q);
  });

  if (!filtered.length) {
    grid.innerHTML = `<div class="empty">No hay resultados para: <strong>${escapeHtml(query)}</strong></div>`;
    return;
  }

  // Orden por semana ascendente
  filtered.sort((a,b) => a.semana - b.semana);
  grid.innerHTML = filtered.map(cardTemplate).join('');
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

let DATA = [];

async function init() {
  const qInput = document.getElementById('q');
  const reloadBtn = document.getElementById('reload');

  try {
    DATA = await loadData();
    render(DATA, qInput.value);
  } catch (err) {
    console.error(err);
    document.getElementById('grid').innerHTML = `
      <div class="empty">
        <strong>Error cargando base.json</strong><br/>
        Abrí la página con un servidor local (VS Code Live Server o <code>python -m http.server</code>).
      </div>`;
  }

  qInput.addEventListener('input', () => render(DATA, qInput.value));
  reloadBtn.addEventListener('click', async () => {
    try {
      DATA = await loadData();
      render(DATA, qInput.value);
    } catch (err) {
      alert('No se pudo recargar base.json. ¿Estás usando un servidor local?');
    }
  });
}

init();
