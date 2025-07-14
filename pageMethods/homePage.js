const locators = require('../pages/homePage');
const actionUtils = require('../utils/actions.js');
const navUtils = require('../utils/navUtil');

class HomePageMethods {

 constructor(page) {
   this.page = page;
 }

 /**
  * Enter username and password and click on login.
  * @param {username field} username 
  * @param {password field} password 
  */
 async login(username, password) {
   await actionUtils.fill(this.page.locator(locators.usernameInput), username);
   await actionUtils.fill(this.page.locator(locators.passwordInput), password);
   await actionUtils.click(this.page.locator(locators.loginButton));
 }

 /**
  *Verify page is visibile. 
  */
 async verifyLoginPage() {
    await actionUtils.waitForVisibility(this.page.locator(locators.usernameInput));
 }

}
module.exports = HomePageMethods;