import axios from 'axios';

const getCorrectedText = async (text, mode) => {
  const prompt = `Correct the following sentence to be grammatically accurate and maintain the original tone: "${text}". Adjust to a ${mode} tone.`;

  try {
    const response = await axios.post('https://api.openai.com/v1/completions', {
      model: 'gpt-4o-mini',
      prompt: prompt,
      max_tokens: 100,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      }
    });

    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error('Error details:', error.response?.data || error.message);
    throw new Error(`Error interacting with OpenAI API: ${error.message}`);
  }
};

export { getCorrectedText };