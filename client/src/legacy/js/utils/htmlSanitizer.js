// ==================== HTML SANITIZER & TEXT EXTRACTOR ====================

const SAFE_TAGS = new Set([
    'a', 'b', 'blockquote', 'br', 'canvas', 'caption', 'code', 'col', 'colgroup',
    'dd', 'del', 'details', 'div', 'dl', 'dt', 'em', 'figcaption', 'figure',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'i', 'img', 'ins', 'kbd',
    'li', 'mark', 'ol', 'p', 'pre', 'q', 's', 'small', 'span', 'strong',
    'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead',
    'tr', 'u', 'ul', 'var'
]);

const STRIP_ENTIRELY_TAGS = new Set([
    'script', 'style', 'iframe', 'object', 'embed', 'link', 'meta', 'noscript', 'template', 'form', 'input', 'textarea', 'select', 'option'
]);

const GLOBAL_SAFE_ATTRS = new Set([
    'class', 'id', 'dir', 'lang', 'title', 'aria-label', 'aria-hidden', 'aria-pressed', 'role', 'tabindex'
]);

const TAG_SAFE_ATTRS = {
    a: new Set(['href', 'target', 'rel']),
    button: new Set(['type', 'disabled']),
    canvas: new Set(['width', 'height']),
    col: new Set(['span']),
    colgroup: new Set(['span']),
    details: new Set(['open']),
    img: new Set(['src', 'alt', 'width', 'height', 'loading']),
    ol: new Set(['start', 'type']),
    span: new Set(['data-latex', 'contenteditable']),
    div: new Set(['data-toggle-target']),
    td: new Set(['colspan', 'rowspan']),
    th: new Set(['colspan', 'rowspan', 'scope'])
};

const BUTTON_ALLOWED_CLASSES = new Set([
    'btn', 'btn-primary', 'btn-secondary', 'ai-retry-btn', 'ai-toggle-btn',
    'response-action-btn', 'copy-msg-btn', 'favorite-problem-btn',
    'open-history-btn', 'deep-explain-btn', 'share-btn', 'rate-good-btn', 'rate-bad-btn',
    'quick-prompt-btn'
]);

export const escapeHtmlAttr = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const decodeHtmlEntities = (value) => {
    const str = String(value ?? '');
    if (!str) return '';
    if (typeof document !== 'undefined') {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = str;
        return textarea.value;
    }
    return str
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'");
};

/**
 * Extracts clean human-readable plain text for saved chat titles, lesson titles,
 * search snippets, and tooltips WITHOUT modifying stored HTML lesson/history data.
 */
export const stripHtmlToPlainText = (value, maxLength = 0) => {
    let text = String(value ?? '');
    if (!text) return '';

    // Remove [درس من المكتبة: Title] wrapper prefix if present while preserving the title
    text = text.replace(/^\s*\[(?:درس من المكتبة|Lesson from Library):\s*([^\]]+)\]\s*/i, '$1 — ');

    if (typeof document !== 'undefined') {
        const template = document.createElement('template');
        template.innerHTML = text;
        template.content.querySelectorAll('script, style, iframe, object, embed, noscript').forEach((el) => el.remove());
        // Insert spaces around block elements so adjacent headings/paragraphs don't glue together
        template.content.querySelectorAll('h1,h2,h3,h4,h5,h6,p,li,div,tr,br').forEach((el) => {
            if (el.tagName === 'BR') {
                el.replaceWith(' ');
            } else {
                el.appendChild(document.createTextNode(' '));
            }
        });
        text = template.content.textContent || '';
    } else {
        text = text
            .replace(/<(script|style|iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
            .replace(/<\/?(?:h[1-6]|p|li|div|tr|br|strong|em|b|i|span|ul|ol|table|td|th|code|pre|blockquote)[^>]*>/gi, ' ')
            .replace(/<[^>]+>/g, ' ');
        text = decodeHtmlEntities(text);
    }

    text = text
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/#+\s+/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    if (maxLength > 0 && text.length > maxLength) {
        return text.slice(0, maxLength).trimEnd() + '...';
    }
    return text;
};

const isSafeUrl = (attrName, value) => {
    const val = String(value || '').trim();
    if (!val) return false;
    if (/^(?:javascript|vbscript|file):/i.test(val)) return false;
    if (attrName === 'src') {
        if (/^data:/i.test(val)) {
            return /^data:image\/(?:png|jpeg|jpg|webp|gif);base64,/i.test(val);
        }
        return true;
    }
    if (attrName === 'href') {
        if (/^data:/i.test(val)) return false;
        return true;
    }
    return false;
};

/**
 * Normalizes legacy light-mode inline styles (used in older lesson modules like
 * background:#f9f9f9 or color:darkblue) into dark-navy-compatible classes while
 * removing dangerous inline style payloads.
 */
const normalizeInlineStyle = (el) => {
    const rawStyle = el.getAttribute('style') || '';
    if (!rawStyle) return;

    const lower = rawStyle.toLowerCase();
    const keepParts = [];

    if (/direction\s*:\s*ltr/i.test(lower)) keepParts.push('direction: ltr');
    if (/direction\s*:\s*rtl/i.test(lower)) keepParts.push('direction: rtl');
    if (/text-align\s*:\s*left/i.test(lower)) keepParts.push('text-align: left');
    if (/text-align\s*:\s*center/i.test(lower)) keepParts.push('text-align: center');
    if (/text-align\s*:\s*right/i.test(lower)) keepParts.push('text-align: right');
    if (/font-weight\s*:\s*(?:bold|700|800)/i.test(lower)) keepParts.push('font-weight: 700');
    if (/font-family\s*:\s*monospace/i.test(lower)) keepParts.push('font-family: var(--font-mono)');

    if (/background(?:-color)?\s*:/i.test(lower)) {
        if (/#ffe6e6|#fff3cd/i.test(lower)) {
            el.classList.add('lesson-callout-warn');
        } else if (/#222|#333|#111/i.test(lower)) {
            el.classList.add('lesson-code-box');
        } else {
            el.classList.add('lesson-callout-box');
        }
    } else if (/border(?:-left|-right|-top|-bottom)?\s*:/i.test(lower) && el.tagName === 'DIV') {
        el.classList.add('lesson-callout-box');
    }

    if (/(?:^|;)\s*color\s*:\s*(?:red|darkred)/i.test(lower)) {
        el.classList.add('lesson-text-accent-warn');
    } else if (/(?:^|;)\s*color\s*:\s*darkblue/i.test(lower)) {
        el.classList.add('lesson-text-accent-info');
    } else if (/font-size\s*:\s*1\.[2-9]em/i.test(lower)) {
        el.classList.add('lesson-formula-highlight');
    }

    // Preserve display:none used specifically by collapsible .ai-details container
    if (el.classList.contains('ai-details') && /display\s*:\s*none/i.test(lower)) {
        keepParts.push('display: none');
    }
    if (/margin-top\s*:\s*\d+px/i.test(lower) && (el.classList.contains('ai-details') || el.parentElement?.classList?.contains('ai-enhanced-result') || el.classList.contains('local-error-card'))) {
        const m = lower.match(/margin-top\s*:\s*(\d+px)/i);
        if (m) keepParts.push(`margin-top: ${m[1]}`);
    }

    if (keepParts.length > 0) {
        el.setAttribute('style', keepParts.join('; '));
    } else {
        el.removeAttribute('style');
    }
};

/**
 * Converts stray inline markdown (**bold**, `code`) inside already-HTML lesson strings
 * strictly in text nodes so attributes and tags are never corrupted.
 */
export const convertInlineMarkdownInDom = (root) => {
    if (!root || typeof document === 'undefined') return;
    const SKIP = new Set(['SCRIPT', 'STYLE', 'CODE', 'PRE', 'TEXTAREA']);
    const textNodes = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
            const val = node.nodeValue || '';
            if (!val.includes('**') && !val.includes('`')) return NodeFilter.FILTER_REJECT;
            let p = node.parentElement;
            while (p && p !== root) {
                if (SKIP.has(p.tagName) || p.classList.contains('math-expression') || p.classList.contains('katex')) {
                    return NodeFilter.FILTER_REJECT;
                }
                p = p.parentElement;
            }
            return NodeFilter.FILTER_ACCEPT;
        }
    });

    let cur;
    while ((cur = walker.nextNode())) textNodes.push(cur);

    const tokenRegex = /(\*\*([^*\n]+)\*\*|`([^`\n]+)`)/g;
    textNodes.forEach((node) => {
        const val = node.nodeValue || '';
        tokenRegex.lastIndex = 0;
        if (!tokenRegex.test(val)) return;
        tokenRegex.lastIndex = 0;

        const frag = document.createDocumentFragment();
        let last = 0;
        let match;
        while ((match = tokenRegex.exec(val)) !== null) {
            if (match.index > last) {
                frag.appendChild(document.createTextNode(val.slice(last, match.index)));
            }
            if (match[2] !== undefined) {
                const strong = document.createElement('strong');
                strong.textContent = match[2];
                frag.appendChild(strong);
            } else if (match[3] !== undefined) {
                const code = document.createElement('code');
                code.className = 'inline-code';
                code.textContent = match[3];
                frag.appendChild(code);
            }
            last = tokenRegex.lastIndex;
        }
        if (last < val.length) {
            frag.appendChild(document.createTextNode(val.slice(last)));
        }
        node.parentNode?.replaceChild(frag, node);
    });
};

export const sanitizeRichHtml = (html, options = {}) => {
    const raw = String(html ?? '');
    if (!raw || typeof document === 'undefined') return raw;

    const template = document.createElement('template');
    template.innerHTML = raw;

    const sanitizeNodeList = (parent) => {
        const children = Array.from(parent.childNodes);
        children.forEach((child) => {
            if (child.nodeType === Node.COMMENT_NODE) {
                child.remove();
                return;
            }
            if (child.nodeType !== Node.ELEMENT_NODE) return;

            const tag = child.tagName.toLowerCase();
            if (STRIP_ENTIRELY_TAGS.has(tag)) {
                child.remove();
                return;
            }

            // Allow buttons only for known safe internal interactive controls (without onclick)
            if (tag === 'button') {
                const classes = Array.from(child.classList);
                const isKnownButton = classes.some((cls) => BUTTON_ALLOWED_CLASSES.has(cls));
                if (!isKnownButton) {
                    const span = document.createElement('span');
                    span.textContent = child.textContent || '';
                    child.replaceWith(span);
                    return;
                }
            } else if (!SAFE_TAGS.has(tag)) {
                // Unwrap unknown tags preserving inner readable text/children
                const frag = document.createDocumentFragment();
                while (child.firstChild) frag.appendChild(child.firstChild);
                child.replaceWith(frag);
                sanitizeNodeList(parent);
                return;
            }

            const allowedForTag = TAG_SAFE_ATTRS[tag];
            Array.from(child.attributes).forEach((attr) => {
                const attrName = attr.name.toLowerCase();
                if (attrName.startsWith('on')) {
                    child.removeAttribute(attr.name);
                    return;
                }
                if (attrName === 'style') {
                    normalizeInlineStyle(child);
                    return;
                }
                if (attrName === 'href' || attrName === 'src') {
                    if (!isSafeUrl(attrName, attr.value)) {
                        child.removeAttribute(attr.name);
                        return;
                    }
                    if (tag === 'a') {
                        child.setAttribute('rel', 'noopener noreferrer');
                    }
                    return;
                }
                if (attrName.startsWith('data-')) {
                    // Only allow known safe data-* attributes
                    if (!['data-latex', 'data-prompt', 'data-toggle-target'].includes(attrName)) {
                        child.removeAttribute(attr.name);
                    }
                    return;
                }
                if (!GLOBAL_SAFE_ATTRS.has(attrName) && !(allowedForTag && allowedForTag.has(attrName))) {
                    child.removeAttribute(attr.name);
                }
            });

            if (tag === 'table') {
                child.classList.add('lesson-data-table');
            }

            sanitizeNodeList(child);
        });
    };

    sanitizeNodeList(template.content);

    if (options.convertInlineMarkdown !== false) {
        convertInlineMarkdownInDom(template.content);
    }

    return template.innerHTML;
};
