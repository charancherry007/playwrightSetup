const config = require('./config/config.json');

module.exports = {
 timeout: config.timeout,
 outputDir: config.reportPath,
 use: {
   headless: config.headless,
   viewport: config.viewport,
   screenshot: 'only-on-failure',
   video: 'retain-on-failure',
   trace: 'retain-on-failure'
 },
 reporter: [
   ['list'],
   ['html', { outputFolder: config.reportPath ,open:'never'}]
 ],
 projects: [
   {
     name: 'chromium',
     use: { browserName: 'chromium' },
   },
   {
     name: 'firefox',
     use: { browserName: 'firefox' },
   }
 ]
};