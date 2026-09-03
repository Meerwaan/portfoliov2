# Refonte mwn-tech.com : Next.js, « un système en fonctionnement qui s'observe lui-même »

## Contexte

Le site actuel (Create React App, JS, une seule route, données en dur dans `src/Components/Home/Projects/Projects.js`, 18 Mo de PNG, aucune police, pas de mode nuit, `og:image` en 404, JSON-LD avec `ton-pseudo-github`) contredit le CV et sous-vend un ingénieur produit. Le brief joint fixe le positionnement, l'architecture six pages et le système visuel. Ce plan tranche les briques restées ouvertes et décrit la reconstruction complète.

**Décisions prises dans cette session (ne pas rouvrir) :**
- Traduction visuelle du concept : squelette « runbook » (rail de télémétrie réel, études de cas en post-mortem) + immersion par le mouvement et la matière réelle, **pas** de schéma navigable.
- Effet wow : **« l'espace des interfaces »**. Les vraies captures des produits flottent comme des plans dans une scène Three.js que la caméra traverse au scroll (GSAP ScrollTrigger scrub).
- IA : **aucune en phase 1**. La barre de commande fait navigation + recherche locale instantanée, avec un contrat d'interface réservé pour le streaming IA en phase 2.
- Langues : **FR + EN** (`/fr` par défaut, `/en`), hreflang.
- Make My Dry : dans `/lab` seulement, discret, cadré santé comportementale.
- Portrait : **non**, site sans visage.
- Livraison : **tout en une fois, sur la branche `rebuild/next`** de ce repo, bascule du domaine à la fin.

**État du matériel (vérifié sur le disque) :** aucune capture d'interface n'existe dans aucun repo. KastMe = `~/Documents/Projetct-nix` (Next 16, Firebase), Reputap = `~/Documents/saas-nfc` (Next, Prisma, NextAuth, Stripe, multi-tenant, `docs/Cadrage-Projet.md`), Neocortex = `~/Documents/neocortex` + `neocortex-backend` (Electron + Express/Sequelize), Hall of Arts = `~/Documents/hall-of-arts-2k26Front` (seul repo avec de vrais assets UI), MakeMyDry = `~/Documents/MakeMyDry`, Roast My Music ≈ `~/Documents/o2p` + `LetterboxRap_live_interactif`. **Capsule Manufacturing n'est pas sur ce disque** : captures et faits à fournir par Merwan.

## Lecture design (skill design-taste-frontend)

Portfolio d'ingénieur produit pour recruteurs, clients freelance et vitrine SaaS, langage « document d'exploitation » calme et précis, exécution Linear / Vercel / Apple avec une couche 3D scénarisée. Dials : `DESIGN_VARIANCE 7 / MOTION_INTENSITY 7 / VISUAL_DENSITY 4`.

Règles tenues partout : une seule couleur signal, pas d'eyebrow au-dessus de chaque section, pas de numérotation décorative, pas de points colorés décoratifs (le seul point bleu est sémantique), aucun tiret cadratin dans les textes UI, héros tenant dans le viewport, nav une ligne ≤ 72 px, zéro marquee, pas de faux écrans en div (uniquement de vraies captures), pas d'Inter, pas d'Instrument Serif ni Fraunces (serifs par défaut des LLM, à l'opposé du but « identité propre »).

## Stack (pnpm, Node 22)

| Paquet | Rôle |
|---|---|
| `next` 16.x, `react` 19.x, `typescript` 5.x strict | App Router, `proxy.ts`, `experimental.viewTransition` |
| `tailwindcss` 4 + `@tailwindcss/postcss` | tokens en variables CSS via `@theme`, pas de config |
| `next-intl` 4.x | routage `[locale]`, détection dans `proxy.ts`, `alternates`, rendu statique |
| `next-mdx-remote` (`/rsc`), `gray-matter`, `zod` 4 | MDX par locale, frontmatter validé au build (le build échoue sur une fiche invalide) |
| `shiki` + `@shikijs/rehype` | code composé comme de la typographie, HTML au build, zéro JS client |
| `gsap` 3.15 + `@gsap/react` | ScrollTrigger pin/scrub (caméra 3D, schémas DrawSVG), nettoyage via `useGSAP` |
| `motion` (`motion/react`, `LazyMotion`) | micro-interactions et `layout` (filtres), jamais dans le même arbre que GSAP |
| `three`, `@react-three/fiber`, `@react-three/drei` | la scène, drei limité à `useTexture`, `Preload`, `PerformanceMonitor` |
| `cmdk` | palette de commande (Radix Dialog, ARIA combobox), filtre maison |
| `@phosphor-icons/react` | unique famille d'icônes |
| `resend` | formulaire de contact 2 champs côté serveur (remplace EmailJS) |
| `@vercel/analytics` | seul tiers, sans cookie |
| dev : `sharp`, `@lhci/cli`, `@next/bundle-analyzer`, eslint/prettier | pipeline captures, budgets Lighthouse |

**Ne pas ajouter :** fuse.js, framer-motion, contentlayer, @next/mdx, lenis, postprocessing, KTX2, kit UI, lucide, react-parallax, react-typed, globe.gl, emailjs, speed-insights.

## Transition du repo

1. `git checkout -b rebuild/next`. `master` continue de servir le CRA.
2. Vercel : créer un **second projet** sur le même repo (branche de prod `rebuild/next`, preset Next.js, pnpm, Node 22, « expose system env vars » activé pour `VERCEL_GIT_COMMIT_SHA` / `VERCEL_REGION`). Env : `NEXT_PUBLIC_SITE_URL`, `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`. Bascule finale : déplacer le domaine, merger dans `master`, repointer la branche de prod, supprimer l'ancien projet. Retour arrière = redéplacer le domaine.
3. Supprimer : `src/`, `build/`, `public/index.html|manifest.json|robots.txt|sitemap.xml`, `package-lock.json`, `.idea/` (+ gitignore), le `README.md` CRA (réécrit), `.env` local `REACT_APP_*`.
4. Migrer : `public/CV_MerwanLaouini.pdf` (même chemin, liens externes), `public/logoJ.svg` conservé une release, `src/Assets/projects/*.png` → `content/raw-screenshots/<slug>/` (gitignoré), seules les sorties WebP/AVIF ≤ 300 Ko vont dans `public/screens/`.
5. Anciens liens : composant client `LegacyHashRedirect` sur la home (`#portfolio→/work`, `#contact→/contact`, `#about|#resume|#whatido|#myskills→/about`) ; redirects serveur `/index.html→/`, `/logo192.png→/icon.svg`.

## Arborescence cible

```
app/
  layout.tsx                 pass-through ; <html lang> vit dans [locale]/layout.tsx
  icon.svg, apple-icon.png   marque « mwn » en mono
  sitemap.ts, robots.ts, manifest.ts
  api/ping/route.ts          no-store, renvoie { region: VERCEL_REGION ?? 'local' } (mesure RTT)
  api/contact/route.ts       POST zod + Resend + honeypot + rate-limit mémoire
  [locale]/
    layout.tsx               NextIntlClientProvider, setRequestLocale, fonts, script thème no-flash,
                             Nav, TelemetryRail, CommandBar, JSON-LD Person, skip link
    template.tsx             <ViewTransition> (transitions de route)
    page.tsx                 home
    opengraph-image.tsx      (idem sous work/, work/[slug]/, lab/, about/, contact/)
    not-found.tsx, error.tsx ROUTE_NOT_FOUND en mono + champ de commande
    work/page.tsx, work/[slug]/page.tsx (generateStaticParams slugs×locales, CreativeWork JSON-LD)
    lab/page.tsx, about/page.tsx, contact/page.tsx
proxy.ts                     next-intl createMiddleware, / → /fr
i18n/routing.ts, i18n/request.ts, messages/{fr,en}.json (chaînes UI uniquement)
components/
  system/     LiveDot, MonoLabel, Rule, StatusChip, Metric, ThemeToggle
  nav/        Nav (S) + NavClient (C)
  telemetry/  TelemetryRail (S, infos build) + LatencyProbe (C) + RouteContext (C)
  command/    CommandBar (C, cmdk), CommandField (C, input du héros), providers/{navigation,search,actions}.ts,
              ranker.ts, useCommandStore.ts, types.ts (contrat phase 2)
  hero/       NameResolve (C, Motion), Doors (S)
  space/      InterfaceSpace (S wrapper) → SpaceScene (L, R3F, dynamic ssr:false), CameraRig, ScreenPlane,
              Captions (C, overlay DOM), SpaceFallback (S, grille statique), SpaceStrip (C, 2D mobile)
  work/       WorkIndex (C, filtres), WorkRow, CaseHero, Diagram (L, GSAP DrawSVG), ScreenSequence, MetricsTable, NextProject
  mdx/        mdx-components.tsx : Figure, Metric, Callout, Diagram, Code
  transitions/ SharedImage, useViewTransitionName
  motion/     MotionProvider (LazyMotion), InView
  contact/    CopyEmail, ContactForm
content/
  projects/{neocortex,capsule,reputap,kastme}/{meta.json,fr.mdx,en.mdx,diagram.svg}
  lab/{roast-my-music,hall-of-arts,make-my-dry,g2tiktok,...}/{meta.json,fr.mdx,en.mdx}
  about/{fr.mdx,en.mdx,path.json}
  raw-screenshots/           gitignoré
  screens.manifest.json      généré (dimensions, blurDataURL)
lib/
  content/schema.ts, loader.ts (server-only, fs + gray-matter + zod), mdx.ts, search-index.ts
  telemetry/build-info.ts    sha7, buildTime, commitDate, isLocal (fallback LOCAL)
  seo/metadata.ts (buildMetadata(locale, path) avec alternates), jsonld.ts
  theme/theme-script.ts, useTheme.ts
scripts/
  capture.mts                Playwright : Reputap et KastMe en local, 1440×900@2x
  prepare-screenshots.mts    sharp → public/screens/<slug>/<name>-{800,1600,2400}.{webp,avif} + texture 1600 + manifest
  build-search-index.mts     prebuild → public/search-index.{fr,en}.json
public/fonts/                CabinetGrotesk-Variable.woff2, CommitMono-{400,700}.woff2, CabinetGrotesk-Bold.otf (OG)
next.config.ts               env build-time (sha, date commit, build time), images, redirects, headers immutables, viewTransition
lighthouserc.cjs, .github/workflows/ci.yml
```

## Modèle de contenu

`meta.json` porte les faits indépendants de la langue (source unique, pas de dérive FR/EN) ; `fr.mdx` / `en.mdx` portent titre, résumé, one-liner, métriques et le récit.

```ts
Status = 'production' | 'delivered' | 'building'      // /work
LabStatus = 'prototype' | 'active' | 'paused' | 'archived'
Role = 'founder' | 'freelance' | 'employee' | 'study'
Screenshot { src, width, height, alt (≥12 car.), frame: 'browser'|'phone'|'desktop'|'none', blurDataURL? }
Metric { label, value, source (obligatoire, phrase ou URL), asOf 'YYYY-MM' }   // aucune métrique sans source
ProjectMeta { slug, status, role, period{from,to|null}, stack[≤12], links{live?,repo?},
              screenshots[≥1], heroScreenshot, diagram?, order, featured, space?{index,tilt} }
ProjectLocale { title, summary ≤160, oneLiner ≤90, metrics[], keywords[] }
```

Le loader hydrate `width/height/blurDataURL` depuis `screens.manifest.json` (jamais saisis à la main) et lève une erreur avec le chemin du fichier fautif. L'index de recherche est dérivé de ce contenu au `prebuild` (projets, lab, pages, sections `##`), ~15 Ko par langue, chargé à la première ouverture de la palette.

## Système de design

**Tokens** (`@theme`, mode nuit via `[data-theme=dark]` et `prefers-color-scheme` sauf `[data-theme=light]`) :

| Token | Papier (clair) | Exploitation (nuit) |
|---|---|---|
| `--color-paper` / `-2` | `#F6F5F1` / `#FFFFFF` | `#0C0D0F` / `#121316` |
| `--color-ink` / `-2` / `-3` | `#111210` / `#4B4B47` / `#6F6F69` | `#ECEBE6` / `#A5A49E` / `#7C7C76` |
| `--color-rule` / `-strong` | `#DDDCD6` / `#B9B8B1` | `#232428` / `#34353A` |
| `--color-signal` / `-soft` | `#0A5BFF` / 10 % | `#3B82FF` / 14 % |

Le bleu signal sert uniquement à : LiveDot, état actif (nav, filtres, ligne sélectionnée de la palette), focus ring, liens au survol, valeurs de métriques vivantes.

**Typo** : display et corps **Cabinet Grotesk** variable (Fontshare, gratuite, auto-hébergée ; grotesque avec du caractère, pas Inter). Mono **Commit Mono** (OFL, accents FR, excellente à 12-14 px). Échelle fluide : display `clamp(3.5rem, 9vw, 8rem)`, h2 `clamp(2.5rem, 5vw, 4.5rem)`, corps `1.0625rem/1.55`, mono `.8125rem`, majuscules, `letter-spacing .04em`. Mesure prose 68ch.

**Rythme** : base 4 px, sections `clamp(4rem, 10vw, 10rem)`, gouttière `clamp(1rem, 4vw, 3rem)`, 12 colonnes max 1440 px. **Rayons** : 2 px (contrôles, chips, code) et 6 px (images, dialogue). **Ombres** : aucune sauf la palette. **Z-index** : rail 10, nav 20, overlay 3D 30, transition 40, palette 50, toast 60.

**Motion** : `120 / 240 / 480 / 900 ms`, `--ease-out cubic-bezier(.2,.7,.2,1)`, GSAP `expo.out`, `scrub 0.8`, tout dans `gsap.matchMedia('(prefers-reduced-motion: no-preference)')`, Motion via `useReducedMotion()`.

**LiveDot** : 8 px, pulsation d'opacité 1,6 s (pas d'échelle, pas de halo), fixe en reduced motion. Uniquement (1) dans le rail quand `/api/ping` a répondu, (2) sur la chip d'une étude de cas en `production`. Jamais ailleurs.

**Lexique** : mono autorisé dans le rail, les lignes méta (rôle / période / stack / statut), métriques et sources, palette, code, labels de formulaire, footer. Interdit dans les titres, le corps, la nav, les boutons. Les termes infra ne décrivent que de l'état réel : `STATUS`, `REGION`, `RTT`, `BUILD`, `DEPLOY`, `LOCAL`. `NODE_0x` sert une fois : identifiant de chaque plan 3D, repris sur la ligne correspondante de `/work`.

## Composition page par page

Familles de mise en page : **A** pleine largeur typographique, **B** deux colonnes 5/7 asymétriques, **C** lignes éditoriales / table, **D** section épinglée scrubbée, **E** grille média, **F** colonne prose, **G** aside collant + contenu.

**`/`** : 1) Héros (A, `100svh - nav`) : `NameResolve` (le nom est rendu côté serveur en texte final ; au client, Motion fond une version mono vers la version display en 900 ms, une fois, jamais de « typing »), une phrase, `CommandField` (vrai `<input>` ouvrant la palette), trois portes Work / Lab / Contact séparées par des filets avec une méta mono chacune. Mobile : portes empilées, nom en h2. 2) **Espace des interfaces** (D, épinglé 320 vh). 3) Systèmes (C, 4 `WorkRow` : titre / rôle / statut / période / stack, filet bleu au survol, fade-up en entrée). 4) Comment je travaille (B, sans motion). 5) Maintenant (G : CDI / freelance / SaaS, une ligne de disponibilité mono). 6) Footer (C, ligne de télémétrie complète, liens, langue).

**`/work`** : en-tête compact (A) avec filtres rôle / statut en boutons texte `aria-pressed`, état dans `?role=&status=` via `replaceState` (page reste statique) ; index (C desktop avec colonne image du projet survolé, E mobile) avec Motion `layout` au filtrage ; teaser lab (B).

**`/work/[slug]`** : `CaseHero` (B : titre, one-liner, table méta mono, capture héro portant `view-transition-name: screen-{slug}`) → Contexte (F) → `Diagram` (D, épinglé 160 vh, SVG tracé au scrub dans l'ordre des chemins, labels qui apparaissent ; mobile : tracé une fois à l'entrée ; RM : statique) → Décisions (F, code Shiki, `Callout`) → Écrans (E, pleine largeur, décalages 12/8 colonnes alternés) → Résultats (C, `MetricsTable` valeur / label / source / date) → `NextProject` (A).

**`/lab`** : intro plus libre (A) ; journal antéchronologique (C) avec chip `LabStatus`, `myRole`, 3 à 8 phrases, une image max, liens ; notes d'automatisation G2TikTok en bloc code-typographie (F). Make My Dry y figure sans mise en avant.

**`/about`** : énoncé (A) ; parcours (C : année mono, rôle, organisation, une ligne) ; ce que je cherche (B) ; stack en listes groupées Front / Mobile / Back / Data / Infra sans logos (F) ; lien CV.

**`/contact`** : email en très grand avec `CopyEmail` (`COPIED` en mono 1,2 s) ; LinkedIn / GitHub / Malt + disponibilité + heure locale Europe/Paris réelle (hydratée) ; `ContactForm` email + message, masqué au build si `RESEND_API_KEY` absent.

## Espace des interfaces (3D)

- `InterfaceSpace` (serveur) rend la section, l'overlay de légendes DOM et `<Suspense fallback={<SpaceFallback/>}>` autour de `next/dynamic(() => import('./SpaceScene'), { ssr:false })`. Le fallback est la composition statique des mêmes images en `next/image` : c'est ce que voient le SSR, le reduced motion, l'absence de WebGL et le mobile, donc le HTML servi contient toujours les captures. Import déclenché par `IntersectionObserver` (`rootMargin 100%`) après `readyState === 'complete'`.
- Scène : `<Canvas dpr={[1,1.5]} frameloop="demand" gl={{antialias:false, alpha:true}} camera={{fov:38}}>`. Un `ScreenPlane` par capture (`planeGeometry` au ratio du manifest, `meshBasicMaterial` non éclairé, texture drei `useTexture` en sRGB, anisotropy 4). Plans posés sur un S doux le long de -Z (z = 0, -3, -6…), décalages x alternés, `tilt` ≤ 8°. `CameraRig` : `CatmullRomCurve3` passant 1,6 unité devant chaque plan ; `ScrollTrigger.create({ trigger, pin:true, start:'top top', end:'+=320%', scrub:0.8, onUpdate: st => { progressRef.current = st.progress; invalidate() } })` dans `useGSAP` + `gsap.matchMedia` ; `useFrame` lerpe position et `lookAt`. Rien ne rend quand le scroll est immobile.
- Légendes : overlay DOM `position: sticky`, opacité pilotée par la même progression (texte sélectionnable, lisible par les lecteurs d'écran, chaque légende contient le vrai `<Link>`). Canvas `aria-hidden`.
- Budget : ≤ 6 plans, textures 1600×1000 WebP q78 ≤ 220 Ko chacune (≤ 1,3 Mo, chargées après le LCP), DPR ≤ 1,5, pas de lumière ni post-process, chunk three ≤ 190 Ko gz, `PerformanceMonitor onDecline` → DPR 1.
- Fallbacks : reduced motion → `SpaceFallback` ; pointeur grossier, < 768 px ou `deviceMemory ≤ 4` → `SpaceStrip` (scroll-snap horizontal 2D des mêmes images) ; échec WebGL2 → `SpaceFallback`. Interrupteur `NEXT_PUBLIC_SPACE=off`.
- Passage vers `/work/[slug]` : au clic, projeter le plan en rectangle écran (`getWorldPosition` → `camera.project`), monter un `<img>` DOM à cet emplacement avec `view-transition-name: screen-{slug}`, puis `router.push` : le navigateur morphe le proxy vers l'image héro. Sur les fallbacks, l'image `next/image` porte le nom directement.
- Préparation des captures : 1440×900 @2x pour le web, 1179×2556 pour le mobile, Electron @2x ; thème clair du produit, données réelles anonymisées, aucun curseur. Cadre appareil fait en CSS/3D (filet 1 px + 6 px de rayon), jamais dans le bitmap.

## Barre de commande

- `cmdk` dans son Radix Dialog, monté une fois dans `[locale]/layout.tsx`, `shouldFilter={false}`. Le `CommandField` du héros pré-remplit la requête et ouvre la palette.
- Clavier : `⌘K` / `Ctrl+K`, `/` focus (ignoré dans un champ), `Esc`, `↑↓`, `Entrée`, `⌘1..6` vers les routes.
- Grammaire : `>` = actions (`> night`, `> day`, `> en`, `> fr`, `> copy email`, `> cv`, `> top`) ; `go ` = navigation (`go work`, `go reputap`) ; texte libre = recherche (titre, mots-clés, stack, sous-titre, corps) ; `?` réservé à la phase 2.
- Classement maison (< 80 lignes) : normalisation NFD sans accents, score `12·titreExact + 8·préfixeTitre + 5·motClé + 4·stack + 3·sousTitre + 1·corps`, égalités par type (projet > page > lab > section) puis `order`.
- Rendu : groupes Systèmes / Lab / Pages / Actions, lignes-cartes (titre display, sous-titre, méta mono `PRODUCTION`, `2025`, `→ /work`). État vide : `NO_MATCH` + trois portes. Jamais un fil de chat.
- Accessibilité : focus trap, `aria-modal`, combobox/listbox/option, `aria-live` pour le nombre de résultats, retour du focus à l'ouvreur.
- Contrat phase 2 (`command/types.ts`, livré, inutilisé) : `CommandProvider { id, priority, matches(query, ctx), run(query, ctx, signal): CommandResult | AsyncIterable<CommandEvent> }`, `CommandEvent = chunk | citation | done | error`. La palette sait déjà rendre un provider streamé dans une `AnswerCard` qui grandit en place.

## Rail de télémétrie

- Build : `next.config.ts` injecte `NEXT_PUBLIC_BUILD_TIME`, `NEXT_PUBLIC_COMMIT_SHA` (`VERCEL_GIT_COMMIT_SHA` ou `git rev-parse --short HEAD`, sinon `LOCAL`), `NEXT_PUBLIC_COMMIT_DATE` (`git log -1 --format=%cI`, try/catch). `TelemetryRail` (serveur) les rend en HTML statique.
- Runtime : `LatencyProbe` (client) appelle `/api/ping` au montage puis toutes les 60 s onglet visible, mesure le RTT avec `performance.now()`, reçoit la vraie `VERCEL_REGION` de la fonction. Avant réponse : `STATUS: PROBING`, point creux ; après : `STATUS: LIVE`, point plein, `RTT 41ms`, `REGION cdg1` ; échec : `STATUS: DEGRADED`. Dev : `LOCAL`.
- Affichage : desktop, rail fixe bas 32 px mono `STATUS · REGION · RTT · BUILD sha7 · DEPLOY 2026.09 · thème · langue` ; mobile, condensé en haut à droite de la nav et complet dans le footer. `RouteContext` change le slot gauche selon la route : `ENTRY`, `INDEX · 4 SYSTEMS`, `NODE_03 · PRODUCTION`, `LAB`, `CONTACT · Europe/Paris 18:42`.

## Transitions, i18n, SEO, accessibilité

- **Transitions** : `experimental.viewTransition` + `<ViewTransition>` dans `template.tsx` (fondu 240 ms) et éléments partagés nommés `screen-{slug}` (ligne `/work`, proxy 3D, `CaseHero`). Tout isolé dans `components/transitions/` ; repli `next-view-transitions` si le flag pose problème (deux fichiers à changer). Navigateurs sans support : coupe franche.
- **i18n** : `defineRouting({ locales:['fr','en'], defaultLocale:'fr', localePrefix:'always' })`, `proxy.ts` (`/` → `/fr` ou `Accept-Language`, cookie `NEXT_LOCALE`), `setRequestLocale` + `generateStaticParams` partout (tout statique), slugs indépendants de la langue, `> en` / `> fr` et le rail appellent `router.replace(pathname, { locale })`, `alternates` canonical / fr / en / x-default sur chaque route et dans `sitemap.ts`. Repli : si `en.mdx` manque, corps FR + ligne mono `EN VERSION PENDING`.
- **SEO / perf** : LCP = h1 texte partout sauf `/work/[slug]` (capture héro `priority`, AVIF) ; `next/font/local` swap + preload Cabinet variable et Commit 400, latin + latin-ext ; `next/image` AVIF/WebP, `deviceSizes [640,828,1200,1600,2400]` ; budgets gz : first-load partagé ≤ 110 Ko, chunk 3D ≤ 190 Ko lazy, palette ≤ 30 Ko lazy, GSAP ≤ 38 Ko chargé par route, Motion ≤ 6 Ko ; `generateMetadata` partout (`'%s · Merwan Laouini'`, OG + `summary_large_image`), `opengraph-image.tsx` 1200×630 par route et par langue (police OTF statique pour Satori, statut et période réels) ; JSON-LD `Person` (sameAs LinkedIn/GitHub réels) + `SoftwareApplication`/`CreativeWork` + `BreadcrumbList` par étude ; `robots.ts`, `sitemap.ts` (20 URL avec alternates, `lastModified` depuis git) ; headers immutables sur `/screens` et `/fonts` ; `/api/*` no-store ; un seul tiers (Vercel Analytics).
- **Accessibilité** : skip link, landmarks, un h1 par page, focus visible bleu 2 px partout, filtres et thème en `<button aria-pressed>` avec texte, reduced motion sur GSAP / Motion / View Transitions / LiveDot / résolution du nom / 3D, contrastes vérifiés dans les deux thèmes (ink-3 ≥ 4,6:1, signal ≥ 4,9:1), alt décrivant ce que fait l'écran, SVG de schéma avec `<title>`/`<desc>` + liste textuelle masquée, formulaire avec labels visibles et erreurs liées.

## Jalons

| Jalon | Contenu | Définition de fini |
|---|---|---|
| **M0 Socle** | branche, Next 16 + TS strict + Tailwind 4 tokens + polices + next-intl + Nav + TelemetryRail (build + ping + RTT) + thème no-flash + projet Vercel + doc de design commité dans `docs/superpowers/specs/2026-09-02-portfolio-rebuild-design.md` | `/fr` et `/en` rendent le héros dans les deux thèmes, le rail affiche sha / région / RTT réels en preview et `LOCAL` en dev, `pnpm build` vert, Lighthouse ≥ 95 sur la coquille |
| **M1 Contenu + /work + Reputap** | schéma, loader, MDX + Shiki, scripts capture / préparation, `/work` filtrable, `/work/reputap` complet FR + EN (schéma tracé, métriques sourcées, OG, JSON-LD) | build échoue sur un `meta.json` invalide ; `curl` trouve corps, OG, hreflang, JSON-LD ; transition ligne → héro OK dans Chrome |
| **M2 Palette** | cmdk, providers, ranker, index, `CommandField`, `> night`, `> en`, contrat phase 2 | parcours clavier complet, axe propre, index ≤ 20 Ko |
| **M3 Scène 3D** | scène, courbe caméra, scrub, légendes, fallbacks, proxy de transition | 60 fps sur MacBook M1 DPR 1,5, ≥ 45 fps Android milieu de gamme sur le strip, LCP < 1,8 s inchangé, chunk ≤ 190 Ko, aucune fuite de contexte WebGL au changement de route |
| **M4 Pages restantes** | Neocortex, Capsule, KastMe, `/lab`, `/about`, `/contact` + Resend, 404 / error, redirect des anciens hash | toutes les routes dans les deux langues, email de contact reçu, aucun texte placeholder |
| **M5 SEO / OG / perf** | OG par route, sitemap / robots, headers, analyse de bundle, audit images et polices | LHCI ≥ 0,95 sur 6 routes × 2 langues, budgets respectés |
| **M6 QA + bascule** | matrice ci-dessous, vrais appareils, validation hreflang / JSON-LD / OG, déplacement du domaine, merge dans `master`, suppression de l'ancien projet | Lighthouse prod ≥ 95 ×4 mobile et desktop, zéro erreur console, `/#portfolio` atterrit sur `/fr/work` |

M1, M2 et M3 sont parallélisables après M0 (sessions ou agents distincts). Le travail de contenu de Merwan court en parallèle de M0 à M3.

## Ce que Merwan doit fournir (en parallèle)

- [ ] **Reputap** : lancer `saas-nfc` en local avec un tenant de démo, 5 captures 1440×900@2x (page publique scan, résultat roue / ticket, validations marchand, dashboard marchand, console super-admin). Confirmer date de lancement, nombre d'établissements (avec source et date), modèle de prix, Stripe en prod ou non, rôle et statut.
- [ ] **KastMe** : 4 captures (galerie publique, éditeur, dashboard, home marketing) + 1 mobile 1179×2556 de la sphère. Confirmer date de prod, utilisateurs (source), statut.
- [ ] **Neocortex** : 3 captures Electron @2x anonymisées (parcours de bilan, résultats / export PDF, liste patients). Confirmer client (ou « cabinet de neuropsychologie »), date de livraison, usage réel, autorisation de montrer l'interface, un résultat mesurable sourcé.
- [ ] **Capsule Manufacturing** : 4 à 6 captures ≥ 1600 px thème clair, stack, période, rôle, autorisation client, 1 à 2 métriques sourcées, un croquis d'architecture.
- [ ] **Lab** : Hall of Arts (2 captures téléphone, ta part exacte, équipe, année), Make My Dry (2 captures, statut, pas de claim médical), Roast My Music (1 à 2 captures, statut honnête), G2TikTok (2 captures ; le chiffre « 1M de vues » a besoin d'une source datée ou disparaît).
- [ ] **Textes FR** (EN traduit ensuite) : phrase de positionnement, « comment je travaille » (3 paragraphes courts), « maintenant » (dispo CDI / freelance / SaaS), parcours (`about/path.json`), groupes de stack.
- [ ] URL LinkedIn, handle GitHub, Malt (optionnel), email à publier, domaine expéditeur Resend vérifié (DNS `mwn-tech.com`).
- [ ] Un schéma d'architecture par étude de cas (liste boîtes + flèches suffit ; converti en `diagram.svg` avec ids ordonnés).

## Vérification

- Commandes : `pnpm typecheck`, `pnpm lint`, `pnpm build` (toutes les routes `○ Static` sauf `/api/*`), `pnpm start && pnpm dlx @lhci/cli autorun` (`lighthouserc.cjs` : catégories ≥ 0,95, LCP ≤ 2000 ms, TBT ≤ 150 ms, CLS ≤ 0,05, 12 URL, preset mobile), `ANALYZE=true pnpm build`, spec Playwright fumée (ouvrir la palette, `> night`, ligne → étude de cas).
- HTML servi : `curl -s <preview>/fr/work/reputap | grep` sur une phrase du corps MDX, `hreflang="en"`, `og:image`, `twitter:card`, `application/ld+json` ; `curl -sI /api/ping` → `no-store` ; `/sitemap.xml` liste 20 URL avec alternates ; `/robots.txt`.
- Validation : Rich Results Test (Person, CreativeWork + Breadcrumb), réciprocité hreflang + x-default, LinkedIn Post Inspector pour l'OG, axe DevTools sur chaque route dans les deux thèmes, WebPageTest profil Moto G4 sur la home.
- Matrice manuelle : {fr, en} × {clair, nuit, système} × {360, 768, 1024, 1440, 1920} × {motion normale, réduite} × {souris, clavier seul, tactile} ; Chrome, Safari 18 (macOS + iOS), Firefox. À vérifier : héros sans scroll à 360×640 et 1440×900, nav une ligne ≤ 72 px, valeurs du rail réelles, LiveDot ne pulse que si LIVE, aucun décalage au chargement des polices, aucun scroll horizontal, la 3D passe le relais au héro, `> en` garde la même page, retour arrière restaure le scroll.

## Risques

- **3D mobile / bas de gamme** : strip 2D sous 768 px, DPR plafonné, `PerformanceMonitor`, textures lazy ≤ 1,3 Mo, fallback SSR statique, interrupteur `NEXT_PUBLIC_SPACE=off`.
- **Captures** : seules de vraies captures sont admises, la scène ne part pas sans elles ; conçue pour 4 à 6 plans ; données anonymisées.
- **Volume de contenu (4 études × 2 langues)** : faits partagés dans `meta.json`, FR d'abord avec repli EN affiché honnêtement, schéma qui force résumé et métriques sourcées.
- **View Transitions** : isolées, non bloquantes, repli identifié.
- **Env Vercel** : `VERCEL_REGION` uniquement en fonction (d'où `/api/ping`), toggle system env documenté, git shallow géré par try/catch, aucun champ du rail jamais vide.
- **Dérive d'API Next 16** : versions épinglées, `pnpm build` en CI à chaque push.
- **Spam contact** : honeypot + rate-limit + limites zod ; Turnstile seulement si abus (phase 2).
