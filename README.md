<div align="center">

# @mongez/react-helmet

**Document `<head>` manager for React — titles, meta, Open Graph, Twitter cards, canonical URL, and `<html>` attributes via a single `<Helmet>` component.**

[![npm](https://img.shields.io/npm/v/@mongez/react-helmet.svg)](https://www.npmjs.com/package/@mongez/react-helmet)
[![license](https://img.shields.io/npm/l/@mongez/react-helmet.svg)](LICENSE)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@mongez/react-helmet.svg)](https://bundlephobia.com/package/@mongez/react-helmet)
[![downloads](https://img.shields.io/npm/dw/@mongez/react-helmet.svg)](https://www.npmjs.com/package/@mongez/react-helmet)

</div>

---

## Why @mongez/react-helmet?

The original [`react-helmet`](https://github.com/nfl/react-helmet) is feature-complete but no longer maintained — its last release predates React 18 and it ships warnings under StrictMode. [`react-helmet-async`](https://github.com/staylor/react-helmet-async) added an SSR-safe Provider but inherits the same virtual-`<head>` reconciler and registry layer. Next.js's `<Head>` and `export const metadata` are excellent but Next-only.

`@mongez/react-helmet` is the React adapter on top of [`@mongez/dom`](https://github.com/hassanzohdy/dom)'s metadata module — the framework-agnostic core that writes the actual `<title>`, `<meta>`, and `<link>` tags. The React surface is one effect-only `<Helmet>` component that calls those writers directly on the real `document.head`, with no virtual `<head>`, no Provider, and no server-string side bag. Each prop maps to a known set of mirror tags (title pushes to `og:title` / `twitter:title` / `itemprop=name`, image pushes to `og:image` / `twitter:image`, etc.) and unmount restores the pre-mount snapshot.

```tsx
import Helmet from "@mongez/react-helmet";

export default function ArticlePage({ post }) {
  return (
    <>
      <Helmet
        title={post.title}
        description={post.summary}
        keywords={post.tags}
        image={post.coverImage}
      />
      <Article post={post} />
    </>
  );
}
```

---

## Features

| Feature | Description |
|---|---|
| **`<Helmet>` component** | Effect-only, returns `null`. Drop it at any depth in your tree — layout, route, suspense boundary, conditional branch. |
| **Title + app-name suffix** | `document.title = title + appNameSeparator + appName`. Configurable per page or app-wide. |
| **Open Graph + Twitter mirrors** | One `title` writes `og:title` / `twitter:title` / `og:image:alt` / `twitter:image:alt` / `itemprop=name`. Same fan-out for `description` and `image`. |
| **Canonical URL** | `<link rel="canonical">` plus `og:url` / `twitter:url`. Defaults to `window.location.href`; pass a string for A/B variants. |
| **`<html>` attributes / id / class** | `htmlAttributes={{ lang, dir, "data-theme" }}`, `pageId`, and `className` — for RTL, theming, and per-route shells. |
| **Translation hook** | Wire `translationFunction` (e.g. `@mongez/localization`'s `trans`) and titles auto-translate, with per-call opt-out. |
| **App-wide configuration** | `setHelmetConfigurations` for `appName`, `appNameSeparator`, default `htmlAttributes`, and translation; props win when both are set. |
| **Snapshot-and-restore** | Mount snapshots `<html>` attributes / id / class and `@mongez/dom`'s metadata singleton; unmount restores them. |
| **TypeScript-first** | `HelmetProps` and `HelmetConfigurations` exported as types from the package root. |

---

## Installation

```sh
npm install @mongez/react-helmet @mongez/dom
```

```sh
yarn add @mongez/react-helmet @mongez/dom
```

```sh
pnpm add @mongez/react-helmet @mongez/dom
```

Peer dependencies: `react >= 18` and `@mongez/dom >= 1.1.2`.

---

## Quick start

```tsx
import Helmet, { setHelmetConfigurations } from "@mongez/react-helmet";

// 1. Set app-wide defaults once, near your entry.
setHelmetConfigurations({
  appName: "My Online Store",
  appendAppName: true,
  appNameSeparator: " | ",
});

// 2. Drop <Helmet> anywhere in the tree.
function HomePage() {
  return (
    <>
      <Helmet
        title="Home"
        description="Best deals every day."
        keywords={["electronics", "deals", "shop"]}
        image="/og-home.png"
      />
      <HomeContent />
    </>
  );
}

// document.title                                       → "Home | My Online Store"
// <meta name="description" content="Best deals every day.">
// <meta name="keywords" content="electronics,deals,shop">
// <meta property="og:title" content="Home | My Online Store">
// <meta property="og:image" content="/og-home.png">
// <meta property="twitter:title" content="Home | My Online Store">
// <link rel="canonical" href="<window.location.href>">
```

`Helmet` returns `null` — all writes happen in effects on the real `document.head` / `document.documentElement`. Re-rendering with new props re-runs the matching effect; unmount restores the pre-mount snapshot.

---

## The `<Helmet>` component

```ts
import Helmet, { type HelmetProps } from "@mongez/react-helmet";

type HelmetProps = {
  // Required. Writes document.title and mirrors to og:title, og:image:alt,
  // twitter:title, twitter:image:alt, and itemprop=name.
  title: string;

  // App-name suffix controls. Each falls back to the corresponding key in
  // setHelmetConfigurations() when undefined here.
  appName?: string;
  appendAppName?: boolean;          // default: true
  appNameSeparator?: string;        // default: " | "

  // Auto-translate the title via the configured translationFunction.
  translatable?: boolean;           // default: true

  // Page-level meta. Each writes the documented mirror tags.
  description?: string;             // → meta description + og:description + twitter:description + itemprop=description
  keywords?: string | string[];     // → meta keywords (array is joined with ",")
  image?: string;                   // → meta image + og:image + twitter:image + itemprop=image
  url?: boolean | string;           // string → that URL; true → window.location.href; default: true

  // <html> tag controls.
  htmlAttributes?: Record<string, any>;   // attribute bag → .setAttribute on <html>
  pageId?: string;                         // → <html>.id
  className?: string;                      // space-separated → each classList.add'd on <html>
};
```

Only `title` is required. Everything else falls back to the config or simply isn't touched.

### Lifecycle

```
mount
 ├── snapshot <html> attributes / id / className and current @mongez/dom metadata
 ├── title effect           — deps: [title, appName, appNameSeparator, appendAppName]
 ├── pageId effect          — deps: [pageId]
 ├── className effect       — deps: [className]
 ├── htmlAttributes effect  — deps: [htmlAttributes]
 ├── description effect     — deps: [description]
 ├── keywords effect        — deps: [keywords]
 ├── image effect           — deps: [image]
 └── url effect             — deps: [url]

re-render (one of those deps changed)
 └── the matching effect re-runs with the new value

unmount
 └── each effect's cleanup restores the snapshot for its concern
```

The component returns `null`. Place it at any depth — including inside a Suspense boundary, route shell, or a conditional render branch.

> **Browser-only.** The module accesses `document.documentElement` lazily, but every effect runs on the client. For Next.js App Router, place `<Helmet>` under a `"use client"` boundary. For Pages Router or Remix, import via `dynamic(..., { ssr: false })`.

---

## Metadata tags produced

Each prop maps to a fixed set of writes. The underlying writers live in `@mongez/dom`'s `src/metadata.ts`; this table is for quick lookup.

| Prop | Tags written |
|---|---|
| `title` | `document.title`, `meta[property="og:title"]`, `meta[property="og:image:alt"]`, `meta[property="twitter:title"]`, `meta[property="twitter:image:alt"]`, `meta[itemprop="name"]` |
| `description` | `meta[name="description"]`, `meta[itemprop="description"]`, `meta[property="og:description"]`, `meta[property="twitter:description"]` |
| `keywords` | `meta[name="keywords"]` (arrays `.join(",")`'d — no space) |
| `image` | `meta[property="image"]`, `meta[property="og:image"]`, `meta[property="twitter:image"]`, `meta[itemprop="image"]` |
| `url` | `link[rel="canonical"]`, `meta[property="og:url"]`, `meta[property="twitter:url"]` |
| `htmlAttributes` | each entry `.setAttribute`'d on `<html>` |
| `pageId` | `<html>.id` |
| `className` | each whitespace-separated token `classList.add`'d on `<html>` |

When `appendAppName` is true and `appName` is configured (or passed), the value written for `title` is `title + appNameSeparator + appName`.

`url` semantics:

- `url={true}` — uses `window.location.href` (this is the default).
- `url="https://..."` — uses that exact string verbatim, regardless of the current path.
- `url={false}` (or `null` / `""`) — leaves the canonical URL untouched for that page.

---

## App-wide configuration

```ts
import {
  setHelmetConfigurations,
  getHelmetConfigurations,
  getHelmetConfig,
  type HelmetConfigurations,
} from "@mongez/react-helmet";

setHelmetConfigurations({
  // App-name suffix
  appName: "My Online Store",
  appendAppName: true,
  appNameSeparator: " | ",

  // i18n
  translatable: true,
  translateAppName: true,
  translationFunction: (key) => i18n.t(key),

  // Default canonical-url behaviour for every <Helmet>
  url: true,

  // Default <html> attributes / className applied when a per-call value
  // is not supplied.
  htmlAttributes: { lang: "en", dir: "ltr" },
  className: "app-shell",
});
```

```ts
type HelmetConfigurations = {
  appName?: string;
  appendAppName?: boolean;            // default: true
  appNameSeparator?: string;          // default: " | "
  url?: boolean;                      // default: true
  htmlAttributes?: Record<string, any>;
  className?: string;
  translatable?: boolean;             // default: true
  translateAppName?: boolean;         // default: true
  translationFunction?: (key: string) => string;
};
```

`setHelmetConfigurations` shallow-merges with the existing config — call it once at app boot to set defaults, then override per page via `<Helmet>` props.

### Resolution order

For any prop that exists in both `HelmetProps` and `HelmetConfigurations`:

1. The value on the `<Helmet>` prop (if not `undefined`).
2. Otherwise, the value from `getHelmetConfigurations()`.
3. Otherwise, the documented default (e.g. `appendAppName: true`, `appNameSeparator: " | "`).

### Reading the config

```ts
getHelmetConfigurations();                 // → full Partial<HelmetConfigurations>
getHelmetConfig("appName");                // → "My Online Store"
getHelmetConfig("appName", "fallback");    // → "fallback" if appName is unset
```

> **`getHelmetConfig` uses `||` internally.** Any falsy value (`false`, `""`, `0`) falls through to the `defaultValue`. If you depend on `getHelmetConfig("appendAppName")` returning `false`, pass an unambiguous fallback or use `getHelmetConfigurations()` and read the key yourself.

### Translation

When `translatable` is true and a `translationFunction` is configured, the title (and optionally `appName`) is passed through `translationFunction` before being written.

```tsx
import { trans } from "@mongez/localization";
import Helmet, { setHelmetConfigurations } from "@mongez/react-helmet";

setHelmetConfigurations({
  appName: "appName",                  // a translation key
  appendAppName: true,
  translatable: true,
  translateAppName: true,
  translationFunction: trans,
});

// In a route component:
<Helmet title="contactUs" />
// document.title = trans("contactUs") + " | " + trans("appName")
```

The component honours both the per-call `translatable={false}` opt-out and a missing `translationFunction` (no-op).

---

## Recipes

### Set page title and OG meta dynamically

Reach for this when a page is driven by async data — a post, product, profile — and the head needs to update once the data lands.

```tsx
import { useEffect, useState } from "react";
import Helmet from "@mongez/react-helmet";

export default function PostPage({ id }: { id: string }) {
  const [post, setPost] = useState<Post | null>(null);
  useEffect(() => {
    api.getPost(id).then(setPost);
  }, [id]);

  if (!post) return <Skeleton />;

  return (
    <>
      <Helmet
        title={post.title}
        description={post.summary}
        keywords={post.tags}
        image={post.cover}
        url={`https://example.com/posts/${post.slug}`}
      />
      <PostBody post={post} />
    </>
  );
}
```

When `id` changes, the new post's `<Helmet>` mounts on the new render path and the matching effects re-fire — title, description, keywords, image, and canonical URL all overwrite the previous values in one commit.

### Configure base URL and default title suffix at app boot

Reach for this when every page should share an app name in its `<title>` and a canonical-URL strategy, and you want a single import that guarantees the config is loaded before any `<Helmet>` mounts.

```ts
// src/config/helmet.ts
import { trans } from "@mongez/localization";
import { setHelmetConfigurations } from "@mongez/react-helmet";

setHelmetConfigurations({
  appName: "appName",                   // translation key, not literal text
  appendAppName: true,
  appNameSeparator: " | ",
  translatable: true,
  translateAppName: true,
  translationFunction: trans,
  url: true,                            // auto-canonicalize to window.location.href
  htmlAttributes: { lang: "en", dir: "ltr" },
});
```

```ts
// src/main.tsx (or app entry)
import "./config/helmet";   // side-effect import, before any <Helmet> mounts
import App from "./App";
```

Now every `<Helmet>` automatically inherits `appName`, the translation function, and the `<html>` defaults — pages only specify what differs (title, description, image).

### Switch `<html lang>` / `dir` per route for an RTL locale

Reach for this when one app serves both LTR and RTL locales, and `<html lang>` / `dir` need to track the active route. Unmount intentionally preserves `lang` and `dir` so navigating between an Arabic and an English page does not snap the page back mid-transition.

```tsx
import Helmet from "@mongez/react-helmet";

export function ArabicLayout({ children }) {
  return (
    <>
      <Helmet
        title="عربى"
        htmlAttributes={{ lang: "ar", dir: "rtl" }}
        pageId="arabic-page"
        className="arabic-route"
      />
      {children}
    </>
  );
}

// On the rendered page:
// <html lang="ar" dir="rtl" id="arabic-page" class="… arabic-route">
```

When the route unmounts, `pageId` and `className` snap back to the values they had at mount. `lang` and `dir` are left alone so a later `<Helmet>` (or a separate localization layer) keeps its own values.

### Pin a canonical URL for A/B variants

Reach for this when several routes render variants of the same page (paid landing experiments, query-string-driven A/B tests) and you want every variant to canonicalize to one indexable URL.

```tsx
import Helmet from "@mongez/react-helmet";

// Default: canonical URL is window.location.href.
<Helmet title="Home" />

// A/B variant on /landing-v2 canonicalizes to the main /landing page.
<Helmet
  title="Variant B"
  url="https://example.com/landing"
/>

// Explicitly skip the canonical write for ephemeral / search-result pages.
<Helmet title="Search results" url={false} />
```

When `url` is a string, that string is used verbatim for `link[rel=canonical]`, `og:url`, and `twitter:url`. When `url={false}` (or `null` / `""`), the canonical-URL effect is a no-op for that page.

### Layer a layout-level `<Helmet>` with a route-level one

Reach for this when a top-level layout sets safe defaults (loading state, default OG image, default html className) and individual routes override the title and description once their data arrives.

```tsx
import Helmet from "@mongez/react-helmet";

// app/Layout.tsx — top-level defaults.
function Layout({ children }) {
  return (
    <>
      <Helmet
        title="Loading"
        image="/og-default.png"
        className="route-shell"
      />
      {children}
    </>
  );
}

// app/posts/PostPage.tsx — overrides title and description, inherits the rest.
function PostPage({ post }) {
  return (
    <>
      <Helmet
        title={post.title}
        description={post.summary}
        image={post.cover}
      />
      <PostBody post={post} />
    </>
  );
}
```

Both `<Helmet>`s mount in tree order. The inner one's effects commit after the outer one's, so its values win for the fields they both set (`title`, `description`, `image`). Fields only set by the outer one (`className`, `pageId`, default `htmlAttributes`) remain in place.

### Use `<Helmet>` in a Next.js App Router project

Reach for this when you want client-driven head writes from data that lives in a client component (e.g. an authenticated profile, a Zustand-backed UI state) and Next's `export const metadata` can't see it.

```tsx
// app/_meta/RouteHead.tsx
"use client";
import Helmet from "@mongez/react-helmet";

export default function RouteHead(props: {
  title: string;
  description?: string;
  image?: string;
}) {
  return <Helmet {...props} />;
}
```

```tsx
// app/(marketing)/about/page.tsx
import RouteHead from "../../_meta/RouteHead";

export default function AboutPage() {
  return (
    <>
      <RouteHead title="About" description="Who we are." />
      <AboutBody />
    </>
  );
}
```

The `"use client"` boundary keeps the `document.documentElement` access on the client. For static metadata that the server already has, prefer Next's native `export const metadata = …` — use `<Helmet>` for the dynamic, client-driven cases that Next's API can't cover.

### Opt a single page out of translation

Reach for this when the app uses `translationFunction` globally but a specific page's title is a proper noun, brand name, or a string already translated upstream.

```tsx
import Helmet from "@mongez/react-helmet";

// Global config translates titles by default.
<Helmet title="contactUs" />              // → trans("contactUs") + " | " + trans("appName")

// This page bypasses translation for its own title.
<Helmet title="MyBrand" translatable={false} />
// document.title = "MyBrand | " + trans(appName)
// (appName is still translated when translateAppName is on.)
```

`translatable={false}` only opts the title out. `appName` still flows through `translateAppName` independently — set both to `false` if you want a fully verbatim title.

---

## Related packages

| Package | Use when you need |
|---|---|
| [`@mongez/dom`](https://github.com/hassanzohdy/dom) | The framework-agnostic core under the hood — `setTitle`, `setDescription`, `setKeywords`, `setImage`, `setCanonicalUrl`, `setHTMLAttributes`, plus font loaders and CSS-variable helpers. Use directly when you need fine-grained `<head>` control outside React. |
| [`@mongez/react-atom`](https://github.com/hassanzohdy/mongez-react-atom) | Sibling React adapter — atom-based reactive state with SSR isolation. Pairs well when your route head data lives in atoms. |
| [`@mongez/localization`](https://github.com/hassanzohdy/mongez-localization) | The `trans()` function commonly wired into `translationFunction` for auto-translated titles and app names. |

---

## Further reading

- [`CHANGELOG.md`](./CHANGELOG.md) — release notes and known-quirk tracking.
- [`llms-full.txt`](./llms-full.txt) — exhaustive single-file API surface for tool-assisted development.
- [`skills/`](./skills) — per-topic deep-dives (overview, helmet, metadata, configuration, recipes).

---

## License

MIT — see [LICENSE](./LICENSE).
