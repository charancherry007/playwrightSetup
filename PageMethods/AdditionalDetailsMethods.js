import PageMaps from '../PageObjects/PageMaps';

class AdditionalDetailsMethods {
    constructor(page) {
        this.page = page;
        this.Pages = new PageMaps(page);
    }

    /**
     * Fills multiple fields in the additional details section.
     * Matches the pluralized pattern used in preview verification.
     * 
     * @param {Object} details - Object containing field names and their values.
     */
    async fillAdditionalDetailsFields(details) {
        try {
            for (const [label, value] of Object.entries(details)) {
                const success = await this.Pages.AdditionalDetailsPage.fillAdditionalDetailsField(label, value);
                if (!success) {
                    console.error(`Failed to fill additional detail field: ${label}`);
                    return false;
                }
            }
            // Click "Preview Order" after filling all details
            return await this.Pages.AdditionalDetailsPage.submitPreviewOrder();
        } catch (error) {
            console.error("Error in fillAdditionalDetailsFields:", error);
            return false;
        }
    }
}

export default AdditionalDetailsMethods;
