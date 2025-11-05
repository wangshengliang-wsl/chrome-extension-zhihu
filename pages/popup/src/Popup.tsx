import '@src/Popup.css';
import { t } from '@extension/i18n';
import { PROJECT_URL_OBJECT, useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { cn, ErrorDisplay, LoadingSpinner, ToggleButton } from '@extension/ui';

const notificationOptions = {
  type: 'basic',
  iconUrl: chrome.runtime.getURL('icon-32.png'),
  title: 'Injecting content script error',
  message: 'You cannot inject script here!',
} as const;

const Popup = () => {
  const { isLight } = useStorage(exampleThemeStorage);
  const logo = isLight ? 'popup/logo_vertical.svg' : 'popup/logo_vertical_dark.svg';

  const goGithubSite = () => chrome.tabs.create(PROJECT_URL_OBJECT);

  const injectContentScript = async () => {
    const [tab] = await chrome.tabs.query({ currentWindow: true, active: true });

    if (tab.url!.startsWith('about:') || tab.url!.startsWith('chrome:')) {
      chrome.notifications.create('inject-error', notificationOptions);
    }

    await chrome.scripting
      .executeScript({
        target: { tabId: tab.id! },
        files: ['/content-runtime/example.iife.js', '/content-runtime/all.iife.js'],
      })
      .catch(err => {
        // Handling errors related to other paths
        if (err.message.includes('Cannot access a chrome:// URL')) {
          chrome.notifications.create('inject-error', notificationOptions);
        }
      });
  };

  const changeZhihuStyle = async () => {
    const [tab] = await chrome.tabs.query({ currentWindow: true, active: true });

    if (tab.url!.startsWith('about:') || tab.url!.startsWith('chrome:')) {
      chrome.notifications.create('inject-error', {
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icon-32.png'),
        title: '无法修改样式',
        message: '此页面不支持样式修改！',
      });
      return;
    }

    await chrome.scripting
      .executeScript({
        target: { tabId: tab.id! },
        func: () => {
          // 修改 CSS 变量 --GBL01A 为黑色
          document.documentElement.style.setProperty('--GBL01A', '#000000');
          console.log('CSS 变量 --GBL01A 已修改为黑色');

          // 修改所有具有 QuestionHeader-title 类名的元素文本
          const titleElements = document.querySelectorAll('.QuestionHeader-title');
          titleElements.forEach(element => {
            element.textContent = '十亿补贴项目文档';
          });
          console.log(`已修改 ${titleElements.length} 个标题元素为"十亿补贴项目文档"`);

          // 1. 移除 .QuestionHeader-side 和 .Question-sideColumn 元素
          const headerSideElements = document.querySelectorAll('.QuestionHeader-side');
          headerSideElements.forEach(element => element.remove());
          const sideColumnElements = document.querySelectorAll('.Question-sideColumn');
          sideColumnElements.forEach(element => element.remove());
          console.log(`已移除 ${headerSideElements.length + sideColumnElements.length} 个侧边栏元素`);

          // 2. 将 .Question-mainColumn 的宽度修改为 100%
          const mainColumns = document.querySelectorAll('.Question-mainColumn');
          mainColumns.forEach(element => {
            (element as HTMLElement).style.width = '100%';
            (element as HTMLElement).style.maxWidth = '100%';
          });
          console.log(`已将 ${mainColumns.length} 个主栏宽度修改为 100%`);

          // 3. 隐藏所有 .AnswerItem 元素下的视频和图片（轮询方式，每秒执行一次）
          const hideMediaInAnswers = () => {
            const answerItems = document.querySelectorAll('.AnswerItem');
            let hiddenMediaCount = 0;
            answerItems.forEach(answerItem => {
              // 隐藏图片
              const images = answerItem.querySelectorAll('img');
              images.forEach(img => {
                if (!img.hasAttribute('data-hidden-by-extension')) {
                  img.style.display = 'none';
                  img.setAttribute('data-hidden-by-extension', 'true');
                  hiddenMediaCount++;
                }
              });
              // 隐藏视频
              const videos = answerItem.querySelectorAll('video');
              videos.forEach(video => {
                if (!video.hasAttribute('data-hidden-by-extension')) {
                  video.style.display = 'none';
                  video.setAttribute('data-hidden-by-extension', 'true');
                  hiddenMediaCount++;
                }
              });
            });
            if (hiddenMediaCount > 0) {
              console.log(`[轮询] 本次隐藏了 ${hiddenMediaCount} 个新的图片和视频元素`);
            }
          };

          // 立即执行一次
          hideMediaInAnswers();

          // 每秒执行一次轮询
          setInterval(hideMediaInAnswers, 1000);
          console.log('已启动图片和视频隐藏轮询，每秒检查一次');

          // 查找知乎 logo 的 SVG 元素
          const logoSvg = document.querySelector('#root > div > div.css-s8xum0 > header > div > a > svg');

          if (logoSvg) {
            // 创建新的飞书 logo SVG
            const newLogoSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            newLogoSvg.setAttribute('width', '1em');
            newLogoSvg.setAttribute('height', '1em');
            newLogoSvg.setAttribute('viewBox', '0 0 24 24');
            newLogoSvg.setAttribute('fill', 'none');
            newLogoSvg.setAttribute('data-icon', 'LarkLogoColorful');
            newLogoSvg.style.width = '32px';
            newLogoSvg.style.height = '32px';

            // 创建三个 path 元素
            const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path1.setAttribute(
              'd',
              'm12.924 12.803.056-.054c.038-.034.076-.072.11-.11l.077-.076.23-.227 1.334-1.319.335-.331c.063-.063.13-.123.195-.183a7.777 7.777 0 0 1 1.823-1.24 7.607 7.607 0 0 1 1.014-.4 13.177 13.177 0 0 0-2.5-5.013 1.203 1.203 0 0 0-.94-.448h-9.65c-.173 0-.246.224-.107.325a28.23 28.23 0 0 1 8 9.098c.007-.006.016-.013.023-.022Z',
            );
            path1.setAttribute('fill', '#00D6B9');

            const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path2.setAttribute(
              'd',
              'M9.097 21.299a13.258 13.258 0 0 0 11.82-7.247 5.576 5.576 0 0 1-.731 1.076 5.315 5.315 0 0 1-.745.7 5.117 5.117 0 0 1-.615.404 4.626 4.626 0 0 1-.726.331 5.312 5.312 0 0 1-1.883.312 5.892 5.892 0 0 1-.524-.031 6.509 6.509 0 0 1-.729-.126c-.06-.016-.12-.029-.18-.044-.166-.044-.33-.092-.494-.14-.082-.024-.164-.046-.246-.072-.123-.038-.247-.072-.366-.11l-.3-.095-.284-.094-.192-.067c-.08-.025-.155-.053-.234-.082a3.49 3.49 0 0 1-.167-.06c-.11-.04-.221-.079-.328-.12-.063-.025-.126-.047-.19-.072l-.252-.098c-.088-.035-.18-.07-.268-.107l-.174-.07c-.072-.028-.141-.06-.214-.088l-.164-.07c-.057-.024-.114-.05-.17-.075l-.149-.066-.135-.06-.14-.063a90.183 90.183 0 0 1-.141-.066 4.808 4.808 0 0 0-.18-.083c-.063-.028-.123-.06-.186-.088a5.697 5.697 0 0 1-.199-.098 27.762 27.762 0 0 1-8.067-5.969.18.18 0 0 0-.312.123l.006 9.21c0 .4.199.779.533 1a13.177 13.177 0 0 0 7.326 2.205Z',
            );
            path2.setAttribute('fill', '#3370FF');

            const path3 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path3.setAttribute(
              'd',
              'M23.732 9.295a7.55 7.55 0 0 0-3.35-.776 7.521 7.521 0 0 0-2.284.35c-.054.016-.107.035-.158.05a8.297 8.297 0 0 0-.855.35 7.14 7.14 0 0 0-.552.297 6.716 6.716 0 0 0-.533.347c-.123.089-.243.18-.363.275-.13.104-.252.211-.375.321-.067.06-.13.123-.196.184l-.334.328-1.338 1.321-.23.228-.076.075c-.038.038-.076.073-.11.11l-.057.054a1.914 1.914 0 0 1-.085.08c-.032.028-.063.06-.095.088a13.286 13.286 0 0 1-2.748 1.946c.06.028.12.057.18.082l.142.066c.044.022.091.041.139.063l.135.06.149.067.17.075.164.07c.073.031.142.06.215.088.056.025.116.047.173.07.088.034.177.072.268.107.085.031.168.066.253.098l.189.072c.11.041.218.082.328.12.057.019.11.041.167.06.08.028.155.053.234.082l.192.066.284.095.3.095c.123.037.243.075.366.11l.246.072c.164.048.331.095.495.14.06.015.12.03.18.043.114.029.227.05.34.07.13.022.26.04.389.057a5.815 5.815 0 0 0 .994.019 5.172 5.172 0 0 0 1.413-.3 5.405 5.405 0 0 0 .726-.334c.06-.035.122-.07.182-.108a7.96 7.96 0 0 0 .432-.297 5.362 5.362 0 0 0 .577-.517 5.285 5.285 0 0 0 .37-.429 5.797 5.797 0 0 0 .527-.827l.13-.258 1.166-2.325-.003.006a7.391 7.391 0 0 1 1.527-2.186Z',
            );
            path3.setAttribute('fill', '#133C9A');

            // 将 path 添加到 SVG
            newLogoSvg.appendChild(path1);
            newLogoSvg.appendChild(path2);
            newLogoSvg.appendChild(path3);

            // 创建文字元素
            const textSpan = document.createElement('span');
            textSpan.textContent = '飞书云文档';
            textSpan.style.whiteSpace = 'nowrap';
            textSpan.style.marginLeft = '8px';
            textSpan.style.fontSize = '16px';
            textSpan.style.fontWeight = '500';
            textSpan.style.color = '#1f2329';
            textSpan.style.verticalAlign = 'middle';

            // 获取父元素（a 标签）
            const parentLink = logoSvg.parentElement;

            if (parentLink) {
              // 清空 a 标签的内容
              parentLink.innerHTML = '';

              // 添加新的 logo 和文字
              parentLink.appendChild(newLogoSvg);
              parentLink.appendChild(textSpan);

              // 修改 a 标签的样式，使其横向排列
              parentLink.style.display = 'flex';
              parentLink.style.alignItems = 'center';

              console.log('知乎 logo 已成功替换为飞书 logo！');
            }
          } else {
            console.warn('未找到知乎 logo 元素，请检查选择器是否正确');
          }
        },
      })
      .catch(err => {
        if (err.message.includes('Cannot access a chrome:// URL')) {
          chrome.notifications.create('inject-error', {
            type: 'basic',
            iconUrl: chrome.runtime.getURL('icon-32.png'),
            title: '无法修改样式',
            message: '此页面不支持样式修改！',
          });
        }
      });
  };

  return (
    <div className={cn('App', isLight ? 'bg-slate-50' : 'bg-gray-800')}>
      <header className={cn('App-header', isLight ? 'text-gray-900' : 'text-gray-100')}>
        <button onClick={goGithubSite}>
          <img src={chrome.runtime.getURL(logo)} className="App-logo" alt="logo" />
        </button>
        <p>
          Edit <code>pages/popup/src/Popup.tsx</code>
        </p>
        <button
          className={cn(
            'mt-4 rounded px-4 py-1 font-bold shadow hover:scale-105',
            isLight ? 'bg-blue-200 text-black' : 'bg-gray-700 text-white',
          )}
          onClick={injectContentScript}>
          {t('injectButton')}
        </button>
        <button
          className={cn(
            'mt-4 rounded px-4 py-1 font-bold shadow hover:scale-105',
            isLight ? 'bg-pink-200 text-black' : 'bg-pink-700 text-white',
          )}
          onClick={changeZhihuStyle}>
          修改知乎样式
        </button>
        <ToggleButton>{t('toggleTheme')}</ToggleButton>
      </header>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <LoadingSpinner />), ErrorDisplay);
