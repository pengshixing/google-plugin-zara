chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.message === "ensureReload") {
    chrome.storage.local.set({ isEnsureReload: 1 }, () => {
      sendResponse({ ensureReloadResponse: true });
    });
    return true; // 保持消息通道打开
  }
  if (message.message === "isEnsureReload") {
    chrome.storage.local.get("isEnsureReload", (result) => {
      sendResponse({
        isEnsureReloadResponse: result,
        templateStatus: message.templateStatus
      });
    });
    return true; // 保持消息通道打开
  }
  if (message.message === "removeReload") {
    chrome.storage.local.set({ isEnsureReload: 0 }, () => {
      sendResponse({ removeReloadResponse: true });
    });
    return true; // 保持消息通道打开
  }
});