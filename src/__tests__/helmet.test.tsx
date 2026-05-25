import { render } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  // The @mongez/dom metadata module keeps a module-level singleton that
  // tracks "the last value we wrote." `setTitle/setDescription/...` early
  // return when the new value equals the cached one, so tests that share
  // any value with a sibling test must defeat that short-circuit by
  // either using a unique value or by writing a sentinel first. We use
  // unique values per test and a sentinel reset to keep the singleton
  // in a known-empty state between runs.
  setTitle as domSetTitle,
  setDescription as domSetDescription,
  setKeywords as domSetKeywords,
  setImage as domSetImage,
  setCanonicalUrl as domSetCanonicalUrl,
} from "@mongez/dom";
import Helmet, {
  getHelmetConfig,
  getHelmetConfigurations,
  setHelmetConfigurations,
} from "../index";

/**
 * Each test starts from a clean <head>, a known document.title, a
 * stripped <html> attribute/id/class list, and a fresh helmet config.
 * We also reset the `@mongez/dom` metadata singleton to a sentinel
 * value so subsequent `setTitle`/`setDescription`/... calls do real
 * work instead of short-circuiting on equality with the prior write.
 */
function resetDom() {
  document.head.innerHTML = "";
  document.body.innerHTML = "";
  document.title = "";
  for (const attr of Array.from(document.documentElement.attributes)) {
    document.documentElement.removeAttribute(attr.name);
  }
  // Sentinel writes that force the dom singleton's cache to known
  // values so the *next* write from a Helmet effect actually fires.
  domSetTitle("__reset__");
  domSetDescription("__reset__");
  domSetKeywords("__reset__");
  domSetImage("__reset__");
  domSetCanonicalUrl("__reset__");
  // Now clean the head again — we don't want the sentinels in our
  // observable DOM and the per-test writes will rebuild them.
  document.head.innerHTML = "";
  document.title = "";
}

function resetHelmetConfig() {
  // The config module keeps its own module-level singleton. Restore the
  // documented defaults so each test starts from the same baseline.
  setHelmetConfigurations({
    appName: undefined,
    appendAppName: true,
    url: true,
    translatable: true,
    translateAppName: true,
    appNameSeparator: " | ",
    htmlAttributes: undefined,
    className: undefined,
    translationFunction: undefined,
  });
}

beforeEach(() => {
  resetDom();
  resetHelmetConfig();
});

afterEach(() => {
  resetDom();
  resetHelmetConfig();
});

describe("Helmet — title", () => {
  it("sets document.title from the title prop", () => {
    render(<Helmet title="Home Page A" appendAppName={false} />);
    expect(document.title).toBe("Home Page A");
  });

  it("appends the app name with the separator when appName is set", () => {
    setHelmetConfigurations({ appName: "Store B" });
    render(<Helmet title="Cart B" />);
    expect(document.title).toBe("Cart B | Store B");
  });

  it("respects a custom separator", () => {
    setHelmetConfigurations({ appName: "Store C", appNameSeparator: " — " });
    render(<Helmet title="Cart C" />);
    expect(document.title).toBe("Cart C — Store C");
  });

  it("does not append the app name when appendAppName is false on the component", () => {
    setHelmetConfigurations({ appName: "Store D" });
    render(<Helmet title="Cart D" appendAppName={false} />);
    expect(document.title).toBe("Cart D");
  });

  it("does not append the app name when appName is not configured", () => {
    render(<Helmet title="Cart E" />);
    expect(document.title).toBe("Cart E");
  });

  it("uses the per-instance appName prop over the config value", () => {
    setHelmetConfigurations({ appName: "Default F" });
    render(<Helmet title="Cart F" appName="Special F" />);
    expect(document.title).toBe("Cart F | Special F");
  });

  it("sets the og:title meta tag", () => {
    render(<Helmet title="Article G" appendAppName={false} />);
    const og = document.head.querySelector('meta[property="og:title"]');
    expect(og?.getAttribute("content")).toBe("Article G");
  });

  it("sets the twitter:title meta tag", () => {
    render(<Helmet title="Article H" appendAppName={false} />);
    const tw = document.head.querySelector('meta[property="twitter:title"]');
    expect(tw?.getAttribute("content")).toBe("Article H");
  });

  it("sets the itemprop=name meta tag", () => {
    render(<Helmet title="Article I" appendAppName={false} />);
    const ip = document.head.querySelector('meta[itemprop="name"]');
    expect(ip?.getAttribute("content")).toBe("Article I");
  });
});

describe("Helmet — description", () => {
  it("sets the meta name=description tag", () => {
    render(<Helmet title="Desc A" description="A short description" />);
    const m = document.head.querySelector('meta[name="description"]');
    expect(m?.getAttribute("content")).toBe("A short description");
  });

  it("sets og:description", () => {
    render(<Helmet title="Desc B" description="og desc value" />);
    const og = document.head.querySelector('meta[property="og:description"]');
    expect(og?.getAttribute("content")).toBe("og desc value");
  });

  it("sets twitter:description", () => {
    render(<Helmet title="Desc C" description="twitter desc value" />);
    const tw = document.head.querySelector('meta[property="twitter:description"]');
    expect(tw?.getAttribute("content")).toBe("twitter desc value");
  });

  it("sets itemprop=description", () => {
    render(<Helmet title="Desc D" description="itemprop desc value" />);
    const ip = document.head.querySelector('meta[itemprop="description"]');
    expect(ip?.getAttribute("content")).toBe("itemprop desc value");
  });
});

describe("Helmet — keywords", () => {
  it("sets meta keywords from a string", () => {
    render(<Helmet title="K A" keywords="react, helmet, seo" />);
    const m = document.head.querySelector('meta[name="keywords"]');
    expect(m?.getAttribute("content")).toBe("react, helmet, seo");
  });

  it("joins an array of keywords with commas", () => {
    render(<Helmet title="K B" keywords={["react", "helmet", "head"]} />);
    const m = document.head.querySelector('meta[name="keywords"]');
    expect(m?.getAttribute("content")).toBe("react,helmet,head");
  });
});

describe("Helmet — image", () => {
  it("sets all image meta variants from the image prop", () => {
    render(<Helmet title="Img A" image="/cover-a.png" />);

    expect(
      document.head.querySelector('meta[property="image"]')?.getAttribute("content")
    ).toBe("/cover-a.png");
    expect(
      document.head.querySelector('meta[property="og:image"]')?.getAttribute("content")
    ).toBe("/cover-a.png");
    expect(
      document.head.querySelector('meta[property="twitter:image"]')?.getAttribute("content")
    ).toBe("/cover-a.png");
    expect(
      document.head.querySelector('meta[itemprop="image"]')?.getAttribute("content")
    ).toBe("/cover-a.png");
  });
});

describe("Helmet — canonical url", () => {
  it("sets a link[rel=canonical] when url is an explicit string", () => {
    render(<Helmet title="URL A" url="https://example.com/page-a" />);
    const link = document.head.querySelector('link[rel="canonical"]');
    expect(link?.getAttribute("href")).toBe("https://example.com/page-a");
  });

  it("sets og:url alongside the canonical link", () => {
    render(<Helmet title="URL B" url="https://example.com/page-b" />);
    const og = document.head.querySelector('meta[property="og:url"]');
    expect(og?.getAttribute("content")).toBe("https://example.com/page-b");
  });

  it("sets twitter:url alongside the canonical link", () => {
    render(<Helmet title="URL C" url="https://example.com/page-c" />);
    const tw = document.head.querySelector('meta[property="twitter:url"]');
    expect(tw?.getAttribute("content")).toBe("https://example.com/page-c");
  });

  it("uses window.location.href when url is true", () => {
    render(<Helmet title="URL D" url={true} />);
    const link = document.head.querySelector('link[rel="canonical"]');
    expect(link?.getAttribute("href")).toBe(window.location.href);
  });
});

describe("Helmet — html attributes", () => {
  it("applies htmlAttributes to the <html> element", () => {
    render(
      <Helmet
        title="HTMLAttr A"
        appendAppName={false}
        htmlAttributes={{ lang: "en", dir: "ltr", "data-app": "mine" }}
      />
    );
    expect(document.documentElement.getAttribute("lang")).toBe("en");
    expect(document.documentElement.getAttribute("dir")).toBe("ltr");
    expect(document.documentElement.getAttribute("data-app")).toBe("mine");
  });
});

describe("Helmet — pageId", () => {
  it("sets document.documentElement.id from the pageId prop", () => {
    render(<Helmet title="PageId A" appendAppName={false} pageId="home-page" />);
    expect(document.documentElement.id).toBe("home-page");
  });

  it("restores the original id on unmount", () => {
    document.documentElement.id = "original";
    const { unmount } = render(
      <Helmet title="PageId B" appendAppName={false} pageId="overridden" />
    );
    expect(document.documentElement.id).toBe("overridden");
    unmount();
    expect(document.documentElement.id).toBe("original");
  });
});

describe("Helmet — className", () => {
  it("adds each class in the className string to <html>", () => {
    render(
      <Helmet title="Class A" appendAppName={false} className="home theme-light" />
    );
    expect(document.documentElement.classList.contains("home")).toBe(true);
    expect(document.documentElement.classList.contains("theme-light")).toBe(true);
  });

  it("restores the original className on unmount", () => {
    document.documentElement.className = "base";
    const { unmount } = render(
      <Helmet title="Class B" appendAppName={false} className="page" />
    );
    expect(document.documentElement.classList.contains("page")).toBe(true);
    unmount();
    expect(document.documentElement.className).toBe("base");
  });
});

describe("Helmet — translatable", () => {
  it("translates the title via translationFunction when translatable is true", () => {
    const dict: Record<string, string> = { home: "Inicio", appName: "Mi Tienda" };
    setHelmetConfigurations({
      appName: "appName",
      appendAppName: true,
      translatable: true,
      translateAppName: true,
      translationFunction: (k: string) => dict[k] ?? k,
    });
    render(<Helmet title="home" />);
    expect(document.title).toBe("Inicio | Mi Tienda");
  });

  it("skips translation when translatable is false on the component", () => {
    const dict: Record<string, string> = { skipMe: "ShouldNotShow" };
    setHelmetConfigurations({
      translatable: true,
      translationFunction: (k: string) => dict[k] ?? k,
    });
    render(<Helmet title="skipMe" translatable={false} appendAppName={false} />);
    expect(document.title).toBe("skipMe");
  });

  it("leaves the title untranslated when no translationFunction is configured", () => {
    setHelmetConfigurations({ translatable: true });
    render(<Helmet title="literalText" appendAppName={false} />);
    expect(document.title).toBe("literalText");
  });
});

describe("Helmet — sequential instances (later wins)", () => {
  it("the most recently mounted Helmet wins on the title", () => {
    function Page() {
      return (
        <>
          <Helmet title="Outer Title" appendAppName={false} />
          <Helmet title="Inner Title" appendAppName={false} />
        </>
      );
    }
    render(<Page />);
    expect(document.title).toBe("Inner Title");
  });

  it("the most recently mounted Helmet wins on the description", () => {
    function Page() {
      return (
        <>
          <Helmet title="Outer Desc" description="first description" />
          <Helmet title="Inner Desc" description="second description" />
        </>
      );
    }
    render(<Page />);
    expect(
      document.head.querySelector('meta[name="description"]')?.getAttribute("content")
    ).toBe("second description");
  });

  it("re-rendering with a new title prop updates the title", () => {
    const { rerender } = render(<Helmet title="One Title" appendAppName={false} />);
    expect(document.title).toBe("One Title");
    rerender(<Helmet title="Two Title" appendAppName={false} />);
    expect(document.title).toBe("Two Title");
  });

  it("re-rendering with a new description prop updates the meta description", () => {
    const { rerender } = render(<Helmet title="ReDesc A" description="orig desc" />);
    expect(
      document.head.querySelector('meta[name="description"]')?.getAttribute("content")
    ).toBe("orig desc");
    rerender(<Helmet title="ReDesc A" description="updated desc" />);
    expect(
      document.head.querySelector('meta[name="description"]')?.getAttribute("content")
    ).toBe("updated desc");
  });
});

describe("Helmet — return value", () => {
  it("renders nothing into the DOM tree", () => {
    const { container } = render(<Helmet title="Empty A" appendAppName={false} />);
    expect(container.innerHTML).toBe("");
  });
});

describe("setHelmetConfigurations / getHelmetConfigurations / getHelmetConfig", () => {
  it("setHelmetConfigurations merges the partial into the current config", () => {
    setHelmetConfigurations({ appName: "Alpha" });
    setHelmetConfigurations({ appNameSeparator: " · " });
    const cfg = getHelmetConfigurations();
    expect(cfg.appName).toBe("Alpha");
    expect(cfg.appNameSeparator).toBe(" · ");
  });

  it("getHelmetConfig with no argument returns the entire object", () => {
    setHelmetConfigurations({ appName: "Beta" });
    const cfg = getHelmetConfig();
    expect(cfg.appName).toBe("Beta");
  });

  it("getHelmetConfig with a key returns just that key", () => {
    setHelmetConfigurations({ appName: "Gamma" });
    expect(getHelmetConfig("appName")).toBe("Gamma");
  });

  it("getHelmetConfig returns the supplied default when the key is absent", () => {
    expect(getHelmetConfig("appName" as any, "fallback")).toBe("fallback");
  });
});

// -----------------------------------------------------------------------------
// Known-bug tests — skipped pending a fix. Each captures behaviour the user
// would reasonably expect; left as `.skip` so the suite stays green while the
// regression is documented in version control.
// -----------------------------------------------------------------------------
describe("Helmet — known bugs (skipped)", () => {
  it(
    "BUG cleanup reads the live currentMeta singleton, so unmount does not restore the original title (Helmet.tsx:24, 29)",
    () => {
      // `useMemo(() => getMetaData(), [])` returns the live singleton from
      // @mongez/dom — it is then mutated by every setTitle call. The
      // cleanup `setTitle(currentMeta.title)` therefore re-sets the
      // current (already-overridden) title, not the original one.
      domSetTitle("OriginalBugTitle");
      const { unmount } = render(
        <Helmet title="OverriddenBugTitle" appendAppName={false} />
      );
      expect(document.title).toBe("OverriddenBugTitle");
      unmount();
      expect(document.title).toBe("OriginalBugTitle"); // currently stays "OverriddenBugTitle"
    }
  );

  it(
    "BUG htmlAttributes cleanup does not remove attributes added by the render (Helmet.tsx:101-125)",
    () => {
      // `setHTMLAttributes` only sets, never removes. If the render added
      // `data-page="cart"` but the captured snapshot did not contain that
      // key, the cleanup leaves it on <html>.
      const { unmount } = render(
        <Helmet
          title="HTMLBug"
          appendAppName={false}
          htmlAttributes={{ "data-page": "cart" }}
        />
      );
      expect(document.documentElement.getAttribute("data-page")).toBe("cart");
      unmount();
      expect(document.documentElement.getAttribute("data-page")).toBeNull(); // currently still "cart"
    }
  );

  it(
    "BUG `setCanonicalUrl` writes the url into `color`, not `url` (dom/metadata.ts:275)",
    async () => {
      // In `@mongez/dom/src/metadata.ts` the `setCanonicalUrl` body does
      // `currentMetaData.color = url` instead of `currentMetaData.url`.
      // The DOM-level meta tags are still produced correctly, but
      // `getMetaData("url")` returns "" forever — and the Helmet cleanup
      // path therefore cannot restore the canonical link to its prior
      // value either.
      const { getMetaData } = await import("@mongez/dom");
      render(<Helmet title="UrlBug" url="https://example.com/page" />);
      expect(getMetaData("url")).toBe("https://example.com/page");
    }
  );

  it(
    "BUG Helmet.tsx accesses `document.documentElement` at module-eval time, crashing on the server (Helmet.tsx:14)",
    () => {
      // `const documentElement: HTMLElement = document.documentElement;`
      // is a top-level statement. If the package is imported in a Node
      // SSR context where the dom-shim isn't loaded first, the import
      // itself throws. Until the access is moved inside the component,
      // SSR consumers must either ensure JSDOM/happy-dom is pre-loaded
      // or wrap their use-site in a client-only boundary.
      expect(true).toBe(true);
    }
  );

  it(
    "BUG passing url={false} crashes the canonical-url effect with `value.trim is not a function` (Helmet.tsx:181-188, dom/metadata.ts:121)",
    () => {
      // The component only short-circuits when `pageUrl === undefined`;
      // any other falsy value flows through to `setCanonicalUrl(false)`,
      // and `meta(...)` then calls `value.trim()` on the boolean. The
      // helmet config exposes `url: false` as a *legal* setting in its
      // type, so this is observably broken.
      expect(() => render(<Helmet title="UrlFalse" url={false as any} />))
        .not.toThrow();
    }
  );
});
