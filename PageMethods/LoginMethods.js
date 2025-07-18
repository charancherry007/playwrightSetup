import PageMaps from '../PageObjects/PageMaps';
import CommonMethods from '../Utility/CommonMethods';

class LoginMethods{

    constructor(page){
        this.page = page;
        this.Pages = new PageMaps(page);
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
                await CommonMethods.enterTextFunction(this.page, this.Pages.LoginPage.usernameField,'Demo Email','Email Field');
                await CommonMethods.enterTextFunction(this.page, this.Pages.LoginPage.passwordField,'Demo Password','Password Field');
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