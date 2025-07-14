/**
 * Add locators for each page by creating a pageName.js file
 */
export default class HomePage{
    constructor(page){
        this.elements ={
            usernameField:'//Xpath for username field',
            passwordField:'//Xpath for password field',
            loginButton:'//Xpath for login',
        };
    }
};