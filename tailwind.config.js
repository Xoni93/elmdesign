/* Configuration Tailwind (thème du template NEXUS, adapté à ELM Design).
   La feuille finale est déjà compilée dans css/site.css : aucun build n'est nécessaire pour publier.
   Pour la régénérer après une modification :
   npx tailwindcss@3 -c tailwind.config.js -i css/site.src.css -o css/site.css --minify */
module.exports = {
  content: ['./index.html', './js/**/*.js'],
  darkMode: 'class',
  future: { hoverOnlyWhenSupported: true }, // pas de survol « collé » au toucher sur mobile
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-15px)' } },
      },
    },
  },
};
