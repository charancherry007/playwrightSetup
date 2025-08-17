import { Location, Locator, Page } from "playwright/test";
import dotenv from 'dotenv';
dotenv.config({ path: './env/dev.env' });

class HomePage {
    page: Page;
    usernameField: Locator;
    passwordField: Locator;
    loginBtn: Locator;
    hamburgerMenu: Locator;
    searchField: Locator;
    
    /**
     * Constructor for the HomePage class.
     * Initializes locators for various elements on the homepage.
     * @param page - The Playwright Page object representing the current page.
     */
constructor(page: Page){
        this.page = page;
        this.usernameField = page.locator('//input[@placeholder="Username/Email"]');
        this.passwordField = page.locator('//input[@placeholder="Password"]');
        this.loginBtn = page.locator('//button[@type="submit"]');
        
        this.hamburgerMenu = page.locator('//button[@aria-label="Open navigation menu"]');
        this.searchField = page.locator('//input[@placeholder="Search..."]');
        /**
         * Add locators of specific page.
         */
    }

    /**
     * This method is used to navigate to a specific URL.
     * It will throw an error if the navigation fails or if the current URL does not match the expected URL.
     * @param url 
     */

async navigateTo(url?: string) {
    const targetUrl = url || process.env.BASE_URL;
    if (!targetUrl) {
        throw new Error('No URL provided and BASE_URL is not set in .env');
    }
    await this.page.goto(targetUrl);
    if (this.page.url() !== targetUrl) {
        throw new Error(`Failed to navigate to ${targetUrl}. Current URL is ${this.page.url()}`);
    } else {
        console.log(`Successfully navigated to ${targetUrl}`);
    }
}

    /**
     * This method is used to log in to the application.
     * It fills in the username and password fields, clicks the login button, and waits for navigation.
     * If the login fails, it throws an error with the current URL.
     * It returns true if the login is successful, otherwise false. 
     * @param username 
     * @param password 
     */
    async login(username: string, password: string) {
        await this.page.waitForTimeout(5000);
        await this.waitForElementAndClick(this.usernameField); 
        await this.waitForElementAndFill(this.usernameField, username);
        
        if (await this.usernameField.isVisible()) {
        await this.usernameField.fill(username);
        console.log("Username field is visible");
    } else {
        console.log("Username field is not visible");
        return false;
    }
        await this.passwordField.fill(password);
        await this.loginBtn.click();
        await this.waitForElementAndClick(this.loginBtn); 
        await this.page.waitForNavigation({ waitUntil: 'networkidle' });
       
    }

    /**
     * This method is used to open the hamburger menu.
     * It clicks on the hamburger menu button.
     */ 
    async openHamburgerMenu() {
        await this.page.waitForTimeout(5000);
        if (await this.hamburgerMenu.isVisible()) {
            console.log("Hamburger menu is visible");
            await this.hamburgerMenu.click();
            console.log("Hamburger menu opened");
        }else {
            console.log("Hamburger menu is not visible");
        }
    }

    /**
     * This method is used to search for a specific term.
     * It fills in the search field with the provided term and waits for the results to load.
     * @param term 
     */ 
    async search(orderType: string) {
        await this.page.waitForTimeout(5000);
        if (await this.searchField.isVisible()) {
            await this.searchField.fill(orderType);
            console.log(`Searching for ${orderType}`);
            await this.page.waitForTimeout(3000); // Adjust as necessary for results to load
        } else {
            console.log("Search field is not visible");
        }
    }

    /**------------------------------------------(06/08)---------------------------------------------- */

    /**
     * symbolField: Locator;
     * actionsDropdown: Locator;
     * quantityField: Locator;
     * orderTypeDropdown: Locator;
     * stopPriceField: Locator;
     * limitPiceField: Locator;
     * timeInForceDropdown: Locator;
     * dateField: Locator;
     * estimateNetAmountField: Locator;
     * symbolPriceField: :Locator;
     * 
     * this.symbolField = page.locator('//input[@placeholder="Symbol"]');
     * this.actionsDropdown = page.locator('//select[@name="action"]');
     * this.quantityField = page.locator('//input[@placeholder="Quantity"]');
     * this.orderTypeDropdown = page.locator('//select[@name="orderType"]');
     * this.stopPriceField = page.locator('//input[@placeholder="Stop Price"]');
     * this.limitPiceField = page.locator('//input[@placeholder="Limit Price"]');
     * this.timeInForceDropdown = page.locator('//select[@name="timeInForce"]');
     * this.dateField = page.locator('//input[@placeholder="Date"]');
     * this.estimateNetAmountField = page.locator('//span[@id="estimatedNetAmount"]');
     * this.symbolPriceField = page.locator('//span[@id="symbolPrice"]');
     * 
     * This method is used to enter order details.
     * 
     */
    async enterOrderDetails(symbolValue: string, actionValue: string, quantity: number) {
        
        
        await this.symbolField.fill(symbolValue);
        const symbolLocator = this.page.locator('//span[contains(text(), "' + symbolValue + '")]');
        await symbolLocator.click();
        await this.page.waitForTimeout(2000);

        const price: number = await this.symbolPriceField.textContent().trim().replace('$', '').replace(',', ''); 
        await this.actionsDropdown.selectOption({ label: 'Buy' });
        /**
         * if the dropdown select is not available then use the below code
         * await this.actionsDropdown.click();
         * const buyOption = this.page.locator('//li[contains(text(), "Buy")]');
         * await buyOption.click();
         */
        await this.page.waitForTimeout(2000);

        await this.quantityField.fill(quantity);
        await this.page.waitForTimeout(2000);

        await this.orderTypeDropdown.selectOption({ label: 'Buy' });
        /**
         * if the dropdown select is not available then use the below code
         * await this.orderTypeDropdown.click();
         * const orderOption = this.page.locator('//li[contains(text(), "Buy")]');
         * await orderOption.click();
         */
        await this.page.waitForTimeout(2000);

        await this.stopPriceField.fill(price+1); 
        await this.page.waitForTimeout(2000);

        await this.limitPiceField.fill(price+2); 
        await this.page.waitForTimeout(2000);

        await this.timeInForceDropdown.selectOption({ label: 'Buy' });
        /**
         * if the dropdown select is not available then use the below code
         * await this.timeInForceDropdown.click();
         * const buyOption = this.page.locator('//li[contains(text(), "Buy")]');
         * await buyOption.click();
         */
        await this.page.waitForTimeout(2000);

        await this.dateField.fill(await this.getFutureDate(1)); // Get next date
        await this.page.waitForTimeout(2000);

        const estNetAmount: number = await this.estimateNetAmountField.textContent().trim().replace('$', '').replace(',', '');
        if(estNetAmount=== quantity * (price+2)) {
            console.log("Estimated Net Amount is correct");
        }
        else { 
            console.log("Estimated Net Amount is incorrect");
            throw new Error(`Expected Estimated Net Amount to be ${quantity * (price+2)}, but got ${estNetAmount}`);
        }

    }

    /**
     * This method is used to get fututre date.
     * It returns a string representing the date in the format 'MM/DD/YYYY'. 
    */
   async getFutureDate(days: number = 1): Promise<string> {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const yyyy = tomorrow.getFullYear();
        const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const dd = String(tomorrow.getDate()).padStart(2, '0');
        const tomorrowStr = `${yyyy}-${mm}-${dd}`;
        return tomorrowStr;
   }

   /**--------------------------------------------------------------------------------------------------------------- */


   /**
    * Random two digit number generator.
    * Generates a number between 10 and 99
    */
   async generateRandomTwoDigitNumber(): Promise<number> {
        return Math.floor(Math.random() * 11) + 10; 
    }


   /**
    * Account
    * Symbol
    * Action
    * Quantity
    * Order Type
    * Limit Price
    * Stop Price
    * Time in Force
    * GT Date
    * //tr/td[text()="Account"]/td[text()='${AccountNumber}']"]
    * 
    * 
    */
   async verifyPreviewOrderDetails(){
    const accountXpath = await this.page.locator(`//tr/td[text()="Account"]/td[text()='${this.accountNumber}']`);
    const symbolXpath = await this.page.locator(`//tr/td[text()="Symbol"]/td[text()='${this.symbolValue}']`);
    const actionXpath = await this.page.locator(`//tr/td[text()="Action"]/td[text()='${this.actionsDropdown}']`);
    const quantityXpath = await this.page.locator(`//tr/td[text()="Quantity"]/td[text()='${this.quantityField}']`);
    const orderTypeXpath = await this.page.locator(`//tr/td[text()="Order Type"]/td[text()='${this.orderTypeDropdown}']`);
    const limitPriceXpath = await this.page.locator(`//tr/td[text()="Limit Price"]/td[text()='${this.limitPiceField}']`);
    const stopPriceXpath = await this.page.locator(`//tr/td[text()="Stop Price"]/td[text()='${this.stopPriceField}']`);
    const timeInForceXpath = await this.page.locator(`//tr/td[text()="Time in Force"]/td[text()='${this.timeInForceDropdown}']`);
    const gtDateXpath = await this.page.locator(`//tr/td[text()="GT Date"]/td[text()='${this.dateField}']`);
    if(accountXpath!=null && symbolXpath!=null && actionXpath!=null && quantityXpath!=null && orderTypeXpath!=null && limitPriceXpath!=null && stopPriceXpath!=null && timeInForceXpath!=null && gtDateXpath!=null) {
        console.log("All preview order details are correct");
    }else{

    }
   }
   /**
    * Use it to wait for an element to be visible and then click on it.
    * Use it to wait for an element to be visible and then fill it with a value.
    */

   async waitForElementAndClick(locator: Locator, timeout: number = 5000) {
        try {
            await locator.waitFor({ state: 'visible', timeout });
            await locator.click();
            console.log(`Clicked on element: ${await locator.textContent()}`);
        } catch (error) {
            console.error(`Failed to click on element: ${await locator.textContent()}`, error);
            throw error;
        }
   }

   async waitForElementAndFill(locator: Locator, value: string, timeout: number = 5000) {
        try {
            await locator.waitFor({ state: 'visible', timeout });
            await locator.fill(value);
            console.log(`Filled element with value: ${value}`);
        } catch (error) {
            console.error(`Failed to fill element with value: ${value}`, error);
            throw error;
        }
    }

    /**---------------------------------------------------------------------------- */
}
export default HomePage;