import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initClientProtection } from './utils/clientProtection';

// Guard against browser extension scripts (e.g., MetaMask inpage.js) throwing unhandled errors in iframe preview
if (typeof window !== 'undefined') {
  initClientProtection();

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
