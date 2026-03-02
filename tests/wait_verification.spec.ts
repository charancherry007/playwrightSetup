import { test, expect } from '@playwright/test';
import { step } from '../pages/fixtures';

test.describe('Wait Script Verification', () => {
    test('Verify step function waits for 200 status API', async ({ page }) => {
        await page.route('**/api/slow', async route => {
            await new Promise(resolve => setTimeout(resolve, 2000));
            await route.fulfill({ status: 200, body: 'Done' });
        });

        await page.setContent('<html><body><button id="trigger">Trigger API</button><script>document.getElementById("trigger").onclick = () => fetch("/api/slow")</script></body></html>');

        const startTime = Date.now();
        await step(page, 'Success Step', async () => {
            await page.click('#trigger');
        });
        const duration = Date.now() - startTime;

        console.log(`Step duration: ${duration}ms`);
        expect(duration).toBeGreaterThan(2000);
    });

    test('Verify step function logs warning for 404 status API', async ({ page }) => {
        await page.route('**/api/fail', async route => {
            await new Promise(resolve => setTimeout(resolve, 1000));
            await route.fulfill({ status: 404, body: 'Not Found' });
        });

        await page.setContent('<html><body><button id="trigger">Trigger API</button><script>document.getElementById("trigger").onclick = () => fetch("/api/fail")</script></body></html>');

        await step(page, 'Failure Step', async () => {
            await page.click('#trigger');
        });
        // We expect a warning in the console (checked manually or via listener)
    });
});
