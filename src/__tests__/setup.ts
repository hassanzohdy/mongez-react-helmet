// Vitest setup for the react-helmet package.
//
// Kept intentionally empty; the happy-dom environment is configured via
// vitest.config.ts and that's all the React layer currently needs. Each
// test resets `document.head` and html attributes inline so individual
// runs stay observationally independent.
export {};
