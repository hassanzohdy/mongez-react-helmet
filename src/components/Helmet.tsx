import {
  setDescription,
  setImage,
  setKeywords,
  setTitle,
  setCanonicalUrl,
  setHTMLAttributes,
  getElementAttributes,
  getMetaData,
} from "@mongez/dom";
import React from "react";
import { getHelmetConfig } from "../config";
import { HelmetConfigurations, HelmetProps } from "../types";

/**
 * Lazy accessor for `document.documentElement` so this module can be imported
 * in a plain Node SSR context that has not yet loaded a DOM shim. All effects
 * run on the client, so the `null` branch is unreachable in practice — the
 * null-checks exist purely to keep import-time evaluation pure.
 */
function getDocumentElement(): HTMLElement | null {
  return typeof document === "undefined" ? null : document.documentElement;
}

export default function Helmet(props: HelmetProps) {
  function getConfig<T>(key: keyof HelmetProps): T {
    return props[key] !== undefined
      ? props[key]
      : getHelmetConfig(key as keyof HelmetConfigurations);
  }

  // Take an immutable shallow clone of the @mongez/dom metadata singleton
  // at mount time. `getMetaData()` returns the live singleton reference —
  // every `setTitle`/`setDescription`/... mutates it in place, so without
  // the spread the cleanup branch would read back the current Helmet's own
  // overrides instead of the values that existed before mount.
  const currentMeta = React.useMemo(() => ({ ...getMetaData() }), []);

  React.useEffect(() => {
    // let's define our page title
    // page title = title prop + app separator + app name
    const clear = () => setTitle(currentMeta.title);

    let title: string = String(props.title);

    const translate: Function = getHelmetConfig("translationFunction");

    const translatable: boolean = getConfig<boolean>("translatable");

    if (translatable && translate) {
      title = translate(title);
    }

    let titleSegments: string[] = [title];

    const appendAppName = getConfig<boolean>("appendAppName");
    const appNameSeparator: string = getConfig<string>("appNameSeparator");
    let appName: string = getConfig<string>("appName");

    if (appendAppName && appName) {
      if (appNameSeparator) {
        titleSegments.push(appNameSeparator);
      }

      if (getHelmetConfig("translateAppName") && translate) {
        appName = translate(appName);
      }

      titleSegments.push(appName);
    }

    setTitle(titleSegments.join(""));

    return clear;
  }, [props.title, props.appName, props.appNameSeparator, props.appendAppName]);

  const currentPageId = React.useMemo(
    () => getDocumentElement()?.id ?? "",
    []
  );

  React.useEffect(() => {
    const clear = () => {
      const el = getDocumentElement();
      if (el) el.id = currentPageId;
    };

    if (props.pageId === undefined) return clear;

    const el = getDocumentElement();
    if (el) el.id = props.pageId;

    return clear;
  }, [props.pageId]);

  const currentClasses = React.useMemo(
    () => getDocumentElement()?.className ?? "",
    []
  );

  React.useEffect(() => {
    const clear = () => {
      const el = getDocumentElement();
      if (el) el.className = currentClasses;
    };

    const classes: string = getConfig<string>("className");

    if (!classes) return clear;

    const el = getDocumentElement();
    if (!el) return clear;

    for (const className of String(classes).split(" ")) {
      el.classList.add(className);
    }

    return clear;
  }, [props.className]);

  const currentHTMLAttributes = React.useMemo(() => {
    const el = getDocumentElement();
    return el ? getElementAttributes(el) : {};
  }, []);

  // html attributes
  React.useEffect(() => {
    const clear = () => {
      const el = getDocumentElement();
      if (!el) return;

      // Stop resetting dir attribute and lang attribute on unmount —
      // a child page may have changed localization mid-session and we
      // do not want to roll that back when this Helmet unmounts.
      const attributes = { ...currentHTMLAttributes };
      if (attributes.dir) {
        delete attributes.dir;
      }

      if (attributes.lang) {
        delete attributes.lang;
      }

      // `setHTMLAttributes` is additive only — it never removes keys.
      // Compute `current - snapshot` (excluding dir/lang per the rule
      // above) and strip any attribute the render introduced that the
      // pre-mount snapshot did not have, before re-applying the snapshot.
      const live = getElementAttributes(el);
      for (const name in live) {
        if (name === "dir" || name === "lang") continue;
        if (!(name in attributes)) {
          el.removeAttribute(name);
        }
      }

      setHTMLAttributes(attributes);
    };

    const htmlAttributes: Object = getConfig<Object>("htmlAttributes");

    if (htmlAttributes === undefined) return clear;

    setHTMLAttributes(htmlAttributes);

    return clear;
  }, [props.htmlAttributes]);

  // description
  React.useEffect(() => {
    const clear = () => setDescription(currentMeta.description || "");

    if (props.description === undefined) return clear;

    if (props.description) {
      setDescription(props.description);
    }

    return clear;
  }, [props.description]);

  // keywords
  React.useEffect(() => {
    const clear = () => {
      setKeywords(currentMeta.keywords || "");
    };

    if (props.keywords === undefined) return clear;

    if (props.keywords) {
      setKeywords(props.keywords);
    }

    return clear;
  }, [props.keywords]);

  // page image
  React.useEffect(() => {
    const clear = () => {
      setImage(currentMeta.image || "");
    };

    if (props.image === undefined) return clear;

    if (props.image) {
      setImage(props.image);
    }

    return clear;
  }, [props.image]);

  // page url
  React.useEffect(() => {
    const clear = () => {
      setCanonicalUrl(currentMeta.url || "");
    };

    const pageUrl: boolean | string = getConfig<boolean | string>("url");

    if (pageUrl === undefined) return clear;

    // `url={false}` (and the falsy string variants) are listed in the
    // HelmetProps type as legal values that mean "don't touch the
    // canonical url for this page". Passing `false` through to
    // `setCanonicalUrl(false)` would crash inside `meta(...)` when it
    // calls `value.trim()` on a boolean.
    if (pageUrl === false || pageUrl === null || pageUrl === "") {
      return clear;
    }

    let url: string = "";

    if (pageUrl === true) {
      url = window.location.href; // get current url of the page
    } else {
      url = pageUrl as string;
    }

    setCanonicalUrl(url);

    return clear;
  }, [props.url]);

  return null;
}
