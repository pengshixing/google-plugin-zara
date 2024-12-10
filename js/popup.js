// popup.js 文件可以包含一些初始化逻辑或事件处理代码
const btn = document.getElementById('getCurrentTime')
btn.addEventListener('click', () => {
  const timestamp = ~~(new Date().valueOf())/1000;
  const timestampDiv = document.getElementById('timestamp');
  timestampDiv.innerText = timestamp;
  // 使用 Clipboard API 将时间戳复制到剪贴板
  navigator.clipboard.writeText(timestamp.toString()).then(() => {
    console.log('时间戳已复制到剪贴板');
    btn.innerText = '时间戳已复制到剪贴板';
  }, () => {
    console.error('无法复制时间戳到剪贴板');
    btn.innerText = '无法复制时间戳到剪贴板';
  });
})
