(function () {
  // Create a debug panel
  const debugDiv = document.createElement("div");
  debugDiv.id = "extension-debug";
  debugDiv.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background-color: rgba(255, 255, 255, 0.9);
        border: 2px solid red;
        padding: 10px;
        z-index: 9999999;
        max-height: 300px;
        overflow-y: auto;
        font-family: monospace;
        font-size: 12px;
    `;
  document.body.appendChild(debugDiv);
  const highlightStyle = document.createElement("style");
  highlightStyle.textContent = `
    @keyframes highlightFade {
        0% { background-color: yellow; }
        100% { background-color: transparent; }
    }
    .lexify-highlight {
        animation: highlightFade 2s ease-in-out;
    }
`;
  document.head.appendChild(highlightStyle);

  function log(...args) {
    const message = args.join(" ");
    console.log("[Content Script]", message);
    const logLine = document.createElement("div");
    logLine.textContent = `[Content Script] ${message}`;
    debugDiv.appendChild(logLine);
  }

  log("Content script starting - version 9");

  function getSelectedText() {
    log("Getting selected text");
    const activeElement = document.activeElement;
    let selectedText = "";

    if (window.getSelection) {
      selectedText = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
      selectedText = document.selection.createRange().text;
    }

    if (selectedText) {
      log("Selected text from window selection:", selectedText);
      return selectedText;
    }

    if (isInputField(activeElement)) {
      selectedText = activeElement.value.substring(
        activeElement.selectionStart,
        activeElement.selectionEnd
      );
      log("Selected text from input field:", selectedText);
      return selectedText;
    }

    if (activeElement.isContentEditable) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        selectedText = range.toString();
        log("Selected text from contenteditable:", selectedText);
        return selectedText;
      }
    }

    const focusedElement = document.querySelector(":focus");
    if (focusedElement) {
      if (focusedElement.value) {
        selectedText = focusedElement.value.substring(
          focusedElement.selectionStart,
          focusedElement.selectionEnd
        );
      } else if (focusedElement.textContent) {
        selectedText = window.getSelection().toString();
      }
      log("Selected text from focused element:", selectedText);
    }

    return selectedText;
  }

  function isInputField(element) {
    return (
      element.tagName === "INPUT" ||
      element.tagName === "TEXTAREA" ||
      element.isContentEditable
    );
  }

  function replaceSelectedText(correctedText) {
    log("Replacing selected text with:", correctedText);
    const activeElement = document.activeElement;

    if (window.getSelection) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const span = document.createElement("span");
        span.textContent = correctedText;
        span.className = "lexify-highlight";
        range.insertNode(span);
        selection.removeAllRanges();
        selection.addRange(range);
        log("Text replaced using window selection");
        return true;
      }
    }

    if (isInputField(activeElement)) {
      const start = activeElement.selectionStart;
      const end = activeElement.selectionEnd;
      const before = activeElement.value.substring(0, start);
      const after = activeElement.value.substring(end);
      activeElement.value = before + correctedText + after;
      activeElement.setSelectionRange(start, start + correctedText.length);

      // For input fields, we can't use a span, so we'll create a temporary overlay
      const rect = activeElement.getBoundingClientRect();
      const overlay = document.createElement("div");
      overlay.style.position = "fixed";
      overlay.style.left = `${rect.left + start * 8}px`; // Approximate character width
      overlay.style.top = `${rect.top}px`;
      overlay.style.width = `${correctedText.length * 8}px`; // Approximate character width
      overlay.style.height = `${rect.height}px`;
      overlay.style.pointerEvents = "none";
      overlay.className = "lexify-highlight";
      document.body.appendChild(overlay);
      setTimeout(() => overlay.remove(), 2000); // Remove after animation

      log("Text replaced in input field");
      return true;
    }

    if (activeElement.isContentEditable) {
      document.execCommand(
        "insertHTML",
        false,
        `<span class="lexify-highlight">${correctedText}</span>`
      );
      log("Text replaced in contenteditable element");
      return true;
    }

    log("Unable to replace text");
    return false;
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    log("Message received in content script:", JSON.stringify(request));
    if (request.action === "ping") {
      log("Ping received, sending pong");
      sendResponse({ pong: true });
    } else if (request.action === "correctText") {
      log("Correct text action received");
      const selectedText = getSelectedText();
      log("Selected text:", selectedText);
      if (!selectedText) {
        log("No text selected");
        sendResponse({ error: "No text selected" });
      } else {
        // Send the selected text to the background script for API processing
        chrome.runtime.sendMessage(
          { action: "correctText", text: selectedText },
          (response) => {
            if (response && response.correctedText) {
              const replaced = replaceSelectedText(response.correctedText);
              log("Text replacement attempt result:", replaced);
              sendResponse({
                replaced: replaced,
                correctedText: response.correctedText,
              });
            } else {
              log("No correction received from API");
              sendResponse({ error: "No correction received" });
            }
          }
        );
        return true; // Indicates that the response is sent asynchronously
      }
    }
    return true; // Indicates that the response is sent asynchronously
  });

  log("Content script fully loaded - version 9");
})();
