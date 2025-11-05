import { sampleFunction } from '@src/sample-function';

console.log('[CEB] All content script loaded');

void sampleFunction();

// 创建悬浮的"复制答案"按钮
const createCopyButton = () => {
  // 检查按钮是否已存在
  if (document.getElementById('zhihu-copy-answers-btn')) {
    return;
  }

  // 创建按钮元素
  const button = document.createElement('button');
  button.id = 'zhihu-copy-answers-btn';
  button.textContent = '复制答案';

  // 设置按钮样式
  Object.assign(button.style, {
    position: 'fixed',
    bottom: '80px',
    right: '24px',
    zIndex: '9999',
    padding: '12px 24px',
    backgroundColor: '#1677ff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    transition: 'all 0.3s ease',
  });

  // 添加 hover 效果
  button.addEventListener('mouseenter', () => {
    button.style.backgroundColor = '#4096ff';
    button.style.transform = 'scale(1.05)';
    button.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
  });

  button.addEventListener('mouseleave', () => {
    button.style.backgroundColor = '#1677ff';
    button.style.transform = 'scale(1)';
    button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  });

  // 点击事件：复制所有答案内容
  button.addEventListener('click', async () => {
    try {
      // 获取所有 .AnswerItem 元素
      const answerItems = document.querySelectorAll('.AnswerItem');

      if (answerItems.length === 0) {
        button.textContent = '未找到答案';
        setTimeout(() => {
          button.textContent = '复制答案';
        }, 2000);
        return;
      }

      // 提取所有答案的文本内容
      const answers: Array<{ index: number; content: string }> = [];
      const answerTexts: string[] = [];

      answerItems.forEach((item, index) => {
        const textContent = item.textContent?.trim();
        if (textContent) {
          answers.push({
            index: index + 1,
            content: textContent,
          });
          answerTexts.push(`======== 答案 ${index + 1} ========\n${textContent}\n`);
        }
      });

      const fullText = answerTexts.join('\n');

      // 复制到剪贴板
      await navigator.clipboard.writeText(fullText);

      // 发送消息到侧边栏，显示答案
      chrome.runtime.sendMessage({
        type: 'COPY_ANSWERS',
        answers: answers,
      });

      // 显示成功提示
      button.textContent = `✓ 已复制 ${answerItems.length} 个答案`;
      button.style.backgroundColor = '#52c41a';

      setTimeout(() => {
        button.textContent = '复制答案';
        button.style.backgroundColor = '#1677ff';
      }, 2000);

      console.log(`成功复制 ${answerItems.length} 个答案到剪贴板，并发送到侧边栏`);
    } catch (error) {
      console.error('复制失败:', error);
      button.textContent = '✗ 复制失败';
      button.style.backgroundColor = '#ff4d4f';

      setTimeout(() => {
        button.textContent = '复制答案';
        button.style.backgroundColor = '#1677ff';
      }, 2000);
    }
  });

  // 将按钮添加到页面
  document.body.appendChild(button);
  console.log('复制答案按钮已添加到页面');
};

// 页面加载完成后创建按钮
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createCopyButton);
} else {
  createCopyButton();
}
