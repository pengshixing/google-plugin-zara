// 监听来自 content-scripts 的消息并转发给 background
window.addEventListener('__CHROME_MESSAGE__FROM__ZARA__', function(event) {
  console.log('Bridge received message from content-scripts:', event.detail);
  
  // 转发消息给 background script
  chrome.runtime.sendMessage(event.detail, response => {
    console.log('Bridge received response from background:', response);
    
    // 如果 background 返回了响应，将响应传回 content-scripts
    if (response) {
      window.dispatchEvent(new CustomEvent('__CHROME_RESPONSE__TO__ZARA__', {
        detail: response
      }));
    }
  });
});
