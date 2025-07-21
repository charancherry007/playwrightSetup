import {test,expect} from '@playwright/test';
import MethodsMap from '../PageMethods/MethodsMap';
import PageMaps from '../PageObjects/PageMaps';


test.describe('Test case description',() =>{

    let Pages;
    let Methods;
    let page;

    test.beforeEach(async ({browser})=>{
        const context = await browser.newContext();
        page = await context.newPage();
        Pages = new PageMaps(page);
        Methods = new MethodsMap(page);
        await Methods.LoginMethods.naviagteTo('https://www.demoshop.com.tr/login'); 
        await page.bringToFront();
        await page.setViewportSize({ width: 1920, height: 1080 });
    });

    test('Test Case Name..', async()=>{
        expect(await Methods.LoginMethods.signIn('usernmae','password')).toBeTruthy();
        expect(await Methods.LoginMethods.searchAndSelectOrderType('order Number')).toBeTruthy();
    });

    test.afterEach(async()=>{
        await page.close();
    });

});