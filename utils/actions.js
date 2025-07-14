const config = require('../config/config.json');

module.exports = {
 async click(element) {
   await element.waitFor({ state: 'visible', timeout: config.timeout });
   await element.click();
 },
 async fill(element, text) {
   await this.waitForVisibility(element);
   await element.fill(text);
 },
 async waitForVisibility(element, timeout = config.timeout) {
   await element.waitFor({ state: 'visible', timeout });
 },
 async waitForPageLoad(page) {
   await page.waitForLoadState('networkidle');
 }
};