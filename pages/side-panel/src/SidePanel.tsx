import '@src/SidePanel.css';
import { t } from '@extension/i18n';
import { PROJECT_URL_OBJECT, useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { cn, ErrorDisplay, LoadingSpinner, ToggleButton } from '@extension/ui';
import { useEffect, useState } from 'react';

interface Answer {
  index: number;
  content: string;
}

const SidePanel = () => {
  const { isLight } = useStorage(exampleThemeStorage);
  const logo = isLight ? 'side-panel/logo_vertical.svg' : 'side-panel/logo_vertical_dark.svg';
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const goGithubSite = () => chrome.tabs.create(PROJECT_URL_OBJECT);

  useEffect(() => {
    // 监听来自 content script 的消息
    const messageListener = (message: { type: string; answers?: Answer[] }) => {
      if (message.type === 'COPY_ANSWERS') {
        if (message.answers && message.answers.length > 0) {
          setAnswers([]);
          setIsAnimating(true);

          // 逐条显示答案，每条延迟 300ms
          message.answers.forEach((answer, index) => {
            setTimeout(() => {
              setAnswers(prev => [...prev, answer]);

              // 最后一条显示完成后，停止动画状态
              if (index === message.answers!.length - 1) {
                setTimeout(() => setIsAnimating(false), 300);
              }
            }, index * 300);
          });
        }
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  const clearAnswers = () => {
    setAnswers([]);
  };

  const copyAllToClipboard = async () => {
    const fullText = answers
      .map(answer => `======== 答案 ${answer.index} ========\n${answer.content}`)
      .join('\n\n');

    try {
      await navigator.clipboard.writeText(fullText);
      console.log('已复制所有答案到剪贴板');
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  return (
    <div className={cn('App min-h-screen', isLight ? 'bg-slate-50' : 'bg-gray-800')}>
      <header className={cn('p-4 border-b', isLight ? 'bg-white border-gray-200' : 'bg-gray-900 border-gray-700')}>
        <div className="flex items-center justify-between mb-4">
          <button onClick={goGithubSite}>
            <img src={chrome.runtime.getURL(logo)} className="h-8" alt="logo" />
          </button>
          <ToggleButton onClick={exampleThemeStorage.toggle}>{t('toggleTheme')}</ToggleButton>
        </div>
        <h1 className={cn('text-xl font-bold', isLight ? 'text-gray-900' : 'text-gray-100')}>知乎答案收集器</h1>
        {answers.length > 0 && (
          <div className="flex gap-2 mt-4">
            <button
              onClick={copyAllToClipboard}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
              复制全部
            </button>
            <button
              onClick={clearAnswers}
              className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors">
              清空
            </button>
          </div>
        )}
      </header>

      <main className="p-4">
        {answers.length === 0 ? (
          <div className={cn('text-center py-12', isLight ? 'text-gray-500' : 'text-gray-400')}>
            <p className="text-lg mb-2">暂无答案</p>
            <p className="text-sm">点击页面中的"复制答案"按钮开始收集</p>
          </div>
        ) : (
          <div className="space-y-4">
            {answers.map((answer, idx) => (
              <div
                key={`${answer.index}-${idx}`}
                className={cn(
                  'p-4 rounded-lg border transition-all duration-300 transform',
                  isLight ? 'bg-white border-gray-200' : 'bg-gray-900 border-gray-700',
                  isAnimating && idx === answers.length - 1 ? 'animate-fadeIn scale-95 opacity-0' : 'scale-100 opacity-100',
                )}
                style={{
                  animation: isAnimating && idx === answers.length - 1 ? 'fadeInScale 0.3s ease-out forwards' : 'none',
                }}>
                <div className="flex items-center justify-between mb-2">
                  <span className={cn('text-sm font-semibold', isLight ? 'text-blue-600' : 'text-blue-400')}>
                    答案 {answer.index}
                  </span>
                  <button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(answer.content);
                        console.log(`已复制答案 ${answer.index}`);
                      } catch (error) {
                        console.error('复制失败:', error);
                      }
                    }}
                    className={cn(
                      'px-2 py-1 text-xs rounded transition-colors',
                      isLight
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700',
                    )}>
                    复制
                  </button>
                </div>
                <div
                  className={cn(
                    'text-sm whitespace-pre-wrap break-words max-h-96 overflow-y-auto',
                    isLight ? 'text-gray-700' : 'text-gray-300',
                  )}>
                  {answer.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default withErrorBoundary(withSuspense(SidePanel, <LoadingSpinner />), ErrorDisplay);
