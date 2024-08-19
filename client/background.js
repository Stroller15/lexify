chrome.runtime.onInstalled.addListener(() => {
    console.log("Lexify extension installed");
  });
  
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'correctText') {
      fetch('https://your-backend-api/correct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message.text, mode: 'neutral' }) // or use stored mode
      })
      .then(response => response.json())
      .then(data => {
        chrome.tabs.sendMessage(sender.tab.id, {
          action: 'updateText',
          correctedText: data.correctedText,
          originalText: message.text
        });
      })
      .catch(error => console.error('Error:', error));
    }
  });
  