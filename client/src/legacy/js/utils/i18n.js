// ==================== INTERNATIONALIZATION (AR / EN / TR) & RTL/LTR ====================

export const I18N_DICTIONARY = {
    ar: {
        dir: 'rtl',
        dateLocale: 'ar-EG',
        appTitle: 'المستشار الرياضي',
        statusOnline: 'متصل',
        statusOffline: 'غير متصل',
        offlineBanner: 'أنت غير متصل بالإنترنت — الوضع المحلي يعمل لحل المعادلات والعمليات الأساسية',
        openMenu: 'فتح القائمة',
        close: 'إغلاق',
        cancel: 'إلغاء',
        toggleTheme: 'تبديل المظهر',
        themeLight: 'الوضع الفاتح',
        themeDark: 'الوضع الليلي',
        accountTitle: 'الحساب والإعدادات',
        defaultStudent: 'طالب الرياضيات',
        authVerified: 'حساب موثّق ✓',
        guestMode: 'وضع الضيف',
        newChat: 'جديد',
        history: 'السجل',
        export: 'تصدير',
        savedChats: 'المحادثات',
        noSavedChats: 'لا توجد محادثات بعد',
        noSavedChatsCloud: 'لا توجد محادثات محفوظة',
        loadingChats: 'جاري التحميل...',
        errorLoadingChats: 'خطأ في تحميل المحادثات',
        localChatTitle: 'محادثة محلية',
        untitledChat: 'بدون عنوان',
        chatActions: 'خيارات المحادثة',
        pinChat: 'تثبيت',
        unpinChat: 'إلغاء التثبيت',
        renameChat: 'إعادة تسمية',
        deleteChat: 'حذف',
        lessons: 'الدروس',
        lessonDefaultTitle: 'درس',
        teacherName: 'الأستاذ محمد جمال نعمه',
        directContact: 'تواصل مباشر',
        whatsapp: 'واتساب',
        facebook: 'فيسبوك',
        telegram: 'تلغرام',
        editorPlaceholder: 'اكتب مسألتك أو ألصق معادلة هنا...',
        send: 'إرسال',
        voiceInput: 'تسجيل صوتي',
        insertEquation: 'إدراج معادلة',
        toolsTitle: 'الأدوات والورش',
        toolCamera: 'كاميرا',
        toolFile: 'ملف',
        toolDrawing: 'رسم',
        toolCalculus: 'التفاضل',
        toolStatistics: 'الإحصاء',
        toolAlgebra: 'الجبر',
        toolGeometry: 'الهندسة',
        toolMatrix: 'المصفوفات',
        toolExam: 'امتحانات',
        toolCalculator: 'حاسبة',
        toolUnits: 'وحدات',
        installTitle: 'ثبّت التطبيق',
        installDesc: 'للوصول السريع والعمل بدون إنترنت',
        installBtn: 'تثبيت',
        updateAvailable: 'يتوفر إصدار أحدث من التطبيق',
        updateBtn: 'تحديث الآن',
        librarySearchPlaceholder: 'ابحث في المكتبة...',
        librarySearchLabel: 'ابحث في مكتبة الدروس',
        libraryFavsTitle: 'عرض الدروس المفضلة',
        libraryExpandAll: 'فتح الكل',
        libraryCollapseAll: 'طي الكل',
        noFavLessons: 'لا توجد دروس مفضلة بعد. اضغط على ☆ بجانب أي درس لإضافته.',
        noMatchingLessons: 'لم يتم العثور على دروس مطابقة لبحثك.',
        addFav: 'إضافة إلى المفضلة',
        removeFav: 'إزالة من المفضلة',
        welcomeHeading: 'المستشار الرياضي',
        welcomeSubtitle: 'حل خطوة بخطوة في الجبر، التفاضل، الهندسة والمصفوفات',
        promptAlgebraTag: 'جبر',
        promptCalculusTag: 'تفاضل',
        promptMatrixTag: 'مصفوفات',
        promptUnitsTag: 'وحدات',
        promptAlgebraText: 'حل المعادلة x^2 - 5x + 6 = 0',
        promptCalculusText: 'اشتق x^3 * sin(x)',
        promptMatrixText: 'محدد المصفوفة [[3, 2], [1, 4]]',
        promptUnitsText: 'حول 5 كيلومتر إلى متر',
        localMetaLabel: 'حل فوري',
        aiMetaLabel: 'المستشار الرياضي',
        copy: 'نسخ',
        favorite: 'تفضيل',
        favorited: 'مفضلة',
        deepExplain: 'شرح أعمق',
        shareCard: 'بطاقة',
        mathModalTitle: 'محرر المعادلات',
        photoModalTitle: 'إرفاق صورة',
        drawingModalTitle: 'لوح الرسم',
        authModalTitle: 'تسجيل الدخول',
        savedChatsModalTitle: 'المحادثات المحفوظة',
        settingsModalTitle: 'الملف الشخصي والإعدادات',
        solvedHistoryTitle: 'سجل المسائل',
        saveProfileBtn: 'حفظ الملف الشخصي',
        continueGuestBtn: 'متابعة كضيف',
        confirmImageBtn: 'تأكيد الإرفاق',
        processDrawingBtn: 'تأكيد الرسم',
        stageLabels: {
            elementary: 'ابتدائي',
            preparatory: 'إعدادي',
            secondary: 'ثانوي',
            higher_ed: 'جامعي / عالي',
            general: 'عام'
        },
        goalLabels: {
            concept_mastery: 'إتقان المفاهيم',
            exam_prep: 'الاستعداد للامتحانات',
            homework: 'حل الواجبات',
            competition: 'الأولمبياد والمسابقات'
        },
        explainLabels: {
            quick: 'سريع',
            detailed: 'تفصيلي'
        }
    },
    en: {
        dir: 'ltr',
        dateLocale: 'en-US',
        appTitle: 'Math Advisor',
        statusOnline: 'Online',
        statusOffline: 'Offline',
        offlineBanner: 'You are offline — Local solver remains active for math calculations',
        openMenu: 'Open Menu',
        close: 'Close',
        cancel: 'Cancel',
        toggleTheme: 'Toggle Theme',
        themeLight: 'Light Mode',
        themeDark: 'Dark Mode',
        accountTitle: 'Account & Settings',
        defaultStudent: 'Math Student',
        authVerified: 'Verified ✓',
        guestMode: 'Guest Mode',
        newChat: 'New',
        history: 'History',
        export: 'Export',
        savedChats: 'Chats',
        noSavedChats: 'No saved chats yet',
        noSavedChatsCloud: 'No saved chats found',
        loadingChats: 'Loading...',
        errorLoadingChats: 'Failed to load chats',
        localChatTitle: 'Local chat',
        untitledChat: 'Untitled',
        chatActions: 'Chat options',
        pinChat: 'Pin',
        unpinChat: 'Unpin',
        renameChat: 'Rename',
        deleteChat: 'Delete',
        lessons: 'Lessons',
        lessonDefaultTitle: 'Lesson',
        teacherName: 'Prof. Muhammed Cemal Nime',
        directContact: 'Direct Contact',
        whatsapp: 'WhatsApp',
        facebook: 'Facebook',
        telegram: 'Telegram',
        editorPlaceholder: 'Type your math problem or paste an equation...',
        send: 'Send',
        voiceInput: 'Voice input',
        insertEquation: 'Insert equation',
        toolsTitle: 'Tools & Workspaces',
        toolCamera: 'Camera',
        toolFile: 'File',
        toolDrawing: 'Draw',
        toolCalculus: 'Calculus',
        toolStatistics: 'Stats',
        toolAlgebra: 'Algebra',
        toolGeometry: 'Geometry',
        toolMatrix: 'Matrices',
        toolExam: 'Exams',
        toolCalculator: 'Calc',
        toolUnits: 'Units',
        installTitle: 'Install App',
        installDesc: 'Fast launch & offline math solving',
        installBtn: 'Install',
        updateAvailable: 'A new update is available',
        updateBtn: 'Update now',
        librarySearchPlaceholder: 'Search lessons...',
        librarySearchLabel: 'Search math lessons',
        libraryFavsTitle: 'Show favorite lessons',
        libraryExpandAll: 'Expand all',
        libraryCollapseAll: 'Collapse all',
        noFavLessons: 'No favorite lessons yet. Tap ☆ next to any lesson to save it.',
        noMatchingLessons: 'No matching lessons found.',
        addFav: 'Add to favorites',
        removeFav: 'Remove from favorites',
        welcomeHeading: 'Math Advisor',
        welcomeSubtitle: 'Step-by-step solutions across Algebra, Calculus, Geometry & Matrices',
        promptAlgebraTag: 'Algebra',
        promptCalculusTag: 'Calculus',
        promptMatrixTag: 'Matrices',
        promptUnitsTag: 'Units',
        promptAlgebraText: 'Solve x^2 - 5x + 6 = 0',
        promptCalculusText: 'Differentiate x^3 * sin(x)',
        promptMatrixText: 'Determinant of [[3, 2], [1, 4]]',
        promptUnitsText: 'Convert 5 km to m',
        localMetaLabel: 'Instant Local Solver',
        aiMetaLabel: 'Math Advisor',
        copy: 'Copy',
        favorite: 'Save',
        favorited: 'Saved',
        deepExplain: 'Deep Explain',
        shareCard: 'Card',
        mathModalTitle: 'Equation Editor',
        photoModalTitle: 'Attach Image',
        drawingModalTitle: 'Drawing Pad',
        authModalTitle: 'Sign In',
        savedChatsModalTitle: 'Saved Chats',
        settingsModalTitle: 'Profile & Settings',
        solvedHistoryTitle: 'Solved Problems',
        saveProfileBtn: 'Save Profile',
        continueGuestBtn: 'Continue as Guest',
        confirmImageBtn: 'Attach Image',
        processDrawingBtn: 'Confirm Drawing',
        stageLabels: {
            elementary: 'Elementary',
            preparatory: 'Middle School',
            secondary: 'High School',
            higher_ed: 'University',
            general: 'General'
        },
        goalLabels: {
            concept_mastery: 'Concept Mastery',
            exam_prep: 'Exam Preparation',
            homework: 'Homework Help',
            competition: 'Math Competitions'
        },
        explainLabels: {
            quick: 'Quick',
            detailed: 'Detailed'
        }
    },
    tr: {
        dir: 'ltr',
        dateLocale: 'tr-TR',
        appTitle: 'Matematik Danışmanı',
        statusOnline: 'Çevrimiçi',
        statusOffline: 'Çevrimdışı',
        offlineBanner: 'Çevrimdışısınız — Yerel matematik çözücü aktif kalmaya devam ediyor',
        openMenu: 'Menüyü Aç',
        close: 'Kapat',
        cancel: 'İptal',
        toggleTheme: 'Tema Değiştir',
        themeLight: 'Açık Tema',
        themeDark: 'Koyu Tema',
        accountTitle: 'Hesap ve Ayarlar',
        defaultStudent: 'Matematik Öğrencisi',
        authVerified: 'Doğrulandı ✓',
        guestMode: 'Misafir Modu',
        newChat: 'Yeni',
        history: 'Geçmiş',
        export: 'Dışa Aktar',
        savedChats: 'Sohbetler',
        noSavedChats: 'Henüz kayıtlı sohbet yok',
        noSavedChatsCloud: 'Kayıtlı sohbet bulunamadı',
        loadingChats: 'Yükleniyor...',
        errorLoadingChats: 'Sohbetler yüklenemedi',
        localChatTitle: 'Yerel sohbet',
        untitledChat: 'Başlıksız',
        chatActions: 'Sohbet seçenekleri',
        pinChat: 'Sabitle',
        unpinChat: 'Sabitlemeyi Kaldır',
        renameChat: 'Yeniden Adlandır',
        deleteChat: 'Sil',
        lessons: 'Dersler',
        lessonDefaultTitle: 'Ders',
        teacherName: 'Öğr. Gör. Muhammed Cemal Nime',
        directContact: 'Doğrudan İletişim',
        whatsapp: 'WhatsApp',
        facebook: 'Facebook',
        telegram: 'Telegram',
        editorPlaceholder: 'Matematik sorunuzu yazın veya denklem yapıştırın...',
        send: 'Gönder',
        voiceInput: 'Sesli giriş',
        insertEquation: 'Denklem ekle',
        toolsTitle: 'Araçlar ve Atölyeler',
        toolCamera: 'Kamera',
        toolFile: 'Dosya',
        toolDrawing: 'Çizim',
        toolCalculus: 'Kalkülüs',
        toolStatistics: 'İstatistik',
        toolAlgebra: 'Cebir',
        toolGeometry: 'Geometri',
        toolMatrix: 'Matrisler',
        toolExam: 'Sınavlar',
        toolCalculator: 'Hesap Mak.',
        toolUnits: 'Birimler',
        installTitle: 'Uygulamayı Yükle',
        installDesc: 'Hızlı erişim ve çevrimdışı çözüm desteği',
        installBtn: 'Yükle',
        updateAvailable: 'Yeni bir güncelleme mevcut',
        updateBtn: 'Şimdi Güncelle',
        librarySearchPlaceholder: 'Derslerde ara...',
        librarySearchLabel: 'Matematik derslerinde ara',
        libraryFavsTitle: 'Favori dersleri göster',
        libraryExpandAll: 'Tümünü Aç',
        libraryCollapseAll: 'Tümünü Kapat',
        noFavLessons: 'Henüz favori ders yok. Eklemek için dersin yanındaki ☆ simgesine dokunun.',
        noMatchingLessons: 'Aramanızla eşleşen ders bulunamadı.',
        addFav: 'Favorilere ekle',
        removeFav: 'Favorilerden çıkar',
        welcomeHeading: 'Matematik Danışmanı',
        welcomeSubtitle: 'Cebir, Kalkülüs, Geometri ve Matrislerde adım adım çözümler',
        promptAlgebraTag: 'Cebir',
        promptCalculusTag: 'Kalkülüs',
        promptMatrixTag: 'Matris',
        promptUnitsTag: 'Birim',
        promptAlgebraText: 'Solve x^2 - 5x + 6 = 0',
        promptCalculusText: 'Differentiate x^3 * sin(x)',
        promptMatrixText: 'Determinant of [[3, 2], [1, 4]]',
        promptUnitsText: 'Convert 5 km to m',
        localMetaLabel: 'Anlık Yerel Çözücü',
        aiMetaLabel: 'Matematik Danışmanı',
        copy: 'Kopyala',
        favorite: 'Kaydet',
        favorited: 'Kaydedildi',
        deepExplain: 'Detaylı Anlat',
        shareCard: 'Kart',
        mathModalTitle: 'Denklem Düzenleyici',
        photoModalTitle: 'Görsel Ekle',
        drawingModalTitle: 'Çizim Tahtası',
        authModalTitle: 'Giriş Yap',
        savedChatsModalTitle: 'Kayıtlı Sohbetler',
        settingsModalTitle: 'Profil ve Ayarlar',
        solvedHistoryTitle: 'Çözülen Sorular',
        saveProfileBtn: 'Profili Kaydet',
        continueGuestBtn: 'Misafir Olarak Devam Et',
        confirmImageBtn: 'Görseli Ekle',
        processDrawingBtn: 'Çizimi Onayla',
        stageLabels: {
            elementary: 'İlkokul',
            preparatory: 'Ortaokul',
            secondary: 'Lise',
            higher_ed: 'Üniversite',
            general: 'Genel'
        },
        goalLabels: {
            concept_mastery: 'Kavram Uzmanlığı',
            exam_prep: 'Sınav Hazırlığı',
            homework: 'Ödev Yardımı',
            competition: 'Matematik Olimpiyatları'
        },
        explainLabels: {
            quick: 'Hızlı',
            detailed: 'Detaylı'
        }
    }
};

export const getAppLanguage = () => {
    try {
        const lang = localStorage.getItem('app_language') || 'ar';
        return I18N_DICTIONARY[lang] ? lang : 'ar';
    } catch {
        return 'ar';
    }
};

export const getLocaleDict = (lang = getAppLanguage()) => {
    return I18N_DICTIONARY[lang] || I18N_DICTIONARY.ar;
};

export const t = (key, lang = getAppLanguage()) => {
    const dict = getLocaleDict(lang);
    return dict[key] ?? I18N_DICTIONARY.ar[key] ?? key;
};

const setText = (selector, text) => {
    const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (el && typeof text === 'string') el.textContent = text;
};

const setAttr = (selector, attr, value) => {
    const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (el && typeof value === 'string') el.setAttribute(attr, value);
};

export const applyLanguage = (requestedLang = getAppLanguage()) => {
    const lang = I18N_DICTIONARY[requestedLang] ? requestedLang : 'ar';
    const dict = getLocaleDict(lang);

    if (typeof document === 'undefined') return lang;

    document.documentElement.lang = lang;
    document.documentElement.dir = dict.dir;
    document.body.setAttribute('dir', dict.dir);
    document.title = dict.appTitle;

    // Header
    setText('.chat-header h1', dict.appTitle);
    setAttr('#openSidebarBtn', 'aria-label', dict.openMenu);
    setAttr('#openSidebarBtn', 'title', dict.openMenu);
    setAttr('#darkModeToggle', 'aria-label', dict.toggleTheme);
    setAttr('#darkModeToggle', 'title', dict.toggleTheme);

    const statusBadge = document.getElementById('connectionStatusBadge');
    const statusText = document.getElementById('connectionStatusText');
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine !== false : true;
    if (statusBadge) {
        statusBadge.classList.toggle('is-offline', !isOnline);
        statusBadge.classList.toggle('is-online', isOnline);
    }
    if (statusText) {
        statusText.textContent = isOnline ? dict.statusOnline : dict.statusOffline;
    }

    // Sidebar
    setAttr('#accountButton', 'aria-label', dict.accountTitle);
    setAttr('#closeSidebarBtn', 'aria-label', dict.close);
    setText('#startNewChatBtn span', dict.newChat);
    setText('#sidebarSolvedHistoryBtn span', dict.history);
    setText('#toggleExportDropdownBtn span', dict.export);
    setText('#toggleSavedChatsBtn .sidebar-nav-label', dict.savedChats);
    setText('#saved-chats-content .sidebar-empty-hint', dict.noSavedChats);
    setText('#toggleLibraryBtn .sidebar-nav-label', dict.lessons);
    setText('#showContactBtn .sidebar-nav-label', dict.teacherName);
    setText('.contact-menu-header span', dict.directContact);
    setText('#hideContactMenuBtn', dict.close);
    setText('.contact-channel-link.is-whatsapp span', dict.whatsapp);
    setText('.contact-channel-link.is-facebook span', dict.facebook);
    setText('.contact-channel-link.is-telegram span', dict.telegram);

    // Library controls if rendered
    const searchInput = document.getElementById('librarySearchInput');
    if (searchInput) {
        searchInput.placeholder = dict.librarySearchPlaceholder;
        searchInput.setAttribute('aria-label', dict.librarySearchLabel);
    }
    const favBtn = document.getElementById('libraryShowFavs');
    if (favBtn) {
        favBtn.title = dict.libraryFavsTitle;
        favBtn.setAttribute('aria-label', dict.libraryFavsTitle);
    }
    const openAllBtn = document.getElementById('libraryOpenAll');
    if (openAllBtn) {
        const isExpanded = window.MathApp?.Library?.areAllExpanded;
        openAllBtn.textContent = isExpanded ? dict.libraryCollapseAll : dict.libraryExpandAll;
    }

    // Composer & Bottom Nav
    setAttr('#editor', 'data-placeholder', dict.editorPlaceholder);
    setAttr('#sendMessageBtn', 'aria-label', dict.send);
    setAttr('#sendMessageBtn', 'title', dict.send);
    setAttr('#recordBtn', 'aria-label', dict.voiceInput);
    setAttr('#recordBtn', 'title', dict.voiceInput);
    setAttr('#plusBtn', 'aria-label', dict.toolsTitle);
    setAttr('#plusBtn', 'title', dict.toolsTitle);
    setAttr('#openMathModalBtn', 'aria-label', dict.insertEquation);
    setAttr('#openMathModalBtn', 'title', dict.insertEquation);

    setText('.bottom-nav-title', dict.toolsTitle);
    setAttr('#closeBottomNavBtn', 'aria-label', dict.close);
    const toolMap = {
        'open-camera': dict.toolCamera,
        'open-file': dict.toolFile,
        'open-drawing': dict.toolDrawing,
        'calculus-workspace': dict.toolCalculus,
        'statistics-workspace': dict.toolStatistics,
        'algebra-workspace': dict.toolAlgebra,
        'geometry-workspace': dict.toolGeometry,
        'matrix-workspace': dict.toolMatrix,
        'exam-builder': dict.toolExam,
        'open-calculator': dict.toolCalculator,
        'unit-converter': dict.toolUnits
    };
    Object.entries(toolMap).forEach(([tool, label]) => {
        setText(`.bottom-nav-btn[data-tool="${tool}"] .btn-label`, label);
    });

    // Core Modals Chrome
    setText('#mathModal .modal-header-title h3', dict.mathModalTitle);
    setText('#cancelMathModalBtn', dict.cancel);
    setText('#photoModal .modal-header-title h3', dict.photoModalTitle);
    setText('#cancelPhotoModalBtn', dict.cancel);
    setText('#confirmImageBtn', dict.confirmImageBtn);
    setText('#drawingModal .modal-header-title h3', dict.drawingModalTitle);
    setText('#cancelDrawingBtn', dict.cancel);
    setText('#processDrawingBtn', dict.processDrawingBtn);
    setText('#authModalTitle', dict.authModalTitle);
    setText('#cancelAuthModalBtn', dict.continueGuestBtn);
    setText('#savedChatsModal .modal-header-title h3', dict.savedChatsModalTitle);
    setText('#settingsModal .modal-header-title h3', dict.settingsModalTitle);
    setText('#closeSettingsModalBtn', dict.close);
    setText('#saveSettingsBtn', dict.saveProfileBtn);
    setText('#solvedHistoryModal .modal-header-title h3', dict.solvedHistoryTitle);

    // Welcome Screen Card (if visible)
    const welcomeCard = document.querySelector('[data-source-kind="welcome"] .welcome-card');
    if (welcomeCard) {
        setText(welcomeCard.querySelector('.welcome-pill-badge span:last-child'), dict.welcomeHeading);
        setText(welcomeCard.querySelector('.welcome-subtitle'), dict.welcomeSubtitle);
        const promptUpdates = [
            ['algebra', dict.promptAlgebraTag, dict.promptAlgebraText],
            ['calculus', dict.promptCalculusTag, dict.promptCalculusText],
            ['matrix', dict.promptMatrixTag, dict.promptMatrixText],
            ['units', dict.promptUnitsTag, dict.promptUnitsText]
        ];
        promptUpdates.forEach(([cat, tagLabel, promptText]) => {
            const btn = welcomeCard.querySelector(`.quick-prompt-btn[data-category="${cat}"]`);
            if (!btn) return;
            btn.setAttribute('data-prompt', promptText);
            setText(btn.querySelector('.qp-tag'), tagLabel);
        });
    }

    // Existing Message Bubbles Direction & Action Labels
    const isLtr = dict.dir === 'ltr';
    document.querySelectorAll('.message-bubble.outgoing').forEach((bubble) => {
        bubble.setAttribute('dir', dict.dir);
        bubble.classList.toggle('ltr', isLtr);
        const sourceKind = bubble.dataset.sourceKind || '';
        const metaLine = bubble.querySelector('.response-meta-line');
        if (metaLine && sourceKind !== 'welcome' && sourceKind !== 'system') {
            metaLine.textContent = sourceKind === 'local' ? dict.localMetaLabel : dict.aiMetaLabel;
        }
        setText(bubble.querySelector('.copy-msg-btn span'), dict.copy);
        setText(bubble.querySelector('.open-history-btn span'), dict.history);
        setText(bubble.querySelector('.deep-explain-btn span'), dict.deepExplain);
        setText(bubble.querySelector('.share-btn span'), dict.shareCard);
        const favToggle = bubble.querySelector('.favorite-problem-btn span');
        if (favToggle) {
            const isFav = bubble.dataset.isFavorite === 'true';
            favToggle.textContent = isFav ? dict.favorited : dict.favorite;
        }
    });

    // Banners
    setText('.pwa-install-title', dict.installTitle);
    setText('.pwa-install-desc', dict.installDesc);
    setText('#pwaInstallBtn', dict.installBtn);
    setAttr('#pwaCloseBanner', 'aria-label', dict.close);
    setText('#updateBannerText', dict.updateAvailable);
    setText('#updateBtn', dict.updateBtn);
    setAttr('#updateCloseBtn', 'aria-label', dict.close);
    setText('#offlineBannerText', dict.offlineBanner);

    try {
        window.dispatchEvent(new CustomEvent('mathaiLangChanged', { detail: { lang, dir: dict.dir } }));
    } catch {
        /* ignore */
    }

    return lang;
};
