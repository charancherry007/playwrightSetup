import { Page, Locator } from "@playwright/test";

export class AdditionalDetailsPage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * This method is used to find all the iframes on the page and use the selector to find the element inside the iframe. and fill it with value.
     * @param selector - The selector to find the element inside the iframe.
     */
    async fillElementInIframe(selector: string, value: string) {
        await this.page.waitForLoadState('domcontentloaded');
        const frames = this.page.frames();
        for (const frame of frames) {
            await frame.waitForLoadState('domcontentloaded');
            await frame.waitForSelector(selector, { state: 'visible' });
            const element = frame.locator(selector);
            if (element !== null) {
                await element.fill(value);
                console.log(`✅ Filled element in iframe with value: ${value}`);
                return true;
            }
        }
        console.error(`❌ Element not found in any iframe: ${selector}`);
        return false;
    }

    /**
     * This method is used to find all the iframes on the page and use the selector to find the element inside the iframe. and click on it.
     * @param selector - The selector to find the element inside the iframe.
     */
    async clickElementInIframe(selector: string) {
        await this.page.waitForLoadState('domcontentloaded');
        const frames = this.page.frames();
        if (frames.length !== 0) {
            const frame = frames[length - 1];
            await frame.waitForLoadState('domcontentloaded');
            await frame.locator(selector).waitFor({ state: 'visible', timeout: 5000 });
            const element: Locator = frame.locator(selector);
            if (!await element.isHidden()) {
                await element.click();
                await this.page.waitForLoadState('domcontentloaded');
                console.log(`✅ Clicked on element in iframe: ${selector}`);
                return true;
            }
        }
        console.error(`❌ Element not found in any iframe: ${selector}`);
        return false;
    }

    /**
     * Enter text into a field in Additional Details page.
     *
     * @param fieldName - The visible label of the Field ("Floor Message", "Confirm Note", etc.)
     * @param expectedValue - Expected text to Enter into Field
     */
    private async enterValueIntoField(fieldName: string, expectedValue: string): Promise<boolean> {
        const valueXPath = `//div[contains(@class,"floor-message-container")]//label[text()="${fieldName}"]//parent::div/div/input`;
        return await this.fillElementInIframe(valueXPath, expectedValue);
    }

    /**
     * Click on Checkbox in Additional Details page.
     *
     * @param fieldName - The visible label of the Field ("On Close", "All or None", etc.) 
     */
    private async clickCheckbox(fieldName: string) {
        const checkboxXPath = `//div[contains(@class,"floor-message-container")]//span[text()="${fieldName}"]//parent::label//input[@type="checkbox"]`;
        return await this.clickElementInIframe(checkboxXPath);
    }

    /**
     * Select an option from the Dropdown element.
     * @param fieldName - The visible label of the Field ("Not Held", "All or None", etc.)
     * @param value - The value to select from the Dropdown
     * @returns 
     */
    private async selectFromDropdown(fieldName: string, value: string) {
        const dropdownXPath = `//div[contains(@class,"floor-message-container")]//label[text()="${fieldName}"]//parent::div/div/input`;
        const dropdownValueXpath = `//li[@data-value="${value}"]`;
        if (await this.clickElementInIframe(dropdownXPath) && await this.clickElementInIframe(dropdownValueXpath)) {
            console.log(`✅ Selected ${value} from ${fieldName} dropdown`);
            return true;
        } else {
            console.log(`❌ Failed to select ${value} from ${fieldName} dropdown`);
            return false;
        }
    }

    /**
     * Enter Additional Details in Order Page.
     *
     * @param details - The Additional Details to be entered into the Order Page.
     */
    private async enterAdditionalOrderDetails(details: AdditionalDetailsPage) {
        console.log(`Entering Additional Details in Order Page...`);
        if (details.floorMessage) await this.enterValueIntoField("Floor Message", details.floorMessage);
        if (details.onClose) await this.clickCheckbox("On Close");
        if (details.notHeald) await this.selectFromDropdown("Not Held", details.notHeald);
        console.log(`✅ Entered Additional Details in Order Page.`);
    }
}

export interface AdditionalDetailsPage {
    floorMessage?: string;
    onClose?: boolean;
    notHeald?: string;
}

