import i18next from 'i18next';
import resources from './locale_resources.js';

export default () => {
  const i18Instance = i18next.createInstance();

  i18Instance.init({
    lng: 'ru',
    debug: false,
    resources,
  });

  return i18Instance;
};
