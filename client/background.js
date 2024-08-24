console.log('Background script loaded - version 2');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'contentScriptLoaded') {
        console.log('Content script loaded in tab:', sender.tab.id);
        sendResponse({received: true});
    }
});