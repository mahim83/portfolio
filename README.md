# Mahim Katiyar — Portfolio Website

**Live site:** [mahim-katiyar.vercel.app](https://mahim-katiyar.vercel.app/)

Personal portfolio of Mahim Katiyar — Machine Learning Engineer, Generative AI Developer, and Backend Developer. Final-year Computer Engineering student at Thapar Institute of Engineering and Technology.

## Features

- Dark theme by default with a light-mode toggle (choice saved across visits)
- Animated hero with a typewriter role line
- Scrollspy navigation and scroll-reveal animations
- 14 projects — five detailed cards plus a "More from GitHub" grid, all with repo and live-demo links
- Experience, skills, education, and campus leadership sections
- Reading-progress bar, staggered scroll reveals, and an animated hero stat strip
- "Write to me" contact form
- Fully responsive — works on phones down to 320px wide
- Respects `prefers-reduced-motion` for accessibility
- No build step and no frameworks — plain HTML, CSS, and JavaScript (webfonts from Google Fonts)

## Tech Stack

- **HTML5** — semantic markup
- **CSS3** — custom properties (design tokens), grid/flexbox, theme switching
- **Fraunces / Inter / JetBrains Mono** via Google Fonts
- **Vanilla JavaScript** — IntersectionObserver, localStorage, no frameworks

## Project Structure

```
├── index.html                   # Markup
├── css/styles.css               # Design system & all styling
├── js/script.js                 # Theme toggle, typewriter, scrollspy, progress, form
└── Mahim_Katiyar_Resume.pdf     # Downloadable résumé
```

## Run Locally

No build step needed — just open `index.html` in a browser, or serve the folder:

```bash
python -m http.server 8000
# then visit http://localhost:8000
```

## Deployment

Deployed on [Vercel](https://vercel.com). Every push to `main` redeploys the live site automatically.
