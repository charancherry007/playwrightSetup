import { test, expect } from '@playwright/test';
import { TradePage, OrderDetails } from '../pages/TradePage';

test.describe('Trade Order Entry Component', () => {

    test('should handle Market Order logic', async ({ page }) => {
        const tradePage = new TradePage(page);

        // Generic navigation - adjustment needed based on actual environment
        // await page.goto('/trade'); 

        const marketOrder: OrderDetails = {
            symbol: 'AAPL',
            action: 'Buy',
            quantity: '10',
            orderType: 'Market'
        };

        await tradePage.enterOrderDetails(marketOrder);

        // Assertions for Market Order
        await expect(tradePage.tifDayBtn).toBeVisible(); // Defaulted to Day
        await expect(tradePage.stopLimitInput).not.toBeVisible(); // Should not be visible for Market

        await tradePage.clickPreviewOrder();
    });

    test('should handle Limit Order logic with GTC and +1 day', async ({ page }) => {
        const tradePage = new TradePage(page);

        const limitOrder: OrderDetails = {
            symbol: 'MSFT',
            action: 'Sell',
            quantity: '5',
            orderType: 'Limit',
            stopLimitValue: '250.50',
            timeInForce: 'Good Until Cancelled',
            dateOffset: 1, // +1 day
            solicitedDiscretion: true
        };

        await tradePage.enterOrderDetails(limitOrder);

        // Assertions for Limit Order
        await expect(tradePage.stopLimitInput).toBeVisible();
        await expect(tradePage.stopLimitInput).toHaveValue('250.50');
        await expect(tradePage.calendarBtn).toBeEnabled();

        await tradePage.clickPreviewOrder();
    });

    test('should handle Limit Order with Day TIF', async ({ page }) => {
        const tradePage = new TradePage(page);

        const limitDayOrder: OrderDetails = {
            symbol: 'GOOGL',
            action: 'Buy',
            quantity: '2',
            orderType: 'Limit',
            stopLimitValue: '140.00',
            timeInForce: 'Day'
        };

        await tradePage.enterOrderDetails(limitDayOrder);

        // Calendar should be disabled or not used for Day
        // Depends on exact UI behavior

        await tradePage.clickPreviewOrder();
    });
});
