---
name: mongez-react-helmet-overview
description: High-level orientation to @mongez/react-helmet — what the package does, its mental model, scope boundaries, component lifecycle, and SSR constraints.
when_to_use: User is new to @mongez/react-helmet and needs a package overview, user asks "what does @mongez/react-helmet do", user needs to understand the relationship between @mongez/react-helmet and @mongez/dom, user asks about SSR compatibility or "use client" requirements for the Helmet component.
---

# Overview

`@mongez/react-helmet` is a React adapter over [`@mongez/dom`](https://github.com/hassanzohdy/dom)'s metadata module. It exposes one component — `<Helmet>` — that sets the document title (with optional app-name suffix), description, keywords, Open Graph / Twitter cards, canonical URL, favicon, and `<html>` attributes. The component is effect-only: it returns `null` and writes directly to `document.head` and `document.documentElement`.

## Install

```sh
yarn add @mongez/react-helmet
# peer: react >= 18, @mongez/dom >= 1.1.2
```

## Import pattern

```ts
import Helmet, {
  setHelmetConfigurations,
  getHelmetConfigurations,
  getHelmetConfig,
  type HelmetProps,
  type HelmetConfigurations,
} from "@mongez/react-helmet";
```

## Mental model

| Concept | Type | Mental model |
|---|---|---|
| `<Helmet>` | Component, returns `null` | Side-effect renderer — every prop maps to an effect that writes one or more tags to `<head>`. |
| `HelmetProps` | Object | Per-instance settings. Each maps to a known set of tags (see `metadata.md`). |
| `setHelmetConfigurations` | Function | App-wide defaults. Per-call props win when both are provided. |
| `translationFunction` | Config | Optional `(key) => string` — auto-translates the title and `appName`. |

## Scope boundaries

| Concern | Lives where | Why |
|---|---|---|
| The DOM-level title / meta writers | `@mongez/dom` | Framework-agnostic |
| The React component + config singleton | `@mongez/react-helmet` | This package |
| Translation strings | `@mongez/localization` | Pluggable; provide via `translationFunction` |

## Lifecycle in one diagram

```
<Helmet title=… description=… />
   |
   v
mount  →  one effect per prop  →  writes to document.head / documentElement
   |
   v
re-render with new prop  →  effect with that prop in deps re-runs  →  overwrites the tag
   |
   v
unmount  →  each effect's cleanup tries to restore the mount-time snapshot
              (pageId / className restore reliably; title / description /
               keywords / image / url cleanup is known-broken — see CHANGELOG)
```

## Browser-only

The component file accesses `document.documentElement` at the module top level. To use under SSR frameworks, wrap the import in a `"use client"` boundary (Next.js App Router) or a `dynamic(..., { ssr: false })` import (Pages Router / Remix).
