# Mahim Katiyar — Portfolio Website

**Live site:** [mahim-katiyar.vercel.app](https://mahim-katiyar.vercel.app/)

Personal portfolio of Mahim Katiyar — Software Engineer, Backend Developer, and Machine Learning enthusiast. Final-year Computer Engineering student at Thapar Institute of Engineering and Technology.

## Features

- Dark theme by default with a light-mode toggle (choice saved across visits)
- Animated hero with a typewriter role line
- Scrollspy navigation and scroll-reveal animations
- Projects, experience, skills, education, and campus leadership sections
- "Write to me" contact form
- Fully responsive — works on phones down to 320px wide
- Respects `prefers-reduced-motion` for accessibility
- Zero dependencies — plain HTML, CSS, and JavaScript

## Tech Stack

- **HTML5** — semantic markup
- **CSS3** — custom properties (design tokens), grid/flexbox, theme switching
- **Vanilla JavaScript** — IntersectionObserver, localStorage, no frameworks

## Project Structure

```
├── index.html        # Markup
├── css/styles.css    # Design system & all styling
├── js/script.js      # Theme toggle, typewriter, scrollspy, form
└── RESUME.pdf        # Downloadable résumé
```

## Run Locally

No build step needed — just open `index.html` in a browser, or serve the folder:

```bash
python -m http.server 8000
# then visit http://localhost:8000
```

## Deployment

Deployed on [Vercel](https://vercel.com). Every push to `main` redeploys the live site automatically.
