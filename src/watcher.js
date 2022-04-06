// @ts-check
import onChange from 'on-change';
import { sel, SELECTORS } from './helpers';

const init = (initState) => {
  const renderError = (state) => {
    const error = state.rssForm.url.errorText;
    const input$ = sel(SELECTORS.input);
    const error$ = sel(SELECTORS.error);
    if (error) {
      input$.classList.add('is-invalid');
    } else {
      input$.classList.remove('is-invalid');
    }
    error$.innerText = error;
    // console.log(state.rssForm.url.errorText);
  };

  const watchedState = onChange(initState, (path, value, previousValue, applyData) => {
    if (path === 'rssList') {
      // console.log(value);
      // validateURL(value)
      //   .then((error) => {
      //     watchedState.rssForm.url.errorText = error;
      //     if (error) {
      //       watchedState.rssForm.status = 'error';
      //     } else {
      //       watchedState.rssForm.status = 'valid';
      //     }
      //     console.log(watchedState.rssForm.url.errorText);
      //     console.log(error);
      //   })
      //   .catch((e) => e.message);
    };

    if (path === 'rssForm.url.errorText' && value !== previousValue) {
      renderError(initState);
    }
  });

  return watchedState;
};

export default init;