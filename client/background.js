console.log('Background script loaded - version 4');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'correctText') {
    fetch('https://lexify.onrender.com/api/correct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: request.text }),
    })
    .then(response => response.json())
    .then(data => {
      // Remove any surrounding quotes and extra text from the correctedText
      let correctedText = data.correctedText;
      correctedText = correctedText.replace(/^["']|["']$/g, ''); // Remove starting and ending quotes
      correctedText = correctedText.split('"').pop().split('"')[0]; // Extract text between last set of quotes if present
      console.log('Processed corrected text:', correctedText);
      sendResponse({ correctedText: correctedText });
    })
    .catch(error => {
      console.error('Error during fetch:', error);
      sendResponse({ error: 'API error' });
    });
    return true; // Indicates that the response is sent asynchronously
  }
});