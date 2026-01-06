import LoginMethods from './LoginMethods';
import AdditionalDetailsMethods from './AdditionalDetailsMethods';

class MethodsMap {
    constructor(page) {
        this.LoginMethods = new LoginMethods(page);
        this.AdditionalDetailsMethods = new AdditionalDetailsMethods(page);
        /**
         * Add other page related methods implementation.
         */
    }
}

export default MethodsMap;