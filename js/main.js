// ---------- password gate (client-side deterrent only — not true security) ----------
(function(){
  const gate = document.getElementById('site-gate');
  if(!gate) return;
  const STORAGE_KEY = 'awg-site-unlocked-2';
  const PASSWORD_HASH = 'ebd3ac3ca1105071b373a7270e8c687303aa0d6e321dd0ac99fba018369da4c0';

  async function sha256(text){
    const data = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2,'0')).join('');
  }

  function unlock(persist){
    if(persist){ try{ localStorage.setItem(STORAGE_KEY, '1'); } catch(e){} }
    gate.classList.add('unlocked');
    gate.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('gate-locked');
    document.querySelectorAll('.site-nav, main, footer').forEach(el => {
      el.removeAttribute('inert');
      el.removeAttribute('aria-hidden');
    });
    setTimeout(() => {
      gate.style.display = 'none';
      if(persist) document.querySelector('main h1')?.focus();
      document.dispatchEvent(new CustomEvent('site:unlocked'));
    }, 550);
  }

  let alreadyUnlocked = false;
  try { alreadyUnlocked = localStorage.getItem(STORAGE_KEY) === '1'; } catch(e){}

  if(alreadyUnlocked){
    unlock(false);
  } else {
    document.body.classList.add('gate-locked');
  }

  const form = document.getElementById('gateForm');
  const input = document.getElementById('gatePw');
  const error = document.getElementById('gateError');
  if(form){
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const hash = await sha256(input.value.trim().toLowerCase());
      if(hash === PASSWORD_HASH){
        error.hidden = true;
        input.removeAttribute('aria-invalid');
        unlock(true);
      } else {
        error.hidden = false;
        input.setAttribute('aria-invalid', 'true');
        input.value = '';
        input.focus();
      }
    });
  }
})();

// ---------- friendly mobile-only desktop-view suggestion ----------
(function(){
  const note = document.getElementById('mobileDesktopNote');
  if(!note) return; // RSVP intentionally does not include this prompt.

  const backdrop = document.getElementById('mobileDesktopNoteBackdrop');
  const closeButton = note.querySelector('.mobile-desktop-note-close');
  const gate = document.getElementById('site-gate');
  const mobileQuery = window.matchMedia('(max-width: 767px)');
  const DISMISSED_KEY = 'awg-desktop-note-dismissed';
  let dismissed = false;
  let hideTimer = null;
  try { dismissed = sessionStorage.getItem(DISMISSED_KEY) === '1'; } catch(e){}

  function showNote(){
    if(!mobileQuery.matches || dismissed || !note.hidden || (gate && !gate.classList.contains('unlocked'))) return;
    if(hideTimer) clearTimeout(hideTimer);
    window.scrollTo(0, 0);
    document.body.classList.add('desktop-note-open');
    if(backdrop) backdrop.hidden = false;
    note.hidden = false;
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      backdrop?.classList.add('is-visible');
      note.classList.add('is-visible');
      closeButton?.focus({preventScroll:true});
    });
  }

  function hideNote(remember){
    note.classList.remove('is-visible');
    backdrop?.classList.remove('is-visible');
    document.body.classList.remove('desktop-note-open');
    if(remember){
      dismissed = true;
      try { sessionStorage.setItem(DISMISSED_KEY, '1'); } catch(e){}
    }
    window.scrollTo(0, 0);
    hideTimer = setTimeout(() => {
      note.hidden = true;
      if(backdrop) backdrop.hidden = true;
      window.scrollTo(0, 0);
      document.querySelector('.nav-mark')?.focus({preventScroll:true});
    }, 220);
  }

  closeButton?.addEventListener('click', () => hideNote(true));
  backdrop?.addEventListener('click', (event) => {
    if(event.target === backdrop) hideNote(true);
  });
  document.addEventListener('keydown', (event) => {
    if(note.hidden) return;
    if(event.key === 'Escape') hideNote(true);
    if(event.key === 'Tab'){
      event.preventDefault();
      closeButton?.focus({preventScroll:true});
    }
  });
  mobileQuery.addEventListener('change', (event) => {
    if(event.matches) showNote();
    else hideNote(false);
  });
  document.addEventListener('site:unlocked', showNote);
  setTimeout(showNote, 700);
})();

// ---------- sticky nav + active link ----------
const nav = document.querySelector('.site-nav');
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('main section[id]');
const hasHero = !!document.querySelector('.hero');

function onScroll(){
  if(hasHero){
    if(window.scrollY > 60){ nav.classList.add('scrolled'); }
    else { nav.classList.remove('scrolled'); }
  }
  let current = '';
  sections.forEach(sec => {
    const top = sec.offsetTop - 120;
    if(window.scrollY >= top){ current = sec.getAttribute('id'); }
  });
  navLinks.forEach(link => {
    const href = link.getAttribute('href') || '';
    const isCurrent = href === '#' + current;
    link.classList.toggle('active', isCurrent);
    if(isCurrent) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
document.addEventListener('scroll', onScroll, {passive:true});
onScroll();

// ---------- mobile nav toggle ----------
const toggle = document.querySelector('.nav-toggle');
const linksEl = document.querySelector('.nav-links');
const backdropEl = document.querySelector('.nav-backdrop');
const mobileNavQuery = window.matchMedia('(max-width: 1080px)');
function setMenuOpen(isOpen){
  if(!linksEl) return;
  const canOpen = mobileNavQuery.matches;
  isOpen = canOpen && isOpen;
  linksEl.classList.toggle('open', isOpen);
  if(toggle) toggle.classList.toggle('open', isOpen);
  if(backdropEl) backdropEl.classList.toggle('open', isOpen);
  document.body.classList.toggle('menu-open', isOpen);
  if(toggle){
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  }
  if(canOpen){
    linksEl.toggleAttribute('inert', !isOpen);
    linksEl.setAttribute('aria-hidden', String(!isOpen));
  } else {
    linksEl.removeAttribute('inert');
    linksEl.removeAttribute('aria-hidden');
  }
}
if(toggle){
  toggle.addEventListener('click', () => {
    const willOpen = !linksEl.classList.contains('open');
    setMenuOpen(willOpen);
    if(willOpen) linksEl.querySelector('a')?.focus();
  });
  navLinks.forEach(a => a.addEventListener('click', () => setMenuOpen(false)));
  if(backdropEl) backdropEl.addEventListener('click', () => setMenuOpen(false));
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && linksEl.classList.contains('open')){
      setMenuOpen(false);
      toggle.focus();
    }
    if(e.key === 'Tab' && linksEl.classList.contains('open')){
      const focusable = [toggle, ...linksEl.querySelectorAll('a')];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if(e.shiftKey && document.activeElement === first){
        e.preventDefault();
        last.focus();
      } else if(!e.shiftKey && document.activeElement === last){
        e.preventDefault();
        first.focus();
      }
    }
  });
  mobileNavQuery.addEventListener('change', () => setMenuOpen(false));
  setMenuOpen(false);
}

// ---------- generic accordion helper ----------
let accordionPanelId = 0;
function wireAccordionGroup(itemSelector, triggerSelector, panelSelector, exclusive){
  document.querySelectorAll(itemSelector).forEach(item => {
    const trigger = item.querySelector(triggerSelector);
    const panel = item.querySelector(panelSelector);
    if(!trigger || !panel) return;
    const panelId = panel.id || `accordion-panel-${++accordionPanelId}`;
    panel.id = panelId;
    trigger.setAttribute('type', 'button');
    trigger.setAttribute('aria-controls', panelId);
    trigger.setAttribute('aria-expanded', String(item.classList.contains('open')));
    panel.setAttribute('aria-hidden', String(!item.classList.contains('open')));
    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      if(exclusive){
        document.querySelectorAll(itemSelector + '.open').forEach(other => {
          if(other !== item){
            other.classList.remove('open');
            other.querySelector(panelSelector).style.maxHeight = null;
            other.querySelector(triggerSelector)?.setAttribute('aria-expanded', 'false');
            other.querySelector(panelSelector)?.setAttribute('aria-hidden', 'true');
          }
        });
      }
      if(isOpen){
        item.classList.remove('open');
        panel.style.maxHeight = null;
        trigger.setAttribute('aria-expanded', 'false');
        panel.setAttribute('aria-hidden', 'true');
      } else {
        item.classList.add('open');
        panel.style.maxHeight = panel.scrollHeight + 'px';
        trigger.setAttribute('aria-expanded', 'true');
        panel.setAttribute('aria-hidden', 'false');
      }
    });
  });
}
wireAccordionGroup('.faq-item', '.faq-q', '.faq-a', true);
wireAccordionGroup('.schedule-item', '.schedule-more', '.schedule-detail', false);
wireAccordionGroup('.hotel-card', '.hotel-more', '.hotel-detail', false);
wireAccordionGroup('.villa-collection', '.villa-more', '.villa-detail', false);

// ---------- mobile-only Things to Do details ----------
const todoSection = document.getElementById('thingstodo');
if(todoSection){
  const todoMobileQuery = window.matchMedia('(max-width: 600px)');
  const todoCards = Array.from(todoSection.querySelectorAll('.todo-card'));

  todoCards.forEach((card, index) => {
    const trigger = card.querySelector('.todo-more');
    const panel = card.querySelector('.todo-card-detail');
    const title = card.querySelector('h4')?.textContent.trim() || 'this recommendation';
    if(!trigger || !panel) return;

    const panelId = panel.id || `todo-detail-${index + 1}`;
    panel.id = panelId;
    trigger.setAttribute('aria-controls', panelId);
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-label', `Show details for ${title}`);

    trigger.addEventListener('click', () => {
      if(!todoMobileQuery.matches) return;
      const willOpen = !card.classList.contains('open');
      card.classList.toggle('open', willOpen);
      trigger.setAttribute('aria-expanded', String(willOpen));
      trigger.setAttribute('aria-label', `${willOpen ? 'Hide' : 'Show'} details for ${title}`);
      panel.setAttribute('aria-hidden', String(!willOpen));
      panel.style.maxHeight = willOpen ? `${panel.scrollHeight}px` : '0px';
    });
  });

  function syncTodoCards(){
    const isMobile = todoMobileQuery.matches;
    todoSection.classList.toggle('todo-accordion-ready', isMobile);
    todoCards.forEach(card => {
      const trigger = card.querySelector('.todo-more');
      const panel = card.querySelector('.todo-card-detail');
      const title = card.querySelector('h4')?.textContent.trim() || 'this recommendation';
      if(!trigger || !panel) return;

      if(isMobile){
        const isOpen = card.classList.contains('open');
        trigger.hidden = false;
        trigger.setAttribute('aria-expanded', String(isOpen));
        trigger.setAttribute('aria-label', `${isOpen ? 'Hide' : 'Show'} details for ${title}`);
        panel.setAttribute('aria-hidden', String(!isOpen));
        panel.style.maxHeight = isOpen ? `${panel.scrollHeight}px` : '0px';
      } else {
        card.classList.remove('open');
        trigger.hidden = true;
        trigger.setAttribute('aria-expanded', 'false');
        trigger.setAttribute('aria-label', `Show details for ${title}`);
        panel.removeAttribute('aria-hidden');
        panel.style.maxHeight = '';
      }
    });
  }

  todoMobileQuery.addEventListener('change', syncTodoCards);
  syncTodoCards();
}

// ---------- story photo carousel ----------
const carousel = document.querySelector('.story-carousel');
if(carousel){
  const track = carousel.querySelector('.story-carousel-track');
  // shuffle the photo order so same-location shots aren't clumped together
  if(track){
    const shuffled = Array.from(track.children);
    for(let i = shuffled.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    shuffled.forEach(img => track.appendChild(img));
  }
  const imgs = carousel.querySelectorAll('.story-carousel-track img');
  const captionEl = carousel.querySelector('.story-carousel-caption');
  const prevBtn = carousel.querySelector('.story-carousel-arrow.prev');
  const nextBtn = carousel.querySelector('.story-carousel-arrow.next');
  const pauseBtn = carousel.querySelector('.story-carousel-pause');
  const captions = Array.from(imgs).map(img => img.dataset.caption || '');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let idx = 0;
  let timer = null;
  let isPaused = prefersReduced;

  function show(i){
    idx = (i + imgs.length) % imgs.length;
    if(track) track.style.transform = `translateX(-${idx * 100}%)`;
    if(captionEl) captionEl.textContent = captions[idx];
  }
  function startAuto(){
    if(imgs.length > 1 && !isPaused && !document.hidden){
      timer = setInterval(() => show(idx + 1), 4500);
    }
  }
  function stopAuto(){
    if(timer){
      clearInterval(timer);
      timer = null;
    }
  }
  function restartAuto(){
    stopAuto();
    startAuto();
  }
  function updatePauseButton(){
    if(!pauseBtn) return;
    pauseBtn.setAttribute('aria-pressed', String(isPaused));
    pauseBtn.setAttribute('aria-label', isPaused ? 'Play photo rotation' : 'Pause photo rotation');
  }
  show(0);
  updatePauseButton();
  startAuto();
  if(nextBtn) nextBtn.addEventListener('click', () => { show(idx + 1); restartAuto(); });
  if(prevBtn) prevBtn.addEventListener('click', () => { show(idx - 1); restartAuto(); });
  if(pauseBtn) pauseBtn.addEventListener('click', () => {
    isPaused = !isPaused;
    updatePauseButton();
    restartAuto();
  });
  document.addEventListener('visibilitychange', () => {
    if(document.hidden) stopAuto();
    else startAuto();
  });
}

// ---------- scroll reveal (staggered 45ms per item within a group) ----------
const revealGroups = new Map();
document.querySelectorAll('.reveal').forEach(el => {
  const parent = el.parentElement;
  if(!revealGroups.has(parent)) revealGroups.set(parent, []);
  revealGroups.get(parent).push(el);
});
if('IntersectionObserver' in window){
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        const el = entry.target;
        const group = revealGroups.get(el.parentElement) || [el];
        const position = group.indexOf(el);
        el.style.transitionDelay = (Math.min(position, 6) * 45) + 'ms';
        el.classList.add('in');
        io.unobserve(el);
      }
    });
  }, {threshold:0.12});
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
}
