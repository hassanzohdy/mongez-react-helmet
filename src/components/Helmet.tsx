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

const documentElement: HTMLElement = document.documentElement;

export default function Helmet(props: HelmetProps) {
  function getConfig<T>(key: keyof HelmetProps): T {
    return props[key] !== undefined
      ? props[key]
      : getHelmetConfig(key as keyof HelmetConfigurations);
  }

  const currentMeta = React.useMemo(() => getMetaData(), []);

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

  const currentPageId = React.useMemo(() => documentElement.id, []);

  React.useEffect(() => {
    const clear = () => {
      documentElement.id = currentPageId;
    };

    if (props.pageId === undefined) return clear;

    documentElement.id = props.pageId;

    return clear;
  }, [props.pageId]);

  const currentClasses = React.useMemo(() => documentElement.className, []);

  React.useEffect(() => {
    const clear = () => {
      documentElement.className = currentClasses;
    };

    const classes: string = getConfig<string>("className");

    if (!classes) return clear;

    for (const className of String(classes).split(" ")) {
      documentElement.classList.add(className);
    }

    return clear;
  }, [props.className]);

  const currentHTMLAttributes = React.useMemo(() => {
    return getElementAttributes(documentElement);
  }, []);

  // html attributes
  React.useEffect(() => {
    const clear = () => {
      setHTMLAttributes(currentHTMLAttributes);
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
