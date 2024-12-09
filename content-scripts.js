const baseUrl = 'https://zara-api.shuinfo.com';
const api = {
  getBsTemplates: `/api/v2/bs/templates/search`,
}

const MAX_RETRIES = 3; // Maximum number of retries
const RETRY_DELAY = 1000; // Delay between retries (in milliseconds)

// Helper function to validate the response
function isResponseValid(data) {
  if (!data || !data.templates || data.templates.length === 0) {
    console.warn("Invalid response data:", data);
    return false;
  }
  if (data.templates[0].public_status !== 2) {
    console.log("数据有更新，请在插件中刷新页面");
    setTimeout(() => {
      window.location.reload();
    }, 10000);
  }
  return true;
}

// Intercept XMLHttpRequest requests
const originalOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function (method, url, ...rest) {
  if (url.includes(api.getBsTemplates)) {
    console.log("Intercepting XMLHttpRequest:", url);
    console.log(method, url, ...rest, '...rest');
    
    const xhr = this;
    let retries = MAX_RETRIES;

    // console.log(xhr);
    
    xhr.addEventListener("load", async function () {
      try {
        const data = JSON.parse(this.responseText);
        if (!isResponseValid(data.data) && retries > 0) {
          retries--;
          console.warn(`Invalid data received. Retrying (${MAX_RETRIES - retries}/${MAX_RETRIES})...`);
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
          originalOpen.apply(xhr, [method, url, ...rest]);
          // xhr.setRequestHeader('authorization', `Bearer ${localStorage.getItem('token')}`)
          xhr.send();
        }
      } catch (err) {
        console.error("Error parsing response:", err.message);
      }
    });
  }
  return originalOpen.apply(this, [method, url, ...rest]);
};