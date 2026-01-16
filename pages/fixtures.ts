import { test, Page } from '@playwright/test';

export async function step(
    page: Page,
    title: string,
    action: () => Promise<void>
) {
    await test.step(title, async () => {
        await action();

        const screenshot = await page.screenshot({ fullPage: true });

        await test.info().attach(title, {
            body: screenshot,
            contentType: 'image/png'
        });
    });
}
