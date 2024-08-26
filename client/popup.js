console.log("Popup script loaded - version 6");

document.getElementById('correctButton').addEventListener('click', async () => {
    console.log("Button clicked");
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });


        chrome.tabs.sendMessage(tab.id, { action: 'ping' }, function(response) {
            if (chrome.runtime.lastError) {

                console.log("Content script not ready, injecting it now");
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['content.js']
                }, () => {
                    if (chrome.runtime.lastError) {
                        console.error('Failed to inject content script:', chrome.runtime.lastError.message);
                    } else {
                        console.log("Content script injected, sending correctText message");

                        setTimeout(() => {
                            sendCorrectTextMessage(tab.id);
                        }, 100);
                    }
                });
            } else {
                console.log("Content script is ready, sending correctText message");
                sendCorrectTextMessage(tab.id);
            }
        });
    } catch (error) {
        console.error('Error in popup script:', error);
    }
});

function sendCorrectTextMessage(tabId) {
    chrome.tabs.sendMessage(tabId, { action: 'correctText' }, function(response) {
        if (chrome.runtime.lastError) {
            console.error('Error sending correctText message:', chrome.runtime.lastError.message);
        } else {
            console.log('correctText message sent successfully, response:', response);
        }
    });
}