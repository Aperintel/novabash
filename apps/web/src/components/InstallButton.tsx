'use client';

import { useEffect, useState } from 'react';

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Shows an Install button only when the browser reports the app is installable
// (Chromium fires beforeinstallprompt) and it is not already installed. Hidden
// otherwise, so it never shows a dead button.
export function InstallButton({ className }: { className?: string }) {
  const [deferred, setDeferred] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as InstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    if (window.matchMedia?.('(display-mode: standalone)').matches) setInstalled(true);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (installed || !deferred) return null;

  return (
    <button
      type="button"
      onClick={async () => {
        await deferred.prompt();
        setDeferred(null);
      }}
      className={
        className ??
        'border border-gold px-3 py-1.5 font-mono text-[11px] text-gold transition-colors hover:bg-gold hover:text-bg'
      }
    >
      Install app
    </button>
  );
}
