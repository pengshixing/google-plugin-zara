const baseUrl = 'https://zara-api.shuinfo.com';
// 
const api = {
  getBsTemplates: `/api/v2/bs/templates/search`,
  getWechatVersion: `/api/v2/dp/applications/820003/mini_program/versions`,
}

// 添加自定义事件处理函数
function sendMessageToServiceWorker(message) {
  // 创建自定义事件
  const event = new CustomEvent('__CHROME_MESSAGE__FROM__ZARA__', {
    detail: message
  });
  // 触发事件
  window.dispatchEvent(event);
}

// 添加监听器接收来自 background 的消息
window.addEventListener('__CHROME_RESPONSE__TO__ZARA__', function (event) {
  // 在这里处理来自 background 的消息
  const { isEnsureReloadResponse = {}, templateStatus } = event.detail;
  let timer = null;
  const reloadHandler = {
    0: () => { 
      // 2. 弹窗通知用户是否开启轮询
      timer = setTimeout(() => {
        if (window.confirm("是否开启自动刷新以检查模板更新？")) {
          // 3. 发送消息给 background，开启轮询
          sendMessageToServiceWorker({
            message: "ensureReload"
          })
        }
      }, 1000);
    },
    1: () => {
      // 4. 如果用户已经开启轮询，则每隔一段时间刷新页面
      console.log("isEnsureReloadResponse:", event.detail.isEnsureReloadResponse);
      timer = setTimeout(() => {
        window.location.reload();
      }, 1000 * 5);
    }
  }
  reloadHandler[isEnsureReloadResponse.isEnsureReload]?.();
  // 5. 如果状态是新上传或是上传没发布，则终止轮询
  const statusArr = [0, 1];
  if (statusArr.includes(templateStatus)) {
    clearTimeout(timer)
    timer = null;
    sendMessageToServiceWorker({
      message: "removeReload"
    })
  }
});

/** 查看最新模板是否已上传到服务器 */
const backstoneDataHandle = (data) => {
  if (!data || !data.templates || data.templates.length === 0) {
    console.warn("Invalid response data:", data);
    return;
  }
  // 1. 发生消息给 background，查看是否需要刷新页面
  sendMessageToServiceWorker({
    message: "isEnsureReload",
    templateStatus: data.templates?.[0]?.public_status
  })
}
/** 查看最新模板是否已上传微信小程序 */
const backstoneDataUpdateWeChat = (data) => {
  if (!data || !data.versions || data.versions.length === 0) {
    console.warn("Invalid response data:", data);
    return;
  }
  /**
   *
    1: "代码已发布"
    2: "审核中"
    3: "审核成功"
    4: "审核失败"
    5: "审核已撤回"
    6: "审核延后"

   */
  // 微信小程序在审核中，需要等待审核完成，需要刷新页面，查看是否已审核通过
  if (data.versions[0].status === 2) {
    console.log("微信小程序在审核中，等待审核完成");
    setTimeout(() => {
      window.location.reload();
    }, 10000);
  }
  if (data.versions[0].status === 3) {
    chrome.runtime.sendMessage({
      type: "showNotification",
      message: "微信小程序审核已通过，通知甲方是否需要发布到线上",
    });
  }
}
// Helper function to validate the response
function responseDataHandle(url, data) {
  const handleMap = {
    [api.getBsTemplates]: backstoneDataHandle,
    [api.getWechatVersion]: backstoneDataUpdateWeChat,
  }
  handleMap[url]?.(data);
}

// Intercept XMLHttpRequest requests
const originalOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function (method, url, ...rest) {
  if ([api.getBsTemplates, api.getWechatVersion].includes(url)) {
    console.log("Intercepting XMLHttpRequest:", url);
    console.log(method, url, ...rest, '...rest');

    const xhr = this;

    xhr.addEventListener("load", async function () {
      try {
        const data = JSON.parse(this.responseText);
        responseDataHandle(url, data.data);
      } catch (err) {
        console.error("Error parsing response:", err.message);
      }
    });
  }
  return originalOpen.apply(this, [method, url, ...rest]);
};