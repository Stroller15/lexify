console.log("Popup script loaded - version 5");

document.getElementById('correctButton').addEventListener('click', async () => {
    console.log("Button clicked");
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (!tab.url.startsWith("chrome://") && !tab.url.startsWith("edge://")) {
            // Inject content script
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
            });
            console.log("Content script injection attempted");

            // Wait for content script to load
            await new Promise((resolve) => {
                const checkLoaded = () => {
                    chrome.tabs.sendMessage(tab.id, {action: 'ping'}, response => {
                        if (chrome.runtime.lastError) {
                            console.log("Ping failed, retrying...");
                            setTimeout(checkLoaded, 100);  // Retry after 100ms
                        } else {
                            console.log("Ping successful", response);
                            resolve();
                        }
                    });
                };
                checkLoaded();
            });

            console.log("Content script confirmed loaded");

            // Now send the actual message
            console.log("Sending correctText message");
            const response = await chrome.tabs.sendMessage(tab.id, { action: 'correctText' });
            console.log('Message sent successfully, response:', response);
        } else {
            console.log("Cannot inject scripts into this type of page");
        }
    } catch (error) {
        console.error('Error in popup script:', error);
    }
});