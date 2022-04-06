import i18next from 'i18next';
import resources from './locale_resources';

const i18Instance = i18next.createInstance();

i18Instance.init({
  lng: 'ru',
  debug: false,
  resources,
});

export { i18Instance as default };
