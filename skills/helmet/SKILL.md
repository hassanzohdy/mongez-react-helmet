---
name: mongez-react-helmet-helmet
description: Complete reference for the <Helmet> component — its props, TypeScript types, per-effect lifecycle, usage examples, and cleanup semantics.
when_to_use: User imports Helmet from @mongez/react-helmet, user renders a <Helmet> component, user asks which props are available on <Helmet>, user asks about title/description/keywords/image/url props, user needs examples of static or async-data pages using <Helmet>, user asks about cleanup or unmount behavior of Helmet.
---

# The `<Helmet>` component

## Import

```ts
import Helmet from "@mongez/react-helmet";
```

## Props

```ts
type HelmetProps = {
  title: string;                        // required

  // App-name suffix; falls back to config when undefined.
  appName?: string;
  appendAppName?: boolean;              // default: true
  appNameSeparator?: string;            // default: " | "

  // i18n
  translatable?: boolean;               // default: true

  // Page meta
  description?: string;
  keywords?: string | string[];
  image?: string;
  url?: boolean | string;               // string → that URL; true → window.location.href; default: true

  // <html> tag controls
  htmlAttributes?: Record<string, any>;
  pageId?: string;
  className?: string;
};
```

Only `title` is required. Every other prop either falls back to the value in `setHelmetConfigurations` (when one of `appName`, `appendAppName`, `appNameSeparator`, `url`, `translatable`, `htmlAttributes`, `className`) or simply isn't touched (`description`, `keywords`, `image`, `pageId`).

## Lifecycle

```
mount
 ├── snapshot <html> attributes / id / className
 ├── title effect           — depends on [title, appName, appNameSeparator, appendAppName]
 ├── pageId effect          — depends on [pageId]
 ├── className effect       — depends on [className]
 ├── htmlAttributes effect  — depends on [htmlAttributes]
 ├── description effect     — depends on [description]
 ├── keywords effect        — depends on [keywords]
 ├── image effect           — depends on [image]
 └── url effect             — depends on [url]

re-render (one of those deps changed)
 └── the corresponding effect re-runs with the new value

unmount
 └── each effect's cleanup tries to restore the snapshot for its concern
```

The component returns `null`. Place it at any depth in a tree — including inside a Suspense boundary, route shell, or a conditional render branch.

## Examples

### Static page

```tsx
<Helmet
  title="Welcome"
  appendAppName={false}
  description="Beautiful homes, delivered."
  image="/og-hero.png"
  url="https://example.com/"
/>
```

### Async-data page

```tsx
function PostPage({ id }: { id: string }) {
  const [post, setPost] = useState<Post | null>(null);
  useEffect(() => { api.getPost(id).then(setPost); }, [id]);

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

When `post` flips from `null` to a real object the whole subtree re-mounts past the early return; the `<Helmet>` then mounts with the populated values.

### Per-page `<html>` attributes

```tsx
<Helmet
  title="عربى"
  htmlAttributes={{ lang: "ar", dir: "rtl" }}
  pageId="arabic-page"
  className="arabic-route"
/>
```

## Cleanup semantics

`pageId` and `className` restore reliably on unmount to the value snapshotted at mount.

The cleanup for `title` / `description` / `keywords` / `image` / `url` is currently a no-op in practice because the snapshot is a live reference to `@mongez/dom`'s mutable `currentMetaData` singleton — by the time the cleanup runs, the snapshot has been mutated to the current values. For most apps this is invisible (the next route's `<Helmet>` overwrites immediately), but it does mean you can't rely on an unmounted `<Helmet>` "reverting" a head tag. See `skills/metadata.md` for the full list of affected tags and CHANGELOG for tracking.
