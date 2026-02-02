import { Page, Locator } from "@playwright/test";

export interface OrderDetails {
    symbol: string;
    action: 'Buy' | 'Sell' | 'Buy to Sell' | 'Sell to Buy';
    quantity: string;
    orderType: 'Market' | 'Limit' | 'Stop Limit';
    stopLimitValue?: string;
    timeInForce?: 'Day' | 'Good Until Through' | 'Good Until Cancelled';
    dateOffset?: number;
    solicitedDiscretion?: boolean;
}

export class TradePage {
    readonly page: Page;

    // Selectors
    readonly selectors = {
        symbolInput: '//input[@placeholder="Symbol" or @id="symbol-search"]',
        symbolResult: (symbol: string) => `//div[contains(@class, "dropdown")]//span[contains(text(), "${symbol}")]`,
        symbolPrice: '//span[@id="symbolPrice" or contains(@class, "price")]',
        actionDropdown: '//select[@name="action" or contains(@id, "action") or contains(@class, "dropdown")]',
        quantityInput: '//input[@name="quantity" or @placeholder="Quantity"]',
        orderTypeDropdown: '//select[@name="orderType" or contains(@id, "orderType") or contains(@class, "dropdown")]',
        stopLimitInput: '//input[@name="stopLimit" or @placeholder="Stop Limit"]',
        tifDayBtn: '//button[text()="Day"]',
        tifGTTBtn: '//button[text()="Good Until Through"]',
        tifGTCBtn: '//button[text()="Good Until Cancelled"]',
        solicitedDiscretionBtn: '//button[contains(@id, "solicited") or contains(@id, "discretion")]',
        calendarBtn: '//button[contains(@class, "calendar")]',
        previewOrderBtn: '//button[text()="Preview Order"]',
        dropdownListItem: (value: string) => `//li[contains(text(), "${value}")] | //div[contains(@class, "option") and contains(text(), "${value}")]`
    };

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * These methods prioritize the last frame (frames.length - 1) as elements are expected to be there.
     */

    private async getLastFrame() {
        await this.page.waitForLoadState('domcontentloaded');
        const frames = this.page.frames();
        if (frames.length === 0) throw new Error("No iframes found on the page.");
        return frames[frames.length - 1];
    }

    async clickElementInIframe(selector: string) {
        const frame = await this.getLastFrame();
        try {
            const element = frame.locator(selector).first();
            await element.waitFor({ state: 'visible', timeout: 5000 });
            await element.click();
            console.log(`Clicked on element in last iframe: ${selector}`);
        } catch (e) {
            console.error(`Element not found in last iframe: ${selector}`);
            throw new Error(`Element not found in last iframe: ${selector}. Error: ${e.message}`);
        }
    }

    async fillElementInIframe(selector: string, value: string) {
        const frame = await this.getLastFrame();
        try {
            const element = frame.locator(selector).first();
            await element.waitFor({ state: 'visible', timeout: 5000 });
            await element.fill(value);
            console.log(`Filled element in last iframe with value: ${value}`);
        } catch (e) {
            console.error(`Element not found in last iframe: ${selector}`);
            throw new Error(`Element not found in last iframe: ${selector}. Error: ${e.message}`);
        }
    }

    async getTextFromElementInIframe(selector: string): Promise<string> {
        const frame = await this.getLastFrame();
        try {
            const element = frame.locator(selector).first();
            await element.waitFor({ state: 'visible', timeout: 5000 });
            const text = await element.textContent();
            return text?.trim() || '';
        } catch (e) {
            console.error(`Error getting text from element in last iframe: ${selector}`);
            return '';
        }
    }

    /**
     * Updated to handle non-standard dropdowns that require a click to expand 
     * followed by a click on the list item.
     */
    async selectValueFromDropdownInIframe(dropdownSelector: string, value: string) {
        const frame = await this.getLastFrame();
        try {
            // 1. Click the dropdown to expand it
            const dropdown = frame.locator(dropdownSelector).first();
            await dropdown.waitFor({ state: 'visible', timeout: 5000 });
            await dropdown.click();
            console.log(`Clicked dropdown to expand: ${dropdownSelector}`);

            // 2. Click the specific value from the list
            const itemSelector = this.selectors.dropdownListItem(value);
            const listItem = frame.locator(itemSelector).first();
            await listItem.waitFor({ state: 'visible', timeout: 5000 });
            await listItem.click();

            console.log(`Selected value "${value}" from custom dropdown in last iframe.`);
        } catch (e) {
            console.error(`Failed to select value "${value}" from dropdown: ${dropdownSelector}`);
            throw new Error(`Failed to select value from dropdown. Error: ${e.message}`);
        }
    }

    async isElementEnabledInIframe(selector: string): Promise<boolean> {
        try {
            const frame = await this.getLastFrame();
            const element = frame.locator(selector).first();
            if (await element.isVisible({ timeout: 2000 })) {
                return await element.isEnabled();
            }
        } catch (e) {
            console.warn(`Could not check if element is enabled in last iframe: ${selector}`);
        }
        return false;
    }

    /**
     * Business Logic Methods
     */

    async selectSymbol(symbol: string) {
        console.log(`Searching for symbol: ${symbol}`);
        await this.fillElementInIframe(this.selectors.symbolInput, symbol);
        const resultSelector = this.selectors.symbolResult(symbol);
        await this.clickElementInIframe(resultSelector);

        // Capture Symbol Price (it takes some time to load)
        console.log("Waiting for symbol price to load...");
        const frame = await this.getLastFrame();
        const priceLocator = frame.locator(this.selectors.symbolPrice).first();

        // Wait for price to be visible and non-empty
        await priceLocator.waitFor({ state: 'visible', timeout: 10000 });
        const priceText = await this.getTextFromElementInIframe(this.selectors.symbolPrice);
        console.log(`Captured Symbol Price: ${priceText}`);
    }

    async enterOrderDetails(details: OrderDetails) {
        console.log(`Entering order details for: ${details.symbol}`);

        // 1. Symbol selection
        await this.selectSymbol(details.symbol);

        // 2. Action selection
        await this.selectValueFromDropdownInIframe(this.selectors.actionDropdown, details.action);

        // 3. Quantity input
        await this.fillElementInIframe(this.selectors.quantityInput, details.quantity);

        // 4. Order Type selection
        await this.selectValueFromDropdownInIframe(this.selectors.orderTypeDropdown, details.orderType);

        // Business Logic handling
        if (details.orderType === 'Market') {
            console.log('Order Type is Market. Time In Force defaults to Day.');
        } else if (details.orderType === 'Limit') {
            console.log('Order Type is Limit. Entering Stop Limit value.');
            if (details.stopLimitValue) {
                await this.fillElementInIframe(this.selectors.stopLimitInput, details.stopLimitValue);
            }

            // Time In Force selection for Limit
            if (details.timeInForce) {
                console.log(`Selecting Time In Force: ${details.timeInForce}`);
                switch (details.timeInForce) {
                    case 'Day':
                        await this.clickElementInIframe(this.selectors.tifDayBtn);
                        break;
                    case 'Good Until Through':
                        await this.clickElementInIframe(this.selectors.tifGTTBtn);
                        await this.handleCalendar(details.dateOffset);
                        break;
                    case 'Good Until Cancelled':
                        await this.clickElementInIframe(this.selectors.tifGTCBtn);
                        await this.handleCalendar(details.dateOffset);
                        break;
                }
            }
        }

        // 5. Solicited/Discretion toggle
        if (details.solicitedDiscretion !== undefined) {
            await this.clickElementInIframe(this.selectors.solicitedDiscretionBtn);
        }

        console.log('Order details entry completed.');
    }

    private async handleCalendar(offset?: number) {
        if (offset === undefined) return;

        console.log(`Handling calendar with offset: ${offset}`);

        if (await this.isElementEnabledInIframe(this.selectors.calendarBtn)) {
            await this.clickElementInIframe(this.selectors.calendarBtn);

            const targetDate = new Date();
            targetDate.setDate(targetDate.getDate() + offset);

            const day = targetDate.getDate();
            const daySelector = `//div[contains(@class, "calendar-day") and text()="${day}"]`;
            await this.clickElementInIframe(daySelector);
        } else {
            console.warn('Calendar button is not enabled.');
        }
    }

    async clickPreviewOrder() {
        await this.clickElementInIframe(this.selectors.previewOrderBtn);
    }
}
