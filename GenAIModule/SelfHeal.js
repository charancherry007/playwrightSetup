const OpenAI = require('openai');
const path = require('path');


/**
 * BedrockClient configuration
 * Make sure to set up your AWS credentials and region correctly.
 */
const openai = new OpenAI({
  apiKey: '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',
  baseURL: 'https://integrate.api.nvidia.com/v1',
})

class SelfHeal {
  /**
   * -----npm install @aws-sdk/client-bedrock-----------
   * @param {object} options
   * @param {function} options.getActivePage - async function returning Playwright page
   * @param {object} options.aiProvider - { name: string, endpoint: string, apiKey: string }
   */
  constructor() {
    this.cache = {};
    this.domStoragePath = path.join(__dirname, '..', 'DOM-Snapshots');
  }

  // Captures the current DOM from the active page
  async getPageDOM(page) {
    try {
      return await page.evaluate(() => document.documentElement.outerHTML);
    } catch (error) {
      console.error('Error getting page DOM:', error);
      return null;
    }
  }

  /**
   * Main method: gets a new locator using AI
   * @param {string} oldDOM
   * @param {string} locator
   * @returns {Promise<string|null>}
   */
  async getNewLocator(oldDOM, locator, page) {
    try {
      if (this.cache[locator]) {
        return this.cache[locator];
      }
      const newDOM = await this.getPageDOM(page);
      if (!newDOM) throw new Error('Failed to capture new DOM.');
      const prompt = this.buildPrompt(oldDOM, locator, newDOM);
      const newLocator = await this.queryAI(prompt);
      if (newLocator) {
        this.cache[locator] = newLocator;
      }
      console.log(`Locator changed from "${locator}" to "${newLocator}"`);
      return newLocator;
    } catch (error) {
      console.error('Error in getNewLocator:', error);
      return null;
    }
  }

  /**
   * Builds a prompt for the AI model
   */
  buildPrompt(oldDOM, locator, newDOM) {
    return `
You are an expert in web automation. Given the old DOM, a locator, and the new DOM after a UI change, suggest the best new locator that matches the original intent.

Old DOM:
${oldDOM}

Original Locator:
${locator}

New DOM:
${newDOM}

Respond with only one locator string which best suits the original intent and also Dont give any explanation.
    `.trim();
  }

  /**
   * Queries the AI model to get a new locator
   * @param {string} prompt
   * @returns {Promise<string>}
   */
  async queryAI(prompt) {
     let val = '';
    try {
        const completion = await openai.chat.completions.create({
    model: "nvidia/llama-3.1-nemotron-70b-instruct",
    messages: [{"role":"user","content":prompt}],
    temperature: 0.5,
    top_p: 1,
    max_tokens: 4096,
    stream: true
  })
   
  for await (const chunk of completion) {
    process.stdout.write(chunk.choices[0]?.delta?.content || '')
    val += chunk.choices[0]?.delta?.content
  }
  console.log(`AI response: ${val}`);
  return val;
    } catch (error) {
      console.error("Error invoking Bedrock model:", error);
      throw error;
    }
  }

}

module.exports = SelfHeal;