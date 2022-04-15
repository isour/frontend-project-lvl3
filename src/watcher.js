// @ts-check
import onChange from 'on-change';
import { sel, SELECTORS } from './helpers.js';

export default (initState, i18) => {
  const input$ = sel(SELECTORS.input);
  const error$ = sel(SELECTORS.error);
  const buttonSubmit$ = sel(SELECTORS.buttonSubmit);

  const renderForm = (state) => {
    const { errorKey } = state.rssForm.url;
    const { status } = state.rssForm;

    switch (status) {
      case 'pending':
        buttonSubmit$.disabled = true;
        input$.readOnly = true;
        break;
      case 'invalid':
        input$.classList.add('is-invalid');
        error$.classList.add('text-danger');
        error$.classList.remove('text-success');
        buttonSubmit$.disabled = false;
        input$.readOnly = false;
        break;
      case 'valid':
        error$.classList.add('text-success');
        error$.classList.remove('text-danger');
        input$.classList.remove('is-invalid');
        input$.focus();
        buttonSubmit$.disabled = false;
        input$.readOnly = false;
        break;
      default:
        throw new Error(`Unknown status: '${status}'`);
    }
    error$.innerHTML = i18.t(errorKey);
  };

  const renderPosts = (state) => {
    const posts$ = sel(SELECTORS.posts);

    const feedFragment$ = new DocumentFragment();
    state.postsList.forEach((post) => {
      const li$ = document.createElement('li');
      li$.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

      const linkClass = state.uiState.watchedPosts.includes(post.guid) ? ['link-secondary', 'fw-normal'] : 'fw-bold';
      const a$ = document.createElement('a');
      a$.classList.add(linkClass);
      a$.setAttribute('href', post.link);
      a$.textContent = post.title;
      li$.appendChild(a$);

      const button$ = document.createElement('button');
      button$.classList.add('btn', 'btn-outline-primary', 'btn-sm');
      button$.setAttribute('type', 'button');
      button$.setAttribute('data-bs-toggle', 'modal');
      button$.setAttribute('data-bs-target', '#modal');
      button$.setAttribute('data-id', post.guid);
      button$.textContent = i18.t('ui.view');
      li$.appendChild(button$);

      feedFragment$.appendChild(li$);
    });

    posts$.innerHTML = `
      <div class='card border-0'>
        <div class='card-body'>
          <h2 class='card-title h4'>${i18.t('ui.posts')}</h2>
        </div>
        <ul class='list-group border-0 rounded-0'></ul>
      </div>
    `;

    posts$.querySelector('.list-group').appendChild(feedFragment$);
  };

  const renderChannels = (channels) => {
    const feeds$ = sel(SELECTORS.feeds);

    let channelList = '';

    channels.forEach((channel) => {
      channelList += `<li class='list-group-item border-0 border-end-0'><h3 class='h6 m-0'>${channel.title}</h3><p class='m-0 small text-black-50'>${channel.description}</p></li>`;
    });

    feeds$.innerHTML = `
      <div class='card border-0'>
        <div class='card-body'><h2 class='card-title h4'>Фиды</h2></div>
        <ul class='list-group border-0 rounded-0'>${channelList}</ul>
      </div>`;
  };

  const renderModal = (state) => {
    const title$ = document.querySelector(SELECTORS.modal.title);
    const body$ = document.querySelector(SELECTORS.modal.body);
    const link$ = document.querySelector(SELECTORS.modal.link);
    const viewedPost = state.postsList.filter((post) => post.guid === state.modal.id)[0];

    title$.textContent = viewedPost.title;
    body$.textContent = viewedPost.description;
    link$.setAttribute('href', viewedPost.link);
  };

  const watchedState = onChange(
    initState,
    (path, value) => {
      if (path === 'uiState.watchedPosts') {
        renderPosts(initState);
      }
      if (path === 'modal.id' && value !== null) {
        renderModal(initState);
      }
      if (path === 'rssForm.url.value' && value === null) {
        document.querySelector(SELECTORS.input).value = '';
      }
      if (path === 'postsList' || path === 'channelList') {
        renderChannels(initState.channelList);
        renderPosts(initState);
      }
      if (path === 'rssForm.status') {
        renderForm(initState);
      }
    },
  );

  return watchedState;
};
