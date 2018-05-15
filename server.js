const logger = require('@hmcts/nodejs-logging').Logger.getLogger(__filename);
const app = require('./app');
const config = require('config');
const path = require('path');
const https = require('https');
const baseUrl = require('helpers/baseUrl');
const fs = require('fs');

let http = {};

if (config.environment === 'development' || config.environment === 'testing') {
  const sslDirectory = path.join(__dirname, 'resources', 'localhost-ssl');

  const sslOptions = {
    key: fs.readFileSync(path.join(sslDirectory, 'localhost.key')),
    cert: fs.readFileSync(path.join(sslDirectory, 'localhost.crt'))
  };

  const server = https.createServer(sslOptions, app);

  http = server.listen(config.get('node.port'));
} else {
  http = app.listen(config.get('node.port'));
}

logger.info(`Application running: ${baseUrl}`);

process.on('SIGTERM', () => {
  http.close(() => {
    process.exit(0); // eslint-disable-line no-process-exit
  });
});
