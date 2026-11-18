import { SolvedHistoryModal } from './SolvedHistoryModal'

const handleExamClearFile = () => {
  if (typeof window === "undefined") return
  const app = (window as unknown as { MathApp?: { ExamBuilder?: { clearFile?: () => void } } }).MathApp
  app?.ExamBuilder?.clearFile?.()
}

export function MathModal() {
  return (
    <div className="app-modal" id="mathModal">
      <div className="modal-content modal-sm">
        <div className="modal-header">
          <div className="modal-header-title">
            <h3>محرر المعادلات</h3>
          </div>
          <button className="modal-close-btn" id="closeMathModalBtn" aria-label="إغلاق">
            &times;
          </button>
        </div>
        <math-field id="mathInput" className="math-input"></math-field>
        <div className="modal-buttons" id="mathModalButtons">
          <button className="btn btn-secondary" id="cancelMathModalBtn">
            إلغاء
          </button>
          <button className="btn btn-primary" id="insertUpdateBtn">
            إدراج المعادلة
          </button>
        </div>
      </div>
    </div>
  )
}

export function PhotoModal() {
  return (
    <div className="app-modal" id="photoModal">
      <div className="modal-content modal-md tool-modal sticky-footer">
        <div className="modal-header">
          <div className="modal-header-title">
            <h3>إرفاق صورة</h3>
          </div>
          <button className="modal-close-btn" id="closePhotoModalBtn" aria-label="إغلاق">
            &times;
          </button>
        </div>
        <div className="modal-body">
          <div className="ws-stack">
            <div id="photoSelectionArea">
              <input
                type="file"
                id="imageFileInput"
                accept="image/jpeg, image/png, image/webp"
                style={{ display: "none" }}
              />
              <button className="btn btn-primary" id="selectImageFileBtn">
                اختيار صورة من الملفات
              </button>
              <button className="btn btn-secondary" id="openCameraBtn">
                التقاط صورة بالكاميرا
              </button>
              <div id="cameraCaptureArea" style={{ display: "none" }}>
                <video id="cameraStream" autoPlay></video>
                <button className="btn btn-primary" id="captureImageBtn">
                  التقاط الصورة
                </button>
              </div>
            </div>
            <div id="imageReviewArea" style={{ display: "none" }}>
              <h4>معاينة الصورة المرفقة</h4>
              <img id="reviewImagePreview" alt="معاينة الصورة" />
            </div>
          </div>
        </div>
        <div className="modal-footer modal-buttons">
          <button className="btn btn-delete" id="clearAttachmentBtn">
            إزالة الصورة
          </button>
          <div>
            <button className="btn btn-secondary" id="cancelPhotoModalBtn">
              إلغاء
            </button>
            <button className="btn btn-primary" id="confirmImageBtn" disabled>
              تأكيد الإرفاق
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function DrawingModal() {
  return (
    <div className="app-modal" id="drawingModal">
      <div className="modal-content modal-md tool-modal sticky-footer">
        <div className="modal-header">
          <div className="modal-header-title">
            <h3>لوح الرسم</h3>
          </div>
          <button className="modal-close-btn" id="closeDrawingModalBtn" aria-label="إغلاق">
            &times;
          </button>
        </div>
        <div className="modal-body">
          <canvas id="drawingCanvas" width={480} height={320}></canvas>
          <div className="tool-controls">
            <button className="btn btn-secondary" id="clearCanvasBtn">
              مسح اللوحة
            </button>
            <input type="range" id="penWidth" min={2} max={15} defaultValue={5} aria-label="سماكة القلم" />
            <input type="color" id="penColor" defaultValue="#000000" aria-label="لون القلم" />
          </div>
        </div>
        <div className="modal-footer modal-buttons">
          <button className="btn btn-secondary" id="cancelDrawingBtn">
            إلغاء
          </button>
          <button className="btn btn-primary" id="processDrawingBtn">
            تأكيد الرسم
          </button>
        </div>
      </div>
    </div>
  )
}

export function AuthModal() {
  return (
    <div className="app-modal" id="authModal">
      <div className="modal-content modal-sm sticky-footer">
        <div className="modal-header">
          <div className="modal-header-title">
            <h3 id="authModalTitle">تسجيل الدخول</h3>
          </div>
          <button className="modal-close-btn" id="closeAuthModalBtn" aria-label="إغلاق">
            &times;
          </button>
        </div>
        <div className="modal-body">
          <div className="google-auth-card">
            <div className="google-auth-icon" aria-hidden="true">☁️</div>
            <h4 className="google-auth-title">المزامنة السحابية</h4>
            <button
              type="button"
              id="googleSignInBtn"
              className="btn btn-primary google-signin-btn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#fff" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81Z" />
              </svg>
              <span>المتابعة بحساب Google</span>
            </button>
          </div>
        </div>
        <div className="modal-footer modal-buttons ws-footer">
          <button className="btn btn-secondary" id="cancelAuthModalBtn" style={{ width: "100%" }}>
            متابعة كضيف
          </button>
        </div>
      </div>
    </div>
  )
}

export function SavedChatsModal() {
  return (
    <div className="app-modal" id="savedChatsModal">
      <div className="modal-content modal-md sticky-footer">
        <div className="modal-header">
          <div className="modal-header-title">
            <h3>المحادثات المحفوظة</h3>
          </div>
          <button className="modal-close-btn" id="closeSavedChatsModalBtn" aria-label="إغلاق">
            &times;
          </button>
        </div>
        <div className="modal-body" id="savedChatsList">
          <p>جاري التحميل...</p>
        </div>
      </div>
    </div>
  )
}

export function SettingsModal() {
  return (
    <div className="app-modal" id="settingsModal">
      <div className="modal-content modal-md sticky-footer">
        <div className="modal-header">
          <div className="modal-header-title">
            <h3>الملف الشخصي والإعدادات</h3>
          </div>
          <button className="modal-close-btn" data-modal-id="settingsModal" aria-label="إغلاق">
            &times;
          </button>
        </div>
        <div className="modal-body">
          <div className="ws-stack">
            {/* Live Profile Hero Preview */}
            <div id="profileHeroPreview" className="profile-hero-card">
              <div id="profilePreviewAvatar" className="profile-avatar-lg">م</div>
              <div className="profile-hero-info">
                <div className="profile-hero-name-row">
                  <h4 id="profilePreviewName" className="profile-hero-name">طالب الرياضيات</h4>
                  <span id="profileAuthBadge" className="profile-auth-badge is-guest">وضع الضيف</span>
                </div>
                <div id="profilePreviewMeta" className="profile-hero-meta">
                  ثانوي • إتقان المفاهيم
                </div>
              </div>
            </div>

            {/* Real Usage Stats */}
            <div className="profile-stats-grid">
              <div className="profile-stat-card">
                <div id="statLocalSolved" className="profile-stat-value">0</div>
                <div className="profile-stat-label">حلول محلية</div>
              </div>
              <div className="profile-stat-card">
                <div id="statAiSolved" className="profile-stat-value">0</div>
                <div className="profile-stat-label">استشارات ذكية</div>
              </div>
              <div className="profile-stat-card">
                <div id="statSavedChats" className="profile-stat-value">0</div>
                <div className="profile-stat-label">محادثات محفوظة</div>
              </div>
            </div>

            <div className="settings-section">
              <h4>حالة الحساب والمزامنة</h4>
              <div id="loginStatusArea" className="login-status-area settings-login-area"></div>
            </div>

            <div className="settings-section">
              <h4>تخصيص الصورة الرمزية</h4>
              <div className="avatar-picker-group">
                <div className="settings-row">
                  <label>لون الخلفية</label>
                  <div id="avatarColorPicker" className="avatar-color-grid">
                    <button type="button" className="avatar-swatch active" data-color="#2563eb" style={{ background: "#2563eb" }} aria-label="أزرق حديث"></button>
                    <button type="button" className="avatar-swatch" data-color="#14b8a6" style={{ background: "#14b8a6" }} aria-label="تركواز"></button>
                    <button type="button" className="avatar-swatch" data-color="#1d4ed8" style={{ background: "#1d4ed8" }} aria-label="أزرق داكن"></button>
                    <button type="button" className="avatar-swatch" data-color="#0284c7" style={{ background: "#0284c7" }} aria-label="سماوي"></button>
                    <button type="button" className="avatar-swatch" data-color="#d97706" style={{ background: "#d97706" }} aria-label="كهرماني"></button>
                    <button type="button" className="avatar-swatch" data-color="#dc2626" style={{ background: "#dc2626" }} aria-label="أحمر ياقوتي"></button>
                  </div>
                </div>
                <div className="settings-row">
                  <label>الرمز المفضل</label>
                  <div id="avatarIconPicker" className="avatar-emoji-grid">
                    <button type="button" className="avatar-emoji-btn active" data-icon="" title="الحرف الأول من الاسم">أ</button>
                    <button type="button" className="avatar-emoji-btn" data-icon="🎓">🎓</button>
                    <button type="button" className="avatar-emoji-btn" data-icon="🧮">🧮</button>
                    <button type="button" className="avatar-emoji-btn" data-icon="📐">📐</button>
                    <button type="button" className="avatar-emoji-btn" data-icon="∑">∑</button>
                    <button type="button" className="avatar-emoji-btn" data-icon="π">π</button>
                    <button type="button" className="avatar-emoji-btn" data-icon="🚀">🚀</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="settings-section">
              <h4>البيانات الدراسية والشخصية</h4>
              <div className="settings-grid-2">
                <div className="settings-row">
                  <label htmlFor="settingsDisplayName">الاسم الظاهر</label>
                  <input
                    type="text"
                    id="settingsDisplayName"
                    className="math-input"
                    placeholder="مثال: أحمد محمد"
                  />
                </div>
                <div className="settings-row">
                  <label htmlFor="settingsGradeDetail">الصف / التخصص</label>
                  <input
                    type="text"
                    id="settingsGradeDetail"
                    className="math-input"
                    placeholder="مثال: الثالث الثانوي العلمي"
                  />
                </div>
              </div>

              <div className="settings-grid-2">
                <div className="settings-row">
                  <label htmlFor="settingsStage">المرحلة الدراسية</label>
                  <select id="settingsStage" className="math-input">
                    <option value="elementary">ابتدائي</option>
                    <option value="preparatory">إعدادي</option>
                    <option value="secondary">ثانوي</option>
                    <option value="higher_ed">جامعي / عالي</option>
                    <option value="general">عام</option>
                  </select>
                </div>
                <div className="settings-row">
                  <label htmlFor="settingsGoal">الهدف التعليمي</label>
                  <select id="settingsGoal" className="math-input">
                    <option value="concept_mastery">فهم وإتقان المفاهيم</option>
                    <option value="exam_prep">الاستعداد للامتحانات</option>
                    <option value="homework">حل الواجبات خطوة بخطوة</option>
                    <option value="competition">الأولمبياد والمسابقات</option>
                  </select>
                </div>
              </div>

              <div className="settings-row">
                <label htmlFor="settingsCountry">البلد / المنهج</label>
                <input
                  type="text"
                  id="settingsCountry"
                  className="math-input"
                  placeholder="مثال: سوريا، السعودية، مصر، تركيا..."
                />
              </div>

              <div className="settings-row">
                <label htmlFor="settingsBio">نبذة وتفضيلات خاصة للمساعد</label>
                <textarea
                  id="settingsBio"
                  className="math-input"
                  rows={2}
                  placeholder="مثال: أفضّل الأمثلة المحلولة والتركيز على المعادلات التفاضلية..."
                ></textarea>
              </div>
            </div>

            <div className="settings-section">
              <h4>تفضيلات الشرح واللغة</h4>
              <div className="settings-grid-2">
                <div className="settings-row">
                  <label htmlFor="settingsExplanationMode">أسلوب الشرح</label>
                  <select id="settingsExplanationMode" className="math-input">
                    <option value="quick">سريع ومباشر</option>
                    <option value="detailed">تفصيلي مع الخطوات</option>
                  </select>
                </div>
                <div className="settings-row">
                  <label htmlFor="settingsLanguage">لغة الرد</label>
                  <select id="settingsLanguage" className="math-input">
                    <option value="ar">العربية</option>
                    <option value="en">English</option>
                    <option value="tr">Türkçe</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="settings-section">
              <h4>الخصوصية</h4>
              <div className="settings-row">
                <a
                  href="/privacy.html"
                  className="btn btn-secondary settings-privacy-link"
                  target="_blank"
                  rel="noreferrer"
                >
                  عرض سياسة الخصوصية
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer modal-buttons compact-footer ws-footer">
          <button className="btn btn-secondary" id="closeSettingsModalBtn">
            إغلاق
          </button>
          <button className="btn btn-primary" id="saveSettingsBtn">
            حفظ الملف الشخصي
          </button>
        </div>
      </div>
    </div>
  )
}

export function GeometryWorkspaceModal() {
  return (
    <div className="app-modal" id="geometry-workspace-modal">
      <div className="modal-content workspace-modal-advanced sticky-footer modal-xl geo-modal">
        <div className="modal-header geo-header">
          <div className="modal-header-title">
            <h3>ورشة الهندسة</h3>
          </div>
          <button className="modal-close-btn" data-modal-id="geometry-workspace-modal" aria-label="إغلاق">
            &times;
          </button>
        </div>

        <div className="modal-body geo-modal-body">
          <div className="geo-studio-layout">
            {/* منطقة السؤال والهدف واضحة أعلى الورشة */}
            <div className="geo-question-card">
              <div className="geo-question-head">
                <label htmlFor="geo-user-question" className="geo-question-label">
                  سؤال المسألة / المطلوب إيجاده
                </label>
                <div className="geo-intent-strip" id="geo-intent-chips" role="group" aria-label="أهداف سريعة">
                  <button type="button" className="geo-intent-chip" data-intent="تحليل هندسي كامل للشكل">تحليل شامل</button>
                  <button type="button" className="geo-intent-chip" data-intent="احسب المساحة والمحيط">المساحة والمحيط</button>
                  <button type="button" className="geo-intent-chip" data-intent="تطبيق نظرية فيثاغورس وإيجاد الضلع الناقص">فيثاغورس</button>
                  <button type="button" className="geo-intent-chip" data-intent="أوجد معادلة المستقيم والميل ونقطة المنتصف">معادلة المستقيم</button>
                  <button type="button" className="geo-intent-chip" data-intent="احسب الحجم والمساحة الكلية">الحجم والسطح</button>
                  <button type="button" className="geo-intent-chip" data-intent="أوجد قياس الزاوية المجهولة">زاوية مجهولة</button>
                </div>
              </div>
              <textarea
                id="geo-user-question"
                className="geo-question-input"
                rows={2}
                placeholder="اكتب مسألتك أو المطلوب هنا (مثال: احسب المساحة والمحيط، أو أوجد الضلع الناقص باستخدام فيثاغورس)..."
              />
            </div>

            {/* قوالب أشكال جاهزة للبدء الفوري */}
            <div className="geo-presets-bar" id="geo-presets-bar">
              <span className="geo-presets-label">إنشاء سريع:</span>
              <div className="geo-presets-scroll">
                <button type="button" className="geo-preset-btn" data-preset="right-triangle">مثلث قائم (3-4-5)</button>
                <button type="button" className="geo-preset-btn" data-preset="equilateral-triangle">متساوي الأضلاع</button>
                <button type="button" className="geo-preset-btn" data-preset="rectangle">مستطيل 6×4</button>
                <button type="button" className="geo-preset-btn" data-preset="square">مربع 5×5</button>
                <button type="button" className="geo-preset-btn" data-preset="circle">دائرة r=4</button>
                <button type="button" className="geo-preset-btn" data-preset="cone">مخروط r=3, h=5</button>
                <button type="button" className="geo-preset-btn" data-preset="polygon">مضلع رباعي</button>
                <button type="button" className="geo-preset-btn" data-preset="line">قطعة مستقيمة</button>
              </div>
            </div>

            {/* شريط أدوات الرسم الاحترافي */}
            <div className="workspace-toolbar geo-toolbar" role="toolbar" aria-label="أدوات الرسم الهندسي">
              <button type="button" className="tool-btn active" data-tool="select" title="تحديد وتحريك">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m4 4 7.07 17 2.51-7.39L21 11.07z" />
                </svg>
                <span>تحديد</span>
              </button>
              <button type="button" className="tool-btn" data-tool="point" title="إضافة نقطة">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="4" fill="currentColor" />
                  <circle cx="12" cy="12" r="9" strokeDasharray="3 3" />
                </svg>
                <span>نقطة</span>
              </button>
              <button type="button" className="tool-btn" data-tool="line" title="قطعة مستقيمة">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" aria-hidden="true">
                  <line x1="5" y1="19" x2="19" y2="5" />
                  <circle cx="5" cy="19" r="2" fill="currentColor" />
                  <circle cx="19" cy="5" r="2" fill="currentColor" />
                </svg>
                <span>مستقيم</span>
              </button>
              <button type="button" className="tool-btn" data-tool="triangle" title="مثلث">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
                  <polygon points="12 4 4 20 20 20" />
                </svg>
                <span>مثلث</span>
              </button>
              <button type="button" className="tool-btn" data-tool="rectangle" title="مستطيل أو مربع">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
                  <rect x="4" y="6" width="16" height="12" rx="1.5" />
                </svg>
                <span>مستطيل</span>
              </button>
              <button type="button" className="tool-btn" data-tool="circle" title="دائرة">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="8" />
                  <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                </svg>
                <span>دائرة</span>
              </button>
              <button type="button" className="tool-btn" data-tool="ellipse" title="قطع ناقص">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <ellipse cx="12" cy="12" rx="9" ry="5.5" />
                </svg>
                <span>ناقص</span>
              </button>
              <button type="button" className="tool-btn" data-tool="polygon" title="مضلع (4 نقاط)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
                  <polygon points="7 5 18 7 20 18 4 17" />
                </svg>
                <span>مضلع</span>
              </button>
              <button type="button" className="tool-btn" data-tool="cone" title="مخروط قائم">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 3 5 18h14Z" />
                  <ellipse cx="12" cy="18" rx="7" ry="2.5" />
                </svg>
                <span>مخروط</span>
              </button>
              <button type="button" className="tool-btn" data-tool="freehand" title="رسم حر بالقلم">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
                <span>حر</span>
              </button>
              <button type="button" className="tool-btn tool-btn-danger" data-tool="delete" title="حذف عنصر أو نقطة">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 6h18" />
                  <path d="M8 6V4h8v2" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                </svg>
                <span>حذف</span>
              </button>
            </div>

            {/* شريط التحكم باللوحة */}
            <div className="geo-utility-bar">
              <div className="geo-utility-actions">
                <button type="button" id="geoUndoBtn" className="geo-utility-btn" title="تراجع" aria-label="تراجع">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M9 14 4 9l5-5" />
                    <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
                  </svg>
                  <span>تراجع</span>
                </button>
                <button type="button" id="geoRedoBtn" className="geo-utility-btn" title="إعادة" aria-label="إعادة">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m15 14 5-5-5-5" />
                    <path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13" />
                  </svg>
                  <span>إعادة</span>
                </button>
                <button type="button" id="geoSnapToggle" className="geo-utility-btn active" title="التقاط للشبكة">
                  الشبكة: مفعّل
                </button>
                <button type="button" id="geoClearBtn" className="geo-utility-btn geo-clear-btn" title="مسح جميع الأشكال">
                  مسح اللوحة
                </button>
              </div>
              <div className="geo-utility-meta">
                <span id="geo-coord-display" className="geo-coord-readout" dir="ltr">x: 0.00 , y: 0.00</span>
                <select id="geo-unit-select" className="geo-unit-select" aria-label="وحدة القياس">
                  <option value="unit">وحدة</option>
                  <option value="cm">سم</option>
                  <option value="m">م</option>
                </select>
              </div>
            </div>

            {/* المساحة الرئيسية: لوحة الرسم + المحرر والمعاينة */}
            <div className="geo-workspace-stage">
              <div className="workspace-canvas-container geo-canvas-box">
                <canvas id="geometry-canvas"></canvas>
                <div className="geo-canvas-hint">
                  <span id="draw-helper-text">اختر أداة للرسم أو أنشئ قالباً جاهزاً من الأعلى</span>
                </div>
              </div>

              <div className="geo-side-column">
                {/* الأشكال المرسومة (الطبقات) */}
                <div className="geo-layers-card">
                  <div className="geo-layers-head">
                    <span>الأشكال على اللوحة</span>
                    <span id="geo-layers-count" className="geo-layers-count">0</span>
                  </div>
                  <div id="geo-layers-empty" className="geo-layers-empty">
                    لم يتم إضافة أي شكل بعد — اختر أداة أو قالباً سريعاً.
                  </div>
                  <div id="geo-layers-list" className="geo-layers-list"></div>
                </div>

                {/* خصائص الشكل المحدد (قابلة للتعديل المباشر) */}
                <div className="geo-inspector-panel">
                  <details id="geo-inspector-details" open>
                    <summary className="geo-inspector-summary">
                      <span className="geo-inspector-summary-left">
                        <span id="geo-inspector-icon">📐</span>
                        <span id="geo-inspector-title">خصائص الشكل المحدد</span>
                      </span>
                      <span className="geo-inspector-chevron">⌄</span>
                    </summary>
                    <div id="geo-inspector-content" className="geo-inspector-content">
                      <p className="geo-empty-hint">
                        ارسم شكلاً أو اختر قالباً لعرض أبعاده وتعديلها مباشرة.
                      </p>
                    </div>
                  </details>
                </div>

                {/* المعاينة المحلية الفورية */}
                <div id="geo-live-preview" className="mx-preview-panel geo-live-preview" style={{ display: "none" }}>
                  <div className="mx-preview-header">
                    <span id="geo-preview-title" className="mx-preview-title">المعاينة الفورية</span>
                    <span id="geo-preview-confidence" className="mx-preview-confidence"></span>
                  </div>
                  <div id="geo-preview-math" className="mx-preview-math" dir="ltr"></div>
                  <div id="geo-preview-steps" className="mx-preview-notes"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer compact-footer ws-footer">
          <button type="button" id="geo-preview-btn" className="btn btn-secondary">
            <span className="btn-label">معاينة</span>
          </button>
          <button type="button" id="solve-geometry-btn" className="btn btn-primary">
            <span className="btn-label">حل المسألة وإرسالها</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export function AlgebraWorkspaceModal() {
  return (
    <div className="app-modal" id="algebra-workspace-modal">
      <div className="modal-content workspace-modal-advanced sticky-footer modal-md">
        <div className="modal-header">
          <div className="modal-header-title">
            <h3>ورشة الجبر</h3>
          </div>
          <button className="modal-close-btn" data-modal-id="algebra-workspace-modal" aria-label="إغلاق">
            &times;
          </button>
        </div>

        <div className="modal-body">
          <div className="workspace-body-vertical ws-stack">
            <div className="ws-card">
              <div className="ws-card-title">العملية المطلوبة</div>
              <div className="ws-grid-2">
                <div className="ws-field">
                  <label htmlFor="algebra-category-select">الفئة</label>
                  <select id="algebra-category-select" className="math-input ws-select"></select>
                </div>
                <div className="ws-field">
                  <label htmlFor="algebra-method-select">العملية / الطريقة</label>
                  <select id="algebra-method-select" className="math-input ws-select"></select>
                </div>
              </div>
            </div>

            <div className="ws-card">
              <div className="ws-field">
                <label htmlFor="algebra-expression-input">التعبير الرياضي أو المعادلة</label>
                <input
                  type="text"
                  id="algebra-expression-input"
                  className="math-input"
                  placeholder="مثال: x^2 - 5x + 6 أو 3x + 2 = 0"
                  dir="ltr"
                />
              </div>
            </div>

            <div id="algebra-params-fieldset" className="ws-card" style={{ display: "none" }}>
              <div className="ws-card-title">معاملات إضافية</div>
              <div className="ws-field">
                <label id="algebra-param-label" htmlFor="algebra-param-input">المعامل:</label>
                <input type="text" id="algebra-param-input" className="math-input" placeholder="" dir="ltr" />
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer modal-buttons compact-footer ws-footer">
          <button id="solve-algebra-btn" className="btn btn-primary">
            <span className="btn-label">حل المسألة الجبرية</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export function StatisticsWorkspaceModal() {
  return (
    <div className="app-modal" id="statistics-workspace-modal">
      <div className="modal-content workspace-modal-advanced sticky-footer modal-md">
        <div className="modal-header">
          <div className="modal-header-title">
            <h3>ورشة الإحصاء</h3>
          </div>
          <button className="modal-close-btn" data-modal-id="statistics-workspace-modal" aria-label="إغلاق">
            &times;
          </button>
        </div>

        <div className="modal-body">
          <div className="workspace-body-vertical ws-stack">
            <div className="ws-card">
              <div className="ws-card-title">نوع التحليل الإحصائي</div>
              <div className="ws-grid-2">
                <div className="ws-field">
                  <label htmlFor="stats-category-select">الفئة</label>
                  <select id="stats-category-select" className="math-input ws-select"></select>
                </div>
                <div className="ws-field">
                  <label htmlFor="stats-method-select">العملية / الطريقة</label>
                  <select id="stats-method-select" className="math-input ws-select"></select>
                </div>
              </div>
            </div>

            <div id="stats-dataset-fieldset" className="ws-card" style={{ display: "none" }}>
              <div className="ws-card-title">مجموعة البيانات</div>
              <div className="ws-field">
                <label htmlFor="stats-data-input">أدخل القيم (مفصولة بفواصل أو مسافات)</label>
                <textarea
                  id="stats-data-input"
                  className="math-input"
                  rows={3}
                  placeholder="مثال: 10, 20, 15, 30, 25"
                  dir="ltr"
                ></textarea>
              </div>
            </div>

            <div id="stats-xy-dataset-fieldset" className="ws-card" style={{ display: "none" }}>
              <div className="ws-card-title">بيانات الارتباط والانحدار (X, Y)</div>
              <div className="ws-grid-2">
                <div className="ws-field">
                  <label htmlFor="stats-x-data-input">المتغير المستقل (X)</label>
                  <input
                    type="text"
                    id="stats-x-data-input"
                    className="math-input"
                    placeholder="مثال: 1, 2, 3, 4, 5"
                    dir="ltr"
                  />
                </div>
                <div className="ws-field">
                  <label htmlFor="stats-y-data-input">المتغير التابع (Y)</label>
                  <input
                    type="text"
                    id="stats-y-data-input"
                    className="math-input"
                    placeholder="مثال: 2, 4, 5, 4, 5"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            <div id="stats-params-fieldset" className="ws-card" style={{ display: "none" }}>
              <div className="ws-card-title">معاملات إضافية</div>
              <div className="ws-field">
                <label id="stats-param-label" htmlFor="stats-param-input">القيمة:</label>
                <input type="text" id="stats-param-input" className="math-input" placeholder="" dir="ltr" />
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer modal-buttons compact-footer ws-footer">
          <button id="solve-stats-btn" className="btn btn-primary">
            <span className="btn-label">تحليل البيانات إحصائياً</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export function MatrixWorkspaceModal() {
  return (
    <div className="app-modal" id="matrix-workspace-modal">
      <div className="modal-content workspace-modal-advanced sticky-footer modal-lg mx-modal">
        <div className="modal-header mx-header">
          <div className="modal-header-title">
            <h3>مختبر المصفوفات</h3>
          </div>
          <button className="modal-close-btn" data-modal-id="matrix-workspace-modal" aria-label="إغلاق">
            &times;
          </button>
        </div>

        <div className="modal-body mx-body">
          <div className="matrix-workspace-body-vertical mx-workbench">
            {/* Operation Selector Bar */}
            <div className="mx-op-bar">
              <select id="matrix-operation-select" className="matrix-operation-select mx-op-select" aria-label="العملية المطلوبة">
                <optgroup label="العمليات الأساسية والتعبيرات">
                  <option value="add" data-requires-b="true" data-requires-param="false">
                    جمع مصفوفتين (A + B)
                  </option>
                  <option value="subtract" data-requires-b="true" data-requires-param="false">
                    طرح مصفوفتين (A - B)
                  </option>
                  <option value="multiply" data-requires-b="true" data-requires-param="false">
                    ضرب مصفوفتين (A × B)
                  </option>
                  <option value="scalarMultiply" data-requires-b="false" data-requires-param="true">
                    ضرب في عدد قياسي (k · A)
                  </option>
                  <option value="power" data-requires-b="false" data-requires-param="true">
                    قوة المصفوفة (Aⁿ)
                  </option>
                  <option value="matrixExpression" data-requires-b="false" data-optional-b="true" data-requires-expr="true">
                    عبارة مصفوفية مخصصة (2*A^2 - 3*A + I)
                  </option>
                </optgroup>

                <optgroup label="الحسابات الجبرية والمعكوس">
                  <option value="transA" data-requires-b="false" data-requires-param="false">
                    منقول المصفوفة (Aᵀ)
                  </option>
                  <option value="detA" data-requires-b="false" data-requires-param="false">
                    محدد المصفوفة det(A)
                  </option>
                  <option value="invA" data-requires-b="false" data-requires-param="false">
                    معكوس المصفوفة (A⁻¹)
                  </option>
                  <option value="adjA" data-requires-b="false" data-requires-param="false">
                    المصفوفة المرافقة adj(A)
                  </option>
                  <option value="traceA" data-requires-b="false" data-requires-param="false">
                    أثر المصفوفة tr(A)
                  </option>
                  <option value="expA" data-requires-b="false" data-requires-param="false">
                    الأسي للمصفوفة (e^A)
                  </option>
                </optgroup>

                <optgroup label="الأنظمة الخطية والمعادلات">
                  <option value="rowEchelon" data-requires-b="false" data-requires-param="false">
                    الشكل الصفي المختزل (RREF)
                  </option>
                  <option value="rankA" data-requires-b="false" data-requires-param="false">
                    رتبة المصفوفة Rank(A)
                  </option>
                  <option value="solveSystem" data-requires-b="false" data-requires-c="true" data-requires-param="false">
                    حل النظام الخطي Ax = b
                  </option>
                  <option value="solveMatrixEq" data-requires-b="true" data-requires-eq-mode="true" data-requires-param="false">
                    المعادلة المصفوفية AX = B أو XA = B
                  </option>
                </optgroup>

                <optgroup label="الفضاءات المتجهة والقيم الذاتية">
                  <option value="eigen" data-requires-b="false" data-requires-param="false">
                    القيم والمتجهات الذاتية
                  </option>
                  <option value="charPoly" data-requires-b="false" data-requires-param="false">
                    كثيرة الحدود المميزة det(λI - A)
                  </option>
                  <option value="diagonalize" data-requires-b="false" data-requires-param="false">
                    قطرنة المصفوفة (A = P D P⁻¹)
                  </option>
                  <option value="gramSchmidt" data-requires-b="false" data-requires-param="false">
                    تعامد غرام-شميدت (Gram-Schmidt)
                  </option>
                  <option value="colSpace" data-requires-b="false" data-requires-param="false">
                    أساس فضاء الأعمدة C(A)
                  </option>
                  <option value="rowSpace" data-requires-b="false" data-requires-param="false">
                    أساس فضاء الصفوف R(A)
                  </option>
                  <option value="nullSpace" data-requires-b="false" data-requires-param="false">
                    أساس الفضاء الصفري N(A)
                  </option>
                </optgroup>

                <optgroup label="التفكيكات المصفوفية">
                  <option value="lu" data-requires-b="false" data-requires-param="false">
                    تفكيك LU (PA = LU)
                  </option>
                  <option value="qr" data-requires-b="false" data-requires-param="false">
                    تفكيك QR (A = Q R)
                  </option>
                  <option value="cholesky" data-requires-b="false" data-requires-param="false">
                    تفكيك Cholesky (A = L Lᵀ)
                  </option>
                  <option value="svd" data-requires-b="false" data-requires-param="false">
                    تحليل القيم المفردة (SVD)
                  </option>
                  <option value="pseudoinverse" data-requires-b="false" data-requires-param="false">
                    شبه المعكوس العام (A⁺)
                  </option>
                </optgroup>

                <optgroup label="التحليل والخصائص">
                  <option value="comprehensive_analysis" data-requires-b="false" data-requires-param="false">
                    التحليل الشامل للمصفوفة
                  </option>
                  <option value="norm" data-requires-b="false" data-requires-param="false">
                    معايير المصفوفة (Norms)
                  </option>
                  <option value="conditionNumber" data-requires-b="false" data-requires-param="false">
                    رقم الشرط κ(A)
                  </option>
                  <option value="matrixType" data-requires-b="false" data-requires-param="false">
                    التصنيف البنيوي للمصفوفة
                  </option>
                  <option value="density" data-requires-b="false" data-requires-param="false">
                    كثافة المصفوفة والتناثر
                  </option>
                </optgroup>
              </select>

              {/* Dynamic Parameter Strip */}
              <div id="matrix-param-fieldset" className="mx-inline-subpanel" style={{ display: "none" }}>
                <div className="mx-param-row">
                  <label id="matrix-param-label" htmlFor="matrix-param-input">العدد (k):</label>
                  <input type="text" id="matrix-param-input" className="matrix-dim mx-param-input" defaultValue="2" dir="ltr" />
                  <div id="matrix-power-presets" className="mx-quick-chips" style={{ display: "none" }}>
                    <button type="button" className="mx-chip" data-param="-2" dir="ltr">A⁻²</button>
                    <button type="button" className="mx-chip" data-param="-1" dir="ltr">A⁻¹</button>
                    <button type="button" className="mx-chip" data-param="2" dir="ltr">A²</button>
                    <button type="button" className="mx-chip" data-param="3" dir="ltr">A³</button>
                  </div>
                </div>
              </div>

              <div id="matrix-eq-mode-fieldset" className="mx-inline-subpanel" style={{ display: "none" }}>
                <div className="mx-eq-mode-toggle">
                  <span className="mx-sub-title">الصيغة:</span>
                  <label className="mx-radio-opt">
                    <input type="radio" name="matrix-eq-mode" value="AX=B" defaultChecked />
                    <span dir="ltr">A·X = B</span>
                  </label>
                  <label className="mx-radio-opt">
                    <input type="radio" name="matrix-eq-mode" value="XA=B" />
                    <span dir="ltr">X·A = B</span>
                  </label>
                </div>
              </div>

              <div id="matrix-expr-fieldset" className="mx-inline-subpanel" style={{ display: "none" }}>
                <div className="mx-expr-wrap">
                  <input
                    type="text"
                    id="matrix-expression-input"
                    className="mx-expr-input"
                    dir="ltr"
                    defaultValue="2*A^2 - 3*A + 5*I"
                    placeholder="2*A^2 - 3*A + 5*I  أو  inv(A)*B"
                  />
                  <div className="mx-expr-templates">
                    <button type="button" className="mx-chip" data-expr="A^2 - 3*A + 2*I" dir="ltr">A²-3A+2I</button>
                    <button type="button" className="mx-chip" data-expr="A*B - B*A" data-needs-b="true" dir="ltr">AB-BA</button>
                    <button type="button" className="mx-chip" data-expr="inv(A)*B" data-needs-b="true" dir="ltr">A⁻¹B</button>
                    <button type="button" className="mx-chip" data-expr="trans(A)*A" dir="ltr">AᵀA</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Matrices Stage */}
            <div className="mx-matrices-grid" id="matrix-cards-container">
              {/* Matrix A Card */}
              <div className="mx-card" id="matrix-a-fieldset">
                <div className="mx-card-top" id="matrix-a-controls">
                  <span className="mx-card-title" dir="ltr">A</span>
                  <div className="mx-dims-inline" dir="ltr">
                    <input
                      type="number"
                      aria-label="صفوف المصفوفة A"
                      className="matrix-dim mx-dim-input"
                      data-matrix="A"
                      data-dim="rows"
                      min={1}
                      max={25}
                      defaultValue={3}
                      dir="ltr"
                    />
                    <span className="mx-dim-x" aria-hidden="true">×</span>
                    <input
                      type="number"
                      aria-label="أعمدة المصفوفة A"
                      className="matrix-dim mx-dim-input"
                      data-matrix="A"
                      data-dim="cols"
                      min={1}
                      max={25}
                      defaultValue={3}
                      dir="ltr"
                    />
                  </div>
                  <details className="mx-tools-drawer">
                    <summary className="mx-tools-summary">أدوات ▾</summary>
                    <div className="mx-tools-menu">
                      <div className="mx-size-presets" data-matrix="A">
                        <button type="button" className="mx-size-btn" data-matrix="A" data-rows="2" data-cols="2" dir="ltr">2×2</button>
                        <button type="button" className="mx-size-btn active" data-matrix="A" data-rows="3" data-cols="3" dir="ltr">3×3</button>
                        <button type="button" className="mx-size-btn" data-matrix="A" data-rows="4" data-cols="4" dir="ltr">4×4</button>
                      </div>
                      <div className="mx-fill-bar" data-matrix="A">
                        <button type="button" className="mx-tool-btn" data-matrix="A" data-fill="identity">I</button>
                        <button type="button" className="mx-tool-btn" data-matrix="A" data-fill="zero">0</button>
                        <button type="button" className="mx-tool-btn" data-matrix="A" data-fill="random">عشوائية</button>
                        <button type="button" className="mx-tool-btn" data-matrix="A" data-fill="symmetric">متناظرة</button>
                        <button type="button" className="mx-tool-btn" data-matrix="A" data-fill="transpose" dir="ltr">Aᵀ</button>
                        <button type="button" className="mx-tool-btn mx-tool-import" data-matrix="A" data-action="toggle-import">لصق</button>
                      </div>
                      <div className="mx-import-box" id="matrix-a-import-box" style={{ display: "none" }}>
                        <textarea
                          id="matrix-a-import-text"
                          className="mx-import-textarea"
                          rows={2}
                          dir="ltr"
                          placeholder="[[2,-1,0],[-1,2,-1],[0,-1,2]]"
                        />
                        <div className="mx-import-actions">
                          <button type="button" className="mx-apply-import-btn" data-matrix="A">تطبيق</button>
                        </div>
                      </div>
                    </div>
                  </details>
                </div>

                <div className="mx-matrix-stage">
                  <div className="mx-matrix-frame">
                    <div className="mx-bracket mx-bracket-left" aria-hidden="true"></div>
                    <div id="matrix-a-grid" className="mx-grid-inner"></div>
                    <div className="mx-bracket mx-bracket-right" aria-hidden="true"></div>
                  </div>
                </div>
              </div>

              {/* Swap Button between A and B */}
              <div className="mx-swap-col" id="matrix-swap-col" style={{ display: "none" }}>
                <button type="button" id="matrix-swap-ab-btn" className="mx-swap-btn" title="تبديل A مع B">
                  <span dir="ltr">A ⇄ B</span>
                </button>
              </div>

              {/* Matrix B Card */}
              <div id="matrix-b-fieldset" className="mx-card" style={{ display: "none" }}>
                <div className="mx-card-top" id="matrix-b-controls">
                  <span className="mx-card-title" dir="ltr">B</span>
                  <div className="mx-dims-inline" dir="ltr">
                    <input
                      type="number"
                      aria-label="صفوف المصفوفة B"
                      className="matrix-dim mx-dim-input"
                      data-matrix="B"
                      data-dim="rows"
                      min={1}
                      max={25}
                      defaultValue={3}
                      dir="ltr"
                    />
                    <span className="mx-dim-x" aria-hidden="true">×</span>
                    <input
                      type="number"
                      aria-label="أعمدة المصفوفة B"
                      className="matrix-dim mx-dim-input"
                      data-matrix="B"
                      data-dim="cols"
                      min={1}
                      max={25}
                      defaultValue={3}
                      dir="ltr"
                    />
                  </div>
                  <details className="mx-tools-drawer">
                    <summary className="mx-tools-summary">أدوات ▾</summary>
                    <div className="mx-tools-menu">
                      <div className="mx-size-presets" data-matrix="B">
                        <button type="button" className="mx-size-btn" data-matrix="B" data-rows="2" data-cols="2" dir="ltr">2×2</button>
                        <button type="button" className="mx-size-btn active" data-matrix="B" data-rows="3" data-cols="3" dir="ltr">3×3</button>
                        <button type="button" className="mx-size-btn" data-matrix="B" data-rows="4" data-cols="4" dir="ltr">4×4</button>
                      </div>
                      <div className="mx-fill-bar" data-matrix="B">
                        <button type="button" className="mx-tool-btn" data-matrix="B" data-fill="identity">I</button>
                        <button type="button" className="mx-tool-btn" data-matrix="B" data-fill="zero">0</button>
                        <button type="button" className="mx-tool-btn" data-matrix="B" data-fill="random">عشوائية</button>
                        <button type="button" className="mx-tool-btn" data-matrix="B" data-fill="transpose" dir="ltr">Bᵀ</button>
                        <button type="button" className="mx-tool-btn mx-tool-import" data-matrix="B" data-action="toggle-import">لصق</button>
                      </div>
                      <div className="mx-import-box" id="matrix-b-import-box" style={{ display: "none" }}>
                        <textarea
                          id="matrix-b-import-text"
                          className="mx-import-textarea"
                          rows={2}
                          dir="ltr"
                          placeholder="[[1,0],[0,1]]"
                        />
                        <div className="mx-import-actions">
                          <button type="button" className="mx-apply-import-btn" data-matrix="B">تطبيق</button>
                        </div>
                      </div>
                    </div>
                  </details>
                </div>

                <div className="mx-matrix-stage">
                  <div className="mx-matrix-frame">
                    <div className="mx-bracket mx-bracket-left" aria-hidden="true"></div>
                    <div id="matrix-b-grid" className="mx-grid-inner"></div>
                    <div className="mx-bracket mx-bracket-right" aria-hidden="true"></div>
                  </div>
                </div>
              </div>

              {/* Vector b Card for Ax = b */}
              <div id="matrix-c-fieldset" className="mx-card mx-card-vector" style={{ display: "none" }}>
                <div className="mx-card-top" id="matrix-c-controls">
                  <span className="mx-card-title" dir="ltr">b</span>
                  <div className="mx-dims-inline" dir="ltr">
                    <input
                      type="number"
                      aria-label="صفوف المتجه b"
                      className="matrix-dim mx-dim-input"
                      data-matrix="C"
                      data-dim="rows"
                      min={1}
                      max={25}
                      defaultValue={3}
                      dir="ltr"
                    />
                    <span className="mx-dim-x" aria-hidden="true">×</span>
                    <input
                      type="number"
                      aria-label="أعمدة المتجه b"
                      className="matrix-dim mx-dim-input"
                      data-matrix="C"
                      data-dim="cols"
                      min={1}
                      max={1}
                      defaultValue={1}
                      readOnly
                      dir="ltr"
                    />
                  </div>
                  <details className="mx-tools-drawer">
                    <summary className="mx-tools-summary">أدوات ▾</summary>
                    <div className="mx-tools-menu">
                      <div className="mx-fill-bar mx-fill-inline" data-matrix="C">
                        <button type="button" className="mx-tool-btn" data-matrix="C" data-fill="zero">0</button>
                        <button type="button" className="mx-tool-btn" data-matrix="C" data-fill="random">عشوائي</button>
                      </div>
                    </div>
                  </details>
                </div>

                <div className="mx-matrix-stage">
                  <div className="mx-matrix-frame">
                    <div className="mx-bracket mx-bracket-left" aria-hidden="true"></div>
                    <div id="matrix-c-grid" className="mx-grid-inner"></div>
                    <div className="mx-bracket mx-bracket-right" aria-hidden="true"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Instant Local Preview Output Panel */}
            <section id="matrix-instant-preview" className="mx-preview-panel" style={{ display: "none" }}>
              <div className="mx-preview-header">
                <span className="mx-preview-title" id="matrix-preview-title">معاينة الحل</span>
                <span className="mx-preview-confidence" id="matrix-preview-confidence"></span>
              </div>
              <div className="mx-preview-math" id="matrix-preview-math" dir="ltr"></div>
              <div className="mx-preview-notes" id="matrix-preview-notes"></div>
            </section>
          </div>
        </div>

        <div className="modal-footer modal-buttons compact-footer ws-footer">
          <button type="button" id="matrix-preview-btn" className="btn btn-secondary">
            <span className="btn-label">معاينة</span>
          </button>
          <button type="button" id="matrix-send-to-chat-btn" className="btn btn-primary">
            <span className="btn-label">احسب الحل</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export function CalculusWorkspaceModal() {
  return (
    <div className="app-modal" id="calculus-workspace-modal">
      <div className="modal-content workspace-modal-advanced sticky-footer modal-md">
        <div className="modal-header">
          <div className="modal-header-title">
            <h3>ورشة التفاضل والتكامل</h3>
          </div>
          <button className="modal-close-btn" data-modal-id="calculus-workspace-modal" aria-label="إغلاق">
            &times;
          </button>
        </div>

        <div className="modal-body">
          <div className="calculus-workspace-body-vertical ws-stack">
            <div className="ws-card">
              <div className="ws-card-title">الخطوة 1: أدخل الدالة f(x)</div>
              <math-field id="calc-function-input" className="math-input" placeholder="مثال: x^2 + sin(x)"></math-field>
            </div>

            <div className="ws-card">
              <div className="ws-card-title">الخطوة 2: العملية المطلوبة</div>
              <select id="calculus-operation-select" className="matrix-operation-select ws-select">
                <optgroup label="تحليل الدوال">
                  <option value="find_domain">مجال التعريف (Domain)</option>
                  <option value="find_asymptotes">الخطوط المقاربة (Asymptotes)</option>
                  <option value="evaluate_at_point">حساب قيمة الدالة عند نقطة</option>
                  <option value="find_extrema">القيم القصوى (Extrema)</option>
                </optgroup>

                <optgroup label="التفاضل (Differentiation)">
                  <option value="differentiate">dy/dx (المشتقة الأولى)</option>
                  <option value="nth_derivative">dⁿy/dxⁿ (المشتقة النونية)</option>
                </optgroup>

                <optgroup label="التكامل (Integration)">
                  <option value="integrate_indefinite">∫f(x)dx (تكامل غير محدود)</option>
                  <option value="integrate_definite">∫[a, b] f(x)dx (تكامل محدود)</option>
                  <option value="arc_length">طول القوس (Arc Length)</option>
                  <option value="volume_revolution">حجم الدوران (Volume of Revolution)</option>
                </optgroup>

                <optgroup label="النهايات والمتسلسلات">
                  <option value="limit">lim f(x) (النهاية)</option>
                  <option value="taylor">متسلسلة تايلور/ماكلورين</option>
                  <option value="series_convergence">اختبار تقارب المتسلسلات</option>
                </optgroup>
              </select>
            </div>

            <div id="calculus-params-fieldset" className="ws-card" style={{ display: "none" }}>
              <div className="ws-card-title">الخطوة 3: المعاملات الإضافية</div>

              <div className="calc-param-row" id="calc-single-param" style={{ display: "none" }}>
                <label id="calc-param-label" htmlFor="calc-param-input">المعامل:</label>
                <input type="text" id="calc-param-input" className="matrix-dim" defaultValue="0" dir="ltr" />
              </div>

              <div className="ws-stack" id="calc-definite-integration" style={{ display: "none" }}>
                <label id="range-label-main" style={{ fontWeight: 700, fontSize: "13px", color: "var(--text-secondary)" }}>
                  حدود التكامل:
                </label>
                <div className="calc-limits-grid">
                  <div className="ws-field">
                    <label htmlFor="calc-limit-a">من (a)</label>
                    <input type="text" id="calc-limit-a" className="math-input" defaultValue="0" dir="ltr" />
                  </div>
                  <div className="ws-field">
                    <label htmlFor="calc-limit-b">إلى (b)</label>
                    <input type="text" id="calc-limit-b" className="math-input" defaultValue="1" dir="ltr" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer modal-buttons compact-footer ws-footer">
          <button id="solve-calculus-btn" className="btn btn-primary">
            <span className="btn-label">حل المسألة خطوة بخطوة</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export function UnitConverterModal() {
  return (
    <div className="app-modal" id="unit-converter-modal">
      <div className="modal-content workspace-modal-advanced sticky-footer modal-md">
        <div className="modal-header">
          <div className="modal-header-title">
            <h3>محول الوحدات</h3>
          </div>
          <button className="modal-close-btn" data-modal-id="unit-converter-modal" aria-label="إغلاق">
            &times;
          </button>
        </div>

        <div className="modal-body">
          <div className="unit-converter-layout ws-stack">
            <div className="ws-card">
              <div className="ws-field">
                <label htmlFor="unit-category-select">اختر نوع الكمية</label>
                <select id="unit-category-select" className="math-input ws-select">
                  <option value="length">الطول (Length)</option>
                  <option value="mass">الكتلة (Mass)</option>
                  <option value="time">الزمن (Time)</option>
                  <option value="energy">الطاقة (Energy)</option>
                  <option value="pressure">الضغط (Pressure)</option>
                  <option value="temperature">الحرارة (Temperature)</option>
                  <option value="area">المساحة (Area)</option>
                  <option value="volume">الحجم (Volume)</option>
                  <option value="speed">السرعة (Speed)</option>
                  <option value="frequency">التردد (Frequency)</option>
                </select>
              </div>
            </div>

            <div className="ws-card">
              <div className="ws-card-title">من (From)</div>
              <div className="ws-unit-pair">
                <input
                  type="number"
                  id="from-value"
                  className="math-input"
                  placeholder="أدخل القيمة"
                  step="any"
                  dir="ltr"
                />
                <select id="from-unit" className="math-input ws-select"></select>
              </div>
            </div>

            <div className="uc-swap-row">
              <button type="button" id="swap-units-btn" className="uc-swap-btn" title="تبديل الوحدتين" aria-label="تبديل الوحدتين">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m7 16 5 5 5-5" />
                  <path d="M12 21V3" />
                  <path d="m17 8-5-5-5 5" />
                </svg>
              </button>
            </div>

            <div className="ws-card">
              <div className="ws-card-title">إلى (To)</div>
              <div className="ws-unit-pair">
                <input
                  type="number"
                  id="to-value"
                  className="math-input"
                  placeholder="النتيجة"
                  readOnly
                  dir="ltr"
                />
                <select id="to-unit" className="math-input ws-select"></select>
              </div>
            </div>

            <div id="conversion-results" className="ws-card" style={{ display: "none" }}>
              <div className="ws-card-title">تحويلات شائعة</div>
              <div id="common-conversions" className="uc-common-grid"></div>
            </div>
          </div>
        </div>
        <div className="modal-footer modal-buttons compact-footer ws-footer">
          <button id="send-conversion-btn" className="btn btn-primary">
            <span className="btn-label">إرسال التحويل للمحادثة</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export function ExamBuilderModal() {
  return (
    <div className="app-modal" id="exam-builder-modal">
      <div className="modal-content workspace-modal-advanced sticky-footer modal-lg">
        <div className="modal-header">
          <div className="modal-header-title">
            <h3>منشئ الامتحانات</h3>
          </div>
          <button className="modal-close-btn" data-modal-id="exam-builder-modal" aria-label="إغلاق">
            &times;
          </button>
        </div>

        <div className="modal-body">
          <div className="exam-layout">
            <div id="exam-setup-panel" className="exam-setup-panel">
              <div className="exam-upload-zone" id="exam-upload-zone">
                <div className="exam-upload-icon" aria-hidden="true">📂</div>
                <p className="exam-upload-title">اضغط هنا لرفع نموذج وزاري، صفحة من كتاب، أو صورة أسئلة</p>
                <p className="exam-upload-hint">يدعم الصور وملفات PDF</p>
                <input type="file" id="exam-file-input" accept="image/*,application/pdf" style={{ display: "none" }} />
              </div>

              <div id="exam-file-preview" className="exam-file-pill">
                <span id="exam-file-name" className="exam-file-name"></span>
                <button
                  type="button"
                  className="btn btn-delete exam-remove-file-btn"
                  onClick={handleExamClearFile}
                >
                  إزالة
                </button>
              </div>

              <div className="ws-card">
                <div className="ws-grid-2">
                  <div className="ws-field">
                    <label htmlFor="exam-question-count">عدد الأسئلة</label>
                    <select id="exam-question-count" className="math-input ws-select">
                      <option value="same">نفس نمط الملف المرفق (تلقائي)</option>
                      <option value="5">5 أسئلة (اختبار سريع)</option>
                      <option value="10">10 أسئلة</option>
                      <option value="20">20 سؤال (نموذج كامل)</option>
                    </select>
                  </div>
                  <div className="ws-field">
                    <label htmlFor="exam-difficulty">مستوى الصعوبة</label>
                    <select id="exam-difficulty" className="math-input ws-select">
                      <option value="match">مطابق للنموذج المرفق</option>
                      <option value="harder">أصعب قليلاً (للمتميزين)</option>
                      <option value="easier">أسهل (للمراجعة)</option>
                    </select>
                  </div>
                </div>
              </div>

              <button type="button" id="generate-exam-btn" className="btn btn-primary" style={{ width: "100%" }}>
                توليد الامتحان التدريبي
              </button>
            </div>

            <div id="exam-display-panel" className="exam-display-panel">
              <div id="exam-questions-container" className="exam-questions-container"></div>
              <div className="exam-display-actions">
                <button type="button" id="submit-exam-btn" className="btn btn-primary">
                  تسليم الامتحان وتصحيحه
                </button>
                <button type="button" id="new-exam-btn" className="btn btn-secondary">
                  امتحان جديد
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function CalculatorModal() {
  return (
    <div className="app-modal" id="calculatorModal">
      <div className="modal-content modal-sm" id="calculatorModalContent">
        <div className="modal-header">
          <div className="modal-header-title">
            <h3>الآلة الحاسبة</h3>
          </div>
          <button className="modal-close-btn" id="closeCalculatorBtn" aria-label="إغلاق">
            &times;
          </button>
        </div>
        <div className="modal-body">
          <div className="calculator-grid">
            <div className="calc-display">
              <div id="calcHistory" className="calc-history" dir="ltr"></div>
              <div id="calcScreen" className="calc-screen" dir="ltr">
                0
              </div>
            </div>

            <button className="calc-btn func-btn" data-key="mc">
              MC
            </button>
            <button className="calc-btn func-btn" data-key="mr">
              MR
            </button>
            <button className="calc-btn func-btn" data-key="m+">
              M+
            </button>
            <button className="calc-btn func-btn" data-key="m-">
              M-
            </button>
            <button className="calc-btn clear-btn" data-key="clear">
              AC
            </button>
            <button className="calc-btn op-btn" data-key="backspace">
              ⌫
            </button>

            <button className="calc-btn func-btn" data-key="sin">
              sin
            </button>
            <button className="calc-btn func-btn" data-key="cos">
              cos
            </button>
            <button className="calc-btn func-btn" data-key="tan">
              tan
            </button>
            <button className="calc-btn func-btn" data-key="asin">
              asin
            </button>
            <button className="calc-btn func-btn" data-key="acos">
              acos
            </button>
            <button className="calc-btn func-btn" data-key="atan">
              atan
            </button>

            <button className="calc-btn func-btn" data-key="sinh">
              sinh
            </button>
            <button className="calc-btn func-btn" data-key="cosh">
              cosh
            </button>
            <button className="calc-btn func-btn" data-key="tanh">
              tanh
            </button>
            <button className="calc-btn func-btn" data-key="log">
              log
            </button>
            <button className="calc-btn func-btn" data-key="ln">
              ln
            </button>
            <button className="calc-btn func-btn" data-key="exp">
              exp
            </button>

            <button className="calc-btn func-btn" data-key="(">
              (
            </button>
            <button className="calc-btn func-btn" data-key=")">
              )
            </button>
            <button className="calc-btn func-btn" data-key="^">
              ^
            </button>
            <button className="calc-btn func-btn" data-key="sqrt">
              √
            </button>
            <button className="calc-btn func-btn" data-key="root">
              y√x
            </button>
            <button className="calc-btn func-btn" data-key="!">
              n!
            </button>

            <button className="calc-btn num-btn" data-key="7">
              7
            </button>
            <button className="calc-btn num-btn" data-key="8">
              8
            </button>
            <button className="calc-btn num-btn" data-key="9">
              9
            </button>
            <button className="calc-btn op-btn" data-key="/">
              ÷
            </button>
            <button className="calc-btn func-btn" data-key="pi">
              π
            </button>
            <button className="calc-btn func-btn" data-key="e">
              e
            </button>

            <button className="calc-btn num-btn" data-key="4">
              4
            </button>
            <button className="calc-btn num-btn" data-key="5">
              5
            </button>
            <button className="calc-btn num-btn" data-key="6">
              6
            </button>
            <button className="calc-btn op-btn" data-key="*">
              ×
            </button>
            <button className="calc-btn func-btn" data-key="%">
              %
            </button>
            <button className="calc-btn func-btn" data-key="inv">
              1/x
            </button>

            <button className="calc-btn num-btn" data-key="1">
              1
            </button>
            <button className="calc-btn num-btn" data-key="2">
              2
            </button>
            <button className="calc-btn num-btn" data-key="3">
              3
            </button>
            <button className="calc-btn op-btn" data-key="-">
              -
            </button>
            <button className="calc-btn func-btn" data-key="toggle-sign">
              +/-
            </button>
            <button className="calc-btn func-btn" data-key="approx" title="تقريب عشري">
              ≈
            </button>

            <button className="calc-btn num-btn" data-key="0">
              0
            </button>
            <button className="calc-btn num-btn" data-key=".">
              .
            </button>
            <button className="calc-btn equal-btn" data-key="=">
              =
            </button>
            <button className="calc-btn op-btn" data-key="+">
              +
            </button>
            <button className="calc-btn func-btn" data-key="ans">
              Ans
            </button>
            <button className="calc-btn plot-btn" data-key="plot" title="ارسم الدالة بيانياً">
              رسم
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Modals() {
  return (
    <>
      <MathModal />
      <PhotoModal />
      <DrawingModal />
      <AuthModal />
      <SettingsModal />
      <SavedChatsModal />
      <SolvedHistoryModal />
      <GeometryWorkspaceModal />
      <AlgebraWorkspaceModal />
      <StatisticsWorkspaceModal />
      <MatrixWorkspaceModal />
      <CalculusWorkspaceModal />
      <UnitConverterModal />
      <ExamBuilderModal />
      <CalculatorModal />
    </>
  )
}
