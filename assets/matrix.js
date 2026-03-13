const TACTIC_ORDER = [
  'Reconnaissance', 'Resource Development', 'Initial Access', 'Execution', 'Persistence',
  'Privilege Escalation', 'Defense Evasion', 'Credential Access', 'Discovery', 'Lateral Movement',
  'Collection', 'Command and Control', 'Exfiltration', 'Impact'
];

let manifestCache = null;
let showSubTechniques = false;
let layoutMode = 'side';
let searchQuery = '';

function byId(id) { return document.getElementById(id); }
function make(tag, cls, html) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (html !== undefined) node.innerHTML = html;
  return node;
}

function normalizeTactic(tactic) {
  return String(tactic || '').trim().toLowerCase();
}

function titleCaseTactic(tactic) {
  return String(tactic || '').split(' ').map(part => part ? part[0].toUpperCase() + part.slice(1) : '').join(' ');
}

function splitTechniqueName(name) {
  const idx = name.indexOf(': ');
  if (idx === -1) return { main: name, sub: '' };
  return { main: name.slice(0, idx), sub: name.slice(idx + 2) };
}

function buildTacticBuckets(techniques) {
  const buckets = new Map();
  TACTIC_ORDER.forEach(t => buckets.set(t, []));

  techniques.forEach(tech => {
    if (!showSubTechniques && tech.techniqueID.includes('.')) return;
    if (searchQuery) {
      const hay = [tech.techniqueID, tech.name, ...(tech.tactics || []), ...(tech.groups || []).map(g => g.name)].join(' ').toLowerCase();
      if (!hay.includes(searchQuery)) return;
    }
    (tech.tactics || []).forEach(tactic => {
      const key = TACTIC_ORDER.find(item => normalizeTactic(item) === normalizeTactic(tactic));
      if (key) buckets.get(key).push(tech);
    });
  });

  for (const [key, arr] of buckets.entries()) {
    arr.sort((a, b) => {
      if (b.group_count !== a.group_count) return b.group_count - a.group_count;
      return a.name.localeCompare(b.name);
    });
  }
  return buckets;
}

function renderStats(manifest, buckets) {
  const host = byId('matrixStats');
  host.innerHTML = '';
  const visibleTechniques = [...buckets.values()].reduce((acc, arr) => acc + arr.length, 0);
  const cards = [
    ['Selected groups', manifest.selected_group_count],
    ['Unique techniques', manifest.unique_technique_count],
    ['Visible technique cells', visibleTechniques],
    ['Sub-techniques', showSubTechniques ? 'shown' : 'hidden']
  ];
  cards.forEach(([label, value]) => {
    const card = make('div', 'stat-card');
    card.append(make('div', 'stat-label', label));
    card.append(make('div', 'stat-value', String(value)));
    host.append(card);
  });
}

function renderMatrix(manifest) {
  const buckets = buildTacticBuckets(manifest.techniques || []);
  renderStats(manifest, buckets);

  const host = byId('matrixContainer');
  host.innerHTML = '';
  host.className = `matrix-container ${layoutMode}`;

  TACTIC_ORDER.forEach(tactic => {
    const items = buckets.get(tactic) || [];
    const col = make('section', 'tactic-column');
    col.append(make('div', 'tactic-title', titleCaseTactic(tactic)));
    col.append(make('div', 'tactic-count', `${items.length} techniques`));

    const list = make('div', 'technique-list');
    if (!items.length) {
      list.append(make('div', 'technique-card muted', 'No mapped techniques'));
    }

    items.forEach(tech => {
      const card = make('a', 'technique-card');
      card.href = tech.url;
      card.target = '_blank';
      card.rel = 'noreferrer';
      const parts = splitTechniqueName(tech.name);
      const meta = `${tech.techniqueID} (${tech.group_count})`;
      card.innerHTML = `<div class="technique-main">${parts.main}</div>${parts.sub ? `<div class="technique-sub">${parts.sub}</div>` : ''}<div class="technique-meta">${meta}</div>`;
      card.title = `${tech.techniqueID} • Used by ${tech.group_count} groups
${(tech.groups || []).map(g => g.name).join(', ')}`;
      list.append(card);
    });

    col.append(list);
    host.append(col);
  });
}

async function init() {
  manifestCache = await fetch('data/manifest.json').then(r => r.json());
  byId('layoutSelect').addEventListener('change', e => {
    layoutMode = e.target.value;
    renderMatrix(manifestCache);
  });
  byId('matrixSearch').addEventListener('input', e => {
    searchQuery = e.target.value.trim().toLowerCase();
    renderMatrix(manifestCache);
  });
  byId('showSubs').addEventListener('click', () => {
    showSubTechniques = true;
    byId('showSubs').classList.add('active');
    byId('hideSubs').classList.remove('active');
    renderMatrix(manifestCache);
  });
  byId('hideSubs').addEventListener('click', () => {
    showSubTechniques = false;
    byId('hideSubs').classList.add('active');
    byId('showSubs').classList.remove('active');
    renderMatrix(manifestCache);
  });
  renderMatrix(manifestCache);
}

init();
