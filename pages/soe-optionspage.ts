import { Page } from "@playwright/test";

export interface OptionsOrderDetails {
    strategy: string;
    action: string;
    quantity: string;
    callPut: 'Call' | 'Put';
    expiration: string;
    strike: string;
    orderType: 'Market' | 'Limit' | 'Stop Limit';
    timeInForce: 'Day' | 'Good Through Date' | 'Good Until Canceled';
    dateOffset?: number;
}

export class SOEOptionsPage {
    readonly page: Page;

    public strategy?: string;
    public action?: string;
    public quantity?: string;
    public callPut?: 'Call' | 'Put';
    public expiration?: string;
    public strike?: string;
    public orderType?: 'Market' | 'Limit' | 'Stop Limit';
    public limitPrice?: number;
    public stopPrice?: number;
    public timeInForce?: 'Day' | 'Good Through Date' | 'Good Until Canceled';
    public dateOffset?: number;
    public bidValue?: number;
    public askValue?: string;
    public volumeValue?: string;
    public openInterestValue?: string;

    // Selectors
    readonly selectors = {
        strategyDropdown: '//select[@name="strategy" or contains(@id, "strategy")]',
        actionBtn: (action: string) => `//button[text()="${action}"]`,
        quantityInput: '//input[@name="quantity" or @placeholder="Quantity"]',
        callPutBtn: (type: string) => `//button[text()="${type}"]`,
        expirationDropdown: '//select[@name="expiration" or contains(@id, "expiration")]',
        strikeDropdown: '//select[@name="strike" or contains(@id, "strike")]',
        orderTypeDropdown: '//select[@name="orderType" or contains(@id, "orderType")]',
        limitPriceInput: '//input[@name="limitPrice" or @placeholder="Limit Price"]',
        stopPriceInput: '//input[@name="stopPrice" or @placeholder="Stop Price"]',
        timeInForceBtn: (tif: string) => `//button[text()="${tif}"]`,
        bidSpan: '//span[contains(@class, "bid")] | //span[@id="bid"]',
        askSpan: '//span[contains(@class, "ask")] | //span[@id="ask"]',
        volumeSpan: '//span[contains(@class, "volume")] | //span[@id="volume"]',
        openInterestSpan: '//span[contains(@class, "openInterest")] | //span[@id="openInterest"]',
        endDateBtn: '//button[contains(@class, "date") or contains(@class, "calendar")]',
        dropdownListItem: (value: string) => `//li[contains(text(), "${value}")] | //div[contains(@class, "option") and contains(text(), "${value}")]`,
        calendarDay: (day: number) => `//div[contains(@class, "calendar-day") and text()="${day}"]`
    };

    constructor(page: Page) {
        this.page = page;
    }

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
        } catch (e: any) {
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
        } catch (e: any) {
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

    async selectValueFromDropdownInIframe(dropdownSelector: string, value: string) {
        const frame = await this.getLastFrame();
        try {
            const dropdown = frame.locator(dropdownSelector).first();
            await dropdown.waitFor({ state: 'visible', timeout: 5000 });
            await dropdown.click();
            console.log(`Clicked dropdown to expand: ${dropdownSelector}`);

            const itemSelector = this.selectors.dropdownListItem(value);
            const listItem = frame.locator(itemSelector).first();
            await listItem.waitFor({ state: 'visible', timeout: 5000 });
            await listItem.click();

            console.log(`Selected value "${value}" from custom dropdown in last iframe.`);
        } catch (e: any) {
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

    private async handleCalendar(offset?: number) {
        if (offset === undefined) return;

        console.log(`Handling calendar with offset: ${offset}`);

        if (await this.isElementEnabledInIframe(this.selectors.endDateBtn)) {
            await this.clickElementInIframe(this.selectors.endDateBtn);

            const targetDate = new Date();
            targetDate.setDate(targetDate.getDate() + offset);

            const day = targetDate.getDate();
            const daySelector = this.selectors.calendarDay(day);
            await this.clickElementInIframe(daySelector);
        } else {
            console.warn('Calendar button is not enabled.');
        }
    }

    async enterOrderDetails(details: OptionsOrderDetails) {
        console.log('Entering Options Order Details');

        // 1. Strategy selection
        if (details.strategy) {
            this.strategy = details.strategy;
            await this.selectValueFromDropdownInIframe(this.selectors.strategyDropdown, details.strategy);
        }

        // 2. Action selection
        if (details.action) {
            this.action = details.action;
            await this.clickElementInIframe(this.selectors.actionBtn(details.action));
        }

        // 3. Quantity input
        if (details.quantity) {
            this.quantity = details.quantity;
            await this.fillElementInIframe(this.selectors.quantityInput, details.quantity);
        }

        // 4. Call/Put selection
        if (details.callPut) {
            this.callPut = details.callPut;
            await this.clickElementInIframe(this.selectors.callPutBtn(details.callPut));
        }

        // 5. Expiration selection
        if (details.expiration) {
            this.expiration = details.expiration;
            await this.selectValueFromDropdownInIframe(this.selectors.expirationDropdown, details.expiration);
        }

        // 6. Strike selection and data population
        let bidValueNum = 0;
        if (details.strike) {
            this.strike = details.strike;
            await this.selectValueFromDropdownInIframe(this.selectors.strikeDropdown, details.strike);
            console.log('Waiting for Strike price related data to populate (Bid, Ask, Volume, Open Interest)...');
            
            const frame = await this.getLastFrame();
            const bidLocator = frame.locator(this.selectors.bidSpan).first();
            
            // Wait for Bid value to be visible indicating data population
            await bidLocator.waitFor({ state: 'visible', timeout: 10000 });

            const bidStr = await this.getTextFromElementInIframe(this.selectors.bidSpan);
            const askStr = await this.getTextFromElementInIframe(this.selectors.askSpan);
            const volumeStr = await this.getTextFromElementInIframe(this.selectors.volumeSpan);
            const oiStr = await this.getTextFromElementInIframe(this.selectors.openInterestSpan);

            console.log(`Populated Values - Bid: ${bidStr}, Ask: ${askStr}, Volume: ${volumeStr}, Open Interest: ${oiStr}`);
            
            bidValueNum = parseFloat(bidStr.replace(/[^0-9.-]+/g, ""));
            if (isNaN(bidValueNum)) {
                bidValueNum = 0;
            }
            this.bidValue = bidValueNum;
            this.askValue = askStr;
            this.volumeValue = volumeStr;
            this.openInterestValue = oiStr;
        }

        // 7. Order Type selection and logic
        if (details.orderType) {
            this.orderType = details.orderType;
            await this.selectValueFromDropdownInIframe(this.selectors.orderTypeDropdown, details.orderType);

            if (details.orderType === 'Market') {
                console.log('Order Type is Market. Limit and Stop price fields are not visible.');
            } else if (details.orderType === 'Limit') {
                console.log('Order Type is Limit. Entering Limit price based on Bid value.');
                this.limitPrice = bidValueNum - 1;
                await this.fillElementInIframe(this.selectors.limitPriceInput, this.limitPrice.toString());
            } else if (details.orderType === 'Stop Limit') {
                console.log('Order Type is Stop Limit. Entering Limit and Stop price based on Bid value.');
                this.limitPrice = bidValueNum - 1;
                this.stopPrice = bidValueNum + 1;
                await this.fillElementInIframe(this.selectors.limitPriceInput, this.limitPrice.toString());
                await this.fillElementInIframe(this.selectors.stopPriceInput, this.stopPrice.toString());
            }
        }

        // 8. Time In Force & End Date selection
        if (details.timeInForce) {
            this.timeInForce = details.timeInForce;
            await this.clickElementInIframe(this.selectors.timeInForceBtn(details.timeInForce));

            if (details.timeInForce !== 'Day') {
                console.log(`Time In Force is ${details.timeInForce}. Handling End Date.`);
                this.dateOffset = details.dateOffset;
                await this.handleCalendar(details.dateOffset);
            } else {
                console.log('Time In Force is Day. End Date field is not visible.');
            }
        }

        console.log('Options Order details entry completed.');
    }
}
