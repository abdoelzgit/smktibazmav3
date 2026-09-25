module.exports = {
  apps: [
    {
      name: 'smktibazmav3',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: process.platform === 'win32' ? 1 : 'max',
      exec_mode: process.platform === 'win32' ? 'fork' : 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
