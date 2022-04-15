// @ts-check

import { setLocale, string } from 'yup';
import axios from 'axios';
import { sel, SELECTORS } from './helpers.js';
import yupLocale from './localization/yup.js';
import watch from './watcher.js';
import i18 from './localization/locale.js';
import parseRss from './rss.js';

const setError = (errorKey, errorStatus, state) => {
  state.rssForm.url.errorKey = errorKey;
  state.rssForm.status = errorStatus;
  if (errorStatus === 'valid') state.rssForm.url.value = null;
};

export default () => {
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

  const validateURL = (value) => {
    const validationSchema = string().url().required();

    return validationSchema
      .validate(value)
      .then(() => null)
      .catch((e) => e.message);
  };

  const getFeed = (url, update = false) => axios
    .get(getProxiedUrl(url))
    .then((response) => {
      const parsedRSS = parseRss(url, response.data.contents, watchedState);

      watchedState.postsList = [
        ...watchedState.postsList,
        ...parsedRSS.differecePosts,
      ];

      if (!update) {
        watchedState.channelList.push(parsedRSS.feedObject);
        setError('rssLoaded', 'valid', watchedState);
      }
    })
    .catch((error) => {
      setError(
        error.isParsing ? 'badRSS' : 'network',
        'invalid',
        watchedState,
      );
      console.log(error);
    });

  const updateFeeds = () => {
    setTimeout(() => {
      const promises = watchedState.channelList;
      promises.map((channel) => getFeed(channel.url, true));
      const promise = Promise.all(promises);
      return promise.finally(() => {
        updateFeeds();
      });
    }, 5000);
  };

  const formSubmit = (event) => {
    event.preventDefault();
    const inputValue = sel(SELECTORS.input).value.trim();

    watchedState.rssForm.url.value = inputValue;
    watchedState.rssForm.status = 'pending';

    validateURL(inputValue)
      .then((error) => {
        if (!error) {
          const { channelList } = watchedState;
          const currentURL = watchedState.rssForm.url.value;

          if (channelList.filter((feed) => feed.url === currentURL).length === 0) {
            watchedState.rssForm.url.value = '';
            getFeed(currentURL, false);
          } else {
            setError('rssExist', 'invalid', watchedState);
          }
        } else {
          setError(error, 'invalid', watchedState);
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

  document.querySelector(SELECTORS.form).addEventListener('submit', formSubmit);
  document.querySelector(SELECTORS.posts).addEventListener('click', modalClick);

  const i18Instance = i18;
  setLocale(yupLocale);
  updateFeeds();
  return i18Instance;
};
