import { getCorrectedText } from '../services/grammarService.js';

export const correctGrammar = async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  try {
    const correctedText = await getCorrectedText(text);
    res.json({ correctedText });
  } catch (error) {
    console.error('Error in correctGrammar:', error);
    res.status(500).json({ error: 'An error occurred while correcting the text.' });
  }
};