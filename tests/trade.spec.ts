import { test, expect } from '@playwright/test';
import { TradePage, OrderDetails } from '../pages/TradePage';
import { DataHelper } from '../Utility/DataHelper';

test.describe('Trade Order Entry Component', () => {

    test('should handle Market Order logic', async ({ page }) => {
        const tradePage = new TradePage(page);
        const testData = DataHelper.getTestData('tradeData.json');
        const marketOrder: OrderDetails = testData.marketOrder;

        await tradePage.enterOrderDetails(marketOrder);

        // Assertions for Market Order
        expect(await tradePage.isElementVisibleInIframe(tradePage.selectors.tifDayBtn)).toBeTruthy();
        expect(await tradePage.isElementHiddenInIframe(tradePage.selectors.stopLimitInput)).toBeTruthy();

        await tradePage.clickPreviewOrder();
    });

    test('should handle Limit Order logic with GTC and +1 day', async ({ page }) => {
        const tradePage = new TradePage(page);
        const testData = DataHelper.getTestData('tradeData.json');
        const limitOrder: OrderDetails = testData.limitOrder;

        await tradePage.enterOrderDetails(limitOrder);

        // Assertions for Limit Order
        expect(await tradePage.isElementVisibleInIframe(tradePage.selectors.stopLimitInput)).toBeTruthy();
        expect(await tradePage.isElementEnabledInIframe(tradePage.selectors.calendarBtn)).toBeTruthy();

        await tradePage.clickPreviewOrder();
    });

    test('should handle Limit Order with Day TIF', async ({ page }) => {
        const tradePage = new TradePage(page);
        const testData = DataHelper.getTestData('tradeData.json');
        const limitDayOrder: OrderDetails = testData.limitDayOrder;

        await tradePage.enterOrderDetails(limitDayOrder);

        await tradePage.clickPreviewOrder();
    });

    // Data-Driven Testing Loop 1: Full Order List
    const allOrders = DataHelper.getTestData('tradeData.json').tradeOrders;
    for (const order of allOrders) {
        test(`Data-Driven Trade test for ${order.symbol} - ${order.orderType}`, async ({ page }) => {
            const tradePage = new TradePage(page);
            await tradePage.enterOrderDetails(order);

            // Shared assertions
            expect(await tradePage.isElementVisibleInIframe(tradePage.selectors.previewOrderBtn)).toBeTruthy();
            await tradePage.clickPreviewOrder();
        });
    }

    // Data-Driven Testing Loop 2: Multi-Symbol with Template
    const templateData = DataHelper.getTestData('tradeData.json');
    const symbols = templateData.symbols;
    const baseConfig = templateData.symbolTemplate;

    for (const symbol of symbols) {
        test(`Template Trade test for ${symbol}`, async ({ page }) => {
            const tradePage = new TradePage(page);

            // Combine template with current symbol
            const order: OrderDetails = {
                ...baseConfig,
                symbol: symbol
            } as OrderDetails;

            await tradePage.enterOrderDetails(order);

            expect(await tradePage.isElementVisibleInIframe(tradePage.selectors.previewOrderBtn)).toBeTruthy();
            await tradePage.clickPreviewOrder();
        });
    }
});
