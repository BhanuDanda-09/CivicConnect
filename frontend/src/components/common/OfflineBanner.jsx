// ==============================================================================
// Offline Status Indicator Banner (OfflineBanner.jsx)
// Subtly informs users of network state changes and local offline draft caching
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' && 'onLine' in navigator ? navigator.onLine : true
  );
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 z-50 px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold border transition-all animate-bounce ${
        isOnline
          ? 'bg-emerald-600 text-white border-emerald-500'
          : 'bg-amber-600 text-white border-amber-500'
      }`}
    >
      {isOnline ? (
        <>
          <Wifi className="w-4 h-4 shrink-0" />
          <span>Connection restored. Ready to sync complaints.</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>You are currently offline. In-progress complaints are saved locally.</span>
        </>
      )}
    </div>
  );
}

