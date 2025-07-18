class LoginPage{
    
    constructor(page){
        this.page = page;
        this.usernameField = page.locator('//input[@name="email"]');
        this.passwordField = page.locator('//input[@name="password"]');
        this.loginBtn = page.locator('//button[@type="submit"]');
        /**
         * Add locators of specific page.
         */
    }
}
export default LoginPage;