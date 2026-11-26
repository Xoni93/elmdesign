/* =========================================================
   ELM Design — interactions
   ========================================================= */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Fond d'encre animée de l'accueil ---------- */
  const hero = document.getElementById('accueil');
  const fluidCanvas = document.getElementById('fluid');
  if (fluidCanvas && typeof fluidSimulation === 'function') {
    let heroVisible = true;
    new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; }).observe(hero);
    try {
      fluidSimulation(fluidCanvas, { isActive: () => heroVisible && !document.hidden });
    } catch (err) {
      // WebGL indisponible : le dégradé de secours en CSS reste affiché
      hero.classList.add('no-webgl');
      console.warn('Fond animé désactivé :', err);
    }
  }

  /* ---------- Apparition échelonnée de l'accueil ---------- */
  // Découpe les titres en mots pour l'apparition mot par mot
  document.querySelectorAll('.words').forEach(el => {
    const base = +el.dataset.delay, stagger = +el.dataset.stagger;
    const dur = +el.dataset.dur, y = +el.dataset.y;
    // Un mot entouré d'astérisques (*mot*) s'affiche en doré
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', el.textContent.trim().replace(/\*/g, ''));
    el.textContent = '';
    words.forEach((w, i) => {
      const span = document.createElement('span');
      const gold = /^\*.+\*$/.test(w);
      span.className = gold ? 'word word--gold' : 'word';
      span.setAttribute('aria-hidden', 'true');
      span.textContent = gold ? w.slice(1, -1) : w;
      span.style.setProperty('--y', y + 'px');
      span.style.transitionDuration = dur + 'ms';
      span.style.transitionDelay = (base + i * stagger) + 'ms';
      el.appendChild(span);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
  });
  document.querySelectorAll('.stagger').forEach(el => {
    el.style.transitionDelay = el.dataset.delay + 'ms';
  });
  requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add('is-loaded')));

  /* ---------- Effet machine à écrire sur le mot doré du titre ----------
     « briller » s'efface lettre par lettre puis laisse place au mot suivant, avec un curseur qui clignote.
     Le titre lu par les lecteurs d'écran reste fixe (aria-label), et rien ne bouge si l'utilisateur
     a demandé moins d'animations. */
  const twWord = document.querySelector('.hero__title .word--gold');
  if (twWord && !reduceMotion) {
    const WORDS = ['briller', 'grandir', 'rayonner', 'décoller'];
    const TYPE_MS = 70, DELETE_MS = 40, HOLD_MS = 1600, START_MS = 2200;
    const textEl = document.createElement('span');
    const caret = document.createElement('span');
    caret.className = 'tw-caret';
    textEl.textContent = twWord.textContent;
    twWord.textContent = '';
    twWord.classList.add('tw');
    twWord.append(textEl, caret);
    // Réserve la largeur du mot le plus long : la fin du titre ne saute pas à chaque lettre
    const reserve = () => {
      const current = textEl.textContent;
      let max = 0;
      WORDS.forEach(w => { textEl.textContent = w; max = Math.max(max, textEl.getBoundingClientRect().width); });
      textEl.textContent = current;
      twWord.style.minWidth = Math.ceil(max + caret.getBoundingClientRect().width + 4) + 'px';
    };
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(reserve);
    window.addEventListener('resize', reserve, { passive: true });

    let index = 0, text = WORDS[0], deleting = true;
    const tick = () => {
      if (document.hidden) return setTimeout(tick, 500);
      const word = WORDS[index % WORDS.length];
      if (!deleting && text === word) { deleting = true; return setTimeout(tick, HOLD_MS); }
      if (deleting && text === '') { deleting = false; index++; return setTimeout(tick, 200); }
      text = deleting ? text.slice(0, -1) : word.slice(0, text.length + 1);
      textEl.textContent = text;
      setTimeout(tick, deleting ? DELETE_MS : TYPE_MS);
    };
    setTimeout(tick, START_MS + HOLD_MS);
  }

  /* ---------- Navigation : fond au scroll + menu mobile ---------- */
  const nav = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const links = document.getElementById('navLinks');

  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 30);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Menu mobile : la page derrière ne défile plus tant qu'il est ouvert
  const setMenu = open => {
    links.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.documentElement.classList.toggle('menu-open', open);
    if (window.lenis) open ? window.lenis.stop() : window.lenis.start();
  };
  const closeMenu = () => { if (links.classList.contains('is-open')) setMenu(false); };
  burger.addEventListener('click', () => setMenu(!links.classList.contains('is-open')));
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  // Toucher en dehors du menu le referme
  document.addEventListener('pointerdown', e => {
    if (links.classList.contains('is-open') && !links.contains(e.target) && !burger.contains(e.target)) closeMenu();
  });

  /* ---------- Lien actif selon la section visible ---------- */
  const sections = [...document.querySelectorAll('main section[id]')];
  const navAnchors = [...links.querySelectorAll('.nav__pill a')];
  const spy = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navAnchors.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => spy.observe(s));

  /* ---------- Apparition au scroll (avec décalage) ---------- */
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const siblings = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
      el.style.transitionDelay = Math.min(siblings.indexOf(el), 5) * 90 + 'ms';
      el.classList.add('is-visible');
      revealObs.unobserve(el);
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  /* ---------- Effet de lumière + inclinaison des cartes ---------- */
  if (window.matchMedia('(pointer: fine)').matches && !reduceMotion) {
    document.querySelectorAll('.tilt').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.setProperty('--mx', x * 100 + '%');
        el.style.setProperty('--my', y * 100 + '%');
        el.style.transform = `perspective(900px) rotateX(${(.5 - y) * 6}deg) rotateY(${(x - .5) * 6}deg)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- Filtres des réalisations ---------- */
  const filters = document.querySelectorAll('.filter');
  const projects = document.querySelectorAll('.project');
  const EASE = 'cubic-bezier(.22, 1, .36, 1)'; // même courbe que --ease en CSS
  let filterTimer;
  filters.forEach(btn => btn.addEventListener('click', () => {
    filters.forEach(b => { b.classList.toggle('is-active', b === btn); b.setAttribute('aria-selected', String(b === btn)); });
    const f = btn.dataset.filter;
    const matches = p => f === 'all' || p.dataset.cat === f;
    // Interrompt proprement une animation en cours si on clique vite sur plusieurs filtres
    clearTimeout(filterTimer);
    projects.forEach(p => p.getAnimations().forEach(a => a.cancel()));

    const apply = () => {
      let shown = 0;
      projects.forEach(p => {
        const show = matches(p);
        p.classList.toggle('is-hidden', !show);
        if (!show) return;
        p.classList.add('is-visible');
        // Les projets affichés apparaissent en fondu, avec un léger décalage (6 cartes max)
        if (!reduceMotion) p.animate(
          [{ opacity: 0, transform: 'scale(.97)' }, { opacity: 1, transform: 'none' }],
          { duration: 220, easing: EASE, delay: Math.min(shown, 5) * 40, fill: 'backwards' }
        );
        shown++;
      });
    };

    const leaving = [...projects].filter(p => !p.classList.contains('is-hidden') && !matches(p));
    if (reduceMotion || !leaving.length) return apply();
    // Les projets masqués s'effacent rapidement avant que la grille ne se réorganise
    leaving.forEach(p => p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 150, easing: 'ease-out', fill: 'forwards' }));
    filterTimer = setTimeout(() => { leaving.forEach(p => p.getAnimations().forEach(a => a.cancel())); apply(); }, 150);
  }));

  /* ---------- Barre e-mail de l'accueil → formulaire de contact ---------- */
  const heroForm = document.getElementById('heroForm');
  const form = document.getElementById('contactForm');
  if (heroForm) heroForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('heroEmail').value.trim();
    form.querySelector('[name="email"]').value = email;
    const target = document.getElementById('contact');
    if (window.lenis) window.lenis.scrollTo(target, { offset: -70 });
    else target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    setTimeout(() => form.querySelector('[name="nom"]').focus({ preventScroll: true }), 900);
  });

  /* ---------- Formulaire de contact ----------
     Les demandes partent directement via Formspree et arrivent dans la boîte e-mail de l'entreprise. */
  const status = document.getElementById('formStatus');
  const CONTACT_EMAIL = 'elmdesign74@gmail.com';
  const FORM_ENDPOINT = 'https://formspree.io/f/mgakdrod';
  // Affiche le message sous le formulaire avec un fondu (relancé à chaque nouveau message)
  const showStatus = (text, success) => {
    status.textContent = text;
    status.classList.toggle('is-success', success);
    status.classList.remove('is-shown');
    void status.offsetWidth;
    status.classList.add('is-shown');
  };
  const submitBtn = form.querySelector('button[type="submit"]');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll('[required]').forEach(f => {
      const ok = f.type === 'email' ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim()) : f.value.trim() !== '';
      f.classList.toggle('is-invalid', !ok);
      if (!ok) valid = false;
    });
    if (!valid) { showStatus('Merci de remplir tous les champs correctement.', false); return; }
    const d = new FormData(form);
    d.append('_subject', `Demande de devis — ${d.get('type')} — ${d.get('nom')}`);
    const label = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi en cours…';
    try {
      const res = await fetch(FORM_ENDPOINT, { method: 'POST', body: d, headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error('Formspree ' + res.status);
      showStatus('Merci ! Votre demande a bien été envoyée. Nous vous répondons rapidement.', true);
      form.reset();
    } catch (err) {
      showStatus(`L’envoi n’a pas abouti. Écrivez-nous directement à ${CONTACT_EMAIL}.`, false);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = label;
    }
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
