# Mahim Katiyar — Portfolio Website

**Live site:** [mahim-katiyar.vercel.app](https://mahim-katiyar.vercel.app/)

Personal portfolio of Mahim Katiyar — Machine Learning Engineer, Generative AI Developer, and Backend Developer. Final-year Computer Engineering student at Thapar Institute of Engineering and Technology.

## Updating the site

**Everything on the page comes from [`data/content.json`](data/content.json). That's the only file you need to touch.** `index.html` is an empty shell, and `js/render.js` builds the page from the JSON at load time — so changing your intro, skills, education, or projects never means editing HTML, CSS, or JavaScript.

After you update your résumé, open `data/content.json` and change the matching fields:

| What changed on your résumé | What to edit |
|---|---|
| Intro / summary | `profile.intro` |
| Job titles in the animated line | `profile.roles` |
| CGPA, graduation year | `stats` |
| Skills | `skills` — each entry is `{ "group": …, "items": [...] }` |
| Internships / roles | `experience` |
| Degrees and marks | `education` |
| Positions of responsibility | `leadership` |
| Email, phone, links | `profile` |

Commit the file and Vercel redeploys automatically. `profile.intro` and the project `body` fields accept `<strong>` and `<em>` if you want to emphasise something.

### Projects update themselves

New public repos appear in the **More from GitHub** grid on their own — the page queries the GitHub API at load time and appends anything it doesn't already know about. You don't have to add a repo for it to show up.

Two knobs in `projects`:

- **`hide`** — repo names that should never appear (coursework, demos, this site itself).
- **`featured` / `archive`** — repos you've written a proper description for. A repo listed here uses your text; a repo that isn't uses its GitHub description, language, and creation date.

So the practical workflow is: push a repo, and **give it a description on GitHub** — that description is what the card shows. Promote it to `archive` or `featured` in the JSON when you want a longer, hand-written blurb.

The "Projects built" and "Live demos" figures in the hero count what's actually on the page, so they stay right on their own.

If the GitHub API is unreachable or rate-limited (60 requests/hour per visitor IP, unauthenticated), the curated projects still render and the section reads normally — discovery is best-effort.

## Features

- Dark theme by default with a light-mode toggle (choice saved across visits)
- Animated hero with a typewriter role line and a stat strip that counts up
- Scrollspy navigation, reading-progress bar, and staggered scroll reveals
- Projects auto-discovered from GitHub, with hand-written cards taking precedence
- "Write to me" contact form
- Fully responsive — works on phones down to 320px wide
- Respects `prefers-reduced-motion` for accessibility
- Degrades sensibly: a `<noscript>` block with contact details, and a readable fallback if `content.json` fails to load

## Tech Stack

- **HTML5** — semantic markup
- **CSS3** — custom properties (design tokens), grid/flexbox, theme switching
- **Fraunces / Inter / JetBrains Mono** via Google Fonts
- **Vanilla JavaScript** — fetch, IntersectionObserver, localStorage, no frameworks

## Project Structure

```
├── index.html            # Shell only — no content lives here
├── data/content.json     # ← every word on the site
├── css/styles.css        # Design system & all styling
└── js/
    ├── render.js         # Builds the page from content.json
    └── script.js         # Theme, typewriter, scrollspy, progress, form
```

## Run Locally

The page fetches `data/content.json`, so it needs to be served over HTTP — opening `index.html` straight from disk will show the fallback message.

```bash
python -m http.server 8000
# then visit http://localhost:8000
```

## Deployment

Deployed on [Vercel](https://vercel.com). Every push to `main` redeploys the live site automatically.
