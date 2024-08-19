document.getElementById("correct-btn").addEventListener("click", () => {
    const mode = document.getElementById("mode").value;
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: correctGrammar,
        args: [mode] // Passing the selected mode to the script
      });
    });
  });
  
  function correctGrammar(mode) {
    const selectedText = window.getSelection().toString();
    if (selectedText) {
      fetch('https://your-backend-api/correct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: selectedText, mode: mode })
      })
      .then(response => response.json())
      .then(data => alert(`Corrected Text: ${data.correctedText}`))
      .catch(error => console.error('Error:', error));
    } else {
      alert('Please select some text first.');
    }
  }
  