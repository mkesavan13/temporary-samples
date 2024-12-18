import '@webex/plugin-logger';
import '@webex/plugin-authorization';
import '@webex/internal-plugin-mercury';
import '@webex/plugin-people';
import '@webex/internal-plugin-conversation';
import '@webex/plugin-rooms';
import '@webex/plugin-meetings';
import '@webex/internal-plugin-flag';
import '@webex/internal-plugin-feature';
import '@webex/internal-plugin-presence';
import '@webex/internal-plugin-search';
import '@webex/internal-plugin-support';
import '@webex/internal-plugin-team';
import Webex from '@webex/webex-core';
import LocalForageStoreAdapter from '@webex/storage-adapter-local-forage';

/**
 * Creates the default sdk config for the widgets
 * @param {Object} [options={}]
 * @returns {Object}
 */
function defaultConfig(options = {}) {
  return {
    appName: 'webex-widgets-demo',
    appVersion: process.env.REACT_WEBEX_VERSION,
    fedramp: options.fedramp,
    device: {
      ephemeral: true
    },
    logger: {
      level: options.logLevel ?? (process.env.NODE_ENV === 'production' ? 'silent' : 'trace')
    },
    conversation: {
      allowedInboundTags: {
        'webex-mention': ['data-object-type', 'data-object-id', 'data-object-url'],
        a: ['href'],
        b: [],
        blockquote: ['class'],
        strong: [],
        i: [],
        em: [],
        pre: [],
        code: [],
        br: [],
        hr: [],
        p: [],
        ul: [],
        ol: [],
        li: [],
        h1: [],
        h2: [],
        h3: []
      },
      allowedOutboundTags: {
        'webex-mention': ['data-object-type', 'data-object-id', 'data-object-url'],
        a: ['href'],
        b: [],
        blockquote: ['class'],
        strong: [],
        i: [],
        em: [],
        pre: [],
        code: [],
        br: [],
        hr: [],
        p: [],
        ul: [],
        ol: [],
        li: [],
        h1: [],
        h2: [],
        h3: []
      }
    },
    credentials: {
      client_id: process.env.WEBEX_CLIENT_ID,
      scope: 'spark:all spark:kms'
    },
    // Added to help load blocking during decryption
    encryption: {
      kmsInitialTimeout: 10000
    },
    meetings: {
      deviceType: 'WEB',
      experimental: {
        enableUnifiedMeetings: true,
        enableAdhocMeetings: true
      }
    },
    storage: {
      unboundedAdapter: new LocalForageStoreAdapter('webex-react-widgets')
    }
  };
}


/**
 * Creates a sdk instance with the access token
 * @param {string} accessToken
 * @param {object} options
 * @returns {Promise<object>}
 */
export function createSDKInstance(accessToken, options = {}) {
  const webexSDKInstance = new Webex({
    credentials: {
      authorization: {
        access_token: accessToken
      }
    },
    config: defaultConfig(options)
  });

  return Promise.resolve(webexSDKInstance);
}

/**
 * Creates a webex instance with the jwt token generated
 * by a guest issuer.
 * https://developer.webex.com/docs/guest-issuer
 *
 * @param {string} jwt
 * @param {object} options
 * @returns {Promise<object>}
 */
export function createSDKGuestInstance(jwt, options = {}) {
  const webexSDKInstance = new Webex({
    config: defaultConfig(options)
  });

  return webexSDKInstance.authorization.requestAccessTokenFromJwt({jwt}).then(() => webexSDKInstance);
}
