const config = require('../config/config.json');
const actionUtils = require('./actions');

module.exports = {

    /**
     * Navigate to Page url.
     */
 async navigate(page, path) {
   await page.goto(`${config.baseURL}${path}`);
   await actionUtils.waitForPageLoad(page);
 },

 /**
  * Reload the page.
  * @param {page} page 
  */
 async reload(page) {
   await page.reload();
   await actionUtils.waitForPageLoad(page);
 }
};