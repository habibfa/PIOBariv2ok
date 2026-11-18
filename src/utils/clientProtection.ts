/**
 * PIOBARI Anti-Duplication, Anti-Inspect & Content Protection Shield
 * Protects UI, clinical database, and system prompts from unauthorized copying,
 * web cloners, keyboard inspection shortcuts, and DOM scraping for public visitors.
 * Automatically unlocks full WebCopy, Save Page, Inspect, and Copy access when Admin is logged in.
 */

const COPYRIGHT_NOTICE =
  "🔒 © PIOBARI - Pusat Informasi Obat RSUD Palembang BARI. Sistem, database klinis, dan prompt AI dilindungi dan dilarang diduplikasi.";

let protectionInitialized = false;
let adminWebCopyEnabled = false;

export function setAdminWebCopyMode(enabled: boolean): void {
  adminWebCopyEnabled = enabled;
  if (typeof document !== "undefined") {
    if (document.body) {
      document.body.classList.toggle("admin-webcopy-allowed", enabled);
    }
    const rootEl = document.getElementById("root");
    if (rootEl) {
      rootEl.classList.toggle("admin-webcopy-allowed", enabled);
    }
    try {
      if (enabled) {
        document.cookie = "piobari_admin_key=519592Fa07$; path=/; max-age=86400; SameSite=Lax";
      } else {
        document.cookie = "piobari_admin_key=; path=/; max-age=0; SameSite=Lax";
      }
    } catch {
      // ignore cookie errors in restricted sandbox
    }
  }
}

export function isAdminWebCopyEnabled(): boolean {
  return adminWebCopyEnabled;
}

function isEditableElement(target: EventTarget | null): boolean {
  if (adminWebCopyEnabled) return true;
  if (!target || !(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  if (tagName === "input" || tagName === "textarea" || tagName === "select") {
    return true;
  }
  if (target.isContentEditable) return true;
  if (target.closest("input, textarea, select, [contenteditable='true'], .allow-copy")) {
    return true;
  }
  return false;
}

export function initClientProtection(): void {
  if (typeof window === "undefined" || protectionInitialized) return;
  protectionInitialized = true;

  // 1. Block Right-Click Context Menu for non-admin users (except inside input/textarea fields)
  document.addEventListener(
    "contextmenu",
    (e: MouseEvent) => {
      if (adminWebCopyEnabled) return;
      if (!isEditableElement(e.target)) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    { capture: true }
  );

  // 2. Block DevTools, View-Source, Save-Page for non-admin users (Ctrl+U, Ctrl+S, F12, Ctrl+Shift+I/J/C)
  window.addEventListener(
    "keydown",
    (e: KeyboardEvent) => {
      if (adminWebCopyEnabled) return;
      const key = (e.key || "").toLowerCase();
      const ctrlOrMeta = e.ctrlKey || e.metaKey;

      // F12
      if (e.key === "F12" || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+Shift+I / J / C / K (DevTools Inspector, Console, Element Picker)
      if (ctrlOrMeta && e.shiftKey && (key === "i" || key === "j" || key === "c" || key === "k")) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Cmd+Option+I / J / C / U on macOS
      if (e.metaKey && e.altKey && (key === "i" || key === "j" || key === "c" || key === "u")) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+U (View Source) & Ctrl+S (Save Webpage / Clone HTML)
      if (ctrlOrMeta && (key === "u" || key === "s")) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+A (Select All) outside of input/textarea
      if (ctrlOrMeta && key === "a" && !isEditableElement(e.target)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    },
    { capture: true }
  );

  // 3. Intercept Copy & Cut attempts outside editable inputs for non-admin users
  document.addEventListener(
    "copy",
    (e: ClipboardEvent) => {
      if (adminWebCopyEnabled) return;
      if (!isEditableElement(e.target)) {
        e.preventDefault();
        e.stopPropagation();
        if (e.clipboardData) {
          e.clipboardData.setData("text/plain", COPYRIGHT_NOTICE);
        }
      }
    },
    { capture: true }
  );

  document.addEventListener(
    "cut",
    (e: ClipboardEvent) => {
      if (adminWebCopyEnabled) return;
      if (!isEditableElement(e.target)) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    { capture: true }
  );

  // 4. Prevent Dragging of Images, Icons, Cards & Links for non-admin users
  document.addEventListener(
    "dragstart",
    (e: DragEvent) => {
      if (adminWebCopyEnabled) return;
      if (!isEditableElement(e.target)) {
        e.preventDefault();
      }
    },
    { capture: true }
  );

  // 5. Console Security Banner & Anti-Tamper Notice
  try {
    const titleStyle =
      "color: #ffffff; background: #0f766e; font-size: 14px; font-weight: bold; padding: 6px 12px; border-radius: 6px;";
    const bodyStyle =
      "color: #dc2626; font-size: 12px; font-weight: bold; padding-top: 4px;";
    console.log("%c🔒 SISTEM KEAMANAN PIOBARI - RSUD PALEMBANG BARI", titleStyle);
    console.log(
      "%cPERINGATAN: Duplikasi kode sumber, penyalinan prompt AI, ekstraksi database klinis, atau kloning antarmuka aplikasi ini dilindungi secara teknis dan hukum (kecuali Administrator resmi).",
      bodyStyle
    );
  } catch {}
}
