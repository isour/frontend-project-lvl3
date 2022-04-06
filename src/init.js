// @ts-check

import { setLocale, string } from 'yup';
import { sel, SELECTORS } from './helpers';
import yupLocale from './localization/yup';
import watch from './watcher';

const init = () => {
  const state = {
    rssForm: {
      status: 'default',
      url: {
        value: '',
        errorKey: '',
      },
    },
    rssList: [],
  };

  const watchedState = watch(state);

  const validateURL = (value) => {
    setLocale(yupLocale);
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
      watchedState.rssForm.url.errorKey = '';
      watchedState.rssForm.status = 'valid';
    } else {
      watchedState.rssForm.url.errorKey = 'rssExist';
      watchedState.rssForm.status = 'error';
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
          watchedState.rssForm.url.errorKey = error;
          watchedState.rssForm.status = 'error';
        };
      })
      .catch((e) => e.message);
  };

  document.querySelector(SELECTORS.form).addEventListener('submit', formSubmit);
};

export { SELECTORS, init as default };
