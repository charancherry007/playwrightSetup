import { test, expect } from '@playwright/test';
import { step } from '../pages/fixtures';

test('Verify step-level retry logic', async ({ page }) => {
    let callCount = 0;

    await page.goto('https://example.com');

    await step(page, 'Test retry logic', async () => {
        callCount++;
        console.log(`Execution number: ${callCount}`);
        if (callCount === 1) {
            throw new Error('Forced failure on first attempt');
        }
        console.log('Action successful on second attempt');
        await expect(page.locator('h1')).toBeVisible();
    });

    // If we reach here, it means the retry worked (or didn't fail the whole test)
    expect(callCount).toBe(2);
});
