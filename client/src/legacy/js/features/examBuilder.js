export const ExamBuilder = {
    state: {
        attachedFile: null, // { content, type, name }
        currentExam: null,  // تخزين بيانات الامتحان المولد
        userAnswers: {}
    },
    dom: {},

    init() {
        this.dom.modal = document.getElementById('exam-builder-modal');
        this.dom.uploadZone = document.getElementById('exam-upload-zone');
        this.dom.fileInput = document.getElementById('exam-file-input');
        this.dom.setupPanel = document.getElementById('exam-setup-panel');
        this.dom.displayPanel = document.getElementById('exam-display-panel');
        this.dom.questionsContainer = document.getElementById('exam-questions-container');
        
        // Event Listeners
        this.dom.uploadZone.addEventListener('click', () => this.dom.fileInput.click());
        this.dom.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        document.getElementById('generate-exam-btn').addEventListener('click', () => this.generateExam());
        document.getElementById('submit-exam-btn').addEventListener('click', () => this.gradeExam());
        document.getElementById('new-exam-btn').addEventListener('click', () => this.reset());
    },

    open() {
        this.reset();
        this.dom.modal.style.display = 'flex';
    },

    reset() {
        this.state.attachedFile = null;
        this.state.currentExam = null;
        this.state.userAnswers = {};
        if (this.dom.fileInput) this.dom.fileInput.value = '';
        this.clearFile();
        this.dom.setupPanel.style.display = 'block';
        this.dom.displayPanel.style.display = 'none';
        this.dom.questionsContainer.innerHTML = '';
        const submitBtn = document.getElementById('submit-exam-btn');
        if (submitBtn) submitBtn.style.display = '';
    },

    async handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        window.MathApp.ui.showToast('جاري معالجة الملف...', false);

        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.state.attachedFile = {
                    content: e.target.result.split(',')[1],
                    type: file.type,
                    name: file.name,
                    isImage: true
                };
                this.updateFilePreview();
                window.MathApp.ui.showToast('✅ تم تجهيز صورة النموذج!', false);
            };
            reader.readAsDataURL(file);
        } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
            try {
                if (typeof pdfjsLib === 'undefined') {
                    throw new Error('مكتبة PDF غير متاحة حالياً.');
                }
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                const page = await pdf.getPage(1);
                const viewport = page.getViewport({ scale: 1.6 });
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                await page.render({ canvasContext: ctx, viewport }).promise;

                const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
                let extractedText = '';
                const pagesToRead = Math.min(pdf.numPages, 3);
                for (let p = 1; p <= pagesToRead; p++) {
                    const pObj = await pdf.getPage(p);
                    const tc = await pObj.getTextContent();
                    const pTxt = tc.items.map((it) => it.str).join(' ').trim();
                    if (pTxt) extractedText += `\n--- Page ${p} ---\n${pTxt}`;
                }

                this.state.attachedFile = {
                    content: dataUrl.split(',')[1],
                    textFallback: extractedText.trim(),
                    type: 'image/jpeg',
                    name: `${file.name} (${pdf.numPages} صفحة)`,
                    isImage: true
                };
                this.updateFilePreview();
                window.MathApp.ui.showToast('✅ تم تحويل صفحة PDF إلى نموذج جاهز للتحليل!', false);
            } catch (err) {
                console.error('ExamBuilder PDF error:', err);
                window.MathApp.ui.showToast(`❌ تعذر قراءة ملف PDF: ${err.message}`, 'error');
            }
        }
    },

    updateFilePreview() {
        document.getElementById('exam-file-preview').style.display = 'flex';
        document.getElementById('exam-file-name').textContent = this.state.attachedFile.name;
        this.dom.uploadZone.style.display = 'none';
    },

    clearFile() {
        this.state.attachedFile = null;
        document.getElementById('exam-file-preview').style.display = 'none';
        this.dom.uploadZone.style.display = 'block';
    },

    async generateExam() {
        // 1. التحقق من وجود الملف
        if (!this.state.attachedFile) {
            window.MathApp.ui.showToast('الرجاء رفع نموذج أو صورة أولاً.', 'error');
            return;
        }

        const qCount = document.getElementById('exam-question-count').value;
        const difficulty = document.getElementById('exam-difficulty').value;

        window.MathApp.ui.showToast('⏳ جاري تحليل النموذج وتوليد الامتحان... (انتظر قليلاً)');

        const extraPdfText = this.state.attachedFile.textFallback
            ? `\nExtracted PDF Text Context:\n${this.state.attachedFile.textFallback.slice(0, 4000)}\n`
            : '';

        const promptText = `
            You are a professional educational exam creator.
            Task: Analyze the attached exam image/document and create a BRAND NEW practice exam that mimics its style, structure, and mathematical level.
            ${extraPdfText}
            Settings:
            - Number of Questions: ${qCount === 'same' ? 'Same quantity as the original' : qCount}
            - Difficulty: ${difficulty === 'match' ? 'Same difficulty' : (difficulty === 'harder' ? 'Slightly harder' : 'Slightly easier')}
            - Language: Arabic (Use KaTeX $...$ for math expressions).

            **IMPORTANT RESPONSE FORMAT**:
            Return ONLY valid JSON without markdown backticks:
            {
                "title": "عنوان الامتحان",
                "questions": [
                    {
                        "id": 1,
                        "type": "mcq",
                        "text": "نص السؤال بالعربية مع $...$",
                        "options": ["أ", "ب", "ج", "د"],
                        "correctAnswer": "الخيار الصحيح",
                        "explanation": "شرح مختصر"
                    }
                ]
            }
        `;

        const parts = [{ text: promptText }];
        if (this.state.attachedFile.content && this.state.attachedFile.type) {
            parts.push({
                inlineData: {
                    mimeType: this.state.attachedFile.type,
                    data: this.state.attachedFile.content
                }
            });
        }

        try {
            const API_BASE = window.MathApp.config.apiBaseUrl || '/api/gemini';
            const MODEL = window.MathApp.config.model;
            if (!API_BASE) {
                window.MathApp.ui.showToast('لم يتم إعداد خادم الوسيط (API_BASE_URL).', 'error');
                return;
            }
            if (!MODEL) {
                window.MathApp.ui.showToast('لم يتم تحديد النموذج (model).', 'error');
                return;
            }

            const API_URL = (() => {
                try {
                    const url = new URL(API_BASE, window.location.origin);
                    url.searchParams.set('model', MODEL);
                    return url.toString();
                } catch (e) {
                    const sep = API_BASE.includes('?') ? '&' : '?';
                    return `${API_BASE}${sep}model=${encodeURIComponent(MODEL)}`;
                }
            })();

            const controller = new AbortController();
            const timeout = setTimeout(() => {
                controller.abort(new Error('EXAM_TIMEOUT'));
            }, 90000);

            let response;
            try {
                response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    signal: controller.signal,
                    body: JSON.stringify({
                        thinkingLevel: 'LOW',
                        contents: [{ parts: parts }]
                    })
                });
            } finally {
                clearTimeout(timeout);
            }

            if (!response.ok) {
                const rawErr = await response.text();
                let errMsg = `HTTP Error: ${response.status}`;
                try {
                    const errData = JSON.parse(rawErr);
                    errMsg = errData?.error?.message || errMsg;
                } catch (e) { /* ignore non-JSON */ }
                console.warn("Exam API Error Details:", response.status, errMsg);
                throw new Error(errMsg);
            }

            const data = await response.json();

            let textResponse = data.text || data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            
            // 4. تنظيف الرد لاستخراج JSON فقط
            // إزالة أي علامات markdown قد يضيفها الذكاء الاصطناعي
            textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            
            // محاولة العثور على بداية ونهاية الـ JSON الحقيقي
            const firstBrace = textResponse.indexOf('{');
            const lastBrace = textResponse.lastIndexOf('}');
            
            if (firstBrace !== -1 && lastBrace !== -1) {
                textResponse = textResponse.substring(firstBrace, lastBrace + 1);
            }

            const examData = JSON.parse(textResponse);
            
            window.MathApp.ui.showToast('✅ تم توليد الامتحان بنجاح!', false);
            this.renderExam(examData);

        } catch (error) {
            console.warn('Exam Generation Error:', error);
            const isTimeout = error?.name === 'AbortError' || error?.message === 'EXAM_TIMEOUT';
            const msg = isTimeout
                ? 'انتهت مهلة توليد الامتحان، يرجى المحاولة مرة أخرى.'
                : (error?.message || 'حدث خطأ غير متوقع.');
            window.MathApp.ui.showToast(`❌ تعذر توليد الامتحان: ${msg}`, 'error');
        }
    },
      
    renderExam(examData) {
        if (!examData || !Array.isArray(examData.questions) || examData.questions.length === 0) {
            window.MathApp.ui.showToast('❌ تعذر تحليل أسئلة الاختبار من الاستجابة. حاول مجدداً.', 'error');
            return;
        }
        this.state.currentExam = examData;
        this.dom.setupPanel.style.display = 'none';
        this.dom.displayPanel.style.display = 'flex';
        const container = this.dom.questionsContainer;
        
        container.innerHTML = `<h3 style="text-align:center; color:var(--primary-color); margin:0 0 8px;">${examData.title || 'اختبار رياضيات'}</h3>`;

        examData.questions.forEach((q, index) => {
            const qDiv = document.createElement('div');
            qDiv.className = 'exam-question-card';

            // نص السؤال مع دعم KaTeX
            let qText = `<div style="font-weight:700; margin-bottom:10px; color:var(--text-color);">س${index+1}: ${q.text}</div>`;
            
            // خيارات الإجابة
            if (q.type === 'mcq' && Array.isArray(q.options)) {
                qText += `<div class="options-grid" style="display:grid; gap:8px;">`;
                q.options.forEach((opt, optIdx) => {
                    qText += `
                        <label class="exam-option-label" data-q-index="${index}" data-opt-index="${optIdx}">
                            <input type="radio" name="q_${index}" value="${String(opt).replace(/"/g, '&quot;')}">
                            <span>${opt}</span>
                        </label>
                    `;
                });
                qText += `</div>`;
            } else {
                qText += `<textarea class="math-input" name="q_essay_${index}" placeholder="اكتب إجابتك هنا..." rows="3"></textarea>`;
            }

            // منطقة التصحيح (مخفية)
            qText += `<div class="correction-area" id="correction_${index}" style="display:none; margin-top:12px; background:var(--bg-info); border:1px solid var(--modal-border); padding:10px 12px; border-radius:var(--radius-sm);">
                <strong>الإجابة الصحيحة:</strong> <span class="correct-ans">${q.correctAnswer}</span><br>
                <strong>الشرح:</strong> ${q.explanation || ''}
            </div>`;

            qDiv.innerHTML = qText;
            container.appendChild(qDiv);
        });

        const submitBtn = document.getElementById('submit-exam-btn');
        if (submitBtn) submitBtn.style.display = '';

        // تفعيل KaTeX على الأسئلة الجديدة
        window.MathApp.ui.renderMathInElement(container);
    },

    gradeExam() {
        const questions = this.state.currentExam?.questions || [];
        if (!questions.length) return;

        const normalizeVal = (val) => String(val ?? '')
            .replace(/\$+/g, '')
            .replace(/\s+/g, '')
            .trim()
            .toLowerCase();

        const letterMap = { 'أ': 0, 'ا': 0, 'a': 0, 'ب': 1, 'b': 1, 'ج': 2, 'c': 2, 'د': 3, 'd': 3 };

        let mcqCount = 0;
        let correctCount = 0;
        let answeredCount = 0;

        questions.forEach((q, index) => {
            const correctionDiv = document.getElementById(`correction_${index}`);
            if (correctionDiv) correctionDiv.style.display = 'block';

            if (q.type === 'mcq' && Array.isArray(q.options)) {
                mcqCount += 1;
                const selectedInput = document.querySelector(`input[name="q_${index}"]:checked`);
                const selectedVal = selectedInput ? selectedInput.value : '';
                if (selectedInput) answeredCount += 1;

                const normCorrect = normalizeVal(q.correctAnswer);
                let correctIdx = q.options.findIndex((opt) => normalizeVal(opt) === normCorrect);
                if (correctIdx === -1 && normCorrect in letterMap && q.options[letterMap[normCorrect]] !== undefined) {
                    correctIdx = letterMap[normCorrect];
                }

                const selectedIdx = selectedInput
                    ? q.options.findIndex((opt) => normalizeVal(opt) === normalizeVal(selectedVal))
                    : -1;

                const isCorrect = selectedInput && (
                    normalizeVal(selectedVal) === normCorrect ||
                    (correctIdx !== -1 && selectedIdx === correctIdx)
                );
                if (isCorrect) correctCount += 1;

                document.querySelectorAll(`.exam-option-label[data-q-index="${index}"]`).forEach((labelEl) => {
                    const idx = Number(labelEl.getAttribute('data-opt-index'));
                    const radio = labelEl.querySelector('input[type="radio"]');
                    if (radio) radio.disabled = true;

                    if (idx === correctIdx) {
                        labelEl.style.borderColor = 'var(--accent-color)';
                        labelEl.style.background = 'rgba(5, 150, 105, 0.12)';
                    } else if (radio?.checked && !isCorrect) {
                        labelEl.style.borderColor = 'var(--delete-bg)';
                        labelEl.style.background = 'rgba(220, 38, 38, 0.12)';
                    }
                });
            }
        });

        const existingSummary = document.getElementById('exam-result-summary');
        if (existingSummary) existingSummary.remove();

        const summary = document.createElement('div');
        summary.id = 'exam-result-summary';
        summary.style.cssText = 'background: var(--bg-info); border: 1.5px solid var(--primary-color); border-radius: var(--radius-md); padding: 14px 16px; display: flex; flex-direction: column; gap: 6px;';
        if (mcqCount > 0) {
            const pct = Math.round((correctCount / mcqCount) * 100);
            const verdict = pct >= 85 ? 'أداء ممتاز!' : pct >= 60 ? 'أداء جيد، راجع الأخطاء لتثبيت الفهم.' : 'راجع الحلول النموذجية أدناه وحاول مجدداً.';
            summary.innerHTML = `<strong style="color: var(--primary-color); font-size: 16px;">النتيجة: ${correctCount} / ${mcqCount} (${pct}%)</strong><span style="font-size: 13px; color: var(--text-secondary);">تمت الإجابة عن ${answeredCount} من أصل ${mcqCount} أسئلة موضوعية. ${verdict}</span>`;
        } else {
            summary.innerHTML = `<strong style="color: var(--primary-color); font-size: 16px;">تم إظهار الحلول النموذجية</strong><span style="font-size: 13px; color: var(--text-secondary);">قارن إجاباتك بالحلول والشروحات التفصيلية أدناه.</span>`;
        }

        const container = this.dom.questionsContainer;
        const firstCard = container.querySelector('.exam-question-card');
        if (firstCard) container.insertBefore(summary, firstCard);
        else container.prepend(summary);
        container.scrollTo({ top: 0, behavior: 'smooth' });

        const submitBtn = document.getElementById('submit-exam-btn');
        if (submitBtn) submitBtn.style.display = 'none';
        window.MathApp.ui.showToast(mcqCount > 0 ? `النتيجة: ${correctCount}/${mcqCount}` : 'تم إظهار الإجابات النموذجية!');
    }
};
