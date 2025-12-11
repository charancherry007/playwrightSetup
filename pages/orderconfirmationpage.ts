import { Page, Locator } from "@playwright/test";

export class PreviewPage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * This method is used to get the text from an element inside an iframe.
     * @param selector - The selector to find the element inside the iframe.
     */
    async getTextFromElementInIframe(selector: string): Promise<string> {
        await this.page.waitForLoadState('domcontentloaded');
        const frames = this.page.frames();
        for (const frame of frames) {
            await frame.waitForLoadState('domcontentloaded');
            await frame.waitForSelector(selector, { state: 'visible', timeout: 5000 });
            const element = frame.locator(selector);
            if (element !== null) {
                const text = await element.textContent();
                console.log(`Text from element in iframe: ${text}`);
                return text || '';
            }
        }
        console.error(`Element not found in any iframe: ${selector}`);
        return '';
    }

    /**
     * Verifies a field value inside the Preview Order table.
     *
     * @param fieldName - The visible label in the left column ("Account Name", "Symbol", etc.)
     * @param expectedValue - Expected text in the value column
     */
    async verifyPreviewOrderField(fieldName: string, expectedValue: string): Promise<boolean> {
        const valueXPath = `//div[contains(@class,"container visible")]//tr/td[text()="${fieldName}"]/following-sibling::td`;
        const actualText: string = (await this.getTextFromElementInIframe(valueXPath))?.trim() ?? "";
        if (actualText !== expectedValue) {
            console.error(`❌ Verification failed for "${fieldName}". Expected: "${expectedValue}", Actual: "${actualText}"`);
            throw new Error(`Verification failed for "${fieldName}". Expected: "${expectedValue}", Actual: "${actualText}"`);
        } else {
            console.log(`✅ Verified "${fieldName}" = "${expectedValue}"`);
            return true;
        }
    }

    private async verifyOrderDetails(expectedAction: string, details: OrderConfirmationDetails) {
        console.log(`Starting verification for ${expectedAction} order...`);
        await this.verifyPreviewOrderField("Action", expectedAction);
        if (details.accountNumber) await this.verifyPreviewOrderField("Account", details.accountNumber);
        if (details.symbol) await this.verifyPreviewOrderField("Symbol", details.symbol);
        if (details.quantity) await this.verifyPreviewOrderField("Quantity", details.quantity);
        if (details.orderType) await this.verifyPreviewOrderField("Order Type", details.orderType);
        if (details.limitPrice) await this.verifyPreviewOrderField("Limit Price", details.limitPrice);
        if (details.stopPrice) await this.verifyPreviewOrderField("Stop Price", details.stopPrice);
        if (details.timeInForce) await this.verifyPreviewOrderField("Time in Force", details.timeInForce);
        if (details.gtDate) await this.verifyPreviewOrderField("GT Date", details.gtDate);
        console.log(`Completed verification for ${expectedAction} order.`);
    }
}

export interface OrderConfirmationDetails {
    accountNumber?: string;
    symbol?: string;
    quantity?: string;
    orderType?: string;
    limitPrice?: string;
    stopPrice?: string;
    timeInForce?: string;
    gtDate?: string;
}

