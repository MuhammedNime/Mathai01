export function Header() {
  return (
    <header className="chat-header">
      <div className="header-contact-group">
        <button
          className="icon-btn"
          id="openSidebarBtn"
          type="button"
          aria-label="فتح القائمة"
          title="القائمة"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>

        <div className="header-chat-avatar" aria-hidden="true">π</div>

        <div className="header-brand">
          <h1>المستشار الرياضي</h1>
          <span id="connectionStatusBadge" className="connection-status-pill is-online" role="status" aria-live="polite">
            <span className="connection-status-dot" aria-hidden="true" />
            <span id="connectionStatusText">متصل</span>
          </span>
        </div>
      </div>

      <div className="header-actions-right">
        <button className="icon-btn" id="darkModeToggle" type="button" aria-label="تبديل المظهر" title="تبديل المظهر">
          <span className="theme-icon-sun" aria-hidden="true">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="m4.93 4.93 1.41 1.41" />
              <path d="m17.66 17.66 1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="m6.34 17.66-1.41 1.41" />
              <path d="m19.07 4.93-1.41 1.41" />
            </svg>
          </span>
          <span className="theme-icon-moon" aria-hidden="true">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
          </span>
        </button>
      </div>
    </header>
  )
}
