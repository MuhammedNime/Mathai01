export function OfflineBanner() {
  return (
    <div id="offlineIndicator" className="offline-indicator-banner" role="status" aria-live="polite">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="2" y1="2" x2="22" y2="22" />
        <path d="M8.5 16.5a5 5 0 0 1 7 0" />
        <path d="M2 8.82a15 15 0 0 1 4.17-2.65" />
        <path d="M10.66 5c4.01-.36 8.14.9 11.34 3.76" />
        <path d="M16.85 11.25a10 10 0 0 1 2.22 1.68" />
        <path d="M5 13a10 10 0 0 1 5.24-2.76" />
        <circle cx="12" cy="20" r="1" />
      </svg>
      <span id="offlineBannerText">أنت غير متصل بالإنترنت — الوضع المحلي يعمل لحل المعادلات والعمليات الأساسية</span>
    </div>
  )
}

export function Banners() {
  return (
    <>
      <div id="updateNotification" className="update-notification-banner" role="region" aria-label="تحديث التطبيق">
        <div className="update-banner-inner">
          <div className="update-banner-lead">
            <div className="update-banner-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 16h5v5" />
              </svg>
            </div>
            <div className="pwa-install-copy">
              <div id="updateBannerText" className="update-banner-title">يتوفر إصدار أحدث من التطبيق</div>
            </div>
          </div>
          <div className="update-banner-actions">
            <button id="updateBtn" type="button" className="update-action-btn">
              تحديث الآن
            </button>
            <button id="updateCloseBtn" type="button" className="update-close-btn" aria-label="إغلاق">
              &times;
            </button>
          </div>
        </div>
      </div>

      <div id="pwaInstallBanner" className="pwa-install-banner" role="region" aria-label="تثبيت التطبيق">
        <div className="pwa-install-banner-inner">
          <div className="pwa-install-lead">
            <div className="pwa-install-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <div className="pwa-install-copy">
              <div className="pwa-install-title">ثبّت التطبيق</div>
              <div className="pwa-install-desc">للوصول السريع والعمل بدون إنترنت</div>
            </div>
          </div>
          <div className="pwa-install-actions">
            <button id="pwaInstallBtn" type="button" className="pwa-install-btn">
              تثبيت
            </button>
            <button id="pwaCloseBanner" type="button" className="pwa-close-btn" aria-label="إغلاق">
              &times;
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
