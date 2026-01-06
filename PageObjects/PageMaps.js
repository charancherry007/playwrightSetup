import LoginPage from './LoginPage';
import { AdditionalDetailsPage } from '../pages/soe-additionaldetailspage';

class PageMaps {
    constructor(page) {
        this.LoginPage = new LoginPage(page);
        this.AdditionalDetailsPage = new AdditionalDetailsPage(page);
        /**
         * Add other page locator class
         */
    }
}

export default PageMaps;
