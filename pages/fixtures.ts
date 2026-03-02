import { test, Page, Request, Response } from '@playwright/test';

/**
 * Executes a test step with automatic background API tracking.
 * It waits for all fetch/xhr requests triggered by the step to complete with a 200 status.
 */
export async function step(
    page: Page,
    title: string,
    action: () => Promise<void>
) {
    await test.step(title, async () => {
        // 1. Initial wait for settle before starting the step
        await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => { });

        const inflight = new Set<Request>();
        const failed: string[] = [];

        const onRequest = (request: Request) => {
            if (['fetch', 'xhr'].includes(request.resourceType())) {
                inflight.add(request);
            }
        };

        const onResponse = (response: Response) => {
            const request = response.request();
            if (['fetch', 'xhr'].includes(request.resourceType())) {
                inflight.delete(request);
                if (response.status() !== 200) {
                    failed.push(`${request.url()} returned ${response.status()}`);
                }
            }
        };

        const onRequestFailed = (request: Request) => {
            if (['fetch', 'xhr'].includes(request.resourceType())) {
                inflight.delete(request);
                failed.push(`${request.url()} failed: ${request.failure()?.errorText || 'unknown error'}`);
            }
        };

        // Attach listeners
        page.on('request', onRequest);
        page.on('response', onResponse);
        page.on('requestfailed', onRequestFailed);

        try {
            console.log(`Executing step: ${title}`);
            await action();

            // Wait for all APIs triggered during the action to settle
            const startTime = Date.now();
            const timeout = 30000;

            // Give a tiny buffer for APIs to start
            await page.waitForTimeout(500);

            while (inflight.size > 0 && (Date.now() - startTime) < timeout) {
                await page.waitForTimeout(200);
            }

            if (failed.length > 0) {
                console.warn(`Step "${title}" completed but some APIs failed:\n${failed.join('\n')}`);
            }
        } catch (error: any) {
            console.error(`Step "${title}" failed. Error: ${error.message}`);
            console.log(`Refreshing page and retrying...`);
            await page.reload();
            await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => { });
            await action();
        } finally {
            // Clean up listeners
            page.off('request', onRequest);
            page.off('response', onResponse);
            page.off('requestfailed', onRequestFailed);
        }

        const screenshot = await page.screenshot({ fullPage: true });
        await test.info().attach(title, {
            body: screenshot,
            contentType: 'image/png'
        });
    });
}
