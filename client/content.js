(function() {
    // Create a debug panel
    const debugDiv = document.createElement('div');
    debugDiv.id = 'extension-debug';
    debugDiv.style.position = 'fixed';
    debugDiv.style.top = '0';
    debugDiv.style.right = '0';
    debugDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    debugDiv.style.border = '1px solid black';
    debugDiv.style.padding = '10px';
    debugDiv.style.zIndex = '9999';
    debugDiv.style.maxHeight = '300px';
    debugDiv.style.overflowY = 'auto';
    document.body.appendChild(debugDiv);

    function log(...args) {
        const message = args.join(' ');
        console.log('[Content Script]', message);
        const logLine = document.createElement('div');
        logLine.textContent = `[Content Script] ${message}`;
        debugDiv.appendChild(logLine);
    }

    log('Content script starting - version 7');

    chrome.runtime.sendMessage({action: 'contentScriptLoaded'}, function(response) {
        log('Content script load notification sent', JSON.stringify(response));
    });

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        log('Message received in content script:', JSON.stringify(request));
        if (request.action === 'ping') {
            log('Ping received, sending pong');
            sendResponse({pong: true});
        } else if (request.action === 'correctText') {
            log('Correct text action received');
            const selectedText = getSelectedText();
            log('Selected text:', selectedText);
            if (!selectedText) {
                log('No text selected');
            }
            sendResponse({ received: true, selectedText: selectedText });
        }
        return true;  // Indicates that the response is sent asynchronously
    });
    function getSelectedText() {
        log('Getting selected text');
        const activeElement = document.activeElement;
        let selectedText = '';
    
        if (window.getSelection) {
            selectedText = window.getSelection().toString();
        } else if (document.selection && document.selection.type != "Control") {
            selectedText = document.selection.createRange().text;
        }
    
        if (selectedText) {
            log('Selected text from window selection:', selectedText);
            return selectedText;
        }
    
        if (isInputField(activeElement)) {
            selectedText = activeElement.value.substring(activeElement.selectionStart, activeElement.selectionEnd);
            log('Selected text from input field:', selectedText);
            return selectedText;
        }
    
        // Handle contenteditable elements (like in Discord)
        if (activeElement.isContentEditable) {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                selectedText = range.toString();
                log('Selected text from contenteditable:', selectedText);
                return selectedText;
            }
        }
    
        // If we still don't have selected text, try to get it from the focused element
        const focusedElement = document.querySelector(':focus');
        if (focusedElement) {
            if (focusedElement.value) {
                selectedText = focusedElement.value.substring(focusedElement.selectionStart, focusedElement.selectionEnd);
            } else if (focusedElement.textContent) {
                selectedText = window.getSelection().toString();
            }
            log('Selected text from focused element:', selectedText);
        }
    
        return selectedText;
    }
    
    function isInputField(element) {
        return element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.isContentEditable;
    }

    log('Content script fully loaded - version 7');
})();