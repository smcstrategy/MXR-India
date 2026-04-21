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
              <strong>App is already installed!</strong> Please check your home screen. To reinstall, please uninstall the existing app first.
            </p>
          ) : isIOS ? (
            <p style={{ marginBottom: 8, fontSize: '0.85rem' }}>
              <strong>iOS Safari:</strong> Tap the <strong>Share icon ([↑])</strong> at the bottom and select<br/>
              <strong>'Add to Home Screen'</strong>.
            </p>
          ) : (
            <>
              <p style={{ marginBottom: 8, fontSize: '0.85rem' }}>
                In Chrome, open the menu (⋮) at the top right, go to <strong>'Cast, save, and share'</strong>, and select <strong>'Create shortcut...'</strong>.
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                * If the button is inactive, the app might already be installed or your browser doesn't support it. For Samsung Internet, tap 'Add to Home screen' in the menu.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
