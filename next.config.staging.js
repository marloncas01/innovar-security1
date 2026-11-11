const baseConfig = require('./next.config');

module.exports = {
  ...baseConfig,
  // Staging-specific overrides
  env: {
    NEXT_PUBLIC_APP_ENV: 'staging',
  },
  // Force HTTPS in staging
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        ],
      },
    ];
  },
};
