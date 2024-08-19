document.getElementById("save-btn").addEventListener("click", () => {
    const defaultMode = document.getElementById("default-mode").value;
    
    chrome.storage.sync.set({ defaultMode: defaultMode }, () => {
      alert('Default mode saved!');
    });
  });
  