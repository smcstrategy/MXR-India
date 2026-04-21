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

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
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
          <p style={{ marginBottom: 8 }}>
            Chrome에서 주소창 오른쪽 <strong>⊕ 아이콘</strong>을 클릭하세요.
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            또는 Chrome DevTools → Application → Storage → <strong>Clear site data</strong> 후 새로고침하면 버튼이 직접 작동합니다.
          </p>
        </div>
      )}
    </div>
  );
}
