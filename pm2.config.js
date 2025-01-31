module.exports = {
  apps: [
    {
      name: 'back',
      script: './dist/index.js',
      cwd: '/var/www/incubator-express-blogsplatform/hometask_04',
      merge_logs: true,
      error_file: '/var/log/back/err.log',
      out_file: '/var/log/back/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm',
      time: true,
    },
  ],
}
