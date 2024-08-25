import dotenv from 'dotenv';
import { Groq } from 'groq-sdk';
import Bottleneck from 'bottleneck';

dotenv.config();

let groq;



try {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("The GROQ_API_KEY environment variable is missing or empty");
  }

  groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
} catch (error) {
  console.error("Error initializing Groq client:", error.message);
}

// Initialize Bottleneck for rate limiting
const limiter = new Bottleneck({
  minTime: 1000,  // 1 second between each request (adjust according to your rate limits)
  maxConcurrent: 1 // Ensure only one request is made at a time
});

const getCorrectedText = limiter.wrap(async (text) => {
  if (!groq) {
    throw new Error("Groq client is not initialized. Please check your API key.");
  }

  const prompt = `Provide only the grammatically corrected version of the following text: "${text}". Do not include any explanations.`;


  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: prompt }
      ],
      model: 'mixtral-8x7b-32768',
      max_tokens: 100,
      temperature: 0.7
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error details:', error);
    throw new Error(`Error interacting with Groq API: ${error.message}`);
  }
});

export { getCorrectedText };