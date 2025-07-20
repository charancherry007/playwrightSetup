import PageMaps from '../PageObjects/PageMaps';
import CommonMethods from '../Utility/CommonMethods';
const fs = require('fs');
const path = require('path');
const { XMLSerializer } = require('xmldom');


class LoginMethods{

    constructor(page){
        this.page = page;
        this.Pages = new PageMaps(page);
        this.captureDOM();
    }

    /**
     * Capture the current DOM and save it to a file.
     * This is used to create a snapshot of the current page state.
     */

    async captureDOM() {
    try {
      const pageTitle = await this.page.title();
      const rootDir = path.resolve(__dirname, '..');
      const domStoragePath = path.join(rootDir, 'DOM-Snapshots');
      const domFilePath = path.join(domStoragePath, `${pageTitle}.html`);

      if (!fs.existsSync(domStoragePath)) {
        fs.mkdirSync(domStoragePath);
      }

      const dom = await this.page.evaluate(() => {
        const serializer = new XMLSerializer();
        return serializer.serializeToString(document.documentElement);
      });

      if (fs.existsSync(domFilePath)) {
        console.log(`DOM file already exists for ${pageTitle}, skipping capture`);
      } else {
        fs.writeFileSync(domFilePath, dom);
        console.log(`DOM captured and saved to ${domFilePath}`);
      }
    } catch (error) {
      console.error(`Error capturing DOM: ${error}`);
    }
  }

  /**
   * get Page Title
   */
  async getPageTitle() {
    try {
      return await this.page.title();
    } catch (error) {
      console.error(`Error getting page title: ${error}`);
      return null;
    }
  }
        
    /**
     * Navigate to url..
     * @param {string} url 
     * @returns 
     */
    async naviagteTo(url){
        try{
            await this.page.goto(url);
            const currentUrl = this.page.url();
            console.log(`Expected url : ${url} Actual url ${currentUrl}`);
            if(url === currentUrl){
                this.captureDOM();
                console.log('Navigated to the url successfully');
                return true;
            }else{
                return false;
            }
        }catch(err){
            console.log('Error Navigating to url ', err);
            return false;
        }
    }
 
    /**
     * Sign into Application.
     */
    async signIn(username,password){
        try{
            await this.page.waitForTimeout(2000);
            if(this.Pages.LoginPage.usernameField.isVisible()){
                await CommonMethods.enterTextFunction(this.page, this.Pages.LoginPage.usernameField,username,'Email Field');
                await CommonMethods.enterTextFunction(this.page, this.Pages.LoginPage.passwordField,password,'Password Field');
                await CommonMethods.clickFunction(this.page, this.Pages.LoginPage.loginBtn,'Login Button')
                return true;
            }else{
                console.log('User Name Input field not found');
                return false;
            }
        }catch(err){
            console.log('Error Performing Login Action ', err);
            return false;
        }
    }
}

export default LoginMethods;