// ==================== LIBRARY MODULE ====================
import { libraryData } from '../data/libraryData.js';
import { escapeHtmlAttr, stripHtmlToPlainText } from '../utils/htmlSanitizer.js';
import { getLocaleDict } from '../utils/i18n.js';

const LIBRARY_FAVS_KEY = 'math_library_favorites_v1';

const normalizeSearchText = (value) => String(value || '')
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .trim();

export const Library = {
    isLibraryOpen: false,
    showFavsOnly: false,
    areAllExpanded: false,
    _favoritesSet: null,
    _lessonIndex: [],

    loadFavorites() {
        if (this._favoritesSet) return this._favoritesSet;
        try {
            const raw = JSON.parse(localStorage.getItem(LIBRARY_FAVS_KEY) || '[]');
            this._favoritesSet = new Set(Array.isArray(raw) ? raw : []);
        } catch {
            this._favoritesSet = new Set();
        }
        return this._favoritesSet;
    },

    saveFavorites() {
        try {
            const list = Array.from(this.loadFavorites());
            localStorage.setItem(LIBRARY_FAVS_KEY, JSON.stringify(list));
        } catch {
            /* ignore storage quota */
        }
    },

    getLessonKey(topicName, levelName, lessonTitle) {
        return `${topicName || ''}::${levelName || ''}::${lessonTitle || ''}`;
    },

    toggleFavorite(key, buttonEl) {
        const favs = this.loadFavorites();
        if (favs.has(key)) {
            favs.delete(key);
        } else {
            favs.add(key);
        }
        this.saveFavorites();

        // Sync all star buttons matching this lesson key
        document.querySelectorAll('.lesson-fav-toggle[data-lesson-key]').forEach((btn) => {
            const isFav = favs.has(btn.getAttribute('data-lesson-key') || '');
            btn.classList.toggle('is-fav', isFav);
            btn.textContent = isFav ? '★' : '☆';
            btn.setAttribute('aria-pressed', isFav ? 'true' : 'false');
        });

        if (buttonEl) {
            const isFav = favs.has(key);
            window.MathApp?.ui?.showToast?.(isFav ? 'تمت إضافة الدرس إلى المفضلة' : 'تمت إزالة الدرس من المفضلة');
        }

        if (this.showFavsOnly) {
            this.updateFilteredResults();
        }
    },

    // تهيئة المكتبة
    async init() {
        this.loadFavorites();
        await this.renderLibraryContent();
        if (!this._langListenerBound) {
            this._langListenerBound = true;
            window.addEventListener('mathaiLangChanged', () => {
                const dict = getLocaleDict();
                document.querySelectorAll('.lesson-fav-toggle').forEach((btn) => {
                    const isFav = btn.classList.contains('is-fav');
                    btn.setAttribute('aria-label', isFav ? dict.removeFav : dict.addFav);
                });
                this.updateFilteredResults();
            });
        }
    },

    // فتح/إغلاق المكتبة الرئيسية
    toggleLibrary() {
        const content = document.getElementById('library-content');
        const icon = document.getElementById('library-main-icon');
        const header = document.getElementById('toggleLibraryBtn');

        if (!content || !icon) return;

        this.isLibraryOpen = !this.isLibraryOpen;

        if (this.isLibraryOpen) {
            content.classList.add('open');
            icon.classList.add('is-open');
            if (header) header.classList.add('is-open');
        } else {
            content.classList.remove('open');
            icon.classList.remove('is-open');
            if (header) header.classList.remove('is-open');
            this.closeAllTopics();
        }
    },

    // إغلاق جميع المواضيع
    closeAllTopics() {
        this.areAllExpanded = false;
        const dict = getLocaleDict();
        const openAllBtn = document.getElementById('libraryOpenAll');
        if (openAllBtn) {
            openAllBtn.textContent = dict.libraryExpandAll;
            openAllBtn.classList.remove('active');
        }

        document.querySelectorAll('.lesson-list, #library-content .accordion-content').forEach((list) => {
            list.style.maxHeight = null;
            if (list.previousElementSibling) {
                list.previousElementSibling.classList.remove('active', 'active-header');
                const icon = list.previousElementSibling.querySelector('.icon');
                if (icon) icon.classList.remove('rotate-90');
            }
        });
    },

    expandAllTopics() {
        this.areAllExpanded = true;
        const dict = getLocaleDict();
        const openAllBtn = document.getElementById('libraryOpenAll');
        if (openAllBtn) {
            openAllBtn.textContent = dict.libraryCollapseAll;
            openAllBtn.classList.add('active');
        }

        // First expand inner level accordions, then outer topic accordions
        const accordions = Array.from(document.querySelectorAll('#library-content .accordion-content'));
        accordions.reverse().forEach((contentDiv) => {
            contentDiv.style.maxHeight = `${contentDiv.scrollHeight + 1200}px`;
            const header = contentDiv.previousElementSibling;
            if (header) {
                header.classList.add('active-header');
                const icon = header.querySelector('.icon');
                if (icon) icon.classList.add('rotate-90');
            }
        });
    },

    updateFilteredResults() {
        const searchInput = document.getElementById('librarySearchInput');
        const resultsBox = document.getElementById('librarySearchResults');
        const treeWrap = document.getElementById('libraryTreeWrap');
        const favBtn = document.getElementById('libraryShowFavs');
        if (!resultsBox || !treeWrap) return;

        const rawQuery = searchInput ? searchInput.value : '';
        const normQuery = normalizeSearchText(rawQuery);
        const favs = this.loadFavorites();

        if (favBtn) {
            favBtn.classList.toggle('active', this.showFavsOnly);
            favBtn.setAttribute('aria-pressed', this.showFavsOnly ? 'true' : 'false');
        }

        const isFiltering = normQuery.length > 0 || this.showFavsOnly;
        if (!isFiltering) {
            resultsBox.innerHTML = '';
            resultsBox.classList.remove('has-results');
            treeWrap.classList.remove('is-hidden');
            return;
        }

        treeWrap.classList.add('is-hidden');
        resultsBox.classList.add('has-results');

        const matches = this._lessonIndex.filter((entry) => {
            if (this.showFavsOnly && !favs.has(entry.key)) return false;
            if (!normQuery) return true;
            return entry.searchBlob.includes(normQuery);
        });

        const dict = getLocaleDict();
        resultsBox.innerHTML = '';
        if (matches.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'library-empty-state';
            empty.textContent = this.showFavsOnly && !normQuery
                ? dict.noFavLessons
                : dict.noMatchingLessons;
            resultsBox.appendChild(empty);
            return;
        }

        const list = document.createElement('ul');
        list.className = 'search-results-list';

        matches.slice(0, 60).forEach((entry) => {
            const li = document.createElement('li');
            li.className = 'search-result-item';

            const link = document.createElement('a');
            link.href = '#';
            link.className = 'search-result-link';
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.sendLessonToChat(entry.title, entry.content);
                window.MathApp.ui.closeSidebar();
            });

            const titleDiv = document.createElement('div');
            titleDiv.textContent = entry.title;

            const metaDiv = document.createElement('div');
            metaDiv.className = 'meta';
            metaDiv.textContent = entry.levelName ? `${entry.topicName} • ${entry.levelName}` : entry.topicName;

            link.appendChild(titleDiv);
            link.appendChild(metaDiv);

            const starBtn = document.createElement('button');
            starBtn.type = 'button';
            const isFav = favs.has(entry.key);
            starBtn.className = `lesson-fav-toggle ${isFav ? 'is-fav' : ''}`;
            starBtn.setAttribute('data-lesson-key', entry.key);
            starBtn.setAttribute('aria-label', isFav ? dict.removeFav : dict.addFav);
            starBtn.setAttribute('aria-pressed', isFav ? 'true' : 'false');
            starBtn.textContent = isFav ? '★' : '☆';
            starBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleFavorite(entry.key, starBtn);
            });

            li.appendChild(link);
            li.appendChild(starBtn);
            list.appendChild(li);
        });

        resultsBox.appendChild(list);
    },

    // عرض محتوى المكتبة (المواضيع والدروس)
    async renderLibraryContent() {
        const container = document.getElementById('library-content');
        if (!container) return;

        container.innerHTML = '';
        this._lessonIndex = [];
        const favs = this.loadFavorites();

        // 1. بناء واجهة البحث والتحكم العاملة بالكامل
        const controlsWrap = document.createElement('div');
        controlsWrap.className = 'library-controls';

        const searchWrap = document.createElement('div');
        searchWrap.className = 'library-search-wrap';
        const dict = getLocaleDict();
        const searchInput = document.createElement('input');
        searchInput.type = 'search';
        searchInput.id = 'librarySearchInput';
        searchInput.className = 'library-search-input';
        searchInput.placeholder = dict.librarySearchPlaceholder;
        searchInput.setAttribute('aria-label', dict.librarySearchLabel);
        searchWrap.appendChild(searchInput);

        const favoritesBtn = document.createElement('button');
        favoritesBtn.type = 'button';
        favoritesBtn.id = 'libraryShowFavs';
        favoritesBtn.className = 'library-fav-btn';
        favoritesBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
        favoritesBtn.title = dict.libraryFavsTitle;
        favoritesBtn.setAttribute('aria-label', dict.libraryFavsTitle);
        favoritesBtn.setAttribute('aria-pressed', 'false');

        const openAllBtn = document.createElement('button');
        openAllBtn.type = 'button';
        openAllBtn.id = 'libraryOpenAll';
        openAllBtn.className = 'library-openall-btn';
        openAllBtn.textContent = dict.libraryExpandAll;

        controlsWrap.appendChild(searchWrap);
        controlsWrap.appendChild(favoritesBtn);
        controlsWrap.appendChild(openAllBtn);
        container.appendChild(controlsWrap);

        // حاوية نتائج البحث والمفضلة
        const resultsBox = document.createElement('div');
        resultsBox.id = 'librarySearchResults';
        resultsBox.className = 'library-search-results';
        container.appendChild(resultsBox);

        // حاوية شجرة المواضيع
        const treeWrap = document.createElement('div');
        treeWrap.id = 'libraryTreeWrap';
        treeWrap.className = 'library-tree-wrap';
        container.appendChild(treeWrap);

        // ربط أحداث البحث والمفضلة وفتح/طي الكل
        searchInput.addEventListener('input', () => {
            this.updateFilteredResults();
        });

        favoritesBtn.addEventListener('click', () => {
            this.showFavsOnly = !this.showFavsOnly;
            this.updateFilteredResults();
        });

        openAllBtn.addEventListener('click', () => {
            if (this.showFavsOnly || (searchInput.value && searchInput.value.trim())) {
                this.showFavsOnly = false;
                searchInput.value = '';
                this.updateFilteredResults();
            }
            if (this.areAllExpanded) {
                this.closeAllTopics();
            } else {
                this.expandAllTopics();
            }
        });

        // دالة مساعدة لإنشاء عنصر درس
        const createLessonRow = (lesson, topicName, levelName) => {
            const rowDict = getLocaleDict();
            const cleanTopic = stripHtmlToPlainText(topicName, 90);
            const cleanLevel = stripHtmlToPlainText(levelName, 90);
            const title = stripHtmlToPlainText(lesson.title || rowDict.lessonDefaultTitle, 120) || rowDict.lessonDefaultTitle;
            const key = this.getLessonKey(cleanTopic, cleanLevel, title);
            this._lessonIndex.push({
                key,
                title,
                content: lesson.content || '',
                topicName: cleanTopic,
                levelName: cleanLevel,
                searchBlob: normalizeSearchText(`${cleanTopic} ${cleanLevel} ${title}`)
            });

            const li = document.createElement('div');
            li.className = 'lesson-item';

            const a = document.createElement('a');
            a.href = '#';
            a.textContent = title;
            a.title = title;
            a.onclick = (e) => {
                e.preventDefault();
                this.sendLessonToChat(title, lesson.content);
                window.MathApp.ui.closeSidebar();
            };

            const isFav = favs.has(key);
            const starBtn = document.createElement('button');
            starBtn.type = 'button';
            starBtn.className = `lesson-fav-toggle ${isFav ? 'is-fav' : ''}`;
            starBtn.setAttribute('data-lesson-key', key);
            starBtn.setAttribute('aria-label', isFav ? rowDict.removeFav : rowDict.addFav);
            starBtn.setAttribute('aria-pressed', isFav ? 'true' : 'false');
            starBtn.textContent = isFav ? '★' : '☆';
            starBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleFavorite(key, starBtn);
            });

            li.appendChild(a);
            li.appendChild(starBtn);
            return li;
        };

        const chevronSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>`;

        // دالة مساعدة لفتح/إغلاق القوائم (Accordion Logic)
        const toggleAccordion = (header, contentDiv) => {
            const icon = header.querySelector('.icon');
            const isOpen = contentDiv.style.maxHeight;

            const parent = contentDiv.parentElement;
            parent.querySelectorAll(':scope > .accordion-content').forEach((c) => {
                if (c !== contentDiv) c.style.maxHeight = null;
            });
            parent.querySelectorAll(':scope > .active-header .icon').forEach((i) => {
                if (i !== icon) i.classList.remove('rotate-90');
            });

            if (isOpen) {
                contentDiv.style.maxHeight = null;
                if (icon) icon.classList.remove('rotate-90');
                header.classList.remove('active-header');
            } else {
                contentDiv.style.maxHeight = `${contentDiv.scrollHeight + 500}px`;
                if (icon) icon.classList.add('rotate-90');
                header.classList.add('active-header');

                let ancestor = parent.closest('.accordion-content');
                while (ancestor) {
                    ancestor.style.maxHeight = `${ancestor.scrollHeight + contentDiv.scrollHeight}px`;
                    ancestor = ancestor.parentElement.closest('.accordion-content');
                }
            }
        };

        // --- بناء المحتوى الرئيسي ---
        if (Array.isArray(libraryData) && libraryData.length > 0) {
            libraryData.forEach((topic) => {
                const cleanTopicName = stripHtmlToPlainText(topic.topic || '', 100);
                const topicContainer = document.createElement('div');

                const topicHeader = document.createElement('div');
                topicHeader.className = 'topic-header';
                const topicLabel = document.createElement('span');
                topicLabel.textContent = cleanTopicName;
                const topicChevron = document.createElement('span');
                topicChevron.className = 'icon';
                topicChevron.innerHTML = chevronSvg;
                topicHeader.appendChild(topicLabel);
                topicHeader.appendChild(topicChevron);

                const topicContent = document.createElement('div');
                topicContent.className = 'accordion-content';

                topicHeader.onclick = () => toggleAccordion(topicHeader, topicContent);

                if (topic.levels) {
                    topic.levels.forEach((level) => {
                        const cleanLevelName = stripHtmlToPlainText(level.level || '', 100);
                        const levelContainer = document.createElement('div');

                        const levelHeader = document.createElement('div');
                        levelHeader.className = 'level-header';
                        const levelLabel = document.createElement('span');
                        levelLabel.textContent = cleanLevelName;
                        const levelChevron = document.createElement('span');
                        levelChevron.className = 'icon';
                        levelChevron.innerHTML = chevronSvg;
                        levelHeader.appendChild(levelLabel);
                        levelHeader.appendChild(levelChevron);

                        const levelContent = document.createElement('div');
                        levelContent.className = 'accordion-content';

                        levelHeader.onclick = (e) => {
                            e.stopPropagation();
                            toggleAccordion(levelHeader, levelContent);
                        };

                        (level.chapters || level.lessons || []).forEach((lesson) => {
                            levelContent.appendChild(createLessonRow(lesson, cleanTopicName, cleanLevelName));
                        });

                        levelContainer.appendChild(levelHeader);
                        levelContainer.appendChild(levelContent);
                        topicContent.appendChild(levelContainer);
                    });
                } else if (topic.lessons) {
                    topic.lessons.forEach((lesson) => {
                        topicContent.appendChild(createLessonRow(lesson, cleanTopicName, ''));
                    });
                }

                topicContainer.appendChild(topicHeader);
                topicContainer.appendChild(topicContent);
                treeWrap.appendChild(topicContainer);
            });
        }
    },

    // فتح/إغلاق موضوع معين
    toggleTopic(element) {
        const lessonList = element.nextElementSibling;
        const icon = element.querySelector('.icon');

        document.querySelectorAll('.lesson-list').forEach((list) => {
            if (list !== lessonList && list.style.maxHeight) {
                list.style.maxHeight = null;
                list.previousElementSibling.classList.remove('active');
                const otherIcon = list.previousElementSibling.querySelector('.icon');
                if (otherIcon) otherIcon.classList.remove('rotate-90');
            }
        });

        element.classList.toggle('active');

        if (lessonList.style.maxHeight) {
            lessonList.style.maxHeight = null;
            if (icon) icon.classList.remove('rotate-90');
        } else {
            lessonList.style.maxHeight = `${lessonList.scrollHeight}px`;
            if (icon) icon.classList.add('rotate-90');
        }
    },

    // إرسال درس مُبني من فهرس الإنترنت (index) إلى الدردشة
    async sendLessonFromIndex(item) {
        try {
            if (!item || !item.sourceFile) {
                this.sendLessonToChat(item.titleAr || item.titleEn || 'درس', item.excerpt || '');
                return;
            }

            const moduleUrl = '/' + item.sourceFile;
            const mod = await import(moduleUrl);

            let found = null;
            for (const key of Object.keys(mod)) {
                const value = mod[key];
                if (!Array.isArray(value)) continue;
                for (const topic of value) {
                    if (Array.isArray(topic.lessons)) {
                        for (const lesson of topic.lessons) {
                            if (lesson.id === item.id || lesson.title === item.titleAr || (lesson.title && lesson.title.ar === item.titleAr)) { found = lesson; break; }
                        }
                    }
                    if (!found && Array.isArray(topic.levels)) {
                        for (const level of topic.levels) {
                            const chapters = Array.isArray(level.chapters) ? level.chapters : [];
                            for (const ch of chapters) {
                                if (ch.id === item.id || ch.title === item.titleAr || (ch.title && ch.title.ar === item.titleAr)) { found = ch; break; }
                            }
                            if (found) break;
                        }
                    }
                    if (!found && Array.isArray(topic.chapters)) {
                        for (const ch of topic.chapters) {
                            if (ch.id === item.id || ch.title === item.titleAr || (ch.title && ch.title.ar === item.titleAr)) { found = ch; break; }
                        }
                    }
                    if (found) break;
                }
                if (found) break;
            }

            if (found) {
                const content = (found.content && (found.content.html || found.content)) || found.content || found;
                const title = (found.title && (found.title.ar || found.title)) || found.title || item.titleAr || 'درس';
                this.sendLessonToChat(title, content || item.excerpt || '');
            } else {
                this.sendLessonToChat(item.titleAr || item.titleEn || 'درس', item.excerpt || '');
            }
        } catch (e) {
            console.warn('Failed to load lesson from source', e);
            this.sendLessonToChat(item.titleAr || item.titleEn || 'درس', item.excerpt || '');
        }
    },

    // إرسال الدرس إلى الدردشة
    sendLessonToChat(title, content) {
        const cleanTitle = stripHtmlToPlainText(title || 'درس', 140) || 'درس';
        const formattedContent = `
<h3>📚 ${escapeHtmlAttr(cleanTitle)}</h3>
${content || ''}
<p class="lesson-note-box">
    💡 <strong>ملاحظة:</strong> يمكنك طرح أي سؤال متعلق بهذا الدرس وسأساعدك في فهمه بشكل أفضل.
</p>
        `.trim();

        window.MathApp.chat.displayMessage(formattedContent, 'outgoing', false, null, { sourceKind: 'lesson' });

        window.MathApp.state.chatHistory.push({
            role: 'model',
            parts: [{ text: `[درس من المكتبة: ${cleanTitle}]\n\n${content || ''}` }]
        });

        window.MathApp.chat.scrollToBottom();
        window.MathApp.ui.showToast(`✅ تم عرض درس: ${cleanTitle}`);
    }
};
