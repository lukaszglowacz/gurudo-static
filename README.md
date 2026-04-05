# Gurudo Landing Page

Production landing page for **Gurudo** — a B2B tech company connecting clients with AI-driven developers for end-to-end product contracts.

Live at: [gurudo.se](https://gurudo.se)

---

## Tech stack

- Static HTML/CSS/JS — no frameworks, no build step required to serve
- SCSS source in `styles/` compiled to `css/styles.css`
- Google Fonts: Syne (display) + DM Mono (mono)
- Firebase Cloud Firestore REST API for contact form submissions
- Deployed via GitHub Pages with a custom domain

---

## Project structure

```
index.html                  Main page (single file, all sections)
css/styles.css              Compiled CSS — this is what the browser loads
js/main.js                  Vanilla JS: navbar, slider, scroll-reveal, etc.
js/firebase-contact.js      Contact form -> Firestore REST API
styles/
  main.scss                 SCSS entry point (@import all partials)
  _variables.scss           SCSS variables (colors, fonts, breakpoints)
  _base.scss                Reset + CSS custom properties + base styles
  _navbar.scss              Navbar + mobile menu
  _hero.scss                Hero section + keyframe animations
  _about.scss               About cards
  _how-it-works.scss        Process steps + contract callout
  _team.scss                Team card
  _testimonials.scss        Testimonials slider
  _contact.scss             Contact form + field styles
  _footer.scss              Footer
assets/
  favicon/                  Favicon files (all sizes)
  og-image/                 Open Graph image
CNAME                       Custom domain for GitHub Pages
.nojekyll                   Disables Jekyll processing on GitHub Pages
robots.txt                  Search engine directives
sitemap.xml                 XML sitemap
```

---

## Running locally

No build step required. Open `index.html` directly in a browser, or serve with any static file server:

```bash
# Python
python3 -m http.server 8080

# Node (npx, no install)
npx serve .

# Node (http-server)
npx http-server -p 8080
```

---

## SCSS compilation

The SCSS source is in `styles/` and compiles to `css/styles.css`. The CSS file is already compiled and committed — you only need to recompile if you edit the SCSS source.

Install Sass:
```bash
npm install -g sass
```

Compile once:
```bash
sass styles/main.scss css/styles.css
```

Watch mode (auto-recompile on save):
```bash
sass styles/main.scss css/styles.css --watch
```

Compressed output for production:
```bash
sass styles/main.scss css/styles.css --style=compressed
```

---

## Firebase contact form setup

The contact form submits to Cloud Firestore via the REST API (no SDK required). Follow these steps:

### 1. Create a Firebase project

1. Go to https://console.firebase.google.com
2. Click "Add project", give it a name (e.g. `gurudo-landing`), continue
3. Disable Google Analytics if not needed, click "Create project"

### 2. Enable Cloud Firestore

1. In the left sidebar: Build -> Firestore Database
2. Click "Create database"
3. Choose "Start in production mode"
4. Select a region close to your users (e.g. `europe-west3` for Stockholm)
5. Click "Enable"

### 3. Set Firestore Security Rules

In the Firestore console, go to the Rules tab and replace the default rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /contacts/{doc} {
      allow create: if request.resource.data.keys()
        .hasAll(['name', 'email', 'type', 'message']);
    }
  }
}
```

Click "Publish".

### 4. Get your credentials

1. Go to Project Settings (gear icon in the top left)
2. Under "Your apps", click the web icon (</>)
3. Register the app (name it anything, e.g. `gurudo-web`)
4. Copy the `projectId` and `apiKey` from the config object shown

### 5. Update js/firebase-contact.js

Open `js/firebase-contact.js` and replace the placeholder values at the top:

```js
var FIREBASE_PROJECT_ID = 'your-actual-project-id';
var FIREBASE_API_KEY    = 'AIzaSy...your-actual-key';
```

### 6. View submissions

In the Firebase console, go to Firestore Database and browse the `contacts` collection. Each form submission creates a new document with fields: `name`, `email`, `type`, `message`, `timestamp`.

---

## GitHub Pages deployment

The site is deployed automatically from the `main` branch via GitHub Pages.

1. Push code to `main`
2. GitHub Pages serves the root of the repo
3. The `CNAME` file sets the custom domain to `gurudo.se`
4. The `.nojekyll` file prevents GitHub from processing the site with Jekyll

To configure GitHub Pages: Repository Settings -> Pages -> Source: "Deploy from a branch" -> Branch: `main` -> folder: `/ (root)`.

---

## Adding team members

To add a new team member, copy this card template inside `.team__grid` in `index.html`:

```html
<div class="team__card reveal">
  <div class="team__card-header">
    <div class="team__avatar" aria-hidden="true">
      AB
      <div class="team__avatar-ring"></div>
    </div>
    <div class="team__card-meta">
      <h3 class="team__name">Full Name</h3>
      <p class="team__role">Role · Specialty</p>
      <p class="team__location">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        City, Country
      </p>
    </div>
  </div>
  <p class="team__bio">Short bio paragraph.</p>
  <div class="team__tags">
    <span class="tag">Skill 1</span>
    <span class="tag">Skill 2</span>
  </div>
  <div class="team__links">
    <a href="https://github.com/handle" target="_blank" rel="noopener noreferrer" class="team__link" aria-label="GitHub">
      <!-- GitHub SVG icon -->
    </a>
  </div>
</div>
```

The `.team__grid` uses `display: flex; justify-content: flex-start` by default. For multiple members in a grid layout, update `.team__grid` in `css/styles.css`:

```css
.team__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(560px, 1fr));
  gap: 20px;
}
```
