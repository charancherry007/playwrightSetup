import LoginPage from'./LoginPage';

class PageMaps{
    constructor(page){
        this.LoginPage = new LoginPage(page);
        /**
         * Add other page locator class
         */
    }
}

export default PageMaps;
