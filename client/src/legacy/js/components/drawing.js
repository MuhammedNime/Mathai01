// ==================== DRAWING MODULE ====================
export const drawing = {
    open() {
        window.MathApp.dom.drawingModal.style.display = 'block';
        window.MathApp.drawing.initCanvas();
        window.MathApp.drawing.resizeCanvas();
    },

    close() {
        window.MathApp.dom.drawingModal.style.display = 'none';
    },

    initCanvas() {
        const canvas = window.MathApp.dom.canvas;
        if (!canvas) return;
        window.MathApp.state.ctx = canvas.getContext('2d');
        window.MathApp.state.ctx.lineCap = 'round';
        window.MathApp.state.ctx.lineJoin = 'round';
        const penWidth = document.getElementById('penWidth');
        const penColor = document.getElementById('penColor');
        if (penWidth) window.MathApp.drawing.setPenWidth(penWidth.value);
        if (penColor) window.MathApp.drawing.setPenColor(penColor.value);
        window.MathApp.drawing.clear();
    },

    resizeCanvas() {
        const canvas = window.MathApp.dom.canvas;
        const modalContent = window.MathApp.dom.drawingModal?.querySelector('.modal-content');
        if (!canvas || !modalContent || !window.MathApp.state.ctx) return;

        const hasExisting = canvas.width > 0 && canvas.height > 0;
        let tempCanvas = null;
        if (hasExisting) {
            tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(canvas, 0, 0);
        }

        const measured = modalContent.clientWidth > 0 ? modalContent.clientWidth - 60 : 480;
        const newWidth = Math.max(240, Math.min(480, measured));
        const newHeight = Math.round(newWidth * (320 / 480));

        canvas.width = newWidth;
        canvas.height = newHeight;

        window.MathApp.state.ctx.lineCap = 'round';
        window.MathApp.state.ctx.lineJoin = 'round';
        if (tempCanvas) {
            window.MathApp.state.ctx.drawImage(tempCanvas, 0, 0, newWidth, newHeight);
        } else {
            window.MathApp.drawing.clear();
        }
    },

                setPenWidth(width) {
                    window.MathApp.state.ctx.lineWidth = width;
                },

                setPenColor(color) {
                    window.MathApp.state.ctx.strokeStyle = color;
                },

                getMousePos(e) {
                    const rect = window.MathApp.dom.canvas.getBoundingClientRect();
                    const scaleX = window.MathApp.dom.canvas.width / rect.width;
                    const scaleY = window.MathApp.dom.canvas.height / rect.height;
                    
                    let clientX, clientY;
                    if (e.touches && e.touches.length > 0) {
                        clientX = e.touches[0].clientX;
                        clientY = e.touches[0].clientY;
                    } else {
                        clientX = e.clientX;
                        clientY = e.clientY;
                    }

                    return {
                        x: (clientX - rect.left) * scaleX,
                        y: (clientY - rect.top) * scaleY
                    };
                },

                startDrawing(e) {
                    e.preventDefault();
                    window.MathApp.state.isDrawing = true;
                    const pos = window.MathApp.drawing.getMousePos(e);
                    window.MathApp.state.lastX = pos.x;
                    window.MathApp.state.lastY = pos.y;
                },

                draw(e) {
                    if (!window.MathApp.state.isDrawing) return;
                    e.preventDefault();
                    const pos = window.MathApp.drawing.getMousePos(e);
                    
                    window.MathApp.state.ctx.beginPath();
                    window.MathApp.state.ctx.moveTo(window.MathApp.state.lastX, window.MathApp.state.lastY);
                    window.MathApp.state.ctx.lineTo(pos.x, pos.y);
                    window.MathApp.state.ctx.stroke();

                    window.MathApp.state.lastX = pos.x;
                    window.MathApp.state.lastY = pos.y;
                },

                stopDrawing() {
                    window.MathApp.state.isDrawing = false;
                },

                clear() {
                    window.MathApp.state.ctx.clearRect(0, 0, window.MathApp.dom.canvas.width, window.MathApp.dom.canvas.height);
                    window.MathApp.state.ctx.fillStyle = document.body.classList.contains('dark-mode') ? '#f8fafc' : '#ffffff';
                    window.MathApp.state.ctx.fillRect(0, 0, window.MathApp.dom.canvas.width, window.MathApp.dom.canvas.height);
                },

                process() {
                    const dataURL = window.MathApp.dom.canvas.toDataURL('image/png');
                    window.MathApp.state.selectedImageMimeType = 'image/png';
                    window.MathApp.state.selectedImageBase64 = dataURL.split(',')[1];

                    window.MathApp.drawing.close();
                    window.MathApp.photo.open();
                    window.MathApp.photo.confirm();
                    
                    window.MathApp.ui.showToast('تم إرفاق الرسم بنجاح. أرسل رسالتك الآن.');
                }
            }