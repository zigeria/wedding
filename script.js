// Minimal logic: countdown, RSVP, questionnaire, responsive nav, gallery lightbox
(function(){
  const WEDDING_DATE = new Date('2025-12-09T15:40:00+03:00'); // измените при необходимости

  // Countdown
  const cd = {
    days: document.getElementById('cd-days'),
    hours: document.getElementById('cd-hours'),
    mins: document.getElementById('cd-mins'),
    secs: document.getElementById('cd-secs')
  };
  function updateTimer(){
    if(!cd.days) return;
    const now = new Date();
    let diff = WEDDING_DATE - now;
    if(diff < 0) diff = 0;
    const sec = Math.floor(diff/1000);
    const days = Math.floor(sec/86400);
    const hours = Math.floor((sec%86400)/3600);
    const mins = Math.floor((sec%3600)/60);
    const secs = sec%60;
    cd.days.textContent = days;
    cd.hours.textContent = hours.toString().padStart(2,'0');
    cd.mins.textContent = mins.toString().padStart(2,'0');
    cd.secs.textContent = secs.toString().padStart(2,'0');
  }
  updateTimer();
  setInterval(updateTimer,1000);

  // RSVP
  const rsvpForm = document.getElementById('rsvp-form');
  const rsvpMsg = document.getElementById('rsvp-message');
  if(rsvpForm){
    rsvpForm.addEventListener('click', e => {
      const action = e.target.getAttribute('data-action');
      if(!action) return;
      const fd = new FormData(rsvpForm);
      const name = fd.get('name');
      const count = fd.get('count');
      if(!name || !count){ rsvpMsg.textContent = 'Заполните поля.'; return; }
      const payload = { name, count: Number(count), status: action==='yes'?'accepted':'declined', ts: Date.now() };
      const existing = JSON.parse(localStorage.getItem('rsvp_list')||'[]');
      existing.push(payload);
      localStorage.setItem('rsvp_list', JSON.stringify(existing));
      rsvpMsg.textContent = action==='yes' ? 'Спасибо! Ждём вас.' : 'Жаль, что не получится.';
    });
  }

  // Questionnaire
  const qForm = document.getElementById('question-form');
  const qMsg = document.getElementById('q-message');
  if(qForm){
    qForm.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(qForm);
      const name = fd.get('q_name');
      const note = fd.get('q_note');
      if(!name){ qMsg.textContent = 'Введите имя.'; return; }
      const payload = { name, note, ts: Date.now() };
      const existing = JSON.parse(localStorage.getItem('questionnaire')||'[]');
      existing.push(payload);
      localStorage.setItem('questionnaire', JSON.stringify(existing));
      qMsg.textContent = 'Сохранено. Спасибо!';
      qForm.reset();
    });
  }

  // Mobile nav toggle
  const navToggle = document.querySelector('.nav-toggle');
  const siteNav = document.getElementById('site-nav');
  if(navToggle && siteNav){
    navToggle.addEventListener('click', () => {
      const open = siteNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open.toString());
    });
  }

  // Scroll lock until car reaches center, then reveal bride & groom sketch
  (function(){
    const hero = document.querySelector('.hero');
    const carWrapper = document.querySelector('.hero-car-wrapper');
    const carImg = document.querySelector('.hero-car');
    const sketchImg = document.querySelector('.hero-sketch');
    const carText = document.querySelector('.hero-car-text');
    if(!hero || !carWrapper || !carImg || !sketchImg) return;
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const body = document.body;
    const startLeft = -window.innerWidth * 0.40; // initial off-screen position in px (approx)
    let distanceToCenter = 0; // computed later
    let progress = 0; // 0..1
    let unlocked = false;
    let swapped = false;

    function computeDistance(){
      const rect = hero.getBoundingClientRect();
      const wrapperRect = carWrapper.getBoundingClientRect();
      distanceToCenter = (rect.width - wrapperRect.width) / 2 - startLeft;
    }

    function render(){
      const tx = distanceToCenter * progress;
      carWrapper.style.transform = `translateX(${tx.toFixed(1)}px)`;
    }

    function revealSketch(){
      if(swapped) return;
      swapped = true;
      // Fade out car, fade in sketch (text stays visible)
      carImg.style.opacity = '0';
      sketchImg.style.opacity = '1';
    }

    function unlock(){
      unlocked = true;
      body.classList.remove('lock');
      window.removeEventListener('wheel', onWheel, { passive:false });
      window.removeEventListener('touchmove', onTouchMove, { passive:false });
      window.removeEventListener('keydown', onKey, true);
      revealSketch();
    }

    function advance(delta){
      if(unlocked) return;
      progress += delta;
      if(progress < 0) progress = 0;
      if(progress >= 1){ progress = 1; render(); unlock(); return; }
      render();
    }

    function normalizeWheel(e){
      // Rough normalization: positive deltaY advances animation
      const dy = e.deltaY;
      return Math.min(Math.max(dy / 600, 0.01), 0.15); // clamp small increments
    }

    function onWheel(e){
      if(unlocked) return;
      e.preventDefault();
      advance(normalizeWheel(e));
    }

    let lastY = null;
    function onTouchMove(e){
      if(unlocked) return;
      if(e.touches.length !== 1) return;
      const y = e.touches[0].clientY;
      if(lastY !== null){
        const diff = lastY - y; // swipe up -> positive diff
        if(diff > 0){
          e.preventDefault();
          advance(Math.min(diff / 400, 0.12));
        }
      }
      lastY = y;
    }
    function onTouchEnd(){ lastY = null; }

    function onKey(e){
      if(unlocked) return;
      const keys = ['ArrowDown','PageDown','Space'];
      if(keys.includes(e.code) || keys.includes(e.key)){
        e.preventDefault();
        advance(0.08);
      }
    }

    function init(){
      computeDistance();
      render();
      if(reduced){ progress = 1; render(); unlock(); return; }
      body.classList.add('lock');
      window.addEventListener('wheel', onWheel, { passive:false });
      window.addEventListener('touchmove', onTouchMove, { passive:false });
      window.addEventListener('touchend', onTouchEnd, { passive:true });
      window.addEventListener('keydown', onKey, true);
      window.addEventListener('resize', () => { computeDistance(); render(); });
    }
    init();
  })();

  // Gallery rendering
  const galleryData = Array.isArray(window.GALLERY) ? window.GALLERY : [];
  const grid = document.getElementById('gallery-grid');
  if(grid && galleryData.length){
    const frag = document.createDocumentFragment();
    galleryData.forEach((src,i) => {
      const div = document.createElement('div');
      div.className = 'item';
      const img = document.createElement('img');
      img.src = src;
      img.alt = 'Фото '+ (i+1);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.addEventListener('click', () => openLightbox(src, img.alt));
      div.appendChild(img); div.appendChild(btn);
      frag.appendChild(div);
    });
    grid.appendChild(frag);
  }

  // Lightbox
  let lb;
  function ensureLightbox(){
    if(lb) return lb;
    lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.innerHTML = '<button class="close" type="button" aria-label="Закрыть">×</button><figure><img alt="" /></figure>';
    document.body.appendChild(lb);
    lb.querySelector('.close').addEventListener('click', closeLightbox);
    lb.addEventListener('click', e => { if(e.target === lb) closeLightbox(); });
    document.addEventListener('keydown', e => { if(e.key==='Escape') closeLightbox(); });
    return lb;
  }
  function openLightbox(src, alt){
    const box = ensureLightbox();
    const img = box.querySelector('img');
    img.src = src; img.alt = alt || '';
    box.classList.add('open');
  }
  function closeLightbox(){ if(lb) lb.classList.remove('open'); }
})();
