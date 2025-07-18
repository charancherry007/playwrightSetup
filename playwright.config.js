import {devices} from '@playwright/test'
const config = require('./config/config.json');

module.exports = {
 timeout: config.timeout,
 outputDir: config.reportPath,
 use: {
   headless: config.headless,
   screenshot:{
    mode: 'only-on-failure',
    fullPage:true,
   },
   video: 'retain-on-failure',
   trace: 'retain-on-failure'
 },
 reporter: [
   ['html', { outputFolder: config.reportPath ,open:'never'}]
 ],
 projects: [
  {
    name: 'chromium',
    use:{...devices['Desktop Chrome'],
      launchOptions:{
        args:['--start-maximized'],
      }
    }
  }
 ]
};