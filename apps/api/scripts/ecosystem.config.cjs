// PM2 ecosystem file for cutai.org API + Worker
// Copy to server: /opt/cutai.org/ecosystem.config.cjs
// Start: pm2 start ecosystem.config.cjs

module.exports = {
  apps: [
    {
      name: 'cutai-api',
      cwd: '/opt/cutai.org/apps/api',
      script: 'dist/server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: '3002',
        DATABASE_URL: process.env.DATABASE_URL,
        REDIS_URL: 'redis://localhost:6383',
        WEB_ORIGIN: 'https://cutai.org',
        SCORE_RATE_LIMIT_PER_HOUR: '30',
        SCAN_RATE_LIMIT_PER_HOUR: '10',
        FETCH_TIMEOUT_MS: '5000',
        FETCH_MAX_BYTES: '5242880',
      },
    },
    {
      name: 'cutai-worker',
      cwd: '/opt/cutai.org/apps/api',
      script: 'dist/worker.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        DATABASE_URL: process.env.DATABASE_URL,
        REDIS_URL: 'redis://localhost:6383',
        FETCH_TIMEOUT_MS: '5000',
        FETCH_MAX_BYTES: '5242880',
      },
    },
  ],
};
