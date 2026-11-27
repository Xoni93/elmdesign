/* Titres du site (h1 à h6) : effet « machine à écrire » — les lettres apparaissent
   une à une, de gauche à droite, rapides et régulières.
   Tout le mouvement passe par spring-text-engine (ressorts react-spring), sans
   transition ni @keyframes CSS. Le texte courant (paragraphes) reste statique.

   Source compilée dans js/headings.js (aucun build nécessaire pour publier) :
   npm i spring-text-engine@0.1.5 @react-spring/web react react-dom preact esbuild
   npx esbuild js/src/headings.jsx --bundle --minify --format=esm \
     --define:process.env.NODE_ENV=\"production\" \
     --alias:react=preact/compat --alias:react-dom=preact/compat --alias:react/jsx-runtime=preact/jsx-runtime \
     --outfile=js/headings.js
   (React est remplacé par preact/compat, compatible, pour un fichier 3 fois plus léger : 36 Ko compressé) */
import React from "react";
import { createRoot } from "react-dom/client";
import TextEngine from "spring-text-engine";

/* Réglages du prompt — à ne pas modifier */
const LETTER_OUT = { opacity: 0 };
const LETTER_IN = { opacity: 1 };
const LETTER_CONFIG = { tension: 150, friction: 15 };
const LETTER_STAGGER = 90;

/* Dégradé des titres du site (.text-gradient) : #A78BFA → #38BDF8 → #22D3EE */
const STOPS = [[0, [167, 139, 250]], [0.5, [56, 189, 248]], [1, [34, 211, 238]]];
const gradientAt = (t) => {
  for (let i = 1; i < STOPS.length; i++) {
    const [p1, c1] = STOPS[i - 1], [p2, c2] = STOPS[i];
    if (t <= p2) {
      const k = (t - p1) / (p2 - p1 || 1);
      return "rgb(" + c1.map((v, n) => Math.round(v + (c2[n] - v) * k)).join(",") + ")";
    }
  }
  return "rgb(" + STOPS[STOPS.length - 1][1].join(",") + ")";
};

/* Convertit le contenu HTML d'un titre en enfants React :
   texte brut → chaînes ; <span class="text-gradient"> → élément enveloppe (animé mot à mot). */
const toChildren = (el) => {
  const out = [];
  el.childNodes.forEach((node, i) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const txt = node.textContent.replace(/\s+/g, " ");
      if (txt.trim()) out.push(txt);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const txt = node.textContent.replace(/\s+/g, " ").trim();
      if (txt) out.push(React.createElement("span", { key: i, className: node.className }, txt));
    }
  });
  return out;
};

/* Une seule couleur par lettre, prise dans le dégradé selon sa position :
   le dégradé « background-clip: text » ne fonctionne pas sur des lettres séparées. */
const paintGradient = (root) => {
  root.querySelectorAll(".text-gradient").forEach((wrap) => {
    const letters = [...wrap.querySelectorAll(".ste-letter")];
    if (!letters.length) return;
    const rects = letters.map((l) => l.getBoundingClientRect());
    // position le long du texte : lignes successives mises bout à bout
    let acc = 0, prevTop = null, prevRight = 0;
    const pos = rects.map((r) => {
      if (prevTop !== null && Math.abs(r.top - prevTop) > r.height / 2) acc += prevRight;
      prevTop = r.top; prevRight = r.right - rects[0].left;
      return acc + (r.left - rects[0].left) + r.width / 2;
    });
    const total = Math.max(1, pos[pos.length - 1]);
    letters.forEach((l, n) => { l.style.color = gradientAt(pos[n] / total); });
  });
};

const mount = (el) => {
  const children = toChildren(el);
  if (!children.length) return;
  const centered = getComputedStyle(el).textAlign === "center";
  const delay = Number(el.dataset.steDelay || 0);
  el.textContent = "";
  el.classList.add("ste-heading");
  const root = createRoot(el);
  root.render(
    <TextEngine
      tag="span"
      mode="once"
      letterOut={LETTER_OUT}
      letterIn={LETTER_IN}
      letterConfig={LETTER_CONFIG}
      letterStagger={LETTER_STAGGER}
      delayIn={delay}
      letterClassName="ste-letter"
      className={centered ? "justify-center" : undefined}
      style={centered ? { justifyContent: "center" } : undefined}
    >
      {children}
    </TextEngine>
  );
  // couleurs du dégradé, recalculées si la mise en page change
  const repaint = () => requestAnimationFrame(() => paintGradient(el));
  setTimeout(repaint, 50);
  new ResizeObserver(repaint).observe(el);
};

if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const targets = [
    ...document.querySelectorAll("[data-ste]"),
    ...[...document.querySelectorAll("h1, h2, h3, h4, h5, h6")].filter((h) => !h.querySelector("[data-ste]") && !h.closest("[data-ste]")),
  ];
  targets.forEach(mount);
}
