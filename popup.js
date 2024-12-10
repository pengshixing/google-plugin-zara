// popup.js 文件可以包含一些初始化逻辑或事件处理代码
console.log('popup.js 已加载');
document.getElementById('getCurrentTime').addEventListener('click', () => {
  console.log(new Date().valueOf());
  
})

document.addEventListener("DOMContentLoaded", () => {
  console.log("Popup.js loaded!");

  // Handle button click
  document.getElementById("getCurrentTime").addEventListener("click", () => {
    console.log("Button clicked!");
  });
});

setTimeout(() => {
  console.log('popup.js 1000');
}, 1000);


document.addEventListener('readystatechange', function () {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      console.log('popup.js 已加载');
    }
});
