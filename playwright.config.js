import { devices } from '@playwright/test'
const config = require('./config/config.json');

module.exports = {
  timeout: config.timeout,
  outputDir: config.reportPath,
  use: {
    headless: config.headless,
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true,
    },
    video: 'retain-on-failure',
    trace: 'retain-on-failure'
  },
  // Choose reporter based on environment variable
  reporter: process.env.REPORTER === 'cloud'
    ? [['list'], ['blob', { outputDir: 'blob-report' }]] // Cloud reporting configuration
    : [['html', { outputFolder: config.reportPath, open: 'never' }]], // Local reporting (default)
  projects: [
    {
      name: 'Microsoft Edge',
      use: {
        ...devices['Desktop Edge'],
        channel: 'msedge',
        permissions: [
          'geolocation',
          'notifications',
          'camera',
          'microphone',
          'clipboard-read',
          'clipboard-write',
          'background-sync',
          'midi',
          'midi-sysex',
          'payment-handler'
        ],
        launchOptions: {
          args: ['--start-maximized',
            '--disable-web-security',
            '--disable-features=PermissionPrompt']
        },
        viewport: null,
        deviceScaleFactor: undefined
      }
    }
  ]
};