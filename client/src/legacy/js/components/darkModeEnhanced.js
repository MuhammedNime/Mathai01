// ==================== ENHANCED DARK MODE TRANSITIONS ====================

/**
 * Default theme is Dark Navy; Light mode is toggled via body.light-mode.
 */
export const enhancedDarkMode = {
    init() {
        this.applyStoredTheme();
    },

    toggleWithAnimation() {
        document.body.classList.add('theme-switching');
        window.MathApp?.ui?.theme?.toggle?.();
        setTimeout(() => {
            document.body.classList.remove('theme-switching');
        }, 320);
    },

    applyStoredTheme() {
        let savedTheme = 'dark';
        try {
            savedTheme = localStorage.getItem('theme') || 'dark';
        } catch {
            savedTheme = 'dark';
        }
        const isLight = savedTheme === 'light';
        document.body.classList.toggle('light-mode', isLight);
        document.body.classList.toggle('dark-mode', !isLight);
    },

    addGlowEffect() {
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (!darkModeToggle) return;

        darkModeToggle.addEventListener('mouseenter', (e) => {
            const isLight = document.body.classList.contains('light-mode');
            const color = isLight ? 'rgba(37, 99, 235, 0.22)' : 'rgba(59, 130, 246, 0.35)';
            e.currentTarget.style.boxShadow = `0 0 14px ${color}`;
        });

        darkModeToggle.addEventListener('mouseleave', (e) => {
            e.currentTarget.style.boxShadow = '';
        });
    }
};

export default enhancedDarkMode;
