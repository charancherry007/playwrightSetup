const SelfHeal = require('../GenAIModule/SelfHeal');
const fs = require('fs');
const path = require('path');
const { XMLSerializer } = require('xmldom');
const updateDOM = true; // Flag to control DOM updates

const CommonMethods = {

   

  /**
   * Click on an element..
   */
  clickFunction: async function (page, selector, objName) {
    try {
      const element = typeof selector === 'string' ? page.locator(selector) : selector;
      if (await element.isVisible()) {
        await element.click();
        console.log(`${objName} - clicked.`)
        return true;
      } else {
        console.log(`Element not Found ${objName}`)
        return false;
      }
    } catch (err) {
      console.log(`Error clicking element ${objName}`, err);
      return false;
    }
  },

  /**
   * Enter Text into an elment.
   */
  enterTextFunction: async function (page, selector, value, objName) {
    try {
      const element = typeof selector === 'string' ? page.locator(selector) : selector;
      if (await element.isVisible()) {
        await element.fill(value);
        console.log(`${value} entered into ${objName}.`)
        return true;
      } else {
        /**
         * Retry with AI Self Healing if element is not found
         */
        console.log(`Element not Found ${objName} Re-trying with AI Self Healing...`);
        const OldDOM = await CommonMethods.getDOMFromSnapshot('Login');
        const selfHealInstance = new SelfHeal({ /* pass required options here */ });
        if (await selfHealInstance.retryWithSelfHealing(OldDOM, selector, 'fill', page, value)) {
          console.log(`Successfully filled ${objName} using AI Self Healing.`);
          CommonMethods.writeUpdatedDOMToFile();
          return true;
        } else {
          console.log(`Failed to fill ${objName} using AI Self Healing.`);
          return false;
        }
        /**
         * End of AI Self Healing Retry
         */
      }
    } catch (err) {
      console.log(`Error Entering Text into element ${objName}`, err);
      return false;
    }
  },

  /**
   * Verify Object Exists in the page
   */
  verifyElement: async function (page, selector, objName) {
    try {
      const element = typeof selector === 'string' ? page.locator(selector) : selector;
      if (await element.count() > 0) {
        console.log(`${objName} is displayed on screen`);
        return true;
      } else {
        console.log(`${objName} is not displayed on screen.`);
        return false;
      }
    } catch (err) {
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

  async writeUpdatedDOMToFile() {
    if (updateDOM) {
      console.log('Updating DOM file with current page state...');
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
    }else{
      console.log('DOM update is disabled. Skipping DOM write operation.');
    }
  }

}
export default CommonMethods;