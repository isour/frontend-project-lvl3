// @ts-check

import { object, string } from 'yup';
import { sel, SELECTORS } from './helpers';
import watch from './watcher';

const init = () => {
  const state = {
    rssForm: {
      status: 'default',
      url: {
        value: '',
        errorText: '',
      },
    },
    rssList: [],
  };

  const watchedState = watch(state);

  const validateURL = (value) => {
    const validationSchema = string().url().required();

    return validationSchema
      .validate(value)
      .then(() => null)
      .catch((e) => e.message);
  };

  const processRSS = () => {
    const rssList$ = watchedState.rssList;
    const currentValue = watchedState.rssForm.url.value;
    if (!rssList$.filter((element) => element.url === currentValue).length) {
      rssList$.push({
        url: currentValue,
      });
      watchedState.rssForm.url.value = '';
      watchedState.rssForm.url.errorText = '';
    } else {
      watchedState.rssForm.url.errorText = 'Rss уже существует.';
    }
  };

  const formSubmit = (event) => {
    event.preventDefault();
    const inputValue = sel(SELECTORS.input).value.trim();

    watchedState.rssForm.url.value = inputValue;
    validateURL(inputValue)
      .then((error) => {
        if (!error) {
          processRSS();
        } else {
          watchedState.rssForm.url.errorText = error;
        };
      })
      .catch((e) => e.message);
  };

  document.querySelector(SELECTORS.form).addEventListener('submit', formSubmit);
};

export { SELECTORS, init as default };
