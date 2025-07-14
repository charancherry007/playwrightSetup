const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const config = require('../config/config.json');

class ReportingUtils {
 constructor() {
   this.reportData = [];
 }
 async captureScreenshot(testInfo, page) {
   if (testInfo.status !== testInfo.expectedStatus) {
     const screenshotPath = testInfo.outputPath(`FAILED_${testInfo.title.replace(/\s+/g, '_')}.png`);
     await page.screenshot({ path: screenshotPath, fullPage: true });
     this.reportData.push({
       test: testInfo.title,
       status: testInfo.status,
       screenshot: path.relative(config.reportPath, screenshotPath),
       error: testInfo.error?.message
     });
     return screenshotPath;
   }
   return null;
 }
 async generateHTMLReport() {
   const reportDir = config.reportPath;
   if (!fs.existsSync(reportDir)) {
     fs.mkdirSync(reportDir, { recursive: true });
   }
   const reportPath = path.join(reportDir, 'index.html');
   const browser = await chromium.launch();
   const page = await browser.newPage();
   // Generate HTML content
   const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<title>Test Execution Report</title>
<style>
         body { font-family: Arial, sans-serif; margin: 20px; }
         table { width: 100%; border-collapse: collapse; }
         th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
         tr:hover { background-color: #f5f5f5; }
         .passed { color: green; }
         .failed { color: red; }
         .screenshot { max-width: 600px; display: block; margin-top: 10px; }
</style>
</head>
<body>
<h1>Test Execution Report</h1>
<table>
<thead>
<tr>
<th>Test</th>
<th>Status</th>
<th>Error</th>
<th>Screenshot</th>
</tr>
</thead>
<tbody>
           ${this.reportData.map(item => `
<tr>
<td>${item.test}</td>
<td class="${item.status}">${item.status.toUpperCase()}</td>
<td>${item.error || '-'}</td>
<td>${item.screenshot ? `<a href="${item.screenshot}" target="_blank">View</a>` : '-'}</td>
</tr>
           `).join('')}
</tbody>
</table>
<p>Generated on ${new Date().toLocaleString()}</p>
</body>
</html>
   `;
   fs.writeFileSync(reportPath, htmlContent);
   await page.close();
   await browser.close();
   console.log(`HTML report generated: ${reportPath}`);
 }
}
module.exports = new ReportingUtils();