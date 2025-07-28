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
      console.log('Capturing current page DOM...');
      return await page.evaluate(() => document.documentElement.outerHTML);
    } catch (error) {
      console.error('Error getting page DOM:', error);
      return null;
    }
  }

  /**
   * Method to Re-try with AI Self Healing Based on the action need to be performed
   */
  async retryWithSelfHealing(oldDOM,locator,action, page, value = undefined) {
    console.log(`Retrying with AI Self Healing for locator: ${locator}, action: ${action}`);
    try {
      const newLocator = await this.getNewLocator(oldDOM, locator, page);
      if (newLocator) {
        console.log(`Performing ${action} action with new AI Suggested locator: ${newLocator}`);
        await this.performActionWithSelfHealedLocator(newLocator,action,page,value);
        return true;
      } else {
        console.error(`Failed to generate new locator using AI for locator ${locator} and action ${action}.`);
        return false;
      }
    } catch (error) {
      console.error('Error in retrying with AI Self Healing:', error);
      return false;
    } 
  }

  /**
   * Method to perform specified action with AI Self Heald locator
   */
async performActionWithSelfHealedLocator(locator, action, page, value = undefined) {
  try{
    if (!locator) {
      console.error('Self-Healed Locator is null or undefined.');
      return;
    }
    const element = typeof locator === 'string' ? page.locator(locator) : locator;
     if (element !== null) {
    switch (action) {
      case 'click':
          await element.click();
          console.log(`Clicked on element with locator: ${locator}`);
        break;
      case 'fill':
          await element.fill(value);
          console.log(`Filled element with locator: ${locator} with value: ${value}`);
        break;
      case 'hover':
          await element.hover();
          console.log(`Hovered over element with locator: ${locator}`);
        break;
      default:
        console.error(`Unknown action: ${action}`);
    }
  }
  } catch (error) {
    console.error(`Error in performing ${action} action with self-healed locator ${locator} :`, error);
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
        console.log(`Using cached locator for ${locator}`);
        return this.cache[locator];
      }
      const newDOM = await this.getPageDOM(page);
      if (!newDOM) throw new Error('Failed to capture new DOM.');
      const prompt = this.buildPrompt(oldDOM, locator, newDOM);
      const newLocator = await this.queryAI(prompt);
      if (newLocator) {
        this.cache[locator] = newLocator;
        console.log(`New Locator for ${locator} is ${newLocator} and will be cached.`);
      }
      console.log(`Locator changed from "${locator}" to "${newLocator}"`);
      return newLocator;
    } catch (error) {
      console.error('Error generating new locator:', error);
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
  console.log('Initiating AI model query with given prompt')
  for await (const chunk of completion) {
    process.stdout.write(chunk.choices[0]?.delta?.content || '')
    val += chunk.choices[0]?.delta?.content
  }
  console.log(`Generated locator : ${val}`);
  return val;
    } catch (error) {
      console.error("Error invoking Bedrock model :", error);
      throw error;
    }
  }

}

module.exports = SelfHeal;