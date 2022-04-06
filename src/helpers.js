// @ts-check
const sel = (selector) => document.querySelector(selector);

const SELECTORS = {
  form: '.rss-form',
  input: '#url-input',
  error: '.feedback',
};

export { sel, SELECTORS };
