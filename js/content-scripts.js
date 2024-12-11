const baseUrl = 'https://zara-api.shuinfo.com';
// 
const api = {
  getBsTemplates: `/api/v2/bs/templates/search`,
  getWechatVersion: `/api/v2/dp/applications/820003/mini_program/versions`,
}

/** 查看最新模板是否已上传到服务器 */
const backstoneDataHandle = (data) => {
  if (!data || !data.templates || data.templates.length === 0) {
    console.warn("Invalid response data:", data);
    return;
  }
  if (data.templates[0].public_status !== 2) {
    console.log("数据有更新，请在插件中刷新页面");
    setTimeout(() => {
      window.location.reload();
    }, 10000);
  }
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