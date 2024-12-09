const requestHandler = (requestInfo, params) => {
  return fetch(requestInfo, params)
   .then(response => response.text())
}


// 定义一个变量来存储上一次接口返回的数据
let previousData = null;
let timer = null;
// 定义一个函数来轮询接口
const pollAPI = () => {
  requestHandler('https://api.example.com/data')
   .then(currentData => {
      // 如果当前数据与上一次不同
      if (currentData!== previousData) {
        // 弹窗提示用户刷新当前页
        chrome.browserAction.setBadgeText({ text: 'New' });
        chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });
      }

      // 更新 previousData 为当前数据
     previousData = currentData;
     
     clearTimeout(timer)
     timer = setTimeout(pollAPI, 10000);
    })
   .catch(error => {
      console.error('请求出错:', error);
    });
}

// 每 10 秒钟调用一次 pollAPI 函数
pollAPI();
