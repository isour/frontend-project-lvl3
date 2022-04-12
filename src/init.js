// @ts-check

import { setLocale, string } from 'yup';
import axios from 'axios';
import { sel, SELECTORS } from './helpers.js';
import yupLocale from './localization/yup.js';
import watch from './watcher.js';
import i18 from './localization/locale.js';

const getProxiedUrl = (url) => {
  const urlResult = new URL('/get', 'https://allorigins.hexlet.app');
  urlResult.searchParams.set('url', url);
  urlResult.searchParams.set('disableCache', 'true');
  return urlResult.toString();
};

const state = {
  rssForm: {
    status: 'default',
    url: {
      value: '',
      errorKey: '',
    },
  },
  channelList: [],
  postsList: [],
  modal: {
    id: null,
    text: null,
    title: null,
  },
  uiState: {
    watchedPosts: [],
  },
};

const watchedState = watch(state, i18());

const setError = (errorKey, errorStatus) => {
  watchedState.rssForm.url.errorKey = errorKey;
  watchedState.rssForm.status = errorStatus;
  if (errorStatus === 'valid') watchedState.rssForm.url.value = null;
};

const uid = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

const validateURL = (value) => {
  const validationSchema = string().url().required();

  return validationSchema
    .validate(value)
    .then(() => null)
    .catch((e) => e.message);
};

const updateFeeds = () => {
  setTimeout(() => {
    const promises = [];
    watchedState.channelList.forEach((channel) => {
      // eslint-disable-next-line no-use-before-define
      promises.push(processRSS(channel.url, true));
    });
    const promise = Promise.all(promises);
    return promise.finally(() => {
      updateFeeds();
    });
  }, 5000);
};

const getFeed = (url, update = false) => {
  let feedObject = {};

  const parser = new DOMParser();
  return axios.get(getProxiedUrl(url))
    .then((response) => {
      let parsedRSS;
      try {
        parsedRSS = parser.parseFromString(response.data.contents, 'text/xml');
      } catch (error) {
        setError(error, 'invalid');
      }
      const currentId = uid();

      feedObject = {
        url,
        id: currentId,
        status: 'loaded',
        title: parsedRSS.querySelector('title').textContent,
        description: parsedRSS.querySelector('description').textContent,
      };

      const newPosts = [...parsedRSS.querySelectorAll('item')];
      const oldsPosts = watchedState.postsList.map((post) => post.title);

      const differenceItems$ = newPosts.filter((x) => !oldsPosts.includes(x.querySelector('title').textContent));

      const differecePosts = [];
      differenceItems$.forEach((item) => {
        differecePosts.push({
          title: item.querySelector('title').textContent,
          guid: uid(),
          link: item.querySelector('link').textContent,
          description: item.querySelector('description').textContent,
          pubDate: item.querySelector('pubDate').textContent,
          parentId: currentId,
        });
      });

      watchedState.postsList = [
        ...watchedState.postsList,
        ...differecePosts,
      ];

      if (!update) {
        watchedState.channelList.push(feedObject);
        setError('rssLoaded', 'valid');
      }
    })
    .catch((error) => {
      setError(error, 'invalid');
    });
};

const processRSS = (currentURL, update = false) => {
  const { channelList } = watchedState;
  if (channelList.filter((feed) => feed.url === currentURL).length === 0 || update) {
    if (!update) watchedState.rssForm.url.value = '';
    getFeed(currentURL, update);
    return;
  }
  setError('rssExist', 'invalid');
};

const formSubmit = (event) => {
  event.preventDefault();
  const inputValue = sel(SELECTORS.input).value.trim();

  watchedState.rssForm.url.value = inputValue;
  watchedState.rssForm.status = 'pending';

  validateURL(inputValue)
    .then((error) => {
      if (!error) {
        processRSS(watchedState.rssForm.url.value);
      } else {
        setError(error, 'invalid');
      }
    })
    .catch((e) => e.message);
};

const modalClick = (event) => {
  if (!('id' in event.target.dataset)) {
    return;
  }

  watchedState.modal.id = event.target.dataset.id;
  watchedState.uiState.watchedPosts.push(watchedState.modal.id);
};

const init = () => {
  document.querySelector(SELECTORS.form).addEventListener('submit', formSubmit);
  document.querySelector(SELECTORS.posts).addEventListener('click', modalClick);

  const i18Instance = i18;
  setLocale(yupLocale);
  updateFeeds();
  return i18Instance;
};

export { init as default };
