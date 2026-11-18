// ==================== PHOTO MODULE ====================
export const photo = {
    open() {
        window.MathApp.dom.photoModal.style.display = 'block';
        window.MathApp.photo.updateReviewArea();
    },

    close() {
        window.MathApp.dom.photoModal.style.display = 'none';
        window.MathApp.photo.stopCamera();
                },

                openCamera() {
                    const cameraArea = document.getElementById('cameraCaptureArea');
                    cameraArea.style.display = 'block';
                    MathApp.dom.confirmImageBtn.disabled = true;

                    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
                        .then(stream => {
                            MathApp.state.cameraStream = stream;
                            MathApp.dom.cameraStream.srcObject = stream;
                        })
                        .catch(err => {
                            console.error("Error accessing camera: ", err);
                            MathApp.ui.showToast("تعذر الوصول إلى الكاميرا. تأكد من إعطاء الأذونات اللازمة.");
                            cameraArea.style.display = 'none';
                        });
                },

                stopCamera() {
                    const cameraArea = document.getElementById('cameraCaptureArea');
                    if (MathApp.state.cameraStream) {
                        MathApp.state.cameraStream.getTracks().forEach(track => track.stop());
                        MathApp.state.cameraStream = null;
                        cameraArea.style.display = 'none';
                    }
                },

                previewFile(event) {
                    const file = event.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            MathApp.state.selectedImageBase64 = e.target.result.split(',')[1];
                            MathApp.state.selectedImageMimeType = file.type;
                            MathApp.photo.updateReviewArea(e.target.result);
                        };
                        reader.readAsDataURL(file);
                        MathApp.photo.stopCamera();
                    }
                },

                capture() {
                    const video = window.MathApp.dom.cameraStream;
                    if (!video || !video.videoWidth || !video.videoHeight) {
                        window.MathApp.ui.showToast('الكاميرا غير جاهزة بعد، انتظر لحظة وحاول مجدداً.', 'error');
                        return;
                    }
                    const canvas = document.createElement('canvas');
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                    const mimeType = 'image/jpeg';
                    const dataURL = canvas.toDataURL(mimeType, 0.9);
                    
                    window.MathApp.state.selectedImageBase64 = dataURL.split(',')[1];
                    window.MathApp.state.selectedImageMimeType = mimeType;
                    window.MathApp.photo.stopCamera();
                    window.MathApp.photo.updateReviewArea(dataURL);
                },

                updateReviewArea(dataURL = null) {
                    const base64Data = dataURL || (window.MathApp.state.selectedImageBase64 ? `data:${window.MathApp.state.selectedImageMimeType};base64,${window.MathApp.state.selectedImageBase64}` : null);

                    if (base64Data) {
                        window.MathApp.dom.reviewImagePreview.src = base64Data;
                        window.MathApp.dom.imageReviewArea.style.display = 'block';
                        window.MathApp.dom.confirmImageBtn.disabled = false;
                        const selectionArea = document.getElementById('photoSelectionArea');
                        if (selectionArea) selectionArea.style.display = 'none';
                    } else {
                        window.MathApp.dom.imageReviewArea.style.display = 'none';
                        window.MathApp.dom.confirmImageBtn.disabled = true;
                        const selectionArea = document.getElementById('photoSelectionArea');
                        if (selectionArea) selectionArea.style.display = 'block';
                    }
                },

                confirm() {
                    window.MathApp.dom.imageAttachedIndicator.style.display = 'flex';
                    window.MathApp.photo.close();
                    if (window.MathApp.updateInputButtons) window.MathApp.updateInputButtons();
                },

                clearAttachment(showConfirm = false) {
                    const doClear = () => {
                        window.MathApp.state.selectedImageBase64 = null;
                        window.MathApp.state.selectedImageMimeType = null;
                        const fileInput = document.getElementById('imageFileInput');
                        if (fileInput) fileInput.value = '';
                        window.MathApp.dom.imageAttachedIndicator.style.display = 'none';
                        window.MathApp.photo.updateReviewArea();
                        window.MathApp.photo.stopCamera();
                        if (window.MathApp.updateInputButtons) window.MathApp.updateInputButtons();
                    };
                    
                    if (showConfirm) {
                        window.MathApp.ui.showConfirm('هل أنت متأكد من إزالة الصورة المرفقة؟', doClear);
                    } else {
                        doClear();
                    }
                }
            };
