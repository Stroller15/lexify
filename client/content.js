(function () {

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



  function getSelectedText() {
    const activeElement = document.activeElement;
    let selectedText = "";

    if (window.getSelection) {
      selectedText = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
      selectedText = document.selection.createRange().text;
    }

    if (selectedText) {
      return selectedText;
    }

    if (isInputField(activeElement)) {
      selectedText = activeElement.value.substring(
        activeElement.selectionStart,
        activeElement.selectionEnd
      );
      return selectedText;
    }

    if (activeElement.isContentEditable) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        selectedText = range.toString();
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
    const activeElement = document.activeElement;

    if (window.getSelection) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const textNode = document.createTextNode(correctedText);
        range.insertNode(textNode);
        range.selectNodeContents(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
        highlightText(textNode);
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
      highlightInputField(activeElement, start, start + correctedText.length);
      return true;
    }

    if (activeElement.isContentEditable) {
      document.execCommand('insertText', false, correctedText);
      return true;
    }

    return false;
  }

  function highlightText(textNode) {
    const span = document.createElement('span');
    span.className = 'lexify-highlight';
    textNode.parentNode.insertBefore(span, textNode);
    span.appendChild(textNode);
    setTimeout(() => {
      span.outerHTML = span.innerHTML;
    }, 2000);
  }

  function highlightInputField(element, start, end) {
    const rect = element.getBoundingClientRect();
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.left = `${rect.left + start * 8}px`;
    overlay.style.top = `${rect.top}px`;
    overlay.style.width = `${(end - start) * 8}px`;
    overlay.style.height = `${rect.height}px`;
    overlay.style.pointerEvents = 'none';
    overlay.className = 'lexify-highlight';
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 2000);
  }

  function copyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "ping") {
      sendResponse({ pong: true });
    } else if (request.action === "correctText") {
      const selectedText = getSelectedText();
      if (!selectedText) {
        sendResponse({ error: "No text selected" });
      } else {

        chrome.runtime.sendMessage(
          { action: "correctText", text: selectedText },
          (response) => {
            if (response && response.correctedText) {
              const replaced = replaceSelectedText(response.correctedText);
              if (!replaced) {
                copyToClipboard(response.correctedText);
                alert("The corrected text has been copied to your clipboard.");
              }
              sendResponse({
                replaced: replaced,
                correctedText: response.correctedText,
              });
            } else {
              sendResponse({ error: "No correction received" });
            }
          }
        );
        return true; 
      }
    }
    return true; 
  });
})();
