'use strict';

function toBoolean(value, fallback) {
  if (value === undefined || value === '') {
    return fallback;
  }

  return value.toLowerCase() === 'true';
}

const hasLicenseKey = Boolean(process.env.NEW_RELIC_LICENSE_KEY);
const shouldEnableAgent =
  process.env.NODE_ENV === 'production' && hasLicenseKey;

exports.config = {
  app_name: [process.env.NEW_RELIC_APP_NAME || 'FlexIt Backend'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  agent_enabled: toBoolean(process.env.NEW_RELIC_ENABLED, shouldEnableAgent),
  distributed_tracing: {
    enabled: true,
  },
  logging: {
    filepath: process.env.NEW_RELIC_LOG || 'stdout',
    level: process.env.NEW_RELIC_LOG_LEVEL || 'info',
  },
  attributes: {
    exclude: [
      'request.headers.authorization',
      'request.headers.cookie',
      'request.headers.proxyAuthorization',
      'request.headers.setCookie*',
      'response.headers.authorization',
      'response.headers.cookie',
      'response.headers.proxyAuthorization',
      'response.headers.setCookie*',
    ],
  },
};
