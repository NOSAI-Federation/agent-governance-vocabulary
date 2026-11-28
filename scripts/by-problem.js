// by-problem.js: the "systems by problem" page of the published site.
// Reads systems-by-problem.yaml and the crosswalk files it names. The page is a
// navigation aid: every entry carries the link where the system's maintainer
// chose its headings, and nothing here grades or ranks a system.
'use strict'

const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

const FILE = 'systems-by-problem.yaml'
const TITLE = 'Systems by problem | Agent Governance Vocabulary'
const DESCRIPTION = 'Open-source AI agent governance systems listed by the problem they address, under headings their own maintainers confirmed.'

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

function httpsUrl(v) {
  if (typeof v !== 'string' || /[\s\\]/.test(v)) return null
  try {
    const u = new URL(v)
    return u.protocol === 'https:' && u.hostname && !u.username && !u.password ? u.href : null
  } catch (_) {
    return null
  }
}

// The real path of a crosswalk file, or null when it does not exist or
// resolves outside crosswalk/ (for example through a symlink).
function crosswalkPath(root, rel) {
  try {
    const dir = fs.realpathSync(path.join(root, 'crosswalk'))
    const real = fs.realpathSync(path.join(root, rel))
    return real.startsWith(dir + path.sep) ? real : null
  } catch (_) {
    return null
  }
}

// Returns { present, headings, entries, errors }. `present` is false when the
// file does not exist, which is valid: the site is then built without the page.
function load(root) {
  const file = path.join(root, FILE)
  if (!fs.existsSync(file)) return { present: false, headings: [], entries: [], errors: [] }
  const errors = []
  let doc
  try { doc = yaml.load(fs.readFileSync(file, 'utf8')) } catch (e) {
    return { present: true, headings: [], entries: [], errors: [`${FILE}: YAML does not parse (${String(e.reason || e.message).split('\n')[0]})`] }
  }
  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) {
    return { present: true, headings: [], entries: [], errors: [`${FILE}: empty or not a mapping`] }
  }
  const headings = []
  const rawHeadings = doc.headings && typeof doc.headings === 'object' && !Array.isArray(doc.headings) ? doc.headings : {}
  for (const [id, h] of Object.entries(rawHeadings)) {
    if (!/^[a-z][a-z0-9-]*$/.test(id)) { errors.push(`${FILE}: heading id "${id}" must be lower case words joined by hyphens`); continue }
    if (!h || typeof h.title !== 'string' || typeof h.about !== 'string') { errors.push(`${FILE}: heading "${id}" needs a title and an about line`); continue }
    headings.push({ id, title: h.title, about: h.about })
  }
  if (headings.length === 0) errors.push(`${FILE}: no headings`)
  const known = new Set(headings.map(h => h.id))
  const entries = []
  const seen = new Set()
  const list = Array.isArray(doc.systems) ? doc.systems : []
  if (!Array.isArray(doc.systems)) errors.push(`${FILE}: systems must be a list`)
  list.forEach((s, i) => {
    const where = `${FILE}: systems[${i}]`
    if (!s || typeof s !== 'object') { errors.push(`${where} is not a mapping`); return }
    const rel = typeof s.crosswalk === 'string' ? s.crosswalk : ''
    if (!/^crosswalk\/[A-Za-z0-9._/-]+\.ya?ml$/.test(rel) || rel.includes('..')) { errors.push(`${where}: crosswalk must be a path under crosswalk/`); return }
    if (seen.has(rel)) { errors.push(`${where}: ${rel} is listed twice`); return }
    seen.add(rel)
    const real = crosswalkPath(root, rel)
    if (!real) { errors.push(`${where}: ${rel} does not exist inside crosswalk/`); return }
    let cw
    try { cw = yaml.load(fs.readFileSync(real, 'utf8')) } catch (_) { errors.push(`${where}: ${rel} cannot be read`); return }
    if (!cw || typeof cw !== 'object' || Array.isArray(cw)) { errors.push(`${where}: ${rel} is empty or not a mapping`); return }
    const hs = Array.isArray(s.headings) ? s.headings : []
    if (hs.length === 0) { errors.push(`${where}: at least one heading is required`); return }
    const unknown = hs.filter(h => !known.has(h))
    if (unknown.length > 0) { errors.push(`${where}: unknown heading ${unknown.join(', ')}`); return }
    if (typeof s.confirmed_by !== 'string' || !/^[A-Za-z0-9-]+$/.test(s.confirmed_by)) { errors.push(`${where}: confirmed_by must be a GitHub handle`); return }
    const confirmation = httpsUrl(s.confirmation)
    if (!confirmation) { errors.push(`${where}: confirmation must be an https link to the public confirmation`); return }
    const sys = cw.system && typeof cw.system === 'object' ? cw.system : {}
    const name = typeof sys.name === 'string' ? sys.name : (typeof cw.system === 'string' ? cw.system : path.basename(rel).replace(/\.ya?ml$/, ''))
    entries.push({
      rel,
      name,
      source: httpsUrl(sys.repo) || httpsUrl(sys.github) || httpsUrl(sys.home),
      headings: hs,
      confirmedBy: s.confirmed_by,
      confirmation,
    })
  })
  entries.sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }))
  return { present: true, headings, entries, errors }
}

function renderHtml(model, opts = {}) {
  const { repoUrl, siteUrl, sourceSha } = opts
  const fileLink = rel => sourceSha ? `${repoUrl}/blob/${sourceSha}/${rel}` : `${repoUrl}/blob/main/${rel}`
  const h = []
  h.push('<!doctype html>')
  h.push('<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">')
  h.push(`<title>${esc(TITLE)}</title>`)
  h.push(`<meta name="description" content="${esc(DESCRIPTION)}">`)
  h.push(`<link rel="canonical" href="${esc(siteUrl)}by-problem.html">`)
  h.push(`<meta name="source-commit" content="${esc(sourceSha || '')}">`)
  h.push('<style>')
  h.push(':root{--bg:#fff;--fg:#1a1a1a;--muted:#5c5c5c;--line:#d9d9d9;--link:#0b57d0}')
  h.push('@media (prefers-color-scheme:dark){:root{--bg:#141414;--fg:#e8e8e8;--muted:#a8a8a8;--line:#3a3a3a;--link:#8ab4f8}}')
  h.push('body{margin:0 auto;max-width:860px;padding:16px;background:var(--bg);color:var(--fg);font:15px/1.5 system-ui,-apple-system,Segoe UI,sans-serif}')
  h.push('a{color:var(--link)}code{font-size:.9em}.muted{color:var(--muted)}section{border-top:1px solid var(--line);padding:8px 0}li{margin:6px 0}')
  h.push('</style></head><body>')
  h.push('<h1>Systems by problem</h1>')
  h.push(`<p>Open-source systems for AI agent governance, listed by the problem they address. Each system appears only under headings that its own maintainer confirmed, and each entry links that confirmation. The headings are for finding work. They do not grade a system, rank it or say that two systems are equivalent. For how each system's records map onto shared terms, see the <a href="${esc(siteUrl)}">crosswalk matrix</a>.</p>`)
  for (const head of model.headings) {
    const listed = model.entries.filter(e => e.headings.includes(head.id))
    h.push(`<section id="${esc(head.id)}"><h2>${esc(head.title)}</h2><p class="muted">${esc(head.about)}</p>`)
    if (listed.length === 0) {
      h.push('<p>No system is listed here yet.</p>')
    } else {
      h.push('<ul>')
      for (const e of listed) {
        const name = e.source ? `<a href="${esc(e.source)}">${esc(e.name)}</a>` : esc(e.name)
        h.push(`<li>${name}. <a href="${esc(fileLink(e.rel))}">Crosswalk</a>, <a href="${esc(e.confirmation)}">headings confirmed by @${esc(e.confirmedBy)}</a>.</li>`)
      }
      h.push('</ul>')
    }
    h.push('</section>')
  }
  h.push(`<section><h2>Add or change a system</h2><p>A maintainer can propose an entry by a pull request to <a href="${esc(repoUrl)}/blob/main/${FILE}"><code>${FILE}</code></a>, or confirm headings on <a href="${esc(repoUrl)}/issues/294">issue 294</a>. Review checks the maintainer and the linked confirmation before merge. Each system needs a crosswalk first. Questions go to the <a href="https://github.com/orgs/NOSAI-Federation/discussions">federation discussions</a>.</p></section>`)
  h.push('</body></html>')
  return h.join('\n') + '\n'
}

module.exports = { FILE, load, renderHtml }
