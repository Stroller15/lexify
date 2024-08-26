console.log('Background script loaded - version 5');

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
      let correctedText = data.correctedText;
      

      const match = correctedText.match(/^([^"(]+)/);
      if (match) {
        correctedText = match[1].trim();
      }
      

      correctedText = correctedText.replace(/^["'\(\)]+|["'\(\)]+$/g, '').trim();
      
      console.log('Processed corrected text:', correctedText);
      sendResponse({ correctedText: correctedText });
    })
    .catch(error => {
      console.error('Error during fetch:', error);
      sendResponse({ error: 'API error' });
    });
    return true; 
  }
});