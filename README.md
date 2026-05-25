# @mongez/react-helmet

> Document `<head>` manager for React. Drop a `<Helmet>` anywhere in your tree and the page title, description, keywords, Open Graph / Twitter cards, canonical URL, favicon, and `<html>` attributes update — with cleanup on unmount.

`@mongez/react-helmet` is the React adapter over [`@mongez/dom`](https://github.com/hassanzohdy/dom)'s metadata module. Everything you set declaratively on `<Helmet>` resolves down to plain `<meta>` / `<link>` / `<title>` writes on the real document head — no virtual DOM for `<head>`, no server-string side bag, no extra runtime.

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

## Install

```sh
yarn add @mongez/react-helmet
# peer: react >= 18, @mongez/dom >= 1.1.2
```

## A 30-second tour

```tsx
import Helmet, { setHelmetConfigurations } from "@mongez/react-helmet";

// 1. App-wide defaults once, near your entry.
setHelmetConfigurations({
  appName: "My Online Store",
  appendAppName: true,
  appNameSeparator: " | ",
});

// 2. Page-level overrides anywhere in the tree.
function HomePage() {
  return (
    <>
      <Helmet
        title="Home"
        description="Best deals every day."
        keywords={["electronics", "deals", "shop"]}
      />
      <HomeContent />
    </>
  );
}
// document.title  → "Home | My Online Store"
// <meta name="description" content="Best deals every day.">
// <meta name="keywords" content="electronics,deals,shop">
// <meta property="og:title" content="Home | My Online Store">  (and og:image:alt, twitter:title, ...)

// 3. Per-page <html> attributes (lang/dir for i18n).
function ArabicPage() {
  return (
    <Helmet
      title="عربى"
      htmlAttributes={{ lang: "ar", dir: "rtl" }}
      pageId="arabic-page"
      className="theme-light arabic-route"
    />
  );
}
```

## What's in the box

| Export | Purpose |
|---|---|
| `Helmet` (default) | The component. Effect-only, returns `null`. |
| `setHelmetConfigurations` | Set app-wide defaults (`appName`, `appNameSeparator`, translation, ...). |
| `getHelmetConfigurations` | Read the whole config object. |
| `getHelmetConfig` | Read a single key, or fall back to a supplied default. |
| `HelmetProps` (type) | Per-instance props. |
| `HelmetConfigurations` (type) | App-wide configuration shape. |

## The `<Helmet>` component

Drop it anywhere in your tree. Each mounted `<Helmet>` runs one effect per concern (title, description, keywords, image, url, html attributes, page id, class name). On unmount, the cleanup tries to restore the prior state.

### Props

```ts
type HelmetProps = {
  // Required. Sets document.title (with optional app-name suffix), and
  // mirrors to og:title, og:image:alt, twitter:title, twitter:image:alt,
  // and the itemprop=name meta tag.
  title: string;

  // App-name suffix controls. Each falls back to the corresponding key in
  // setHelmetConfigurations() when undefined here.
  appName?: string;
  appendAppName?: boolean;        // default: true
  appNameSeparator?: string;      // default: " | "

  // Auto-translate the title via the configured translationFunction.
  translatable?: boolean;         // default: true

  // Page-level meta. Each writes the documented mirror tags.
  description?: string;           // → meta description + og:description + twitter:description + itemprop=description
  keywords?: string | string[];   // → meta keywords (array is joined with ",")
  image?: string;                 // → meta image + og:image + twitter:image + itemprop=image
  url?: boolean | string;         // string → that exact URL; true → window.location.href; default: true

  // <html> tag controls.
  htmlAttributes?: Record<string, any>;   // attribute bag to .setAttribute on <html>
  pageId?: string;                         // sets <html>.id
  className?: string;                      // space-separated; each token classList.add'd on <html>
};
```

Only `title` is required. Everything else falls back to either the per-call config or just isn't touched.

### `Helmet` returns `null`

The component renders nothing into your tree — all writes happen in effects on the real `document.head` and `document.documentElement`. Safe to render at any depth, including inside layout components, suspense boundaries, and route-level shells.

## App-wide configuration

```ts
import { setHelmetConfigurations } from "@mongez/react-helmet";

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

`setHelmetConfigurations` shallow-merges with the existing config — call it once at app boot to set defaults, then override per page via `<Helmet>` props.

```ts
type HelmetConfigurations = {
  appName?: string;
  appendAppName?: boolean;           // default: true
  appNameSeparator?: string;         // default: " | "
  url?: boolean;                     // default: true
  htmlAttributes?: Record<string, any>;
  className?: string;
  translatable?: boolean;            // default: true
  translateAppName?: boolean;        // default: true
  translationFunction?: (key: string) => string;
};
```

## Translation

When `translatable` is true and a `translationFunction` is configured, the title (and optionally `appName`) is passed through `translationFunction` before being written.

```tsx
import { trans } from "@mongez/localization";
import Helmet, { setHelmetConfigurations } from "@mongez/react-helmet";

setHelmetConfigurations({
  appName: "appName",          // a translation key
  appendAppName: true,
  translatable: true,
  translateAppName: true,
  translationFunction: trans,
});

// In a route component:
<Helmet title="contactUs" />
// Resolves to: trans("contactUs") + " | " + trans("appName")
```

The component honours both the per-call `translatable={false}` opt-out and a missing `translationFunction` (no-op).

## `<html>` attributes, page id, class name

```tsx
<Helmet
  title="Dashboard"
  htmlAttributes={{ lang: "en", dir: "ltr", "data-theme": "dark" }}
  pageId="dashboard"
  className="route-dashboard theme-dark"
/>
```

- `htmlAttributes` writes each key/value via `setAttribute` on `<html>`.
- `pageId` sets `<html>.id`.
- `className` is split on whitespace and each token is `classList.add`'d.

On unmount, `pageId` and `className` are restored to whatever was on `<html>` when the `<Helmet>` first mounted.

## Examples

### Static landing page

```tsx
<Helmet
  title="Welcome"
  appendAppName={false}
  description="Beautiful homes, delivered."
  image="/og-hero.png"
  url="https://example.com/"
/>
```

### Detail page driven by async data

```tsx
function PostPage({ id }: { id: string }) {
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

When `id` changes, the new post's `<Helmet>` mounts on the new render path and overwrites the previous title / description / image.

### Localized RTL page

```tsx
<Helmet
  title="عربى"
  htmlAttributes={{ lang: "ar", dir: "rtl" }}
  pageId="arabic-page"
  className="arabic-route"
/>
```

`<html lang="ar" dir="rtl" id="arabic-page" class="… arabic-route">`.

### Per-page custom URL strategy

```tsx
// Default: canonical URL is window.location.href.
<Helmet title="Default" />

// Static canonical (e.g., A/B variant should canonicalize to the main URL).
<Helmet title="Variant A" url="https://example.com/landing" />
```

## Related packages

| Package | Purpose |
|---|---|
| [`@mongez/dom`](https://github.com/hassanzohdy/dom) | The framework-agnostic DOM utilities under the hood — `setTitle`, `setDescription`, `setKeywords`, `setImage`, `setCanonicalUrl`, `setHTMLAttributes`, font loaders, CSS-variable helpers. Use directly when you need fine-grained `<head>` control outside React. |
| [`@mongez/react-atom`](https://github.com/hassanzohdy/mongez-react-atom) | Sibling React adapter — atom-based state management with SSR isolation. |
| [`@mongez/localization`](https://github.com/hassanzohdy/mongez-localization) | The `trans()` function commonly wired into `translationFunction`. |

## Limitations

- **Browser-only.** The module accesses `document.documentElement` at import time, so it can't be imported in a Node SSR context without a DOM shim already loaded. For Next.js / Remix users this means the component must live in a client-only file (`"use client"` or a dynamic import with `ssr: false`).
- **No virtual `<head>`.** Writes go directly to `document.head`. Two `<Helmet>` instances that set the same field both write — the last effect to run wins, which is the React commit order from the top of the tree down. Re-renders update the corresponding fields; unmount restores `pageId` and `className` to their mount-time snapshot.

## License

MIT
