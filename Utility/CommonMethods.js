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
                console.log(`Element not Found ${objName}`)
                return false;
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
    }
}
export default CommonMethods;