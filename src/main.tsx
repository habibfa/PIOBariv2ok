import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initClientProtection } from './utils/clientProtection';

// Guard against browser extension scripts (e.g., MetaMask inpage.js) throwing unhandled errors in iframe preview
if (typeof window !== 'undefined') {
  initClientProtection();

  // Tier 1 Google Maps Platform quota & auth failure listener
  (window as any).gm_authFailure = () => {
    window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
  };
  const origConsoleError = console.error;
  console.error = (...args: unknown[]) => {
    origConsoleError.apply(console, args);
    const msg = args.map((a) => String(a)).join(' ');
    if (msg.includes('OverQuotaMapError') || msg.includes('QuotaExceededError')) {
      window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
    }
  };

  const isBrowserExtensionIssue = (text: string) => {
    const lower = text.toLowerCase();
    return (
      lower.includes('metamask') ||
      lower.includes('chrome-extension://') ||
      lower.includes('moz-extension://') ||
      lower.includes('inpage.js')
    );
  };

  window.addEventListener(
    'error',
    (event) => {
      const details = `${event.message || ''} ${event.filename || ''} ${event.error?.stack || ''}`;
      if (isBrowserExtensionIssue(details)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true
  );

  window.addEventListener(
    'unhandledrejection',
    (event) => {
      const reason = event.reason;
      const details = `${reason?.message || String(reason || '')} ${reason?.stack || ''}`;
      if (isBrowserExtensionIssue(details)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
