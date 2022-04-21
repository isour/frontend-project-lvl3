// @ts-check

import * as yup from 'yup';
import axios from 'axios';
import i18next from 'i18next';
import { sel, SELECTORS } from './helpers.js';
import yupLocale from './localization/yup.js';
import watch from './watcher.js';
import resources from './localization/locale_resources.js';
import parseRss from './rss.js';

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

  const i18Instance = i18next.createInstance();

  const i18Promise = i18Instance.init({
    lng: 'ru',
    debug: false,
    resources,
  }).then(() => {
    yup.setLocale(yupLocale);
    const validationSchema = yup.string().url().required();

    const validateURL = (url, currentState) => {
      const { channelList } = currentState;

      const channelURLs = channelList.map((channel) => channel.url);
      const currentSchema = validationSchema.notOneOf(channelURLs);

      return currentSchema
        .validate(url)
        .then(() => null)
        .catch((e) => e.message);
    };

    const watchedState = watch(state, i18Instance);

    const getFeed = (url) => axios
      .get(getProxiedUrl(url))
      .then((response) => {
        const parsedRSS = parseRss(url, response.data.contents, watchedState);

        watchedState.postsList = [
          ...watchedState.postsList,
          ...parsedRSS.differecePosts,
        ];
      })
      .catch((error) => {
        console.log(error);
      });

    const getRSS = (url) => axios
      .get(getProxiedUrl(url))
      .then((response) => {
        const parsedRSS = parseRss(url, response.data.contents, watchedState);

        watchedState.postsList = [
          ...watchedState.postsList,
          ...parsedRSS.differecePosts,
        ];

        watchedState.channelList.push(parsedRSS.feedObject);
        watchedState.rssForm.url.errorKey = 'rssLoaded';
        watchedState.status = null;
        watchedState.rssForm.url.value = null;
      })
      .catch((error) => {
        watchedState.rssForm.url.errorKey = error.isParsing ? 'badRSS' : 'network';
        watchedState.status = 'invalid';
      });

    const updateFeeds = () => {
      setTimeout(() => {
        const promises = watchedState.channelList;
        promises.map((channel) => getFeed(channel.url, false));
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
      watchedState.status = 'pending';

      validateURL(inputValue, watchedState)
        .then((error) => {
          if (!error) {
            const currentURL = watchedState.rssForm.url.value;
            getRSS(currentURL);
          } else {
            watchedState.rssForm.url.errorKey = error;
            watchedState.status = 'invalid';
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

    updateFeeds();
    document.querySelector(SELECTORS.form).addEventListener('submit', formSubmit);
    document.querySelector(SELECTORS.posts).addEventListener('click', modalClick);
  });

  return i18Promise;
};
