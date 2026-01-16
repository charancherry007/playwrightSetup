import { test as base } from '@playwright/test';

export const test = base.extend({
    page: async ({ page }, use, testInfo) => {
        await use(page);

        if (testInfo.status !== testInfo.expectedStatus) {
            const screenshot = await page.screenshot({ fullPage: true });

            await testInfo.attach('Failure Screenshot', {
                body: screenshot,
                contentType: 'image/png'
            });
        }
    }
});
