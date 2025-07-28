class LoginPage{
    
    constructor(page){
        this.page = page;
        this.usernameField = page.locator('//div[@type="radio"]');
        this.passwordField = page.locator('//input[@name="password"]');
        this.loginBtn = page.locator('//button[@type="submit"]');
        this.hamburgerMenu = page.locator('//button[@aria-label="Open navigation menu"]');
        this.searchField = page.locator('//input[@placeholder="Search..."]');
        /**
         * Add locators of specific page.
         */
    }
}
export default LoginPage;