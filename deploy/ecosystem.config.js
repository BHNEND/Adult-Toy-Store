module.exports = {
  apps: [
    {
      name: 'ats-backend',
      script: 'dist/index.js',
      cwd: '/root/Projects/Adult-Toy-Store/server',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: '/root/.pm2/logs/ats-backend-error.log',
      out_file: '/root/.pm2/logs/ats-backend-out.log',
      max_memory_restart: '500M',
      autorestart: true,
      watch: false,
    },
  ],
};
