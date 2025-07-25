import {test,expect} from '@playwright/test';
import homepage from '../pages/homepage';
import { Page } from 'playwright/test';


test.describe('Test case description',() =>{

    let page: Page;
    let homePage: homepage;

    test.beforeEach(async ({browser})=>{
        const context = await browser.newContext();
        page = await context.newPage();
        homePage = new homepage(page);
        await homePage.navigateTo(); 
        await page.bringToFront();
        await page.setViewportSize({ width: 1920, height: 1080 });
    });

    test('Test Case Name..', async()=>{
        test.step('Login to application', async () => {
            expect(await homePage.login('usernmae','password')).toBeTruthy();
        });
        
        await homePage.openHamburgerMenu();
    });

    test.afterEach(async()=>{
        await page.close();
    });

});