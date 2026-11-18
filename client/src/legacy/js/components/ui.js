
import { escapeHtmlAttr } from '../utils/htmlSanitizer.js';
import { applyLanguage, getAppLanguage, getLocaleDict } from '../utils/i18n.js';

// ==================== THEME MODULE ====================
export const theme = {
        apply() {
            let savedTheme = 'dark';
            try { savedTheme = localStorage.getItem('theme') || 'dark'; } catch { savedTheme = 'dark'; }
            const isLight = savedTheme === 'light';
            const dict = getLocaleDict();
            document.body.classList.toggle('light-mode', isLight);
            document.body.classList.toggle('dark-mode', !isLight);

            const themeMeta = document.querySelector('meta[name="theme-color"]');
            if (themeMeta) {
                themeMeta.setAttribute('content', isLight ? '#ffffff' : '#0c1628');
            }

            const toggleBtn = window.MathApp?.dom?.darkModeToggle;
            if (toggleBtn) {
                const label = isLight ? dict.themeDark : dict.themeLight;
                toggleBtn.setAttribute('aria-label', label);
                toggleBtn.setAttribute('title', label);
            }
        },
        toggle() {
            document.body.classList.add('theme-switching');
            const currentlyLight = document.body.classList.contains('light-mode');
            const nextIsLight = !currentlyLight;
            try { localStorage.setItem('theme', nextIsLight ? 'light' : 'dark'); } catch { /* ignore */ }
            this.apply();

            const drawingModal = window.MathApp?.dom?.drawingModal;
            if (!drawingModal || drawingModal.style.display === 'none' || !drawingModal.style.display) {
                window.MathApp?.drawing?.initCanvas();
            }
            setTimeout(() => {
                document.body.classList.remove('theme-switching');
            }, 320);
        }
    }
    
    // ==================== STAGE MODULE ====================
export const stage = {
        select(stageKey, stageText) {
            window.MathApp.state.currentStage = stageKey;
            const stageEl = document.getElementById('current-stage-text');
            if (stageEl) stageEl.textContent = stageText;
            localStorage.setItem('ai_stage', stageKey);
            localStorage.setItem('ai_stage_text', stageText);
            // notify other components (library) that stage changed
            try { window.dispatchEvent(new CustomEvent('stageChanged', { detail: { key: stageKey, text: stageText } })); } catch(e) {}
        },
        load() {
            const savedStage = localStorage.getItem('ai_stage') || 'secondary';
            const savedText = localStorage.getItem('ai_stage_text') || 'ثانوي';
            this.select(savedStage, savedText);
        },
        getContext() {
            const lang = (() => {
                try { return localStorage.getItem('app_language') || 'ar'; } catch (e) { return 'ar'; }
            })();
            const contextsByLang = {
                ar: {
                    elementary: "أجب بأسلوب بسيط ومناسب لطفل.",
                    preparatory: "أجب بأسلوب مناسب للمرحلة الإعدادية.",
                    secondary: "أجب بأسلوب مناسب للمرحلة الثانوية.",
                    higher_ed: "أجب بأسلوب أكاديمي وعميق مناسب للجامعة.",
                    general: "أجب بطريقة مفهومة لجميع المراحل (ابتدائي-جامعي) وقابلة للتبسيط أو التعميق حسب الطلب."
                },
                en: {
                    elementary: "Answer in a simple, child-friendly way.",
                    preparatory: "Answer in a way suitable for middle school level.",
                    secondary: "Answer in a way suitable for high school level.",
                    higher_ed: "Answer in an academic, in-depth university level style.",
                    general: "Answer in a way understandable for all levels (elementary to university), adaptable to simplify or deepen as requested."
                },
                tr: {
                    elementary: "Basit ve çocuk seviyesine uygun şekilde yanıt ver.",
                    preparatory: "Ortaokul seviyesine uygun şekilde yanıt ver.",
                    secondary: "Lise seviyesine uygun şekilde yanıt ver.",
                    higher_ed: "Üniversite seviyesinde akademik ve derinlikli yanıt ver.",
                    general: "Tüm seviyeler (ilkokuldan üniversiteye) için anlaşılır şekilde yanıt ver, istenirse sadeleştir veya derinleştir."
                }
            };
            const contexts = contextsByLang[lang] || contextsByLang.ar;
            return contexts[window.MathApp.state.currentStage] || contexts.secondary;
        }
    }

    // ==================== FILE MODULE ====================
export const file = { 
         async handleFileUpload(event) {
                    const file = event.target.files[0];
                    if (!file) return;

                    const mimeType = file.type;
                    const reader = new FileReader();

                    // معالجة الصور
                    if (mimeType.startsWith('image/')) {
                        reader.onload = (e) => {
                            window.MathApp.state.selectedImageBase64 = e.target.result.split(',')[1];
                            window.MathApp.state.selectedImageMimeType = mimeType;
                            window.MathApp.state.attachedFileContent = null;
                            window.MathApp.state.attachedFileName = null;
                            
                            window.MathApp.dom.imageAttachedIndicator.style.display = 'flex';
                            window.MathApp.dom.imageAttachedIndicator.innerHTML = '<span>صورة مرفقة (AI)</span><button type="button" class="attachment-clear-btn" aria-label="إزالة المرفق" title="إزالة المرفق">✕</button>';
                            event.target.value = '';
                            window.MathApp.ui.showToast('تم إرفاق الصورة بنجاح. يمكنك الآن إرسال سؤالك.');
                            window.MathApp.ui.closeBottomNav();
                            if (window.MathApp.updateInputButtons) window.MathApp.updateInputButtons();
                        };
                        reader.readAsDataURL(file);
                    
                    // معالجة ملفات TXT
                    } else if (mimeType === 'text/plain' || file.name.endsWith('.txt')) {
                        reader.onload = (e) => {
                            window.MathApp.state.attachedFileContent = e.target.result;
                            window.MathApp.state.attachedFileName = file.name;
                            window.MathApp.state.selectedImageBase64 = null;
                            window.MathApp.state.selectedImageMimeType = null;

                            window.MathApp.dom.imageAttachedIndicator.style.display = 'flex';
                            window.MathApp.dom.imageAttachedIndicator.innerHTML = `<span>ملف نصي: ${file.name}</span><button type="button" class="attachment-clear-btn" aria-label="إزالة المرفق" title="إزالة المرفق">✕</button>`;
                            event.target.value = '';
                            window.MathApp.ui.showToast('تم إرفاق الملف النصي بنجاح. سيتم تحليل محتواه مع سؤالك.');
                            window.MathApp.ui.closeBottomNav();
                            if (window.MathApp.updateInputButtons) window.MathApp.updateInputButtons();
                        };
                        reader.readAsText(file);
                    
                    // معالجة ملفات PDF
                    } else if (mimeType === 'application/pdf' || file.name.endsWith('.pdf')) {
                        try {
                            window.MathApp.ui.showToast('جاري استخراج النص من PDF...', false);
                            
                            const arrayBuffer = await file.arrayBuffer();
                            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                            const totalPages = pdf.numPages;
                            
                            let extractedText = '';
                            let processedPages = 0;
                            
                            for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
                                try {
                                    const page = await pdf.getPage(pageNum);
                                    const textContent = await page.getTextContent();
                                    
                                    const pageText = textContent.items
                                        .map(item => item.str)
                                        .join(' ')
                                        .trim();
                                    
                                    if (pageText) {
                                        extractedText += `\n\n=== صفحة ${pageNum} من ${totalPages} ===\n${pageText}`;
                                        processedPages++;
                                    }
                                    
                                    if (pageNum % 5 === 0 || pageNum === totalPages) {
                                        window.MathApp.ui.showToast(`معالجة الصفحة ${pageNum}/${totalPages}...`, false);
                                    }
                                    
                                } catch (pageError) {
                                    console.warn(`فشل في قراءة الصفحة ${pageNum}:`, pageError);
                                    extractedText += `\n\n=== صفحة ${pageNum}: خطأ في القراءة ===\n`;
                                }
                            }
                            
                            if (!extractedText.trim()) {
                                throw new Error('لم يتم العثور على نص قابل للقراءة في ملف PDF. قد يكون الملف عبارة عن صور ممسوحة ضوئياً.');
                            }
                            
                            window.MathApp.state.attachedFileContent = extractedText.trim();
                            window.MathApp.state.attachedFileName = file.name;
                            window.MathApp.state.selectedImageBase64 = null;
                            window.MathApp.state.selectedImageMimeType = null;
                            
                            window.MathApp.dom.imageAttachedIndicator.style.display = 'flex';
                            window.MathApp.dom.imageAttachedIndicator.innerHTML = `
                                <span>PDF: ${file.name} (${processedPages} صفحة)</span>
                                <button type="button" class="attachment-clear-btn" aria-label="إزالة المرفق" title="إزالة المرفق">✕</button>
                            `;
                            event.target.value = '';
                            
                            const charCount = extractedText.length;
                            const wordCount = extractedText.split(/\s+/).length;
                            window.MathApp.ui.showToast(`✅ تم استخراج النص بنجاح!\n\n📄 الصفحات: ${processedPages}/${totalPages}\n🔤 الأحرف: ${charCount.toLocaleString()}\n📤 الكلمات: ${wordCount.toLocaleString()}\n\nيمكنك الآن طرح سؤالك عن محتوى الملف.`);
                            window.MathApp.ui.closeBottomNav();
                            if (window.MathApp.updateInputButtons) window.MathApp.updateInputButtons();
                            
                        } catch (error) {
                            console.error('PDF Processing Error:', error);
                            
                            let errorMsg = 'فشل في معالجة ملف PDF.';
                            
                            if (error.message.includes('Password')) {
                                errorMsg = '❌ هذا الملف محمي بكلمة مرور. الرجاء إلغاء الحماية وإعادة المحاولة.';
                            } else if (error.message.includes('صور ممسوحة')) {
                                errorMsg = '⚠️ هذا الملف يحتوي على صور ممسوحة ضوئياً ولا يحتوي على نص قابل للقراءة.\n\nالحل: التقط صورة للصفحة وأرفقها كصورة بدلاً من PDF.';
                            } else if (error.message.includes('Invalid PDF')) {
                                errorMsg = '❌ الملف تالف أو ليس ملف PDF صالح.';
                            } else {
                                errorMsg += '\n\nالتفاصيل: ' + error.message;
                            }
                            
                            window.MathApp.ui.showToast(errorMsg);
                            event.target.value = '';
                            window.MathApp.ui.closeBottomNav();
                        }
                    
                    // رفض الملفات غير المدعومة
                    } else {
                        window.MathApp.ui.showToast(`عذراً، نوع الملف "${file.name}" (${mimeType}) غير مدعوم حالياً.\n\n✅ الملفات المدعومة:\n• صور: JPG, PNG, WEBP\n• نصوص: TXT, PDF\n\n💡 نصيحة: يمكنك تحويل ملفات Word/Excel إلى PDF أولاً.`);
                        event.target.value = '';
                        window.MathApp.ui.closeBottomNav();
                    }
                },
                
                clearAttachment() {
                    window.MathApp.state.selectedImageBase64 = null;
                    window.MathApp.state.selectedImageMimeType = null;
                    window.MathApp.state.attachedFileContent = null;
                    window.MathApp.state.attachedFileName = null;
                    window.MathApp.dom.imageAttachedIndicator.style.display = 'none';
                    
                    if(window.MathApp.dom.imageFileInput) window.MathApp.dom.imageFileInput.value = ''; 
                    if(window.MathApp.dom.fileInputForEquation) window.MathApp.dom.fileInputForEquation.value = '';
                    if (window.MathApp.updateInputButtons) window.MathApp.updateInputButtons();
                }
     }

    // ==================== EDITOR MODULE ====================
export const editor = {
        saveCursor() {
                    const selection = window.getSelection();
                    if (selection.rangeCount > 0 && window.MathApp.dom.editor.contains(selection.anchorNode)) {
                        window.MathApp.state.currentCursorPosition = selection.getRangeAt(0).cloneRange();
                    }
                },

                restoreCursor(position) {
                    const range = position || window.MathApp.state.currentCursorPosition;
                    if (range) {
                        const selection = window.getSelection();
                        selection.removeAllRanges();
                        selection.addRange(range);
                    }
                    window.MathApp.dom.editor.focus();
                },

                setCursorAfter(node) {
                    const range = document.createRange();
                    range.setStartAfter(node);
                    range.collapse(true);
                    window.MathApp.state.currentCursorPosition = range.cloneRange();
                    this.restoreCursor();
                },

                setCursorToEnd() {
                    const range = document.createRange();
                    range.selectNodeContents(window.MathApp.dom.editor);
                    range.collapse(false);
                    window.MathApp.state.currentCursorPosition = range;
                    this.restoreCursor();
                },

                clear(showConfirm = true) {
                    const doClear = () => {
                        window.MathApp.dom.editor.innerHTML = '';
                        window.MathApp.photo.clearAttachment(false);
                        this.setCursorToEnd();
                    };
                    doClear();
                },

                getContent() {
                    return window.MathApp.dom.editor.innerHTML.trim();
                },

                convertToText(htmlContent) {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = htmlContent;
                    const mathElements = tempDiv.querySelectorAll('.math-expression');
                    mathElements.forEach(span => {
                        const latex = (span.getAttribute('data-latex') || '').trim();
                        const textNode = document.createTextNode(` $${latex}$ `);
                        span.parentNode.replaceChild(textNode, span);
                    });
                    return tempDiv.textContent.replace(/\s+/g, ' ').trim();
                },

               // في ملف ui.js داخل الكائن editor = { ... }

// دالة النسخ الذكي (تم تحسينها لتعمل مع التحديد الجزئي)
handleCopy(e) {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    // استنساخ المحتوى المحدد فقط
    const container = document.createElement('div');
    const range = selection.getRangeAt(0);
    container.appendChild(range.cloneContents());

    // البحث عن المعادلات داخل النص المنسوخ وتحويلها إلى كود
    // نبحث عن العناصر التي لها كلاس math-expression
    const mathElements = container.querySelectorAll('.math-expression');
    
    // إذا لم تكن هناك معادلات، اترك النسخ الطبيعي يعمل
    if (mathElements.length === 0 && !range.startContainer.parentElement.closest('.math-expression')) {
        return; 
    }

    e.preventDefault(); // إيقاف النسخ العادي

    // تحويل كل معادلة إلى صيغة $latex$
    mathElements.forEach(span => {
        const latex = span.getAttribute('data-latex');
        if (latex) {
            span.replaceWith(`$${latex}$`); // استبدال الشكل البصري بالكود
        }
    });

    // وضع النص المعالج في الحافظة
    const finalBuffer = container.textContent;
    e.clipboardData.setData('text/plain', finalBuffer);
},

// دالة اللصق الذكي (تأكد أنها بهذا الشكل)
handlePaste(e) {
    e.preventDefault();
    
    // جلب النص من الحافظة
    let text = (e.clipboardData || window.clipboardData).getData('text/plain');
    if (!text) return;

    // تنظيف النص وتحويل صيغ $...$ إلى عناصر HTML قابلة للتعديل
    // يدعم $$...$$ و \(...\) و $...$
    const toMathSpan = (latex) => {
        try {
            const cleanLatex = String(latex || '').trim();
            const renderedMath = katex.renderToString(cleanLatex, { throwOnError: false });
            return `<span class="math-expression" contenteditable="false" dir="ltr" data-latex="${escapeHtmlAttr(cleanLatex)}">${renderedMath}</span>`;
        } catch (err) {
            return `$${latex}$`;
        }
    };

    const processedHtml = text
        .replace(/\$\$([\s\S]+?)\$\$/g, (match, latex) => toMathSpan(latex))
        .replace(/\\\(([\s\S]+?)\\\)/g, (match, latex) => toMathSpan(latex))
        .replace(/\$([^$]+)\$/g, (match, latex) => toMathSpan(latex));

    // إدراج النتيجة في مكان المؤشر
    document.execCommand('insertHTML', false, processedHtml);
    
    // تحديث المؤشر وحالة المحرر
    this.saveCursor();
    window.MathApp.dom.editor.dispatchEvent(new Event('input'));
},
               
// داخل كائن math
editExisting(element) {
    const editor = document.getElementById('editor');
    const isInEditor = editor.contains(element);

    if (isInEditor) {
        // === الحالة 1: داخل المحرر (تعديل) ===
        MathApp.state.editingElement = element;
        const latex = element.getAttribute('data-latex');
        MathApp.dom.mathField.value = latex;
        MathApp.dom.insertUpdateBtn.textContent = 'تعديل المعادلة';
        MathApp.dom.mathModal.style.display = 'block';
        setTimeout(() => MathApp.dom.mathField.focus(), 100);
        
    } else {
        // === الحالة 2: داخل الشات (نسخ إلى المحرر) ===
        const latex = element.getAttribute('data-latex');
        
        const newSpan = document.createElement('span');
        newSpan.className = 'math-expression';
        newSpan.contentEditable = false;
        newSpan.setAttribute('dir', 'ltr');
        newSpan.setAttribute('data-latex', latex);
        
        try {
            katex.render(latex, newSpan, { throwOnError: false });
        } catch (e) {
            newSpan.textContent = latex;
        }

        // إدراج في نهاية المحرر (مع التأكد من عدم التكرار)
        editor.appendChild(document.createTextNode(' ')); // مسافة قبلها
        editor.appendChild(newSpan);
        editor.appendChild(document.createTextNode(' ')); // مسافة بعدها
        
        // تحريك المؤشر للنهاية وتحديث التمرير
        MathApp.editor.setCursorToEnd();
        editor.scrollTop = editor.scrollHeight;
        
        // تحديث زر الإرسال
        editor.dispatchEvent(new Event('input'));
        
        MathApp.ui.showToast('تم نسخ المعادلة 👇');
    }
},
    }
     // ==================== EXPORT MODULE (FIXED & IMPLEMENTED) ====================
export const exportModule = {
                applyExportContrastStyles(container) {
                    if (!container) return;
                    container.classList.add('export-contrast');
                    const style = document.createElement('style');
                    style.textContent = `
                        .export-contrast {
                            background: #ffffff !important;
                            color: #111827 !important;
                        }
                        .export-contrast .message-bubble {
                            backdrop-filter: none !important;
                            box-shadow: none !important;
                        }
                        .export-contrast .incoming {
                            background: #1d4ed8 !important;
                            color: #ffffff !important;
                            border: 1px solid #1e40af !important;
                        }
                        .export-contrast .outgoing {
                            background: #ffffff !important;
                            color: #111827 !important;
                            border: 1px solid #e5e7eb !important;
                        }
                        .export-contrast .local-solution-card,
                        .export-contrast .local-steps-details,
                        .export-contrast .local-final-box,
                        .export-contrast .local-step-math {
                            background: #f8fafc !important;
                            color: #111827 !important;
                            border-color: #cbd5e1 !important;
                        }
                        .export-contrast .message-bubble h3 {
                            color: #111827 !important;
                            border-bottom-color: #cbd5e1 !important;
                        }
                        .export-contrast .message-bubble pre {
                            background: #f3f4f6 !important;
                            color: #111827 !important;
                        }
                        .export-contrast .message-bubble table {
                            background: #ffffff !important;
                        }
                        .export-contrast .message-actions,
                        .export-contrast .message-actions-bar {
                            display: none !important;
                        }
                    `;
                    container.appendChild(style);
                },
                async getChatElementClone() {
                    const original = window.MathApp.dom.chatMessages;
                    const clone = original.cloneNode(true);
                    
                    clone.querySelectorAll('.typing-indicator').forEach(el => el.remove());
                    
                    clone.querySelectorAll('.math-expression').forEach(span => {
                        const latex = span.getAttribute('data-latex');
                        try {
                            katex.render(latex, span, { throwOnError: false, displayMode: false });
                        } catch (e) {
                            span.textContent = `[خطأ في المعادلة: ${latex}]`;
                        }
                    });
                    
                    return clone;
                },
                
                        
    // ==========================================================
    async toPdf() {
        window.MathApp.ui.showToast('جاري إنشاء ملف PDF...');
        try {
            // -- الخطوات المشتركة: توليد الـ PDF في الذاكرة --
            const { jsPDF } = window.jspdf;
            const tempContainer = document.createElement('div');
            tempContainer.style.cssText = `position: fixed; left: -9999px; top: 0; width: 800px; padding: 20px; background: #ffffff; direction: rtl;`;
            document.body.appendChild(tempContainer);
            const clone = await this.getChatElementClone();
            this.applyExportContrastStyles(tempContainer);
            tempContainer.appendChild(clone);
            const canvas = await html2canvas(tempContainer, { scale: 3, useCORS: true, backgroundColor: '#ffffff' });
            document.body.removeChild(tempContainer);

            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(canvas);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            let heightLeft = pdfHeight;
            let position = 0;
            pdf.addImage(canvas, 'PNG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= pdf.internal.pageSize.getHeight();
            while (heightLeft > 0) {
                position -= pdf.internal.pageSize.getHeight();
                pdf.addPage();
                pdf.addImage(canvas, 'PNG', 0, position, pdfWidth, pdfHeight);
                heightLeft -= pdf.internal.pageSize.getHeight();
            }

            const timestamp = new Date().toISOString().slice(0, 10);
            const fileName = `محادثة_الرياضيات_${timestamp}.pdf`;

            // --- اكتشاف البيئة واختيار طريقة الحفظ ---
            if (window.MathApp.isCapacitor()) {
                // --- منطق Capacitor (تطبيق الموبايل) ---
                const pdfData = btoa(pdf.output('arraybuffer'));
                const { Filesystem, Directory } = Capacitor.Plugins;
                await Filesystem.writeFile({
                    path: fileName,
                    data: pdfData,
                    directory: Directory.Documents,
                });
                window.MathApp.ui.showToast(`✅ تم حفظ الملف في مجلد المستندات.`);
            } else {
                // --- منطق الويب (المتصفح العادي) ---
                pdf.save(fileName);
                window.MathApp.ui.showToast('✅ تم بدء تنزيل ملف PDF!');
            }

        } catch (error) {
            console.error('Export PDF Error (Universal):', error);
            window.MathApp.ui.showToast(`❌ فشل تصدير PDF: ${error.message}`, 'error');
        }
    },

    // ==========================================================
    // ===== دالة تصدير Word (نسخة عالمية للويب و Capacitor) =====
    // ==========================================================

async toWord() {
    window.MathApp.ui.showToast('جاري إنشاء ملف Word...');
    try {
        // --- الخطوات المشتركة: توليد محتوى HTML ---
        
        // 1. نحصل على نسخة نظيفة من المحادثة
        const clone = await this.getChatElementClone();
        
        // 2. نزيل أي عناصر لا نريدها في الملف المصدر (مثل أزرار التحكم)
        clone.querySelectorAll('.message-actions, .message-actions-bar').forEach(el => el.remove());

        // 3. نجهز رأس وتذييل ملف HTML الذي سيفهمه Word
        // هذا هو الجزء الذي كان ناقصاً في الكود السابق
        const header = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
                <meta charset='utf-8'>
                <title>تصدير محادثة</title>
                <style>
                    /* تنسيقات أساسية لبرنامج وورد لجعل المحادثة مقروءة */
                    body { font-family: Arial, sans-serif; direction: rtl; text-align: right; }
                    .message-bubble { 
                        border: 1px solid #dddddd; 
                        padding: 10px; 
                        margin-bottom: 10px; 
                        border-radius: 5px; 
                        max-width: 80%; 
                        word-wrap: break-word; /* لضمان عدم خروج النص الطويل عن الفقاعة */
                    }
                    .incoming { 
                        background-color: #e1f5fe; /* لون أزرق فاتح لرسائل المستخدم */
                        margin-right: auto; 
                        clear: both;
                        float: left;
                    }
                    .outgoing { 
                        background-color: #f1f8e9; /* لون أخضر فاتح لرسائل المساعد */
                        margin-left: auto;
                        clear: both;
                        float: right;
                    }
                    h1, p { text-align: right; } /* محاذاة العناوين لليمين */
                </style>
            </head>
            <body>
                <h1>محادثة مع المستشار الرياضي</h1>
                <p>تاريخ التصدير: ${new Date().toLocaleString('ar-EG')}</p>
                <hr>
        `;

        const footer = '</body></html>';

        // 4. ندمج كل الأجزاء للحصول على المحتوى النهائي
        const sourceHTML = header + clone.innerHTML + footer;
        const timestamp = new Date().toISOString().slice(0, 10);
        const fileName = `محادثة_الرياضيات_${timestamp}.doc`;

        // --- اكتشاف البيئة واختيار طريقة الحفظ ---
        if (window.MathApp.isCapacitor()) {
            // --- منطق Capacitor (تطبيق الموبايل) ---
            const base64Data = btoa(unescape(encodeURIComponent(sourceHTML)));
            const { Filesystem, Directory } = Capacitor.Plugins;
            await Filesystem.writeFile({
                path: fileName,
                data: base64Data,
                directory: Directory.Documents,
            });
            window.MathApp.ui.showToast(`✅ تم حفظ الملف في مجلد المستندات.`);
        } else {
            // --- منطق الويب (المتصفح العادي) ---
            if (typeof saveAs === 'undefined') {
                window.MathApp.ui.showToast('مكتبة الحفظ (FileSaver) غير متوفرة.', 'error');
                return;
            }
            const blob = new Blob([sourceHTML], { type: 'application/msword;charset=utf-8' });
            saveAs(blob, fileName);
            window.MathApp.ui.showToast('✅ تم بدء تنزيل ملف Word!');
        }
    } catch (error) {
        console.error('Export Word Error (Universal):', error);
        window.MathApp.ui.showToast(`❌ فشل تصدير Word: ${error.message}`, 'error');
    }
},
    async toPowerPoint() {
        return this.toPdf();
    },
    
    // ===== دالة المشاركة كصورة (نسخة عالمية للويب و Capacitor) =====
    
    // داخل exportModule في ui.js

    async shareMessageAsImage(buttonElement) {
        window.MathApp.ui.showToast('جاري تصميم بطاقة الحل... 🎨');
    
    const messageBubble = buttonElement.closest('.message-bubble');
    if (!messageBubble) return;

    // 1. إنشاء حاوية مؤقتة للتصوير
    const tempContainer = document.createElement('div');
    tempContainer.style.cssText = `
        position: fixed; left: -9999px; top: 0; width: 600px;
        background: linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%);
        padding: 30px; font-family: 'Cairo', sans-serif; direction: rtl;
        border-radius: 20px;
    `;

    // 2. إضافة ترويسة (اسم التطبيق)
    const header = document.createElement('div');
    header.innerHTML = `
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; border-bottom:2px solid var(--primary-color); padding-bottom:10px;">
            <h2 style="margin:0; color:var(--primary-color);">المستشار الرياضي 🎓</h2>
            <span style="font-size:12px; color:#666;">Math Assistant AI</span>
        </div>
    `;
    tempContainer.appendChild(header);

    // 3. استنساخ المحتوى (بدون الأزرار)
    const contentClone = messageBubble.cloneNode(true);
    contentClone.style.boxShadow = 'none';
    contentClone.style.background = 'transparent';
    contentClone.style.border = 'none';
    contentClone.style.padding = '0';
    contentClone.querySelectorAll('.message-actions, .message-actions-bar').forEach(el => el.remove()); // إزالة الأزرار
    tempContainer.appendChild(contentClone);

    // 4. إضافة تذييل (الرابط والدعوة)
    const footer = document.createElement('div');
    footer.innerHTML = `
        <div style="margin-top:20px; padding-top:10px; border-top:1px dashed #ccc; text-align:center; color:#555; font-size:13px;">
            <p style="margin:5px 0;">🚀 تم الحل باستخدام الذكاء الاصطناعي</p>
            <p style="margin:0; font-weight:bold; color:var(--primary-color);">www.mathassistant.com</p>
        </div>
    `;
        tempContainer.appendChild(footer);

        document.body.appendChild(tempContainer);
        this.applyExportContrastStyles(tempContainer);

        try {
            // تحويل الحاوية المصممة إلى صورة
            const canvas = await html2canvas(tempContainer, { scale: 3, useCORS: true, backgroundColor: '#ffffff' });
        
        // ... (باقي كود المشاركة كما هو: Capacitor أو Web Share API) ...
        // (انسخ باقي المنطق من الكود القديم هنا)
        
        if (window.MathApp.isCapacitor()) {
             const base64Data = canvas.toDataURL('image/png');
             const { Share } = Capacitor.Plugins;
             await Share.share({ url: base64Data });
        } else {
             canvas.toBlob(async (blob) => {
                const file = new File([blob], "math-solution.png", { type: "image/png" });
                if (navigator.share) {
                    await navigator.share({ files: [file], title: 'حل المسألة' });
                } else {
                    saveAs(blob, 'math-solution.png');
                }
             });
        }

    } catch (error) {
        console.error(error);
        window.MathApp.ui.showToast('فشل إنشاء الصورة', 'error');
    } finally {
        document.body.removeChild(tempContainer);
    }
}
    }
    // ==========================================================

  // ==================== ui ====================
// ==================== UI MODULE (UPDATED) ====================
export const ui = {
    // --- دالة مركزية لإغلاق كل القوائم والنوافذ المنبثقة ---
    closeAllOverlays() {
        // 1. إغلاق القائمة الجانبية (Sidebar)
        if (window.MathApp.dom.sidebarNav) {
            window.MathApp.dom.sidebarNav.classList.remove('open');
        }
        const sidebarBackdrop = document.getElementById('sidebarBackdrop');
        if (sidebarBackdrop) sidebarBackdrop.classList.remove('open');

        // 2. إغلاق القائمة السفلية (Bottom Nav)
        if (window.MathApp.dom.bottomNavMenu) {
            window.MathApp.dom.bottomNavMenu.classList.remove('open');
        }
        const bottomNavBackdrop = document.getElementById('bottomNavBackdrop');
        if (bottomNavBackdrop) bottomNavBackdrop.classList.remove('open');
        if (window.MathApp.dom.plusBtn) {
            window.MathApp.dom.plusBtn.classList.remove('is-open');
        }

        // 3. إغلاق جميع القوائم المنسدلة (Dropdowns)
        document.querySelectorAll('.dropdown-content, .chat-options-dropdown').forEach(el => {
            el.classList.remove('show');
            this.resetDropdownPosition(el);
        });
        const exportBtn = document.getElementById('toggleExportDropdownBtn');
        if (exportBtn) {
            exportBtn.classList.remove('is-open');
            exportBtn.querySelector('.sidebar-chevron')?.classList.remove('is-open');
        }

        // 4. إغلاق قائمة التواصل (Contact Menu) داخل السايدبار
        this.hideContactMenu();
    },

    // --- الوظائف الأساسية ---

    rateMessage(buttonElement, rating) {
        const actionsContainer = buttonElement.parentElement;
        if (actionsContainer) {
            actionsContainer.querySelectorAll('.rate-good-btn, .rate-bad-btn, .action-icon-btn').forEach(btn => {
                btn.style.opacity = '0.5';
                btn.style.pointerEvents = 'none';
            });
        }
        buttonElement.style.opacity = '1';
        buttonElement.style.background = 'var(--primary-color)';
        buttonElement.style.color = '#ffffff';
        buttonElement.style.borderColor = 'var(--primary-color)';
        window.MathApp.ui.showToast('شكراً لتقييمك!', false);
    },

    showToast(message, type = '') {
        const toast = document.getElementById('toast-message');
        if (!toast) return;
        toast.textContent = message;
        toast.className = `toast-message ${type === 'error' ? 'error' : ''}`;
        toast.classList.add('show');
        clearTimeout(window.MathApp.toastTimeout);
        window.MathApp.toastTimeout = setTimeout(() => toast.classList.remove('show'), 3000);
    },

    createMessage(content, type) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message-bubble');
        messageElement.classList.add(type === 'ai' ? 'outgoing' : 'incoming');
        const formattedContent = content.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        messageElement.innerHTML = `<p>${formattedContent}</p>`;
        window.MathApp.dom.chatMessages.appendChild(messageElement);
        window.MathApp.ui.renderMathInElement(messageElement);
        window.MathApp.dom.chatMessages.scrollTop = window.MathApp.dom.chatMessages.scrollHeight;
    },

    renderMathInElement(container) {
        if (!container || typeof window.katex === 'undefined') return;

        // Render any unhydrated .math-expression spans first
        container.querySelectorAll('.math-expression[data-latex]').forEach((span) => {
            if (span.querySelector('.katex')) return;
            const latex = span.getAttribute('data-latex') || '';
            const isDisplay = span.parentElement?.classList?.contains('katex-block-container');
            try {
                window.katex.render(latex, span, { throwOnError: false, displayMode: !!isDisplay });
            } catch (e) {
                span.textContent = latex;
            }
        });

        const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'CODE', 'PRE', 'MATH-FIELD']);
        const textNodes = [];
        const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
                const val = node.nodeValue;
                if (!val || (!val.includes('$') && !val.includes('\\(') && !val.includes('\\['))) {
                    return NodeFilter.FILTER_REJECT;
                }
                let p = node.parentElement;
                while (p && p !== container) {
                    if (SKIP_TAGS.has(p.tagName) || p.classList.contains('katex') || p.classList.contains('math-expression')) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    p = p.parentElement;
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        });

        let currentNode;
        while ((currentNode = walker.nextNode())) {
            textNodes.push(currentNode);
        }

        const mathRegex = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|(?<!\\)\$(?!\s)(?:\\.|[^$\n\\])+?(?<!\s)\$)/g;

        textNodes.forEach((node) => {
            const text = node.nodeValue;
            if (!text) return;
            mathRegex.lastIndex = 0;
            if (!mathRegex.test(text)) return;
            mathRegex.lastIndex = 0;

            const fragment = document.createDocumentFragment();
            let lastIdx = 0;
            let match;

            while ((match = mathRegex.exec(text)) !== null) {
                if (match.index > lastIdx) {
                    fragment.appendChild(document.createTextNode(text.slice(lastIdx, match.index)));
                }

                const token = match[0];
                const isBlock = token.startsWith('$$') || token.startsWith('\\[');
                const innerLatex = (token.startsWith('$$') || token.startsWith('\\[') || token.startsWith('\\('))
                    ? token.slice(2, -2).trim()
                    : token.slice(1, -1).trim();

                if (!innerLatex) {
                    fragment.appendChild(document.createTextNode(token));
                } else {
                    const span = document.createElement('span');
                    span.className = 'math-expression';
                    span.setAttribute('data-latex', innerLatex);
                    try {
                        window.katex.render(innerLatex, span, { throwOnError: false, displayMode: isBlock });
                    } catch (e) {
                        span.textContent = innerLatex;
                    }

                    if (isBlock) {
                        const wrapper = document.createElement('div');
                        wrapper.className = 'katex-block-container';
                        wrapper.appendChild(span);
                        fragment.appendChild(wrapper);
                    } else {
                        fragment.appendChild(span);
                    }
                }

                lastIdx = mathRegex.lastIndex;
            }

            if (lastIdx < text.length) {
                fragment.appendChild(document.createTextNode(text.slice(lastIdx)));
            }

            node.parentNode?.replaceChild(fragment, node);
        });
    },

    showConfirm(message, callback) {
        const confirmDiv = document.createElement('div');
        confirmDiv.className = 'custom-dialog-backdrop';
        confirmDiv.innerHTML = `
            <div class="custom-dialog-card" role="dialog" aria-modal="true">
                <h3>تأكيد الإجراء</h3>
                <p></p>
                <div class="custom-dialog-actions">
                    <button type="button" id="cancelConfirm" class="btn btn-secondary">إلغاء</button>
                    <button type="button" id="okConfirm" class="btn btn-delete">تأكيد</button>
                </div>
            </div>
        `;
        confirmDiv.querySelector('p').textContent = message;
        document.body.appendChild(confirmDiv);
        confirmDiv.querySelector('#cancelConfirm').onclick = () => confirmDiv.remove();
        confirmDiv.querySelector('#okConfirm').onclick = () => { callback(); confirmDiv.remove(); };
    },

    showPrompt(options = {}) {
        const {
            title = 'إدخال قيمة',
            message = '',
            placeholder = '',
            defaultValue = '',
            inputType = 'text',
            suggestions = [],
            confirmText = 'تأكيد',
            cancelText = 'إلغاء'
        } = typeof options === 'string' ? { message: options } : options;

        return new Promise((resolve) => {
            const backdrop = document.createElement('div');
            backdrop.className = 'custom-dialog-backdrop';
            backdrop.innerHTML = `
                <div class="custom-dialog-card" role="dialog" aria-modal="true">
                    <h3></h3>
                    ${message ? '<p class="custom-dialog-msg"></p>' : ''}
                    ${Array.isArray(suggestions) && suggestions.length ? '<div class="custom-dialog-suggestions"></div>' : ''}
                    <input class="math-input custom-dialog-input" />
                    <div class="custom-dialog-actions">
                        <button type="button" class="btn btn-secondary custom-dialog-cancel"></button>
                        <button type="button" class="btn btn-primary custom-dialog-ok"></button>
                    </div>
                </div>
            `;

            backdrop.querySelector('h3').textContent = title;
            const msgEl = backdrop.querySelector('.custom-dialog-msg');
            if (msgEl) msgEl.textContent = message;

            const input = backdrop.querySelector('.custom-dialog-input');
            input.type = inputType;
            input.placeholder = placeholder;
            input.value = defaultValue;

            const cancelBtn = backdrop.querySelector('.custom-dialog-cancel');
            const okBtn = backdrop.querySelector('.custom-dialog-ok');
            cancelBtn.textContent = cancelText;
            okBtn.textContent = confirmText;

            const sugContainer = backdrop.querySelector('.custom-dialog-suggestions');
            if (sugContainer) {
                suggestions.forEach((item) => {
                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = 'dialog-suggestion-btn';
                    btn.textContent = item;
                    btn.addEventListener('click', () => {
                        input.value = item;
                        input.focus();
                    });
                    sugContainer.appendChild(btn);
                });
            }

            const cleanup = (val) => {
                backdrop.remove();
                resolve(val);
            };

            cancelBtn.addEventListener('click', () => cleanup(null));
            okBtn.addEventListener('click', () => cleanup(input.value.trim() || null));
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    cleanup(input.value.trim() || null);
                } else if (e.key === 'Escape') {
                    cleanup(null);
                }
            });

            document.body.appendChild(backdrop);
            setTimeout(() => input.focus(), 40);
        });
    },

    initProfileUI() {
        if (this._profileUIInitialized) return;
        this._profileUIInitialized = true;

        const colorPicker = document.getElementById('avatarColorPicker');
        if (colorPicker) {
            colorPicker.addEventListener('click', (e) => {
                const btn = e.target.closest('.avatar-swatch');
                if (!btn) return;
                colorPicker.querySelectorAll('.avatar-swatch').forEach(s => s.classList.remove('active'));
                btn.classList.add('active');
                const color = btn.getAttribute('data-color') || '#1d4ed8';
                try { localStorage.setItem('user_avatar_color', color); } catch (err) { /* ignore */ }
                this.updateProfilePreview();
                window.MathApp?.auth?.renderStatus?.();
            });
        }

        const iconPicker = document.getElementById('avatarIconPicker');
        if (iconPicker) {
            iconPicker.addEventListener('click', (e) => {
                const btn = e.target.closest('.avatar-emoji-btn');
                if (!btn) return;
                iconPicker.querySelectorAll('.avatar-emoji-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const icon = btn.getAttribute('data-icon') ?? '';
                try { localStorage.setItem('user_avatar_icon', icon); } catch (err) { /* ignore */ }
                this.updateProfilePreview();
                window.MathApp?.auth?.renderStatus?.();
            });
        }

        ['settingsDisplayName', 'settingsGradeDetail', 'settingsStage', 'settingsGoal', 'settingsCountry'].forEach((id) => {
            const el = document.getElementById(id);
            if (!el) return;
            const evt = el.tagName === 'SELECT' ? 'change' : 'input';
            el.addEventListener(evt, () => this.updateProfilePreview());
        });

        window.addEventListener('mathaiStatsUpdated', () => {
            this.updateProfilePreview();
        });
    },

    updateProfilePreview() {
        const user = window.MathApp?.auth?.currentUser || null;
        const nameEl = document.getElementById('settingsDisplayName');
        const gradeEl = document.getElementById('settingsGradeDetail');
        const stageEl = document.getElementById('settingsStage');
        const goalEl = document.getElementById('settingsGoal');
        const countryEl = document.getElementById('settingsCountry');

        let storedName = '';
        let storedColor = '#2563eb';
        let storedIcon = '';
        let storedGrade = '';
        let storedGoal = 'concept_mastery';
        let storedCountry = '';
        let localSolved = 0;
        let aiSolved = 0;
        let savedChatsCount = 0;

        try {
            storedName = localStorage.getItem('user_display_name') || '';
            const rawStoredColor = localStorage.getItem('user_avatar_color') || '#2563eb';
            storedColor = rawStoredColor === '#008069' ? '#2563eb' : rawStoredColor;
            storedIcon = localStorage.getItem('user_avatar_icon') || '';
            storedGrade = localStorage.getItem('user_grade_detail') || '';
            storedGoal = localStorage.getItem('user_learning_goal') || 'concept_mastery';
            storedCountry = localStorage.getItem('user_country') || '';
            localSolved = parseInt(localStorage.getItem('mathai_stats_local_solved') || '0', 10) || 0;
            aiSolved = parseInt(localStorage.getItem('mathai_stats_ai_solved') || '0', 10) || 0;
            const rawChats = localStorage.getItem('localSavedChats');
            if (rawChats) {
                const parsed = JSON.parse(rawChats);
                if (Array.isArray(parsed)) savedChatsCount = parsed.length;
            }
        } catch (e) { /* ignore */ }

        const dict = getLocaleDict();
        const displayName = (nameEl && nameEl.value.trim()) || user?.displayName || storedName || dict.defaultStudent;
        const gradeDetail = (gradeEl && gradeEl.value.trim()) || storedGrade;
        const stageKey = (stageEl && stageEl.value) || window.MathApp?.state?.currentStage || 'secondary';
        const goalKey = (goalEl && goalEl.value) || storedGoal;
        const country = (countryEl && countryEl.value.trim()) || storedCountry;

        const stageLabels = dict.stageLabels || {};
        const goalLabels = dict.goalLabels || {};

        const avatarText = storedIcon || Array.from(displayName.trim())[0] || 'م';

        const previewAvatar = document.getElementById('profilePreviewAvatar');
        if (previewAvatar) {
            previewAvatar.textContent = avatarText;
            previewAvatar.style.background = storedColor;
        }

        const heroCard = document.getElementById('profileHeroPreview');
        if (heroCard) {
            heroCard.style.background = `linear-gradient(135deg, ${storedColor} 0%, #0f172a 100%)`;
        }

        const previewName = document.getElementById('profilePreviewName');
        if (previewName) previewName.textContent = displayName;

        const authBadge = document.getElementById('profileAuthBadge');
        if (authBadge) {
            if (user) {
                authBadge.textContent = dict.authVerified;
                authBadge.classList.remove('is-guest');
                authBadge.classList.add('is-verified');
            } else {
                authBadge.textContent = dict.guestMode;
                authBadge.classList.remove('is-verified');
                authBadge.classList.add('is-guest');
            }
        }

        const metaParts = [stageLabels[stageKey] || stageLabels.secondary || stageKey];
        if (gradeDetail) metaParts.push(gradeDetail);
        if (country) metaParts.push(country);
        if (goalLabels[goalKey]) metaParts.push(goalLabels[goalKey]);

        const previewMeta = document.getElementById('profilePreviewMeta');
        if (previewMeta) previewMeta.textContent = metaParts.join(' • ');

        const statLocalEl = document.getElementById('statLocalSolved');
        const statAiEl = document.getElementById('statAiSolved');
        const statChatsEl = document.getElementById('statSavedChats');
        if (statLocalEl) statLocalEl.textContent = String(localSolved);
        if (statAiEl) statAiEl.textContent = String(aiSolved);
        if (statChatsEl) statChatsEl.textContent = String(savedChatsCount);
    },

    openSettings() {
        this.closeAllOverlays();
        const modal = document.getElementById('settingsModal');
        if (!modal) return;
        this.initProfileUI();
        this.populateSettingsForm();
        if (window.MathApp && window.MathApp.auth && typeof window.MathApp.auth.renderStatus === 'function') {
            window.MathApp.auth.renderStatus();
        }
        this.updateProfilePreview();
        modal.style.display = 'block';
    },

    closeSettings() {
        const modal = document.getElementById('settingsModal');
        if (modal) modal.style.display = 'none';
    },

    populateSettingsForm() {
        const nameInput = document.getElementById('settingsDisplayName');
        const gradeInput = document.getElementById('settingsGradeDetail');
        const stageSelect = document.getElementById('settingsStage');
        const goalSelect = document.getElementById('settingsGoal');
        const explanationSelect = document.getElementById('settingsExplanationMode');
        const languageSelect = document.getElementById('settingsLanguage');
        const countryInput = document.getElementById('settingsCountry');
        const bioInput = document.getElementById('settingsBio');

        const user = window.MathApp && window.MathApp.auth ? window.MathApp.auth.currentUser : null;
        const safeGet = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };

        if (nameInput) nameInput.value = safeGet('user_display_name') || user?.displayName || '';
        if (gradeInput) gradeInput.value = safeGet('user_grade_detail') || '';

        const savedStage = safeGet('ai_stage') || window.MathApp?.state?.currentStage || 'secondary';
        if (stageSelect) stageSelect.value = savedStage;

        const savedGoal = safeGet('user_learning_goal') || 'concept_mastery';
        if (goalSelect) goalSelect.value = savedGoal;

        const mode = safeGet('ai_explain_mode') || window.MathApp?.config?.explanationMode || 'detailed';
        if (explanationSelect) explanationSelect.value = mode;

        const lang = safeGet('app_language') || 'ar';
        if (languageSelect) languageSelect.value = lang;

        if (countryInput) countryInput.value = safeGet('user_country') || '';
        if (bioInput) bioInput.value = safeGet('user_bio') || '';

        const rawColor = safeGet('user_avatar_color') || '#2563eb';
        const savedColor = rawColor === '#008069' ? '#2563eb' : rawColor;
        document.querySelectorAll('#avatarColorPicker .avatar-swatch').forEach((s) => {
            s.classList.toggle('active', s.getAttribute('data-color') === savedColor);
        });

        const savedIcon = safeGet('user_avatar_icon') ?? '';
        document.querySelectorAll('#avatarIconPicker .avatar-emoji-btn').forEach((b) => {
            b.classList.toggle('active', (b.getAttribute('data-icon') ?? '') === savedIcon);
        });

        this.updateProfilePreview();
    },

    saveSettings() {
        const nameInput = document.getElementById('settingsDisplayName');
        const gradeInput = document.getElementById('settingsGradeDetail');
        const stageSelect = document.getElementById('settingsStage');
        const goalSelect = document.getElementById('settingsGoal');
        const explanationSelect = document.getElementById('settingsExplanationMode');
        const languageSelect = document.getElementById('settingsLanguage');
        const countryInput = document.getElementById('settingsCountry');
        const bioInput = document.getElementById('settingsBio');

        const displayName = nameInput ? nameInput.value.trim() : '';
        try {
            if (displayName) localStorage.setItem('user_display_name', displayName);
            else localStorage.removeItem('user_display_name');
        } catch (e) { /* ignore */ }

        const gradeDetail = gradeInput ? gradeInput.value.trim() : '';
        try {
            if (gradeDetail) localStorage.setItem('user_grade_detail', gradeDetail);
            else localStorage.removeItem('user_grade_detail');
        } catch (e) { /* ignore */ }

        if (goalSelect) {
            try { localStorage.setItem('user_learning_goal', goalSelect.value || 'concept_mastery'); } catch (e) { /* ignore */ }
        }

        if (displayName && window.MathApp && window.MathApp.auth && typeof window.MathApp.auth.updateDisplayName === 'function') {
            void window.MathApp.auth.updateDisplayName(displayName);
        }

        const nextLang = languageSelect ? (languageSelect.value || 'ar') : getAppLanguage();
        try { localStorage.setItem('app_language', nextLang); } catch (e) { /* ignore */ }
        const dict = getLocaleDict(nextLang);

        if (stageSelect && window.MathApp && window.MathApp.stage && typeof window.MathApp.stage.select === 'function') {
            const stageValue = stageSelect.value || 'secondary';
            const label = (dict.stageLabels && dict.stageLabels[stageValue]) || stageValue;
            window.MathApp.stage.select(stageValue, label);
        }

        if (explanationSelect && window.MathApp && typeof window.MathApp.setExplanationMode === 'function') {
            const mode = explanationSelect.value === 'quick' ? 'quick' : 'detailed';
            const label = (dict.explainLabels && dict.explainLabels[mode]) || mode;
            window.MathApp.setExplanationMode(mode, label);
        }

        applyLanguage(nextLang);

        const country = countryInput ? countryInput.value.trim() : '';
        try {
            if (country) localStorage.setItem('user_country', country);
            else localStorage.removeItem('user_country');
        } catch (e) { /* ignore */ }

        const bio = bioInput ? bioInput.value.trim() : '';
        try {
            if (bio) localStorage.setItem('user_bio', bio);
            else localStorage.removeItem('user_bio');
        } catch (e) { /* ignore */ }

        if (window.MathApp && window.MathApp.auth && typeof window.MathApp.auth.renderStatus === 'function') {
            window.MathApp.auth.renderStatus();
        }
        this.updateProfilePreview();
        this.showToast('✅ تم حفظ الملف الشخصي بنجاح');
        this.closeSettings();
    },

    resetDropdownPosition(dropdown) {
        if (!dropdown) return;
        if (dropdown.dataset.portalized === 'true' && dropdown._portalParent) {
            const parent = dropdown._portalParent;
            const next = dropdown._portalNextSibling;
            if (next && next.parentNode === parent) {
                parent.insertBefore(dropdown, next);
            } else {
                parent.appendChild(dropdown);
            }
            dropdown.dataset.portalized = '';
            dropdown._portalParent = null;
            dropdown._portalNextSibling = null;
            dropdown._portalTrigger = null;
        }
        dropdown.style.position = '';
        dropdown.style.left = '';
        dropdown.style.right = '';
        dropdown.style.top = '';
        dropdown.style.bottom = '';
        dropdown.style.marginTop = '';
        dropdown.style.marginBottom = '';
        dropdown.style.zIndex = '';
        dropdown.style.transform = '';
        dropdown.style.maxWidth = '';
    },

    positionDropdownInViewport(dropdown, trigger, zIndex = '99999') {
        if (!dropdown || !trigger) return;
        if (dropdown.dataset.portalized !== 'true') {
            dropdown._portalParent = dropdown.parentElement;
            dropdown._portalNextSibling = dropdown.nextSibling;
            dropdown._portalTrigger = trigger;
            dropdown.dataset.portalized = 'true';
            document.body.appendChild(dropdown);
        }

        dropdown.style.position = 'fixed';
        dropdown.style.right = 'auto';
        dropdown.style.bottom = 'auto';
        dropdown.style.marginTop = '0';
        dropdown.style.marginBottom = '0';
        dropdown.style.zIndex = zIndex;
        dropdown.style.maxWidth = `min(240px, calc(100vw - 16px))`;

        const triggerRect = trigger.getBoundingClientRect();
        const dropdownRect = dropdown.getBoundingClientRect();
        const spacing = 6;

        let top = triggerRect.bottom + spacing;
        if (top + dropdownRect.height > window.innerHeight - spacing) {
            top = Math.max(spacing, triggerRect.top - dropdownRect.height - spacing);
        }

        let left = triggerRect.left;
        const minLeft = spacing;
        const maxLeft = Math.max(spacing, window.innerWidth - dropdownRect.width - spacing);
        left = Math.min(Math.max(left, minLeft), maxLeft);

        dropdown.style.top = `${Math.round(top)}px`;
        dropdown.style.left = `${Math.round(left)}px`;
    },

    // --- تم التعديل: التعامل مع القوائم المنسدلة ---
    toggleDropdown(id) {
        const dropdown = document.getElementById(id);
        if (!dropdown) return;
        const isCurrentlyOpen = dropdown.classList.contains('show');
        const isInSidebar = !!dropdown.closest('.sidebar-nav');

        if (isInSidebar) {
            // أغلق القوائم الأخرى بدون إغلاق السايدبار
            document.querySelectorAll('.dropdown-content').forEach(el => {
                if (el !== dropdown) {
                    el.classList.remove('show');
                    this.resetDropdownPosition(el);
                }
            });
            // أغلق القائمة السفلية وقائمة التواصل إن وُجدت
            if (window.MathApp.dom.bottomNavMenu) {
                window.MathApp.dom.bottomNavMenu.classList.remove('open');
            }
            const bottomNavBackdrop = document.getElementById('bottomNavBackdrop');
            if (bottomNavBackdrop) bottomNavBackdrop.classList.remove('open');
            if (window.MathApp.dom.plusBtn) {
                window.MathApp.dom.plusBtn.classList.remove('is-open');
            }
            this.hideContactMenu();
        } else {
            // أغلق كل شيء أولاً
            this.closeAllOverlays();
        }

        // إذا كانت مفتوحة، أغلقها
        const triggerBtn = (id === 'exportDropdown' ? document.getElementById('toggleExportDropdownBtn') : null)
            || dropdown.previousElementSibling
            || dropdown.parentElement?.querySelector('button');
        if (isCurrentlyOpen) {
            dropdown.classList.remove('show');
            if (triggerBtn) {
                triggerBtn.classList.remove('is-open');
                triggerBtn.querySelector('.sidebar-chevron')?.classList.remove('is-open');
            }
            this.resetDropdownPosition(dropdown);
            return;
        }

        // إذا لم تكن مفتوحة سابقاً، افتحها الآن
        dropdown.classList.add('show');
        if (triggerBtn && isInSidebar) {
            triggerBtn.classList.add('is-open');
            triggerBtn.querySelector('.sidebar-chevron')?.classList.add('is-open');
        }
        const isChatToolbar = dropdown.closest('.chat-options-bar');
        if (isChatToolbar) {
            this.positionDropdownInViewport(dropdown, triggerBtn);
        } else {
            this.resetDropdownPosition(dropdown);
        }
    },

    // --- تم التعديل: التعامل مع القائمة السفلية ---
    toggleBottomNav() {
        const nav = window.MathApp.dom.bottomNavMenu;
        const backdrop = document.getElementById('bottomNavBackdrop');
        const isCurrentlyOpen = nav.classList.contains('open');

        // أغلق كل شيء أولاً
        this.closeAllOverlays();

        // إذا لم تكن مفتوحة سابقاً، افتحها الآن
        if (!isCurrentlyOpen) {
            nav.classList.add('open');
            if (backdrop) backdrop.classList.add('open');
            if (window.MathApp.dom.plusBtn) {
                window.MathApp.dom.plusBtn.classList.add('is-open');
            }
        }
    },

    closeBottomNav() {
        if (window.MathApp.dom.bottomNavMenu) {
            window.MathApp.dom.bottomNavMenu.classList.remove('open');
        }
        const backdrop = document.getElementById('bottomNavBackdrop');
        if (backdrop) backdrop.classList.remove('open');
        if (window.MathApp.dom.plusBtn) {
            window.MathApp.dom.plusBtn.classList.remove('is-open');
        }
    },

    // --- تم التعديل: التعامل مع القائمة الجانبية (Sidebar) ---
    openSidebar() {
        // أغلق كل شيء أولاً
        this.closeAllOverlays();

        // ثم افتح السايدبار
        window.MathApp.dom.sidebarNav.classList.add('open');
        const sidebarBackdrop = document.getElementById('sidebarBackdrop');
        if (sidebarBackdrop) sidebarBackdrop.classList.add('open');

        // إعادة تعيين حالة زر التواصل داخل السايدبار
        this.hideContactMenu();
    },

    closeSidebar() {
        document.querySelectorAll('.chat-options-dropdown.show').forEach(el => {
            el.classList.remove('show');
            this.resetDropdownPosition(el);
        });
        if (window.MathApp.dom.sidebarNav) {
            window.MathApp.dom.sidebarNav.classList.remove('open');
        }
        const sidebarBackdrop = document.getElementById('sidebarBackdrop');
        if (sidebarBackdrop) sidebarBackdrop.classList.remove('open');
    },

    showContactMenu() {
        if (window.MathApp.dom.showContactBtn) window.MathApp.dom.showContactBtn.style.display = 'none';
        if (window.MathApp.dom.contactMenu) window.MathApp.dom.contactMenu.style.display = 'block';
    },

    hideContactMenu() {
        if (window.MathApp.dom.contactMenu) window.MathApp.dom.contactMenu.style.display = 'none';
        if (window.MathApp.dom.showContactBtn) window.MathApp.dom.showContactBtn.style.display = 'flex';
    }
};
