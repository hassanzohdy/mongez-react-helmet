import { HelmetConfigurations } from "./types";

let defaultConfigurations: HelmetConfigurations = {
  appendAppName: true,
  url: true,
  translatable: true,
  translateAppName: true,
  appNameSeparator: " | ",
};

// current configurations
let helmetConfigurations: HelmetConfigurations = { ...defaultConfigurations };

/**
 * Set helmet configurations
 */
export function setHelmetConfigurations(
  newConfigurations: HelmetConfigurations
): void {
  helmetConfigurations = { ...helmetConfigurations, ...newConfigurations };
}

/**
 * Get helmet single config value
 */
export function getHelmetConfig(
  key?: keyof HelmetConfigurations,
  defaultValue: any = null
): any {
  if (arguments.length === 0) return helmetConfigurations;

  return helmetConfigurations[key] || defaultValue;
}

/**
 * Get current helmet configurations
 */
export function getHelmetConfigurations(): HelmetConfigurations {
  return helmetConfigurations;
}
