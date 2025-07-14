import { test, expect } from '@playwright/test';
import LoginPageMethods from '../pageMethods/homePage.js';
import * as navUtils from '../utils/navUtil.js';
import * as reportingUtils from '../utils/reportingUtil.js';

 let loginPage;
 let page;

 test.beforeAll(async ({ browser }) => {
   const context = await browser.newContext();
   page = await context.newPage();
   loginPage = new LoginPageMethods(page);
   await navUtils.navigate(page, '');
 });
 test('Successful login', async () => {
   try {
     /**
      * Test implementation
      */
   } catch (error) {
     //await reportingUtils.captureScreenshot(test.info(), page);
     throw error;
   }
 });
 test('Failed login', async () => {
   try {
     await loginPage.verifyLoginPage();
     await loginPage.login('invalid', 'credentials');
     const error = await loginPage.getErrorMessage();
     expect(error).toContain('Invalid credentials');
   } catch (error) {
     //await reportingUtils.captureScreenshot(test.info(), page);
     throw error;
   }
 });
 test.afterAll(async () => {
   //await reportingUtils.generateHTMLReport();
 });