import { test, expect } from '@playwright/test';
import MethodsMap from '../PageMethods/MethodsMap';
import PageMaps from '../PageObjects/PageMaps';
import AdditionalDetailsPage from '../pages/soe-additionaldetailspage';
import { test, expect } from './fixtures';

test.describe('Test case description', () => {

    let Pages;
    let Methods;
    let page;


    test.beforeEach(async ({ browser }) => {
        const context = await browser.newContext();
        page = await context.newPage();
        Pages = new PageMaps(page);
        Methods = new MethodsMap(page);
        AdditionalDetailsPage = new AdditionalDetailsPage(page);
        await Methods.LoginMethods.naviagteTo('https://www.demoshop.com.tr/login');
        await page.bringToFront();
        await page.setViewportSize({ width: 1920, height: 1080 });
    });




    test('Test Case Name..', async () => {
        expect(await Methods.LoginMethods.signIn('usernmae', 'password')).toBeTruthy();
        expect(await Methods.LoginMethods.searchAndSelectOrderType('order Number')).toBeTruthy();

        //**-------------------------12/10/2025--------------------------------------------------- */
        test.step('Verify Preview Order', async () => {
            expect(await Methods.LoginMethods.verifyPreviewOrderFields({
                "Account Name": this.accountName,
                "Symbol": this.symbolValue,
                "Action": this.actionsDropdownValue,
            })).toBeTruthy();
        })
        //**-------------------------12/10/2025--------------------------------------------------- */

        //**-------------------------12/10/2025--------------------------------------------------- */
        test.step('Verify Preview Order', async () => {
            expect(await AdditionalDetailsPage.enterAdditionalOrderDetails({
                "Account Name": this.accountName,
                "Symbol": this.symbolValue,
                "Action": this.actionsDropdownValue,
            })).toBeTruthy();
        })
        //**---------------//

        await previewPage.verifyOrderDetails("Buy", { symbol: 'AAPL', quantity: '10' })
    });

    test.afterEach(async () => {
        await page.close();
    });

});