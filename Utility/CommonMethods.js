const SelfHeal = require('../GenAIModule/SelfHeal');
const fs = require('fs');
const path = require('path');
const { XMLSerializer } = require('xmldom');

const CommonMethods = {

    /**
     * Click on an element..
     */
    clickFunction: async function(page, selector, objName){
        try{
            const element = typeof selector === 'string' ? page.locator(selector) : selector;
            if(await element.isVisible()){
                await element.click();
                console.log(`${objName} - clicked.`)
                return true;
            }else{
                console.log(`Element not Found ${objName}`)
                return false;
            }
        }catch(err){
            console.log(`Error clicking element ${objName}`, err);
            return false;
        }
    },

    /**
     * Enter Text into an elment.
     */
    enterTextFunction: async function (page, selector, value, objName) {
        try{
            const element = typeof selector === 'string' ? page.locator(selector) : selector;
         if(await element.isVisible()){
                await element.fill(value);
                console.log(`${value} entered into ${objName}.`)
                return true;
            }else{
                /**
                 * Retry with AI Self Healing if element is not found
                 */
                console.log(`Element not Found ${objName} Re-trying with AI Self Healing...`);
                const OldDOM = await CommonMethods.getDOMFromSnapshot('Login');
                const selfHealInstance = new SelfHeal({ /* pass required options here */ });
                const newLocator = await selfHealInstance.getNewLocator(OldDOM, selector, page);
                if(newLocator !== null){
                    console.log(`Locator updated from ${selector} to ${newLocator} retrying...`);
                    const newElement = typeof newLocator === 'string' ? page.locator(newLocator) : newLocator;
                    if(await newElement.isVisible()){
                        await newElement.fill(value);
                        CommonMethods.writeUpdatedDOMToFile();
                        console.log(`Updated DOM written to file.`);
                        console.log(`${value} entered into ${objName} using new locator ${newLocator}.`);
                        return true;
                    }else{
                        console.log(`New locator ${newLocator} for ${objName} is not visible.`);
                        return false;
                    }
                }else{
                    console.log(`Failed to find a new locator for ${objName} using self-heal.`);
                    return false;
                }
                /**
                 * End of AI Self Healing Retry
                 */
            }
        }catch(err){
            console.log(`Error Entering Text into element ${objName}`, err);
            return false;
        }
    },

    /**
     * Verify Object Exists in the page
     */
    verifyElement: async function(page,selector,objName) {
        try{
            const element = typeof selector === 'string' ? page.locator(selector) : selector;
            if(await element.count()>0){
                console.log(`${objName} is displayed on screen`);
                return true;
            }else{
                console.log(`${objName} is not displayed on screen.`);
                return false;
            }
        }catch(err){
            console.log(`Error verifying element ${objName}`, err);
        }
    },

    /**
     * Get the old DOM from the snapshot file.
     * This is used for AI Self Healing to compare the current DOM with the snapshot.
     * @param {*} pageTitle 
     * @returns 
     */
    async getDOMFromSnapshot(pageTitle) {
    try {
      const rootDir = path.resolve(__dirname, '..');
      const domStoragePath = path.join(rootDir, 'DOM-Snapshots');
      const domFilePath = path.join(domStoragePath, `${pageTitle}.html`);

      if (!fs.existsSync(domFilePath)) {
        throw new Error(`DOM file not found for ${pageTitle}`);
      }
      const dom = fs.readFileSync(domFilePath, 'utf8');
      return dom;
    } catch (error) {
      console.error(`Error getting DOM from snapshot: ${error}`);
      return null;
    }
  },

  /**
   * Write the updated DOM to the snapshot file.
   * This is used to update the snapshot file after AI Self Healing.
   */

   async writeUpdatedDOMToFile(){
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
            fs.writeFileSync(domFilePath, dom);
            console.log(`DOM file Updated for ${pageTitle}`);
          } else {
            fs.writeFileSync(domFilePath, dom);
            console.log(`DOM captured and saved to ${domFilePath}`);
          }
        } catch (error) {
          console.error(`Error capturing DOM: ${error}`);
        }
  }

}
export default CommonMethods;