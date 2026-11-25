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

  /* ---------- Navigation : fond au scroll + menu mobile ---------- */
  const nav = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const links = document.getElementById('navLinks');

  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 30);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const closeMenu = () => {
    links.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
  };
  burger.addEventListener('click', () => {
    const open = links.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
  });
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

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
     Sans serveur : ouvre la messagerie du visiteur avec le message pré-rempli.
     Pour un envoi direct, branchez un service (Formspree, Netlify Forms, etc.). */
  const status = document.getElementById('formStatus');
  const CONTACT_EMAIL = 'elmdesign74@gmail.com';
  // Affiche le message sous le formulaire avec un fondu (relancé à chaque nouveau message)
  const showStatus = (text, success) => {
    status.textContent = text;
    status.classList.toggle('is-success', success);
    status.classList.remove('is-shown');
    void status.offsetWidth;
    status.classList.add('is-shown');
  };
  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll('[required]').forEach(f => {
      const ok = f.type === 'email' ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim()) : f.value.trim() !== '';
      f.classList.toggle('is-invalid', !ok);
      if (!ok) valid = false;
    });
    if (!valid) { showStatus('Merci de remplir tous les champs correctement.', false); return; }
    const d = new FormData(form);
    const subject = `Demande de devis — ${d.get('type')}`;
    const body = `Nom : ${d.get('nom')}\nE-mail : ${d.get('email')}\nProjet : ${d.get('type')}\n\n${d.get('message')}`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    showStatus('Merci ! Votre messagerie va s’ouvrir pour envoyer la demande.', true);
    form.reset();
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
