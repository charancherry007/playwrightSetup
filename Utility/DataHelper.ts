import * as fs from 'fs';
import * as path from 'path';

export class DataHelper {
    /**
     * Reads and parses a JSON file from the test-data directory.
     * @param fileName The name of the JSON file (e.g., 'tradeData.json')
     * @returns The parsed JSON object
     */
    static getTestData(fileName: string): any {
        const filePath = path.resolve(process.cwd(), 'test-data', fileName);

        try {
            if (!fs.existsSync(filePath)) {
                throw new Error(`Test data file not found at path: ${filePath}`);
            }

            const rawData = fs.readFileSync(filePath, 'utf-8');
            return JSON.parse(rawData);
        } catch (error: any) {
            if (error instanceof SyntaxError) {
                throw new Error(`Failed to parse JSON in file: ${fileName}. Error: ${error.message}`);
            }
            throw new Error(`Error loading test data from ${fileName}: ${error.message}`);
        }
    }
}
