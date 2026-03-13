
async function load() {
  const manifest = await fetch('data/manifest.json').then(r => r.json());
  renderStats(manifest);
  renderValidation(manifest.validation);
  renderMatrix(manifest.tactic_summary);
  renderTechniques(manifest.techniques);
  renderGroups(manifest.groups);
}
function el(tag, cls, html) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (html !== undefined) node.innerHTML = html;
  return node;
}
function renderStats(manifest) {
  const stats = document.getElementById('stats');
  const peak = Math.max(...manifest.techniques.map(t => t.group_count));
  [[ 'Selected groups', manifest.selected_group_count ], [ 'Unique techniques', manifest.unique_technique_count ], [ 'Generated layers', manifest.groups.length ], [ 'Peak overlap', peak ]].forEach(([label, value]) => {
    const card = el('div', 'stat');
    card.append(el('div', 'label', label));
    card.append(el('div', 'value', String(value)));
    stats.append(card);
  });
}
function renderValidation(rows) {
  const host = document.getElementById('validationTable');
  const wrap = el('div', 'table-wrap');
  const table = el('table');
  table.innerHTML = `<thead><tr><th>Group</th><th>MITRE page</th><th>Local layer</th><th>Official layer</th><th>Techniques</th><th>Status</th></tr></thead>`;
  const tbody = el('tbody');
  rows.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td><strong>${r.name}</strong><br><span class="small">${r.id}</span></td><td><a target="_blank" rel="noreferrer" href="${r.group_url}">group page</a></td><td><a href="${r.generated_layer_path}">generated JSON</a></td><td><a target="_blank" rel="noreferrer" href="${r.official_layer_url}">official pattern</a></td><td>${r.technique_count}</td><td><span class="badge ok">${r.validated ? 'validated' : 'check failed'}</span></td>`;
    tbody.append(tr);
  });
  table.append(tbody); wrap.append(table); host.append(wrap);
}
function renderMatrix(rows) {
  const host = document.getElementById('matrix');
  const grid = el('div', 'matrix-grid');
  rows.forEach(row => {
    const card = el('div', 'matrix-card');
    const items = row.top_techniques.map(t => `<li><a target="_blank" rel="noreferrer" href="${t.url}"><span class="score">${t.group_count}</span> — ${t.techniqueID} ${t.name}</a></li>`).join('');
    card.innerHTML = `<h3>${row.tactic} <span class="small">(${row.technique_count} techniques)</span></h3><ul>${items || '<li>No mapped techniques in current selection.</li>'}</ul>`;
    grid.append(card);
  });
  host.append(grid);
}
function renderTechniques(rows) {
  const tacticSelect = document.getElementById('tacticFilter');
  const search = document.getElementById('techSearch');
  const host = document.getElementById('techniquesTable');
  [...new Set(rows.flatMap(r => r.tactics))].sort().forEach(t => {
    const opt = document.createElement('option'); opt.value = t; opt.textContent = t; tacticSelect.append(opt);
  });
  function draw() {
    const q = search.value.trim().toLowerCase();
    const tactic = tacticSelect.value;
    const filtered = rows.filter(r => {
      const hay = [r.techniqueID, r.name, ...r.tactics, ...r.groups.map(g => g.name)].join(' ').toLowerCase();
      return (!q || hay.includes(q)) && (!tactic || r.tactics.includes(tactic));
    });
    host.innerHTML = '';
    const wrap = el('div', 'table-wrap');
    const table = el('table');
    table.innerHTML = '<thead><tr><th>Technique</th><th>Tactics</th><th>Groups</th><th>Platforms</th></tr></thead>';
    const tbody = el('tbody');
    filtered.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td><a target="_blank" rel="noreferrer" href="${r.url}"><strong>${r.techniqueID}</strong> ${r.name}</a><br><span class="small">Used by ${r.group_count} selected groups</span></td><td>${r.tactics.map(t => `<span class="badge">${t}</span>`).join('')}</td><td>${r.groups.map(g => g.name).join(', ')}</td><td>${(r.platforms || []).join(', ')}</td>`;
      tbody.append(tr);
    });
    table.append(tbody); wrap.append(table); host.append(wrap);
  }
  search.addEventListener('input', draw); tacticSelect.addEventListener('change', draw); draw();
}
function renderGroups(groups) {
  const host = document.getElementById('groupCards');
  groups.forEach(g => {
    const card = el('article', 'card');
    card.innerHTML = `<h3><a target="_blank" rel="noreferrer" href="${g.url}">${g.name}</a></h3><div class="meta">${g.id}</div><p><span class="badge ${g.confidence}">${g.confidence}</span> ${g.rationale}</p><p class="small">${g.description}</p><p class="small">${g.technique_count} techniques • <a href="${g.layer_url}">generated layer</a> • <a target="_blank" rel="noreferrer" href="${g.official_layer_url}">official URL pattern</a></p>`;
    host.append(card);
  });
}
load();
