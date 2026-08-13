module.exports = {
  apps: [
    {
      name: 'crypto-card',
      script: 'dist/server.cjs',
      cwd: '/home/savewiseguide.lat/public_html',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      max_memory_restart: '500M',
      time: true,
    },
  ],
};
