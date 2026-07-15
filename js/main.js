// ---------- hero video (falls back to the animated photo if no video file exists) ----------
const heroVideo = document.querySelector('.hero-video');
if(heroVideo){
  const heroBg = document.querySelector('.hero-bg');
  const hideVideo = () => { heroVideo.style.display = 'none'; };
  const useRealVideo = () => { if(heroBg) heroBg.style.opacity = '0'; };
  heroVideo.addEventListener('error', hideVideo, true);
  heroVideo.addEventListener('loadeddata', useRealVideo);
  setTimeout(() => { if(heroVideo.readyState === 0){ hideVideo(); } }, 2500);
}

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
    link.classList.toggle('active', href === '#' + current);
  });
}
document.addEventListener('scroll', onScroll, {passive:true});
onScroll();

// ---------- mobile nav toggle ----------
const toggle = document.querySelector('.nav-toggle');
const linksEl = document.querySelector('.nav-links');
if(toggle){
  toggle.addEventListener('click', () => linksEl.classList.toggle('open'));
  navLinks.forEach(a => a.addEventListener('click', () => linksEl.classList.remove('open')));
}

// ---------- generic accordion helper ----------
function wireAccordionGroup(itemSelector, triggerSelector, panelSelector, exclusive){
  document.querySelectorAll(itemSelector).forEach(item => {
    const trigger = item.querySelector(triggerSelector);
    const panel = item.querySelector(panelSelector);
    if(!trigger || !panel) return;
    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      if(exclusive){
        document.querySelectorAll(itemSelector + '.open').forEach(other => {
          if(other !== item){
            other.classList.remove('open');
            other.querySelector(panelSelector).style.maxHeight = null;
          }
        });
      }
      if(isOpen){
        item.classList.remove('open');
        panel.style.maxHeight = null;
      } else {
        item.classList.add('open');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });
}
wireAccordionGroup('.faq-item', '.faq-q', '.faq-a', true);
wireAccordionGroup('.schedule-item', '.schedule-more', '.schedule-detail', false);

// ---------- audio players ----------
document.querySelectorAll('.audio-card').forEach(audioCard => {
  const audioEl = audioCard.querySelector('audio');
  const playBtn = audioCard.querySelector('.audio-play');
  if(!audioEl || !playBtn) return;
  const iconPlay = playBtn.querySelector('.icon-play');
  const iconPause = playBtn.querySelector('.icon-pause');

  playBtn.addEventListener('click', () => {
    document.querySelectorAll('.audio-card audio').forEach(other => {
      if(other !== audioEl && !other.paused){ other.pause(); }
    });
    if(audioEl.paused){
      audioEl.play().catch(() => { audioCard.classList.toggle('playing'); });
    } else {
      audioEl.pause();
    }
  });
  audioEl.addEventListener('play', () => {
    audioCard.classList.add('playing');
    if(iconPlay) iconPlay.style.display = 'none';
    if(iconPause) iconPause.style.display = 'block';
  });
  ['pause','ended'].forEach(evt => audioEl.addEventListener(evt, () => {
    audioCard.classList.remove('playing');
    if(iconPlay) iconPlay.style.display = 'block';
    if(iconPause) iconPause.style.display = 'none';
  }));
});

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
  const captions = Array.from(imgs).map(img => img.dataset.caption || '');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let idx = 0;
  let timer = null;

  function show(i){
    idx = (i + imgs.length) % imgs.length;
    if(track) track.style.transform = `translateX(-${idx * 100}%)`;
    if(captionEl) captionEl.textContent = captions[idx];
  }
  function startAuto(){
    if(imgs.length > 1 && !prefersReduced){
      timer = setInterval(() => show(idx + 1), 4500);
    }
  }
  function restartAuto(){
    if(timer) clearInterval(timer);
    startAuto();
  }
  show(0);
  startAuto();
  if(nextBtn) nextBtn.addEventListener('click', () => { show(idx + 1); restartAuto(); });
  if(prevBtn) prevBtn.addEventListener('click', () => { show(idx - 1); restartAuto(); });
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
