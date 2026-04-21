'use client';

import { useEffect, useState } from 'react';
import { Monitor, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallButton() {
  const [prompt, setPrompt]     = useState<BeforeInstallPromptEvent | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Check iOS
    const ua = window.navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleClick = async () => {
    if (prompt) {
      await prompt.prompt();
      setPrompt(null);
    } else {
      setShowGuide(v => !v);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button className="nav-item install-btn" onClick={handleClick} title="Add to Desktop">
        <Monitor size={20} />
        <span>Add to Desktop</span>
      </button>

      {showGuide && (
        <div className="install-tip">
          <button className="install-tip-close" onClick={() => setShowGuide(false)}>
            <X size={14} />
          </button>
          
          {isStandalone ? (
            <p style={{ marginBottom: 8, fontSize: '0.85rem' }}>
              <strong>이미 앱이 설치되어 있습니다!</strong> 홈 화면을 확인해주세요. 재설치를 원하시면 기존 앱을 삭제 후 시도해주세요.
            </p>
          ) : isIOS ? (
            <p style={{ marginBottom: 8, fontSize: '0.85rem' }}>
              <strong>iOS Safari:</strong> 하단의 <strong>공유 아이콘([↑])</strong>을 누르고<br/>
              <strong>'홈 화면에 추가'</strong>를 선택하세요.
            </p>
          ) : (
            <>
              <p style={{ marginBottom: 8, fontSize: '0.85rem' }}>
                Chrome에서 주소창 오른쪽 <strong>⊕ 아이콘</strong>이나 메뉴의 <strong>앱 설치</strong>를 클릭하세요.
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                * 버튼이 활성화되지 않는 경우, 이미 설치되었거나 지원되지 않는 브라우저일 수 있습니다. 삼성 인터넷의 경우 메뉴에서 '홈 화면에 추가'를 선택하세요.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
