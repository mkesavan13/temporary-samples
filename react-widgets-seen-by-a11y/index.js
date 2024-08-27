import '@babel/polyfill';

import React from 'react';
import ReactDOM from 'react-dom';

import {IntlProvider} from 'react-intl';
import {CookiesProvider} from 'react-cookie';

import DemoWidget from './components/demo-widget';

if (process.env.NODE_ENV !== 'production') {
  /* eslint-disable global-require */
  require('@webex/widget-space');
  require('@webex/widget-recents');
  /* eslint-enable */
}

ReactDOM.render(
  <IntlProvider locale="en">
    <CookiesProvider>
      <DemoWidget />
    </CookiesProvider>
  </IntlProvider>,
  document.getElementById('main')
);
