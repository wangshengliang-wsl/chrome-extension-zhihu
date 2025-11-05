import '@src/SidePanel.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { cn, ErrorDisplay, LoadingSpinner } from '@extension/ui';
import { useEffect, useState } from 'react';

interface Answer {
  index: number;
  content: string;
}

const SidePanel = () => {
  const { isLight } = useStorage(exampleThemeStorage);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

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
    const fullText = answers.map(answer => `======== 答案 ${answer.index} ========\n${answer.content}`).join('\n\n');

    try {
      await navigator.clipboard.writeText(fullText);
      console.log('已复制所有答案到剪贴板');
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  return (
    <div className={cn('App min-h-screen', isLight ? 'bg-slate-50' : 'bg-gray-800')}>
      <header className={cn('border-b p-4', isLight ? 'border-gray-200 bg-white' : 'border-gray-700 bg-gray-900')}>
        {answers.length > 0 && (
          <div className="flex justify-center gap-2">
            <button
              onClick={copyAllToClipboard}
              className="rounded bg-blue-500 px-3 py-1 text-sm text-white transition-colors hover:bg-blue-600">
              复制全部
            </button>
            <button
              onClick={clearAnswers}
              className="rounded bg-gray-500 px-3 py-1 text-sm text-white transition-colors hover:bg-gray-600">
              清空
            </button>
          </div>
        )}
      </header>

      <main className="p-4">
        {answers.length === 0 ? (
          <div className={cn('py-12 text-center', isLight ? 'text-gray-500' : 'text-gray-400')}>
            <p className="mb-2 text-lg">暂无答案</p>
            <p className="text-sm">点击页面中的"复制答案"按钮开始收集</p>
          </div>
        ) : (
          <div className="space-y-4">
            {answers.map((answer, idx) => (
              <div
                key={`${answer.index}-${idx}`}
                className={cn(
                  'transform rounded-lg border p-4 transition-all duration-300',
                  isLight ? 'border-gray-200 bg-white' : 'border-gray-700 bg-gray-900',
                  isAnimating && idx === answers.length - 1
                    ? 'animate-fadeIn scale-95 opacity-0'
                    : 'scale-100 opacity-100',
                )}
                style={{
                  animation: isAnimating && idx === answers.length - 1 ? 'fadeInScale 0.3s ease-out forwards' : 'none',
                }}>
                <div className="mb-2 flex items-center justify-between">
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
                      'rounded px-2 py-1 text-xs transition-colors',
                      isLight
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700',
                    )}>
                    复制
                  </button>
                </div>
                <div
                  className={cn(
                    'max-h-96 overflow-y-auto whitespace-pre-wrap break-words text-sm',
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
