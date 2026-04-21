'use client';

import { useEffect, useState } from 'react';
import { Monitor } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallButton() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleClick = async () => {
    if (!prompt) return;
    await prompt.prompt();
    setPrompt(null);
  };

  return (
    <button
      className="nav-item install-btn"
      onClick={handleClick}
      title="Add to Desktop"
      style={{ opacity: prompt ? 1 : 0.5, cursor: prompt ? 'pointer' : 'default' }}
    >
      <Monitor size={20} />
      <span>Add to Desktop</span>
    </button>
  );
}
