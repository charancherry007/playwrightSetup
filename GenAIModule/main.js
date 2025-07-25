const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: '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',
  baseURL: 'https://integrate.api.nvidia.com/v1',
})
 
async function main() {
  const completion = await openai.chat.completions.create({
    model: "nvidia/llama-3.1-nemotron-70b-instruct",
    messages: [{"role":"user","content":"You are an expert in web automation. a locator has changed with Ui changes, suggest the best new locator that matches the original intent locator: //nput[@id='username'] Respond with only one locator string which best suits the original intent and also Dont give any explanation."}],
    temperature: 0.5,
    top_p: 1,
    max_tokens: 4096,
    stream: true
  })
   let val = '';
  for await (const chunk of completion) {
    process.stdout.write(chunk.choices[0]?.delta?.content || '')
    val += chunk.choices[0]?.delta?.content
  }
   console.log(`AI response: ${val}`);
}

main();