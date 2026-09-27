module.exports = {
  apps: [
    {
      name: 'smktibazmav3',
      script: '.next/standalone/server.js', // 👈 Mengarahkan ke server standalone
      instances: process.platform === 'win32' ? 1 : 'max',
      exec_mode: process.platform === 'win32' ? 'fork' : 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
