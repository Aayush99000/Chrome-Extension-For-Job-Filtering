chrome.runtime.onInstalled.addListener(() => {
  console.log("Job Filter AI extension installed.");
});

// Listen for messages from popup or content scripts
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    //Detect Job sites
    if (
      tab.url.includes("linkedin.com/jobs") ||
      tab.url.includes("glassdoor.com/Job") ||
      tab.url.includes("handshake.com/jobs")
    ) {
      console.log("Job site detected, notifying content script.", tab.url);
    }
  }
});

//Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SCAN_CURRENT_TAB") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { type: "SCAN_JOBS" });
      }
    });
  }
});
