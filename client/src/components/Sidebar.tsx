export function Sidebar() {
  return (
    <aside id="sidebarNav" className="sidebar-nav" aria-label="القائمة">
      <div className="sidebar-header">
        <button
          className="sidebar-account-btn"
          id="accountButton"
          type="button"
          aria-label="الحساب والإعدادات"
        >
          <span id="sidebarAvatar" className="sidebar-avatar">م</span>
          <span className="sidebar-account-meta">
            <span id="accountName" className="sidebar-account-name">
              طالب الرياضيات
            </span>
            <span id="accountSub" className="sidebar-account-sub">
              ثانوي
            </span>
          </span>
          <span className="sidebar-account-gear" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
            </svg>
          </span>
        </button>

        <button type="button" className="sidebar-close-btn" id="closeSidebarBtn" aria-label="إغلاق">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <nav className="sidebar-content" aria-label="القائمة الرئيسية">
        <div className="sidebar-quick-actions">
          <button type="button" className="sidebar-quick-btn is-primary" id="startNewChatBtn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
            <span>جديد</span>
          </button>

          <button type="button" className="sidebar-quick-btn" id="sidebarSolvedHistoryBtn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
              <path d="M3 3v5h5" />
              <path d="M12 7v5l3 2" />
            </svg>
            <span>السجل</span>
          </button>

          <button type="button" className="sidebar-quick-btn" id="toggleExportDropdownBtn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>تصدير</span>
          </button>
        </div>

        <div className="dropdown-container sidebar-export">
          <div id="exportDropdown" className="dropdown-content sidebar-inline-dropdown">
            <a href="#" id="exportPdfBtn">
              <span>PDF</span>
            </a>
            <a href="#" id="exportWordBtn">
              <span>Word</span>
            </a>
          </div>
        </div>

        <div id="saved-chats-menu" className="sidebar-item-card">
          <button type="button" className="sidebar-nav-btn is-in-card library-main-header" id="toggleSavedChatsBtn">
            <svg className="sidebar-nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span className="sidebar-nav-label">المحادثات</span>
            <span className="icon sidebar-chevron" id="saved-chats-icon" aria-hidden="true">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </span>
          </button>
          <div id="saved-chats-content" className="library-content">
            <p className="sidebar-empty-hint">لا توجد محادثات بعد</p>
          </div>
        </div>

        <div id="library-menu" className="sidebar-item-card">
          <div id="library-accordion">
            <button type="button" className="sidebar-nav-btn is-in-card library-main-header" id="toggleLibraryBtn">
              <svg className="sidebar-nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              </svg>
              <span className="sidebar-nav-label">الدروس</span>
              <span className="icon sidebar-chevron" id="library-main-icon" aria-hidden="true">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </span>
            </button>
            <div id="library-content" className="library-content"></div>
          </div>
        </div>
      </nav>

      <div id="contactToggleArea" className="sidebar-contact-footer">
        <button id="showContactBtn" type="button" className="sidebar-nav-btn">
          <svg className="sidebar-nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          <span className="sidebar-nav-label">الأستاذ محمد جمال نعمه</span>
        </button>

        <div id="contactMenu" className="contact-menu-panel" style={{ display: 'none' }}>
          <div className="contact-menu-header">
            <span>تواصل مباشر</span>
            <button id="hideContactMenuBtn" type="button" className="contact-close-btn">
              إغلاق
            </button>
          </div>
          <div className="contact-links-grid">
            <a
              href="https://wa.me/qr/WLRRIAB7FMM5A1"
              target="_blank"
              rel="noreferrer"
              className="contact-channel-link is-whatsapp"
            >
              <span>واتساب</span>
            </a>
            <a
              href="https://www.facebook.com/share/15hRUiky32/"
              target="_blank"
              rel="noreferrer"
              className="contact-channel-link is-facebook"
            >
              <span>فيسبوك</span>
            </a>
            <a
              href="https://t.me/Muhammed_Cemal_Nime"
              target="_blank"
              rel="noreferrer"
              className="contact-channel-link is-telegram"
            >
              <span>تلغرام</span>
            </a>
          </div>
        </div>
      </div>
    </aside>
  )
}
