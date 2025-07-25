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
        this.usernameField = page.locator('//input[@name="email"]');
        this.passwordField = page.locator('//input[@name="password"]');
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
        await this.usernameField.fill(username);
        await this.passwordField.fill(password);
        await this.loginBtn.click();
        await this.page.waitForNavigation({ waitUntil: 'networkidle' });
        if (this.page.url() !== 'expectedDashboardUrl') {
            console.log(`Login failed. Current URL is ${this.page.url()}`);
            return false;
        }else {
            console.log(`Successfully logged in as ${username}`);
            return true;
        }
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
}
export default HomePage;