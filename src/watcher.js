// @ts-check
import onChange from 'on-change';
import { sel, SELECTORS } from './helpers.js';
import loc from './localization/locale.js';

const renderForm = (state) => {
  const { errorKey } = state.rssForm.url;
  const { status } = state.rssForm;
  const input$ = sel(SELECTORS.input);
  const error$ = sel(SELECTORS.error);
  const buttonSubmit$ = sel(SELECTORS.buttonSubmit);

  buttonSubmit$.disabled = status === 'pending';

  switch (status) {
    case 'invalid':
      input$.classList.add('is-invalid');
      error$.classList.add('text-danger');
      error$.classList.remove('text-success');
      break;
    case 'valid':
      error$.classList.add('text-success');
      error$.classList.remove('text-danger');
      input$.classList.remove('is-invalid');
      input$.focus();
      break;
    default:
      throw new Error(`Unknown status: '${state.status}'`);
  }
  error$.innerHTML = loc.t(errorKey);
};

const renderPosts = (state) => {
  const posts$ = sel(SELECTORS.posts);
  let feedsHTML = '';

  state.postsList.forEach((post) => {
    const postWatched = state.uiState.watchedPosts.includes(post.guid);
    feedsHTML += `
      <li class="list-group-item d-flex justify-content-between align-items-start border-0 border-end-0">
        <a href="${post.link}" class="${postWatched ? 'link-secondary fw-normal' : 'fw-bold'}" data-id="2" target="_blank" rel="noopener noreferrer">${post.title}</a>
        <button type="button" class="btn btn-outline-primary btn-sm" data-id="${post.guid}" data-bs-toggle="modal" data-bs-target="#modal">Просмотр</button>
      </li>`;
  });

  posts$.innerHTML = `
    <div class="card border-0">
      <div class="card-body">
        <h2 class="card-title h4">Посты</h2>
      </div>
      <ul class="list-group border-0 rounded-0">${feedsHTML}</ul>
    </div>
  `;
};

const renderChannels = (channels) => {
  const feeds$ = sel(SELECTORS.feeds);

  let channelList = '';

  channels.forEach((channel) => {
    channelList += `<li class="list-group-item border-0 border-end-0"><h3 class="h6 m-0">${channel.title}</h3><p class="m-0 small text-black-50">${channel.description}</p></li>`;
  });

  feeds$.innerHTML = `
    <div class="card border-0">
      <div class="card-body"><h2 class="card-title h4">Фиды</h2></div>
      <ul class="list-group border-0 rounded-0">${channelList}</ul>
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

const init = (initState) => {
  const watchedState = onChange(initState, (path, value, previousValue, applyData) => {
    if (path === 'uiState.watchedPosts') {
      renderPosts(initState);
    }
    if (path === 'modal.id' && value !== null) {
      renderModal(initState);
    }
    if (path === 'rssForm.url.value' && value === null) {
      document.querySelector(SELECTORS.form).reset();
    }
    if (path === 'postsList' || path === 'channelList') {
      renderChannels(initState.channelList);
      renderPosts(initState);
    }
    if (path === 'rssForm.status') {
      renderForm(initState);
    }
  });

  return watchedState;
};

export default init;