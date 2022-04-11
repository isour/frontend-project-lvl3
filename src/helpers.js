// @ts-check
const sel = (selector) => document.querySelector(selector);

const SELECTORS = {
  form: '.rss-form',
  input: '#url-input',
  error: '.feedback',
  feeds: '.feeds',
  posts: '.posts',
  buttonSubmit: '.rss-form .btn',
  listButtons: '.list-group .btn',
  modal: {
    title: '.modal-title',
    body: '.modal-body',
    link: '.full-article',
  },
};

export { sel, SELECTORS };
