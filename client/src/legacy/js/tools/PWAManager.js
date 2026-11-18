// ==================== PWA MANAGER ====================
import { getLocaleDict } from '../utils/i18n.js';

const PWA_DISMISS_STORAGE_KEY = 'pwa_install_dismissed_v1';
const PWA_DISMISS_TTL_MS = 14 * 24 * 60 * 60 * 1000;

export const PWAManager = {
    deferredPrompt: null,
    swRegistration: null,
    _lastOnlineState: null,

    async init() {
        if (this.isServiceWorkerDisabled()) {
            await this.unregisterServiceWorkers();
            this.monitorConnection();
            this.handleShortcuts();
            return;
        }

        await this.registerServiceWorker();
        this.monitorConnection();
        this.setupInstallPrompt();
        this.checkForUpdates();
        this.handleShortcuts();
    },

    async registerServiceWorker() {
        if (!('serviceWorker' in navigator)) return;

        try {
            this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            });

            this.swRegistration.addEventListener('updatefound', () => {
                const newWorker = this.swRegistration.installing;
                if (!newWorker) return;

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        this.showUpdateNotification();
                    }
                });
            });
        } catch (error) {
            console.error('❌ Service Worker registration failed:', error);
        }
    },

    isServiceWorkerDisabled() {
        return !!(window.MathApp && window.MathApp.config && window.MathApp.config.enableServiceWorker === false);
    },

    async unregisterServiceWorkers() {
        if (!('serviceWorker' in navigator)) return;
        try {
            const registrations = await navigator.serviceWorker.getRegistrations();
            await Promise.all(registrations.map((registration) => registration.unregister()));
        } catch (error) {
            console.warn('⚠️ Failed to unregister Service Workers:', error);
        }
    },

    monitorConnection() {
        const updateOnlineStatus = (showToastOnChange = true) => {
            const isOnline = typeof navigator !== 'undefined' ? navigator.onLine !== false : true;
            const dict = getLocaleDict();

            const offlineIndicator = document.getElementById('offlineIndicator');
            const offlineBannerText = document.getElementById('offlineBannerText');
            if (offlineIndicator) {
                offlineIndicator.style.display = isOnline ? 'none' : 'flex';
            }
            if (offlineBannerText) {
                offlineBannerText.textContent = dict.offlineBanner;
            }

            const statusBadge = document.getElementById('connectionStatusBadge');
            const statusText = document.getElementById('connectionStatusText');
            if (statusBadge) {
                statusBadge.classList.toggle('is-offline', !isOnline);
                statusBadge.classList.toggle('is-online', isOnline);
            }
            if (statusText) {
                statusText.textContent = isOnline ? dict.statusOnline : dict.statusOffline;
            }

            if (showToastOnChange && this._lastOnlineState !== null && this._lastOnlineState !== isOnline) {
                if (isOnline) {
                    window.MathApp?.ui?.showToast?.(dict.statusOnline, false);
                } else {
                    window.MathApp?.ui?.showToast?.(dict.statusOffline, 'error');
                }
            }
            this._lastOnlineState = isOnline;
        };

        window.addEventListener('online', () => updateOnlineStatus(true));
        window.addEventListener('offline', () => updateOnlineStatus(true));
        window.addEventListener('mathaiLangChanged', () => updateOnlineStatus(false));

        updateOnlineStatus(false);
    },

    isDismissedRecently() {
        try {
            const raw = localStorage.getItem(PWA_DISMISS_STORAGE_KEY);
            if (!raw) return false;
            const ts = parseInt(raw, 10);
            if (!Number.isFinite(ts)) return false;
            return (Date.now() - ts) < PWA_DISMISS_TTL_MS;
        } catch {
            return false;
        }
    },

    persistDismissed() {
        try {
            localStorage.setItem(PWA_DISMISS_STORAGE_KEY, String(Date.now()));
        } catch {
            /* ignore */
        }
    },

    isInIframe() {
        try {
            return window.self !== window.top;
        } catch {
            return true;
        }
    },

    setupInstallPrompt() {
        const installBanner = document.getElementById('pwaInstallBanner');
        const installBtn = document.getElementById('pwaInstallBtn');
        const closeBanner = document.getElementById('pwaCloseBanner');

        if (!installBanner || !installBtn || !closeBanner) return;

        const isIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);

        const showBanner = () => {
            if (this.isStandalone() || this.isDismissedRecently()) return;
            if (!this.deferredPrompt && (!isIOS || this.isInIframe())) return;
            installBanner.style.display = 'block';
        };

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;

            if (!this.isDismissedRecently() && !this.isStandalone()) {
                setTimeout(() => {
                    showBanner();
                }, 4000);
            }
        });

        // iOS Safari standalone install prompt (outside iframe)
        if (isIOS && !this.isStandalone() && !this.isDismissedRecently() && !this.isInIframe()) {
            setTimeout(() => {
                showBanner();
            }, 5000);
        }

        if (installBtn.dataset.bound !== 'true') {
            installBtn.dataset.bound = 'true';
            installBtn.addEventListener('click', async () => {
                if (!this.deferredPrompt) {
                    if (isIOS) {
                        window.MathApp?.ui?.showToast?.('على iOS: اضغط مشاركة ثم "إضافة إلى الشاشة الرئيسية"', false);
                    } else {
                        window.MathApp?.ui?.showToast?.('افتح قائمة المتصفح ثم اختر "تثبيت التطبيق"', false);
                    }
                    return;
                }

                this.deferredPrompt.prompt();
                const { outcome } = await this.deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    window.MathApp?.ui?.showToast?.('🎉 شكراً لتثبيت التطبيق!', false);
                } else {
                    this.persistDismissed();
                }

                this.deferredPrompt = null;
                installBanner.style.display = 'none';
            });
        }

        if (closeBanner.dataset.bound !== 'true') {
            closeBanner.dataset.bound = 'true';
            closeBanner.addEventListener('click', () => {
                installBanner.style.display = 'none';
                this.persistDismissed();
            });
        }

        window.addEventListener('appinstalled', () => {
            window.MathApp?.ui?.showToast?.('✅ تم تثبيت التطبيق بنجاح!', false);
            installBanner.style.display = 'none';
        });
    },

    showUpdateNotification() {
        const updateNotif = document.getElementById('updateNotification');
        const updateBtn = document.getElementById('updateBtn');
        const updateCloseBtn = document.getElementById('updateCloseBtn');

        if (!updateNotif || !updateBtn) return;

        updateNotif.style.display = 'block';

        if (updateBtn.dataset.bound !== 'true') {
            updateBtn.dataset.bound = 'true';
            updateBtn.addEventListener('click', () => {
                if (this.swRegistration && this.swRegistration.waiting) {
                    this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });

                    navigator.serviceWorker.addEventListener('controllerchange', () => {
                        window.location.reload();
                    });
                } else {
                    window.location.reload();
                }
            });
        }

        if (updateCloseBtn && updateCloseBtn.dataset.bound !== 'true') {
            updateCloseBtn.dataset.bound = 'true';
            updateCloseBtn.addEventListener('click', () => {
                updateNotif.style.display = 'none';
            });
        }
    },

    checkForUpdates() {
        if (!this.swRegistration) return;

        setInterval(() => {
            this.swRegistration.update();
        }, 60 * 60 * 1000);

        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.swRegistration.update();
            }
        });
    },

    handleShortcuts() {
        const urlParams = new URLSearchParams(window.location.search);
        const action = urlParams.get('action');

        switch (action) {
            case 'new-chat':
                window.MathApp?.chat?.startNew?.();
                break;
            case 'library':
                window.MathApp?.Library?.toggleLibrary?.();
                break;
            case 'saved-chats':
                window.MathApp?.data?.loadSavedChats?.();
                break;
        }
    },

    isStandalone() {
        return window.matchMedia('(display-mode: standalone)').matches ||
               window.navigator.standalone ||
               document.referrer.includes('android-app://');
    }
};
