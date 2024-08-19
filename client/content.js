// Function to create and inject a context menu item when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: 'correct-grammar',
      title: 'Correct Grammar',
      contexts: ['selection']
    });
  });
  
  // Event listener for context menu click
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'correct-grammar') {
      const selectedText = info.selectionText;
      if (selectedText) {
        // Send the selected text to the background script for processing
        chrome.runtime.sendMessage({
          action: 'correctText',
          text: selectedText
        });
      }
    }
  });
  
  // Listen for messages from background script and update the webpage with the corrected text
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'updateText') {
      const { correctedText, originalText } = message;
  
      // Replace the original text with the corrected text in the page
      // This simple implementation assumes that the original text is visible and replaceable
      const bodyHTML = document.body.innerHTML;
      document.body.innerHTML = bodyHTML.replace(originalText, correctedText);
    }
  });
  