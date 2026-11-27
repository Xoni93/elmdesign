/* ELM Design — interactions du site (template NEXUS + fonctions validées) */
(() => {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ------------------------------------------------------------------
     1. Vidéo de fond (validée) : pause quand l'onglet est caché
  ------------------------------------------------------------------ */
  const video = $('#bgVideo video');
  if (video) {
    if (reduceMotion) { video.removeAttribute('autoplay'); video.pause(); }
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) video.pause(); else if (!reduceMotion) video.play().catch(() => {});
    });
  }

  /* ------------------------------------------------------------------
     2. Réseau de particules par-dessus la vidéo (template)
  ------------------------------------------------------------------ */
  const canvas = $('#bg-canvas');
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext('2d');
    let particles = [], W = 0, H = 0, dpr = 1, running = true;
    const mouse = { x: null, y: null, radius: 140 };

    class Particle {
      constructor() {
        this.x = Math.random() * W; this.y = Math.random() * H;
        this.size = Math.random() * 1.8 + 0.6;
        this.vx = (Math.random() - 0.5) * 0.45; this.vy = (Math.random() - 0.5) * 0.45;
        this.color = Math.random() > 0.5 ? 'rgba(139, 92, 246, 0.55)' : 'rgba(6, 182, 212, 0.55)';
      }
      update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > W) this.vx *= -1;
        if (this.y < 0 || this.y > H) this.vy *= -1;
        if (mouse.x !== null) {
          const dx = mouse.x - this.x, dy = mouse.y - this.y, dist = Math.hypot(dx, dy);
          if (dist < mouse.radius && dist > 0) {
            const force = (mouse.radius - dist) / mouse.radius;
            this.x -= (dx / dist) * force * 1.5; this.y -= (dy / dist) * force * 1.5;
          }
        }
      }
      draw() { ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fillStyle = this.color; ctx.fill(); }
    }
    const init = () => {
      particles = [];
      const count = Math.min(Math.floor((W * H) / 16000), 85);
      for (let i = 0; i < count; i++) particles.push(new Particle());
    };
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth || innerWidth; H = canvas.clientHeight || innerHeight; // taille CSS réelle (100lvh)
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      init();
    };
    const frame = () => {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]; p.update(); p.draw();
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j], dist = Math.hypot(p.x - q.x, p.y - q.y);
          if (dist < 130) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(120, 140, 220, ' + (0.14 * (1 - dist / 130)) + ')';
            ctx.lineWidth = 0.8; ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
      }
      requestAnimationFrame(frame);
    };
    let lastW = innerWidth;
    addEventListener('resize', () => { if (innerWidth !== lastW || Math.abs(canvas.clientHeight - H) > 1) { lastW = innerWidth; resize(); } }); // la barre d'adresse mobile ne change pas 100lvh : pas de réinitialisation en défilant
    if (finePointer) {
      addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
      document.addEventListener('mouseleave', () => { mouse.x = mouse.y = null; });
    }
    document.addEventListener('visibilitychange', () => {
      running = !document.hidden; if (running) requestAnimationFrame(frame);
    });
    resize(); frame();
  }

  /* ------------------------------------------------------------------
     3. Menu mobile (Échap et toucher extérieur ferment le menu)
  ------------------------------------------------------------------ */
  const menuBtn = $('#mobile-menu-btn'), menu = $('#mobile-menu');
  if (menuBtn && menu) {
    const setMenu = (open) => {
      menu.classList.toggle('hidden', !open);
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
      menuBtn.querySelector('i').className = open ? 'fa-solid fa-xmark text-lg' : 'fa-solid fa-bars text-lg';
    };
    menuBtn.addEventListener('click', () => setMenu(menu.classList.contains('hidden')));
    $$('.mobile-link').forEach((a) => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
    document.addEventListener('pointerdown', (e) => {
      if (!menu.classList.contains('hidden') && !menu.contains(e.target) && !menuBtn.contains(e.target)) setMenu(false);
    });
  }

  /* ------------------------------------------------------------------
     4. Machine à écrire (validée : briller / grandir / rayonner / décoller)
  ------------------------------------------------------------------ */
  const tw = $('#typewriter-text');
  if (tw && !reduceMotion) {
    const WORDS = ['briller', 'grandir', 'rayonner', 'décoller'];
    // Le mot s'écrit juste après « Des sites qui font » (titre animé lettre par lettre)
    const TYPE_MS = 45, DELETE_MS = 30, HOLD_MS = 2200, START_MS = 950; // même rythme que les titres (45 ms par lettre)
    let w = 0, c = 0, deleting = false;
    tw.textContent = '';
    const tick = () => {
      if (document.hidden) { setTimeout(tick, 500); return; }
      const word = WORDS[w];
      c += deleting ? -1 : 1;
      tw.textContent = word.slice(0, c);
      let delay = deleting ? DELETE_MS : TYPE_MS;
      if (!deleting && c === word.length) { delay = HOLD_MS; deleting = true; }
      else if (deleting && c === 0) { deleting = false; w = (w + 1) % WORDS.length; delay = 400; }
      setTimeout(tick, delay);
    };
    setTimeout(tick, START_MS);
  }

  /* ------------------------------------------------------------------
     5. Inclinaison 3D + bordure lumineuse (souris uniquement)
  ------------------------------------------------------------------ */
  if (finePointer && !reduceMotion) {
    $$('.tilt-card').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        card.style.setProperty('--mouse-x', x + 'px');
        card.style.setProperty('--mouse-y', y + 'px');
        const rx = ((y - r.height / 2) / (r.height / 2)) * -6, ry = ((x - r.width / 2) / (r.width / 2)) * 6;
        card.style.transform = 'perspective(1000px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) scale3d(1.01, 1.01, 1.01)';
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ------------------------------------------------------------------
     6. Apparition au défilement + ligne de la méthode
  ------------------------------------------------------------------ */
  const line = $('#process-line-bar');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add('active');
      if (line && en.target.closest('#process-container')) line.style.width = '100%';
      io.unobserve(en.target);
    });
  }, { threshold: 0.15 });
  $$('.reveal').forEach((el) => io.observe(el));

  /* ------------------------------------------------------------------
     7. Notification
  ------------------------------------------------------------------ */
  const toast = $('#toast-notification');
  let toastTimer;
  const showToast = (title, msg) => {
    $('#toast-title').textContent = title;
    $('#toast-message').textContent = msg;
    toast.classList.remove('translate-y-24', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.add('translate-y-24', 'opacity-0');
      toast.classList.remove('translate-y-0', 'opacity-100');
    }, 4500);
  };

  /* ------------------------------------------------------------------
     8. Simulateur sans prix : préremplit la demande de devis
  ------------------------------------------------------------------ */
  const typeBtns = $$('.sim-type-btn');
  const features = $$('#sim-features input[type="checkbox"]');
  const slider = $('#sim-timeline');
  const SPEED = { 1: 'Rapidement', 2: 'Dans les prochains mois', 3: 'Pas pressé' };
  const SPEED_SHORT = { 1: 'Rapidement', 2: 'Prochains mois', 3: 'Pas pressé' };
  let selectedType = 'Site vitrine';

  const refresh = () => {
    const n = features.filter((f) => f.checked).length;
    $('#recap-type-big').textContent = selectedType;
    $('#recap-count').textContent = n === 0 ? 'Aucune' : n + ' option' + (n > 1 ? 's' : '');
    $('#sim-timeline-label').textContent = SPEED[slider.value];
    $('#recap-speed').textContent = SPEED_SHORT[slider.value];
  };
  typeBtns.forEach((btn) => btn.addEventListener('click', () => {
    typeBtns.forEach((b) => { b.classList.toggle('is-active', b === btn); b.setAttribute('aria-checked', String(b === btn)); });
    selectedType = btn.dataset.type;
    refresh();
  }));
  features.forEach((f) => f.addEventListener('change', refresh));
  slider && slider.addEventListener('input', refresh);
  refresh();

  const goTo = (target) => {
    if (window.lenis) window.lenis.scrollTo(target, { offset: -90 });
    else target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  };
  $('#apply-estimate-btn')?.addEventListener('click', () => {
    const chosen = features.filter((f) => f.checked).map((f) => f.dataset.name);
    const select = $('#type');
    if (select) select.value = selectedType;
    $('#message').value =
      'Bonjour ELM Design,\n\n' +
      'Je souhaite un projet de type « ' + selectedType + ' ».\n' +
      'Fonctionnalités envisagées : ' + (chosen.length ? chosen.join(', ') : 'à définir ensemble') + '.\n' +
      'Délai : ' + SPEED[slider.value].toLowerCase() + '.\n\n' +
      'Pouvez-vous me recontacter pour en parler ?';
    goTo($('#contact'));
    showToast('Demande préparée !', 'Ajoutez votre nom et votre e-mail pour l’envoyer.');
  });

  /* ------------------------------------------------------------------
     9. Formulaire de contact → Formspree (validé)
  ------------------------------------------------------------------ */
  const FORM_ENDPOINT = 'https://formspree.io/f/mgakdrod';
  const CONTACT_EMAIL = 'elmdesign74@gmail.com';
  const form = $('#contact-form'), status = $('#formStatus');
  if (form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const showStatus = (text, ok) => {
      status.textContent = text;
      status.className = 'text-sm min-h-[1.25rem] ' + (ok ? 'text-emerald-400' : 'text-rose-400');
    };
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        showStatus('Merci de remplir tous les champs correctement.', false);
        form.reportValidity();
        return;
      }
      const d = new FormData(form);
      d.append('_subject', 'Demande de devis — ' + d.get('type') + ' — ' + d.get('nom'));
      const label = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Envoi en cours…</span>';
      try {
        const res = await fetch(FORM_ENDPOINT, { method: 'POST', body: d, headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error('Formspree ' + res.status);
        showStatus('Merci ! Votre demande a bien été envoyée. Nous vous répondons rapidement.', true);
        showToast('Merci ' + (d.get('nom') || '') + ' !', 'Votre demande a bien été envoyée.');
        form.reset();
      } catch (err) {
        showStatus('L’envoi n’a pas abouti. Écrivez-nous directement à ' + CONTACT_EMAIL + '.', false);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = label;
      }
    });
  }

  /* ------------------------------------------------------------------
     10. Barre de navigation plus compacte en défilant + année
  ------------------------------------------------------------------ */
  const navbar = $('#navbar');
  const onScroll = () => { const s = scrollY > 40; navbar.classList.toggle('py-2', s); navbar.classList.toggle('py-4', !s); };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
