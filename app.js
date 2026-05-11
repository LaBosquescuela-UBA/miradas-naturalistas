/* =============================================================
   APP.JS — scroll horizontal, glosario, bitácora
   ============================================================= */
import './glossary.js';

(function () {
  'use strict';

  const stage = document.querySelector('.stage-wrap');
  const stageInner = document.querySelector('.stage');
  const progressFill = document.querySelector('.progress-fill');
  const progressMarks = document.querySelector('.progress-marks');
  const chapterList = document.querySelector('.chapter-list');
  const splash = document.querySelector('.splash');

  /* ----------- horizontal wheel scroll (solo desktop) ----------- */
    const isMobile = () => window.matchMedia('(max-width: 1300px)').matches;
  stage.addEventListener('wheel', (e) => {
    if (isMobile()) return; // en móvil scroll vertical nativo
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    e.preventDefault();
    stage.scrollLeft += e.deltaY * 1.4;
  }, { passive: false });

  /* ----------- keyboard nav ----------- */
  window.addEventListener('keydown', (e) => {
    if (document.activeElement && /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
    if (isMobile()) return;
    const w = window.innerWidth;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') {
      e.preventDefault();
      stage.scrollBy({ left: w * 0.9, behavior: 'smooth' });
    }
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      stage.scrollBy({ left: -w * 0.9, behavior: 'smooth' });
    }
    if (e.key === 'Home') stage.scrollTo({ left: 0, behavior: 'smooth' });
    if (e.key === 'End')  stage.scrollTo({ left: stage.scrollWidth, behavior: 'smooth' });
  });

  /* ----------- progress + chapter highlight ----------- */
  const chapters = [];
  function buildChapterIndex() {
    const scenes = document.querySelectorAll('.scene[data-chapter]');
    scenes.forEach(s => {
      const cid = s.dataset.chapter;
      if (!chapters.find(c => c.id === cid)) {
        chapters.push({
          id: cid,
          label: s.dataset.chapterLabel || cid,
          el: s,
          short: s.dataset.chapterShort || cid
        });
      }
    });
    chapterList.innerHTML = chapters.map((c, i) =>
      `<button class="chap-btn" data-cid="${c.id}" aria-current="false" aria-label="${String(i).padStart(2,'0')} · ${c.short}"><span class="chap-num">${String(i).padStart(2,'0')}</span><span class="chap-sep"> · </span><span class="chap-short">${c.short}</span></button>`
    ).join('');
    chapterList.querySelectorAll('.chap-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const c = chapters.find(x => x.id === btn.dataset.cid);
        if (!c) return;
        if (isMobile()) {
          stage.scrollTo({ top: c.el.offsetTop, behavior: 'smooth' });
        } else {
          stage.scrollTo({ left: c.el.offsetLeft, behavior: 'smooth' });
        }
      });
    });
  }

  function buildProgressMarks() {
    progressMarks.innerHTML = '';
    const mob = isMobile();
    const total = mob
      ? (stage.scrollHeight - stage.clientHeight)
      : (stageInner.scrollWidth - window.innerWidth);
    if (total <= 0) return;
    chapters.forEach(c => {
      const pos = mob ? c.el.offsetTop : c.el.offsetLeft;
      const pct = Math.max(0, Math.min(100, (pos / total) * 100));
      const mark = document.createElement('div');
      mark.className = 'progress-mark';
      mark.style.left = pct + '%';
      progressMarks.appendChild(mark);
    });
  }

  function updateProgress() {
    const mob = isMobile();
    const total = mob
      ? (stage.scrollHeight - stage.clientHeight)
      : (stageInner.scrollWidth - window.innerWidth);
    const cur = mob ? stage.scrollTop : stage.scrollLeft;
    const pct = total > 0 ? (cur / total) * 100 : 0;
    progressFill.style.width = pct + '%';

    const probe = mob
      ? (cur + window.innerHeight * 0.3)
      : (cur + window.innerWidth * 0.4);
    let activeId = chapters[0] && chapters[0].id;
    for (const c of chapters) {
      const off = mob ? c.el.offsetTop : c.el.offsetLeft;
      if (off <= probe) activeId = c.id;
    }
    chapterList.querySelectorAll('.chap-btn').forEach(b => {
      const active = b.dataset.cid === activeId;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-current', active ? 'page' : 'false');
    });

    // marcar escena central como visitada
    let visScene = null;
    document.querySelectorAll('.scene[data-course]').forEach(s => {
      const off = mob ? s.offsetTop : s.offsetLeft;
      const size = mob ? s.offsetHeight : s.offsetWidth;
      if (off <= probe && off + size >= probe) visScene = s;
    });
    if (visScene) {
      const id = visScene.dataset.screenLabel || visScene.dataset.sceneTitle;
      markVisited(id);
    }
  }

  /* ----------- glossary popover ----------- */
  const popover = document.createElement('div');
  popover.className = 'g-popover';
  popover.style.display = 'none';
  popover.innerHTML = `
    <button class="gp-close" aria-label="cerrar">×</button>
    <div class="gp-eyebrow"></div>
    <div class="gp-term"></div>
    <div class="gp-def"></div>
  `;
  document.body.appendChild(popover);
  const popClose = popover.querySelector('.gp-close');
  popClose.addEventListener('click', () => popover.style.display = 'none');

  function showPopover(termEl, entry) {
    popover.querySelector('.gp-eyebrow').textContent = entry.cat;
    popover.querySelector('.gp-term').textContent = entry.term;
    popover.querySelector('.gp-def').textContent = entry.def;
    popover.style.display = 'block';
    // position: above & near the click
    const rect = termEl.getBoundingClientRect();
    const popW = 320;
    let left = rect.left + rect.width/2 - popW/2;
    left = Math.max(16, Math.min(window.innerWidth - popW - 16, left));
    let top = rect.top - popover.offsetHeight - 12;
    if (top < 16) top = rect.bottom + 12;
    popover.style.left = left + 'px';
    popover.style.top = top + 'px';
  }
  function extractScientific(alt) {
    if (!alt) return '';
    if (alt.includes(' — ')) return alt.split(' — ')[1].trim();
    if (alt.includes(' · ')) {
      const parts = alt.split(' · ');
      if (parts[0].split(' ').length >= 2 && /[A-Z]/.test(parts[0][0])) return parts[0].trim();
      if (parts[1].split(' ').length >= 2 && /[A-Z]/.test(parts[1][0])) return parts[1].trim();
    }
    const m = alt.match(/([A-Z][a-z]+ [a-z]+)/);
    if (m) return m[1];
    return '';
  }

  document.addEventListener('click', (e) => {
    const t = e.target.closest('.g-term');
    if (t) {
      const id = t.dataset.term;
      const entry = window.GLOSS_MAP[id];
      if (entry) {
        e.preventDefault();
        openGlossaryCard(entry);
      }
    } else if (!e.target.closest('.g-popover') && !e.target.closest('.modal-content')) {
      popover.style.display = 'none';
    }
  });
  // hide on scroll (popover is positioned absolutely vs viewport)
  stage.addEventListener('scroll', () => {
    if (popover.style.display !== 'none') popover.style.display = 'none';
  });

  /* ----------- glossary modal ----------- */
  const glossModal = document.querySelector('#modal-glossary');
  const glossModalContent = glossModal.querySelector('.gloss-card-wrap');
  const glossModalCloser = glossModal.querySelector('.modal-closer');
  const glossModalBackdrop = glossModal.querySelector('.modal-backdrop');

  function openGlossaryCard(entry) {
    glossModalContent.innerHTML = `
      <div class="gloss-card" data-course="${entry.course || ''}">
        <div class="gc-inner">
          <div class="gc-face gc-front">
            <div class="gc-decor">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3" opacity="0.4"/>
                <circle cx="50" cy="50" r="18" fill="currentColor" opacity="0.2"/>
                <circle cx="50" cy="50" r="3.5" fill="currentColor"/>
                <g stroke="currentColor" stroke-width="1.2" opacity="0.6">
                  <line x1="50" y1="20" x2="50" y2="80"/>
                  <line x1="24" y1="35" x2="76" y2="65"/>
                  <line x1="24" y1="65" x2="76" y2="35"/>
                </g>
              </svg>
            </div>
            <div class="gc-cat">${escapeHtml(entry.cat)}</div>
            <div class="gc-term">${escapeHtml(entry.term)}</div>
            <div class="gc-flip-hint">↻ tocar para ver definición</div>
          </div>
          <div class="gc-face gc-back">
            <div class="gc-cat">${escapeHtml(entry.cat)}</div>
            <div class="gc-def">${escapeHtml(entry.def)}</div>
            <div class="gc-flip-hint">↺ tocar para volver</div>
          </div>
        </div>
      </div>
    `;
    glossModal.classList.add('is-open');
    glossModal.setAttribute('aria-hidden', 'false');
    
    const card = glossModalContent.querySelector('.gloss-card');
    card.addEventListener('click', () => {
      card.classList.toggle('is-flipped');
    });
  }

  function closeGlossaryModal() {
    glossModal.classList.remove('is-open');
    glossModal.setAttribute('aria-hidden', 'true');
    setTimeout(() => { if(!glossModal.classList.contains('is-open')) glossModalContent.innerHTML = ''; }, 400);
  }

  glossModalCloser.addEventListener('click', closeGlossaryModal);
  glossModalBackdrop.addEventListener('click', closeGlossaryModal);

  /* ----------- glossary drawer ----------- */
  const glossDrawer = document.querySelector('#drawer-glossary');
  const glossList = glossDrawer.querySelector('.gloss-list');
  const glossSearch = glossDrawer.querySelector('.gloss-search');
  function renderGlossary(filter = '') {
    const f = filter.toLowerCase().trim();
    let items = window.GLOSSARY.filter(g =>
      !f || g.term.toLowerCase().includes(f) || g.def.toLowerCase().includes(f) || g.cat.toLowerCase().includes(f)
    ).sort((a,b) => a.term.localeCompare(b.term));

    if (!items.length) {
      glossList.innerHTML = `<div class="log-empty">Sin coincidencias.</div>`;
      return;
    }

    let html = '';
    let lastLetter = '';
    items.forEach(g => {
      const currentLetter = g.term.charAt(0).toUpperCase();
      if (!f && currentLetter !== lastLetter) {
        html += `<div class="gloss-letter">${currentLetter}</div>`;
        lastLetter = currentLetter;
      }
      html += `
        <button class="gloss-item" type="button" data-tid="${g.id}" data-course="${g.course || ''}">
          <span class="gi-term">${g.term}</span>
          <span class="gi-cat">${g.cat}</span>
        </button>
      `;
    });
    glossList.innerHTML = html;

    glossList.querySelectorAll('.gloss-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const entry = window.GLOSS_MAP[btn.dataset.tid];
        if (entry) {
          e.stopPropagation();
          openGlossaryCard(entry);
        }
      });
    });
  }
  glossSearch.addEventListener('input', e => renderGlossary(e.target.value));

  /* ----------- bitácora drawer ----------- */
  const logDrawer = document.querySelector('#drawer-log');
  const logList = logDrawer.querySelector('.log-list');
  const logForm = logDrawer.querySelector('.log-form');
  const courseProgressList = logDrawer.querySelector('.course-progress-list');
  const favListEl = logDrawer.querySelector('.fav-list');
  const favCountEl = logDrawer.querySelector('.fav-count');
  const logCountEl = logDrawer.querySelector('.log-count');
  const KEY = 'mn_bitacora_v1';
  const VISITED_KEY = 'mn_visited_v1';
  const FAV_KEY = 'mn_favoritas_v1';

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function readEntries() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
  }
  function writeEntries(arr) { localStorage.setItem(KEY, JSON.stringify(arr)); }

  function currentScene() {
    const mob = isMobile();
    const probe = mob
      ? stage.scrollTop + window.innerHeight/2
      : stage.scrollLeft + window.innerWidth/2;
    const scenes = document.querySelectorAll('.scene');
    let cur = scenes[0];
    for (const s of scenes) {
      const off = mob ? s.offsetTop : s.offsetLeft;
      if (off <= probe) cur = s;
    }
    return cur;
  }
  function currentSceneLabel() {
    const cur = currentScene();
    const ch = cur && cur.dataset.chapterLabel ? cur.dataset.chapterLabel : '';
    const title = cur && cur.dataset.sceneTitle ? cur.dataset.sceneTitle : '';
    return [ch, title].filter(Boolean).join(' · ') || 'inicio';
  }
  function currentSceneCourse() {
    const cur = currentScene();
    return cur && cur.dataset.course || '';
  }

  /* ---- avance por curso (escenas visitadas) ---- */
  let visitedSet = (() => {
    try { return new Set(JSON.parse(localStorage.getItem(VISITED_KEY) || '[]')); }
    catch { return new Set(); }
  })();
  function persistVisited() {
    localStorage.setItem(VISITED_KEY, JSON.stringify([...visitedSet]));
  }
  function markVisited(id) {
    if (!id || visitedSet.has(id)) return;
    visitedSet.add(id);
    persistVisited();
    if (logDrawer.classList.contains('is-open')) renderCourseProgress();
  }
  function courseLabels() {
    const labels = {};
    document.querySelectorAll('.scene[data-course][data-chapter-label]').forEach(s => {
      const c = s.dataset.course;
      if (!labels[c]) labels[c] = s.dataset.chapterLabel;
    });
    return labels;
  }
  function courseStats() {
    const stats = {};
    document.querySelectorAll('.scene[data-course]').forEach(s => {
      const c = s.dataset.course;
      const id = s.dataset.screenLabel || s.dataset.sceneTitle;
      if (!stats[c]) stats[c] = { total: 0, seen: 0 };
      stats[c].total += 1;
      if (visitedSet.has(id)) stats[c].seen += 1;
    });
    return stats;
  }
  function renderCourseProgress() {
    if (!courseProgressList) return;
    const stats = courseStats();
    const labels = courseLabels();
    const ids = Object.keys(stats).sort();
    courseProgressList.innerHTML = ids.map(id => {
      const { total, seen } = stats[id];
      const pct = total ? Math.round((seen / total) * 100) : 0;
      let label = labels[id] || `${id}`;
      label = label.replace(/^Micro-curso\s+/i, '');
      return `
        <div class="course-progress-row" data-course="${id}">
          <div class="cp-meta">
            <div class="cp-name">${escapeHtml(label)}</div>
            <div class="cp-stats">${seen} de ${total} escenas · ${pct}%</div>
          </div>
          <div class="cp-pct">${pct}%</div>
          <div class="cp-bar"><div class="cp-bar-fill" style="width: ${pct}%"></div></div>
        </div>
      `;
    }).join('');
  }

  /* ---- favoritas ---- */
  function readFavs() {
    try { return JSON.parse(localStorage.getItem(FAV_KEY) || '[]'); } catch { return []; }
  }
  function writeFavs(arr) { localStorage.setItem(FAV_KEY, JSON.stringify(arr)); }
  function isFav(src) { return readFavs().some(f => f.src === src); }
  function toggleFav(src, alt, scene, course, sci, sidx) {
    let favs = readFavs();
    const idx = favs.findIndex(f => f.src === src);
    if (idx > -1) favs.splice(idx, 1);
    else favs.unshift({ src, alt, scene, course, sci, sidx, date: Date.now() });
    writeFavs(favs);
    syncFavButtons();
    if (logDrawer.classList.contains('is-open')) renderFavorites();
  }
  function setupFavButtons() {
    const containers = document.querySelectorAll(
      '.layout-image-only, ' +
      '.layout-split .pane-img, ' +
      '.layout-stack .pane-img, ' +
      '.layout-triptych > *, ' +
      '.layout-diptych .cell, ' +
      '.gcell'
    );
    const favSet = new Set(readFavs().map(f => f.src));
    containers.forEach(c => {
      if (c.querySelector(':scope > .fav-btn')) return;
      const img = c.querySelector('img');
      if (!img || !img.getAttribute('alt')) return;
      const src = img.getAttribute('src');
      const alt = img.getAttribute('alt');
      const sc = c.closest('.scene');
      const sceneTitle = sc && (sc.dataset.sceneTitle || sc.dataset.screenLabel) || '';
      const course = sc && sc.dataset.course || '';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'fav-btn' + (favSet.has(src) ? ' is-fav' : '') + (course ? ' c-' + course : '');
      btn.dataset.src = src;
      btn.setAttribute('aria-label', `Guardar imagen: ${alt}`);
      const allScenes = Array.from(document.querySelectorAll('.scene'));
      btn.setAttribute('aria-pressed', favSet.has(src) ? 'true' : 'false');
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const sidx = allScenes.indexOf(sc);
        toggleFav(src, alt, sceneTitle, course, extractScientific(alt), sidx);
      });
      c.appendChild(btn);
    });
  }
  function syncFavButtons() {
    const favSet = new Set(readFavs().map(f => f.src));
    document.querySelectorAll('.fav-btn').forEach(btn => {
      const isF = favSet.has(btn.dataset.src);
      btn.classList.toggle('is-fav', isF);
      btn.setAttribute('aria-pressed', isF ? 'true' : 'false');
    });
  }
  function renderFavorites() {
    if (!favListEl) return;
    const favs = readFavs();
    if (favCountEl) favCountEl.textContent = favs.length;
    if (!favs.length) {
      favListEl.innerHTML = `<div class="fav-empty">Aún no has guardado imágenes. Pulsa el icono de la cámara <span class="mini-camera"></span> sobre cualquier fotografía para sumarla aquí.</div>`;
      return;
    }
      favListEl.innerHTML = favs.map((f, i) => {
      const tilt = ['tilt-l', 'tilt-r', 'tilt-l2', 'tilt-r2'][i % 4];
      const scientific = f.sci || extractScientific(f.alt);
      const displayScene = (f.alt && f.alt.includes(' — ')) ? f.alt.split(' — ')[0] : (f.scene || 'imagen');
      return `
        <figure class="fav-thumb polaroid ${tilt}" data-course="${escapeHtml(f.course || '')}" data-sidx="${f.sidx ?? ''}" title="Volver a esta escena">
          <span class="washi"></span>
          <div class="polaroid-img-wrap">
            <img src="${escapeHtml(f.src)}" alt="${escapeHtml(f.alt || '')}" loading="lazy">
          </div>
          <button type="button" class="fav-rm" data-i="${i}" aria-label="Quitar favorita">×</button>
          <figcaption class="fav-cap polaroid-caption">
            <span class="sci-name">${escapeHtml(scientific || displayScene)}</span>
          </figcaption>
        </figure>
      `;
    }).join('');

    favListEl.querySelectorAll('.polaroid').forEach(p => {
      p.addEventListener('click', (e) => {
        if (e.target.closest('.fav-rm')) return;
        const sidx = p.dataset.sidx;
        let target;
        if (sidx !== '' && sidx !== undefined && sidx !== 'null') {
          target = document.querySelectorAll('.scene')[sidx];
        }
        if (!target) {
          // Fallback para favoritas antiguas o si falló el index
          const thumbImg = p.querySelector('img');
          if (thumbImg) {
            const src = thumbImg.getAttribute('src');
            const sceneImg = document.querySelector(`.scene img[src="${src}"]`);
            if (sceneImg) target = sceneImg.closest('.scene');
          }
        }

        if (target) {
          closeDrawers();
          if (isMobile()) {
            stage.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
          } else {
            stage.scrollTo({ left: target.offsetLeft, behavior: 'smooth' });
          }
        }
      });
    });
    favListEl.querySelectorAll('.fav-rm').forEach(b => {
      b.addEventListener('click', () => {
        const arr = readFavs();
        arr.splice(parseInt(b.dataset.i, 10), 1);
        writeFavs(arr);
        renderFavorites();
        syncFavButtons();
      });
    });
  }

  /* ---- anotaciones ---- */
  function renderLog() {
    const entries = readEntries();
    if (logCountEl) logCountEl.textContent = entries.length;
    if (!entries.length) {
      logList.innerHTML = `<div class="log-empty">Aún no hay anotaciones. Deja una primera observación al pasar por una escena que te conmovió.</div>`;
      return;
    }
    logList.innerHTML = entries.map((e, i) => `
      <div class="log-entry"${e.course ? ` data-course="${escapeHtml(e.course)}"` : ''}>
        ${e.course ? `<div class="le-course">Micro-curso ${escapeHtml(e.course)}</div>` : ''}
        <div class="le-head">
          <span>${e.date || ''}</span>
        </div>
        <div class="le-text">${escapeHtml(e.text)}</div>
        <div class="le-scene">↳ ${escapeHtml(e.scene || '')}</div>
        <button class="le-del" data-i="${i}">eliminar</button>
      </div>
    `).join('');
    logList.querySelectorAll('.le-del').forEach(b => {
      b.addEventListener('click', () => {
        const arr = readEntries();
        arr.splice(parseInt(b.dataset.i, 10), 1);
        writeEntries(arr);
        renderLog();
      });
    });
  }

  logForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(logForm);
    const text = (fd.get('text') || '').toString().trim();
    if (!text) return;
    const entry = {
      text: text.slice(0, 600),
      scene: currentSceneLabel(),
      course: currentSceneCourse(),
      date: new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
    };
    const arr = readEntries();
    arr.unshift(entry);
    writeEntries(arr);
    logForm.reset();
    renderLog();
  });

  /* ---- reset avance ---- */
  logDrawer.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-reset]');
    if (!btn) return;
    if (btn.dataset.reset === 'visited') {
      if (!confirm('¿Reiniciar el avance registrado?')) return;
      visitedSet = new Set();
      persistVisited();
      renderCourseProgress();
    }
  });

  /* ----------- drawer open/close ----------- */
  const backdrop = document.querySelector('.drawer-backdrop');
  function syncDrawerTriggers() {
    document.querySelectorAll('[data-open-drawer]').forEach(btn => {
      const sel = btn.dataset.openDrawer;
      const d = document.querySelector(sel);
      btn.setAttribute('aria-expanded', d && d.classList.contains('is-open') ? 'true' : 'false');
    });
  }
  function openDrawer(d) {
    document.querySelectorAll('.drawer').forEach(x => x.classList.remove('is-open'));
    d.classList.add('is-open');
    backdrop.classList.add('is-open');
    syncDrawerTriggers();
  }
  function closeDrawers() {
    document.querySelectorAll('.drawer').forEach(x => x.classList.remove('is-open'));
    backdrop.classList.remove('is-open');
    syncDrawerTriggers();
  }
  backdrop.addEventListener('click', closeDrawers);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawers(); });
  document.querySelectorAll('[data-open-drawer]').forEach(btn => {
    btn.setAttribute('aria-expanded', 'false');
    const sel = btn.dataset.openDrawer;
    const d = document.querySelector(sel);
    if (d && d.id) btn.setAttribute('aria-controls', d.id);
    btn.addEventListener('click', () => {
      const target = document.querySelector(sel);
      if (target) {
        openDrawer(target);
        if (sel === '#drawer-glossary') renderGlossary();
        if (sel === '#drawer-log') {
          renderCourseProgress();
          renderFavorites();
          renderLog();
          // reset to first tab
          const firstTab = logDrawer.querySelector('.bit-tab-btn');
          if (firstTab) firstTab.click();
        }
      }
    });
  });

  /* ----------- bitácora tabs ----------- */
  logDrawer.querySelectorAll('.bit-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = `pane-${btn.dataset.tabTarget}`;
      logDrawer.querySelectorAll('.bit-tab-btn').forEach(b => b.classList.remove('is-active'));
      logDrawer.querySelectorAll('.bit-pane').forEach(p => p.classList.remove('is-active'));
      btn.classList.add('is-active');
      const pane = logDrawer.querySelector(`#${targetId}`);
      if (pane) pane.classList.add('is-active');
    });
  });

  document.querySelectorAll('.drawer .closer').forEach(b => b.addEventListener('click', closeDrawers));

  /* ----------- course menu navigation ----------- */
  document.querySelectorAll('.cg-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const cid = btn.dataset.gotoCourse;
      const target = document.querySelector(`.scene[data-course="${cid}"]`);
      if (target) {
        if (isMobile()) {
          stage.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
        } else {
          stage.scrollTo({ left: target.offsetLeft, behavior: 'smooth' });
        }
      }
    });
  });


  /* ----------- sound control ----------- */
  function setupSound() {
    const btn = document.getElementById('sound-btn');
    const audios = [
      document.getElementById('snd-chisga'),
      document.getElementById('snd-rio')
    ];
    if (!btn || !audios[0]) return;

    let isPlaying = false;

    // Ajustes de volumen inicial
    audios[0].volume = 0.2; // chisga (aves)
    audios[1].volume = 0.1; // rio (agua)

    // Aleatorizar el tiempo de inicio de cada pista para evitar sincronía artificial
    audios.forEach(a => {
      if (!a) return;
      const randomize = () => {
        if (!isNaN(a.duration) && isFinite(a.duration)) {
          a.currentTime = Math.random() * a.duration;
        }
      };
      a.addEventListener('loadedmetadata', randomize);
      // Fallback si ya estaban cargados
      if (a.readyState >= 1) randomize();
    });

    btn.addEventListener('click', () => {
      isPlaying = !isPlaying;
      btn.classList.toggle('is-playing', isPlaying);

      audios.forEach(a => {
        if (!a) return;
        if (isPlaying) {
          a.play().catch(err => {
            console.warn('Audio play blocked by browser:', err);
            isPlaying = false;
            btn.classList.remove('is-playing');
          });
        } else {
          a.pause();
        }
      });
    });
  }

  /* ----------- initial paint ----------- */
  function init() {
    buildChapterIndex();
    buildProgressMarks();
    setupFavButtons();
    setupSound();
    updateProgress();
    stage.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', () => { buildProgressMarks(); updateProgress(); });
    setTimeout(() => splash && splash.classList.add('hidden'), 700);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ----------- expose for debug ----------- */
  window.__mn = { stage, chapters };
})();
