// ==================== GEOMETRY WORKSPACE v5.0 - INTERACTIVE CAD STUDIO ====================
import { geometrySolver } from '../solvers/geometrySolver.js';
import { localSolver } from '../localSolver.js';

export const GeometryWorkspace = {
    state: {
        activeTool: 'select',
        scene: {
            points: {},
            objects: [],
            values: {}
        },
        isDragging: false,
        selectedPoint: null,
        selectedObject: null,
        draggingObject: null,
        dragLastPos: null,
        tempPoints: [],
        mousePos: { x: 0, y: 0 },
        canvas: { width: 720, height: 380, dpr: 1, scale: 24 }, // 1 وحدة = 24 بكسل منطقي
        grid: { size: 24, snap: true },
        freehand: { isDrawing: false, currentStroke: [] },
        history: { undo: [], redo: [] },
        lastActionHadChanges: false,
    },
    dom: {},

    init() {
        this.dom.modal = document.getElementById('geometry-workspace-modal');
        this.dom.canvas = document.getElementById('geometry-canvas');
        if (!this.dom.modal || !this.dom.canvas) return;

        this.dom.toolbar = this.dom.modal.querySelector('.workspace-toolbar');
        this.dom.inspector = document.getElementById('geo-inspector-content');
        this.dom.inspectorDetails = document.getElementById('geo-inspector-details');
        this.dom.layersList = document.getElementById('geo-layers-list');
        this.dom.layersEmpty = document.getElementById('geo-layers-empty');
        this.dom.layersCount = document.getElementById('geo-layers-count');
        this.dom.helperText = document.getElementById('draw-helper-text');
        this.dom.questionInput = document.getElementById('geo-user-question');
        this.dom.intentChips = document.getElementById('geo-intent-chips');
        this.dom.presetsBar = document.getElementById('geo-presets-bar');
        this.dom.unitSelect = document.getElementById('geo-unit-select');
        this.dom.snapToggle = document.getElementById('geoSnapToggle');
        this.dom.clearBtn = document.getElementById('geoClearBtn');
        this.dom.coordDisplay = document.getElementById('geo-coord-display');
        this.dom.undoBtn = document.getElementById('geoUndoBtn');
        this.dom.redoBtn = document.getElementById('geoRedoBtn');
        this.dom.previewBtn = document.getElementById('geo-preview-btn');
        this.dom.livePreview = document.getElementById('geo-live-preview');
        this.dom.previewTitle = document.getElementById('geo-preview-title');
        this.dom.previewConfidence = document.getElementById('geo-preview-confidence');
        this.dom.previewMath = document.getElementById('geo-preview-math');
        this.dom.previewSteps = document.getElementById('geo-preview-steps');
        this.dom.solveBtn = document.getElementById('solve-geometry-btn');

        this.ctx = this.dom.canvas.getContext('2d');

        // أحداث الماوس
        this.dom.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.dom.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.dom.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.dom.canvas.addEventListener('mouseleave', () => {
            if (this.state.freehand.isDrawing) {
                this.handleMouseUp();
            } else {
                this.state.isDragging = false;
                this.state.draggingObject = null;
                this.drawScene();
            }
        });

        // أحداث اللمس للموبايل
        this.dom.canvas.addEventListener('touchstart', (e) => this.handleMouseDown(e), { passive: false });
        this.dom.canvas.addEventListener('touchmove', (e) => this.handleMouseMove(e), { passive: false });
        this.dom.canvas.addEventListener('touchend', (e) => this.handleMouseUp(e));
        this.dom.canvas.addEventListener('touchcancel', () => this.handleMouseUp());

        // الأزرار الرئيسية
        this.dom.solveBtn?.addEventListener('click', () => this.solve());
        this.dom.previewBtn?.addEventListener('click', () => this.renderLivePreview({ scrollIntoView: true }));

        // شريط الأدوات
        this.dom.toolbar?.addEventListener('click', (e) => {
            const btn = e.target.closest('.tool-btn');
            if (btn && btn.dataset.tool) this.setActiveTool(btn.dataset.tool);
        });

        // القوالب السريعة
        this.dom.presetsBar?.addEventListener('click', (e) => {
            const btn = e.target.closest('.geo-preset-btn');
            if (btn && btn.dataset.preset) {
                this.loadPreset(btn.dataset.preset);
            }
        });

        // الأهداف السريعة (chips)
        this.dom.intentChips?.addEventListener('click', (e) => {
            const chip = e.target.closest('.geo-intent-chip');
            if (!chip || !this.dom.questionInput) return;
            const intentText = chip.dataset.intent || chip.textContent || '';
            this.dom.questionInput.value = intentText;
            this.dom.intentChips.querySelectorAll('.geo-intent-chip').forEach((c) => {
                c.classList.toggle('active', c === chip);
            });
            this.renderLivePreview();
        });

        this.dom.questionInput?.addEventListener('input', () => {
            if (this.state.selectedObject) {
                this.renderLivePreview();
            }
        });

        this.dom.snapToggle?.addEventListener('click', () => {
            this.state.grid.snap = !this.state.grid.snap;
            this.updateSnapUI();
        });

        this.dom.clearBtn?.addEventListener('click', () => this.clearCanvas());
        this.dom.undoBtn?.addEventListener('click', () => this.undo());
        this.dom.redoBtn?.addEventListener('click', () => this.redo());

        // قائمة الطبقات / الأشكال
        this.dom.layersList?.addEventListener('click', (e) => {
            const actionBtn = e.target.closest('.geo-layer-btn');
            if (actionBtn) {
                e.stopPropagation();
                const objectId = actionBtn.dataset.objectId;
                if (actionBtn.dataset.action === 'toggle-visibility') {
                    this.toggleObjectVisibility(objectId);
                } else if (actionBtn.dataset.action === 'toggle-lock') {
                    this.toggleObjectLock(objectId);
                } else if (actionBtn.dataset.action === 'delete-object') {
                    this.deleteObject(objectId);
                }
                return;
            }
            const item = e.target.closest('.geo-layer-item');
            if (!item) return;
            this.state.selectedObject = item.dataset.objectId;
            this.updateInspector();
            this.drawScene();
            this.renderLivePreview();
        });

        window.addEventListener('resize', () => {
            if (this.dom.modal && this.dom.modal.style.display === 'flex') {
                this.resizeCanvas();
                this.updateInspectorCollapse();
            }
        });
    },

    open() {
        if (!this.dom.modal) return;
        this.reset();
        this.dom.modal.style.display = 'flex';
        requestAnimationFrame(() => {
            this.resizeCanvas();
            this.updateInspectorCollapse();
        });
    },

    reset() {
        this.state.scene = { points: {}, objects: [], values: {} };
        this.state.isDragging = false;
        this.state.selectedPoint = null;
        this.state.selectedObject = null;
        this.state.draggingObject = null;
        this.state.dragLastPos = null;
        this.state.tempPoints = [];
        this.state.freehand = { isDrawing: false, currentStroke: [] };
        this.state.history = { undo: [], redo: [] };
        this.state.lastActionHadChanges = false;
        if (this.dom.questionInput) this.dom.questionInput.value = '';
        this.dom.intentChips?.querySelectorAll('.geo-intent-chip').forEach((c) => c.classList.remove('active'));
        if (this.dom.livePreview) this.dom.livePreview.style.display = 'none';
        this.setActiveTool('select');
        this.updateSnapUI();
        this.drawScene();
        this.updateInspector();
        this.pushHistory();
    },

    clearCanvas() {
        if (this.state.scene.objects.length === 0 && Object.keys(this.state.scene.points).length === 0) return;
        this.state.scene = { points: {}, objects: [], values: {} };
        this.state.selectedObject = null;
        this.state.selectedPoint = null;
        this.state.tempPoints = [];
        if (this.dom.livePreview) this.dom.livePreview.style.display = 'none';
        this.drawScene();
        this.updateInspector();
        this.pushHistory();
    },

    updateInspectorCollapse() {
        if (!this.dom.inspectorDetails) return;
        const isCompact = window.innerWidth < 980;
        if (!this.state.selectedObject && isCompact) {
            this.dom.inspectorDetails.open = false;
        } else {
            this.dom.inspectorDetails.open = true;
        }
    },

    resizeCanvas() {
        if (!this.dom.canvas) return;
        const container = this.dom.canvas.parentElement;
        if (!container) return;

        const w = Math.max(260, Math.floor(container.clientWidth));
        const h = Math.max(260, Math.floor(container.clientHeight));
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        this.dom.canvas.style.width = `${w}px`;
        this.dom.canvas.style.height = `${h}px`;
        this.dom.canvas.width = Math.round(w * dpr);
        this.dom.canvas.height = Math.round(h * dpr);

        this.state.canvas.width = w;
        this.state.canvas.height = h;
        this.state.canvas.dpr = dpr;

        if (this.ctx) {
            this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        this.drawScene();
    },

    setActiveTool(toolName) {
        this.state.activeTool = toolName;
        this.dom.toolbar?.querySelectorAll('.tool-btn').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.tool === toolName);
        });
        this.state.tempPoints = [];
        this.updateHelperText();
        if (this.dom.canvas) {
            this.dom.canvas.style.cursor = toolName === 'select' ? 'default' : (toolName === 'delete' ? 'not-allowed' : 'crosshair');
        }
        this.drawScene();
    },

    _getCanvasPos(e) {
        if (e && e.cancelable) e.preventDefault();
        const rect = this.dom.canvas.getBoundingClientRect();
        const touch = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
        const clientX = touch ? touch.clientX : e.clientX;
        const clientY = touch ? touch.clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    },

    _snapToGrid(pos) {
        if (!this.state.grid.snap) return pos;
        const size = this.state.grid.size || 24;
        return {
            x: Math.round(pos.x / size) * size,
            y: Math.round(pos.y / size) * size
        };
    },

    _toMathCoords(pos) {
        const scale = this.state.canvas.scale || 24;
        const h = this.state.canvas.height || 380;
        return {
            x: +(pos.x / scale).toFixed(2),
            y: +((h - pos.y) / scale).toFixed(2)
        };
    },

    handleMouseDown(e) {
        const rawPos = this._getCanvasPos(e);
        const pos = this._snapToGrid(rawPos);
        const snappedPoint = this.getClosestPoint(rawPos, 16);

        if (this.state.activeTool === 'select') {
            if (snappedPoint) {
                this.state.isDragging = true;
                this.state.selectedPoint = snappedPoint.name;
                const owner = this.state.scene.objects.find((o) => o.points && o.points.includes(snappedPoint.name));
                if (owner) this.state.selectedObject = owner.id;
                this.state.lastActionHadChanges = true;
                this.updateInspector();
                this.drawScene();
            } else {
                const clickedObj = this.getObjectAtPosition(rawPos);
                if (clickedObj) {
                    this.state.selectedObject = clickedObj.id;
                    if (!clickedObj.locked) {
                        this.state.draggingObject = clickedObj.id;
                        this.state.dragLastPos = rawPos;
                        this.state.lastActionHadChanges = true;
                    }
                    this.updateInspector();
                    this.drawScene();
                    this.renderLivePreview();
                } else {
                    this.state.selectedObject = null;
                    this.updateInspector();
                    this.drawScene();
                }
            }
        } else if (this.state.activeTool === 'delete') {
            if (snappedPoint) {
                this.deletePoint(snappedPoint.name);
            } else {
                const clickedObj = this.getObjectAtPosition(rawPos);
                if (clickedObj) this.deleteObject(clickedObj.id);
            }
        } else if (this.state.activeTool === 'freehand') {
            this.state.freehand.isDrawing = true;
            this.state.freehand.currentStroke = [rawPos];
            this.state.lastActionHadChanges = true;
        } else {
            this.handleToolClick(snappedPoint || pos);
        }
    },

    handleMouseMove(e) {
        const rawPos = this._getCanvasPos(e);
        const pos = this._snapToGrid(rawPos);
        this.state.mousePos = this.state.activeTool === 'freehand' ? rawPos : pos;
        this.updateCoordDisplay(rawPos);

        if (this.state.isDragging && this.state.selectedPoint) {
            const objUsingPoint = this.state.scene.objects.find((o) => o.points && o.points.includes(this.state.selectedPoint));
            if (!objUsingPoint || !objUsingPoint.locked) {
                this.state.scene.points[this.state.selectedPoint] = { x: pos.x, y: pos.y };
                if (objUsingPoint) {
                    objUsingPoint.manualUnknowns = {};
                }
            }
        }
        if (this.state.draggingObject) {
            const dx = rawPos.x - this.state.dragLastPos.x;
            const dy = rawPos.y - this.state.dragLastPos.y;
            this.translateObject(this.state.draggingObject, dx, dy);
            this.state.dragLastPos = rawPos;
        }
        if (this.state.freehand.isDrawing) {
            const stroke = this.state.freehand.currentStroke;
            const prev = stroke[stroke.length - 1];
            if (!prev || this._getDistance(prev, rawPos) >= 3) {
                stroke.push(rawPos);
            }
        }
        this.drawScene();
    },

    handleMouseUp() {
        this.state.isDragging = false;
        this.state.selectedPoint = null;
        this.state.draggingObject = null;
        this.state.dragLastPos = null;
        if (this.state.freehand.isDrawing) {
            this.state.freehand.isDrawing = false;
            if (this.state.freehand.currentStroke.length > 2) {
                this.createFreehandObject([...this.state.freehand.currentStroke]);
            }
            this.state.freehand.currentStroke = [];
        }
        if (this.state.lastActionHadChanges) {
            this.recomputeAllProps();
            this.pushHistory();
            this.state.lastActionHadChanges = false;
            this.renderLivePreview();
        }
        this.drawScene();
    },

    handleToolClick(point) {
        if (this.state.activeTool === 'point') {
            const p = this._snapToGrid(point);
            this.addPoint(p.x, p.y);
            this.pushHistory();
            return;
        }

        const p = point.name ? point : this._snapToGrid(point);
        this.state.tempPoints.push(p);
        const requiredPoints = {
            line: 2, triangle: 3, rectangle: 2, circle: 2,
            cone: 2, ellipse: 3, polygon: 4
        };

        const req = requiredPoints[this.state.activeTool];
        if (req && this.state.tempPoints.length === req) {
            this.createObject(this.state.activeTool, [...this.state.tempPoints]);
            this.state.tempPoints = [];
        } else {
            this.updateHelperText();
            this.drawScene();
        }
    },

    createObject(type, points, options = {}) {
        const pointNames = this._ensurePointsExist(points);
        const obj = {
            id: `${type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            type,
            points: pointNames,
            props: this._generateDefaultProps(type, pointNames.map((n) => this.state.scene.points[n])),
            manualUnknowns: {},
            color: options.color || null,
            lineWidth: options.lineWidth || 2.5,
            hidden: false,
            locked: false
        };
        this.state.scene.objects.push(obj);
        this.state.selectedObject = obj.id;
        if (this.dom.inspectorDetails) this.dom.inspectorDetails.open = true;
        this.updateInspector();
        this.drawScene();
        this.renderLivePreview();
        if (!options.skipHistory) this.pushHistory();
        return obj;
    },

    createFreehandObject(pathPoints) {
        const obj = {
            id: `freehand-${Date.now()}`,
            type: 'freehand',
            points: [],
            props: {
                path: pathPoints,
                length: this._getPathLength(pathPoints) / this.state.canvas.scale
            },
            manualUnknowns: {},
            color: null,
            lineWidth: 2.5,
            hidden: false,
            locked: false
        };
        this.state.scene.objects.push(obj);
        this.state.selectedObject = obj.id;
        this.updateInspector();
        this.drawScene();
        this.renderLivePreview();
        this.pushHistory();
    },

    loadPreset(presetId) {
        const scale = this.state.canvas.scale || 24;
        const w = this.state.canvas.width || 640;
        const h = this.state.canvas.height || 360;
        const gx = (units) => Math.round((w / 2 + units * scale) / scale) * scale;
        const gy = (units) => Math.round((h / 2 - units * scale) / scale) * scale;

        // تفريغ القالب السابق لإبقاء اللوحة مرتبة عند التبديل السريع
        this.state.scene = { points: {}, objects: [], values: {} };
        this.state.tempPoints = [];
        this.state.selectedPoint = null;

        if (presetId === 'right-triangle') {
            // مثلث قائم 3-4-5
            this.createObject('triangle', [
                { x: gx(-2), y: gy(-1.5) },
                { x: gx(2), y: gy(-1.5) },
                { x: gx(-2), y: gy(1.5) }
            ]);
            if (this.dom.questionInput && !this.dom.questionInput.value.trim()) {
                this.dom.questionInput.value = 'تحقق من نظرية فيثاغورس واحسب المساحة والمحيط والزوايا';
            }
        } else if (presetId === 'equilateral-triangle') {
            const side = 6;
            const hTri = (Math.sqrt(3) / 2) * side;
            this.createObject('triangle', [
                { x: gx(-3), y: gy(-2) },
                { x: gx(3), y: gy(-2) },
                { x: gx(0), y: gy(-2 + hTri) }
            ]);
        } else if (presetId === 'rectangle') {
            this.createObject('rectangle', [
                { x: gx(-3), y: gy(2) },
                { x: gx(3), y: gy(-2) }
            ]);
        } else if (presetId === 'square') {
            this.createObject('rectangle', [
                { x: gx(-2.5), y: gy(2.5) },
                { x: gx(2.5), y: gy(-2.5) }
            ]);
        } else if (presetId === 'circle') {
            this.createObject('circle', [
                { x: gx(0), y: gy(0) },
                { x: gx(4), y: gy(0) }
            ]);
        } else if (presetId === 'cone') {
            this.createObject('cone', [
                { x: gx(0), y: gy(2.5) },
                { x: gx(3), y: gy(-2.5) }
            ]);
        } else if (presetId === 'polygon') {
            this.createObject('polygon', [
                { x: gx(-3), y: gy(2) },
                { x: gx(2), y: gy(3) },
                { x: gx(4), y: gy(-2) },
                { x: gx(-2), y: gy(-3) }
            ]);
        } else if (presetId === 'line') {
            this.createObject('line', [
                { x: gx(-3), y: gy(-2) },
                { x: gx(3), y: gy(2) }
            ]);
            if (this.dom.questionInput && !this.dom.questionInput.value.trim()) {
                this.dom.questionInput.value = 'أوجد طول القطعة المستقيمة والميل ومعادلة المستقيم';
            }
        }

        this.setActiveTool('select');
    },

    _generateDefaultProps(type, points) {
        const props = {};
        const scale = this.state.canvas.scale || 24;

        if (type === 'triangle' && points.length >= 3) {
            props.sides = {
                a: this._getDistance(points[1], points[2]) / scale,
                b: this._getDistance(points[0], points[2]) / scale,
                c: this._getDistance(points[0], points[1]) / scale
            };
            props.angles = {
                A: this._calculateAngle(points[1], points[0], points[2]),
                B: this._calculateAngle(points[0], points[1], points[2]),
                C: this._calculateAngle(points[0], points[2], points[1])
            };
        } else if (type === 'rectangle' && points.length >= 2) {
            props.width = Math.abs(points[0].x - points[1].x) / scale;
            props.height = Math.abs(points[0].y - points[1].y) / scale;
        } else if (type === 'cone' && points.length >= 2) {
            props.radius = Math.abs(points[1].x - points[0].x) / scale;
            props.height = Math.abs(points[1].y - points[0].y) / scale;
            props.width = props.radius;
        } else if (type === 'circle' && points.length >= 2) {
            props.radius = this._getDistance(points[0], points[1]) / scale;
        } else if (type === 'ellipse' && points.length >= 3) {
            props.radiusX = Math.abs(points[0].x - points[1].x) / scale;
            props.radiusY = Math.abs(points[0].y - points[2].y) / scale;
        } else if (type === 'line' && points.length >= 2) {
            const p1 = this._toMathCoords(points[0]);
            const p2 = this._toMathCoords(points[1]);
            props.x1 = p1.x;
            props.y1 = p1.y;
            props.x2 = p2.x;
            props.y2 = p2.y;
            props.length = this._getDistance(points[0], points[1]) / scale;
        } else if (type === 'polygon' && points.length >= 3) {
            const edges = [];
            let perimeter = 0;
            let areaPx2 = 0;
            for (let i = 0; i < points.length; i++) {
                const a = points[i];
                const b = points[(i + 1) % points.length];
                const d = this._getDistance(a, b) / scale;
                edges.push(d);
                perimeter += d;
                areaPx2 += (a.x * b.y - b.x * a.y);
            }
            props.edges = edges;
            props.perimeter = perimeter;
            props.area = Math.abs(areaPx2) / (2 * scale * scale);
        }

        return props;
    },

    getClosestPoint(target, radius) {
        let closest = null;
        let minDistance = radius;
        for (const name in this.state.scene.points) {
            const point = this.state.scene.points[name];
            const distance = this._getDistance(point, target);
            if (distance < minDistance) {
                minDistance = distance;
                closest = { name, ...point };
            }
        }
        return closest;
    },

    getObjectAtPosition(pos) {
        for (let i = this.state.scene.objects.length - 1; i >= 0; i--) {
            const obj = this.state.scene.objects[i];
            if (obj.hidden) continue;
            if (this._isPointInObject(pos, obj)) return obj;
        }
        return null;
    },

    _isPointInObject(pos, obj) {
        const points = obj.type === 'freehand' ? [] : obj.points.map((n) => this.state.scene.points[n]);
        if (obj.type !== 'freehand' && !points.every(Boolean)) return false;

        if (obj.type === 'line') {
            return this._distanceToSegment(pos, points[0], points[1]) <= 12;
        }
        if (obj.type === 'triangle') {
            if (this._isPointInTriangle(pos, points[0], points[1], points[2])) return true;
            return (
                this._distanceToSegment(pos, points[0], points[1]) <= 10 ||
                this._distanceToSegment(pos, points[1], points[2]) <= 10 ||
                this._distanceToSegment(pos, points[2], points[0]) <= 10
            );
        }
        if (obj.type === 'rectangle') {
            const [p1, p2] = points;
            return (
                pos.x >= Math.min(p1.x, p2.x) - 6 &&
                pos.x <= Math.max(p1.x, p2.x) + 6 &&
                pos.y >= Math.min(p1.y, p2.y) - 6 &&
                pos.y <= Math.max(p1.y, p2.y) + 6
            );
        }
        if (obj.type === 'circle') {
            const dist = this._getDistance(pos, points[0]);
            const radius = this._getDistance(points[0], points[1]);
            return dist <= radius + 8;
        }
        if (obj.type === 'ellipse') {
            const rx = Math.max(8, Math.abs(points[0].x - points[1].x));
            const ry = Math.max(8, Math.abs(points[0].y - points[2].y));
            const norm = ((pos.x - points[0].x) / rx) ** 2 + ((pos.y - points[0].y) / ry) ** 2;
            return norm <= 1.15;
        }
        if (obj.type === 'cone') {
            const [tip, baseEdge] = points;
            const r = Math.max(8, Math.abs(baseEdge.x - tip.x));
            const leftBase = { x: tip.x - r, y: baseEdge.y };
            const rightBase = { x: tip.x + r, y: baseEdge.y };
            if (this._isPointInTriangle(pos, tip, leftBase, rightBase)) return true;
            const normBase = ((pos.x - tip.x) / r) ** 2 + ((pos.y - baseEdge.y) / Math.max(6, r * 0.32)) ** 2;
            return normBase <= 1.15;
        }
        if (obj.type === 'polygon') {
            if (this._isPointInPolygon(pos, points)) return true;
            for (let i = 0; i < points.length; i++) {
                if (this._distanceToSegment(pos, points[i], points[(i + 1) % points.length]) <= 10) return true;
            }
            return false;
        }
        if (obj.type === 'freehand') {
            const path = (obj.props && obj.props.path) || [];
            return this._isPointNearStroke(pos, path, 10);
        }
        return false;
    },

    _isPointInPolygon(p, vertices) {
        let inside = false;
        for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
            const xi = vertices[i].x, yi = vertices[i].y;
            const xj = vertices[j].x, yj = vertices[j].y;
            const intersect = ((yi > p.y) !== (yj > p.y)) && (p.x < ((xj - xi) * (p.y - yi)) / (yj - yi + 1e-12) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    },

    _isPointInTriangle(p, p0, p1, p2) {
        const denom = (-p1.y * p2.x + p0.y * (-p1.x + p2.x) + p0.x * (p1.y - p2.y) + p1.x * p2.y);
        if (Math.abs(denom) < 1e-6) return false;
        const s = (1 / denom) * (p0.y * p2.x - p0.x * p2.y + (p2.y - p0.y) * p.x + (p0.x - p2.x) * p.y);
        const t = (1 / denom) * (p0.x * p1.y - p0.y * p1.x + (p0.y - p1.y) * p.x + (p1.x - p0.x) * p.y);
        return s >= 0 && t >= 0 && (1 - s - t) >= 0;
    },

    getNextPointName() {
        const existingNames = Object.keys(this.state.scene.points);
        for (let i = 65; i < 91; i++) {
            const name = String.fromCharCode(i);
            if (!existingNames.includes(name)) return name;
        }
        return `P${existingNames.length + 1}`;
    },

    addPoint(x, y) {
        const name = this.getNextPointName();
        this.state.scene.points[name] = { x, y };
        this.drawScene();
        return name;
    },

    deletePoint(pointName) {
        delete this.state.scene.points[pointName];
        this.state.scene.objects = this.state.scene.objects.filter((obj) => !obj.points.includes(pointName));
        if (this.state.selectedObject && !this.state.scene.objects.some((o) => o.id === this.state.selectedObject)) {
            this.state.selectedObject = null;
        }
        this.updateInspector();
        this.drawScene();
        this.renderLivePreview();
        this.pushHistory();
    },

    deleteObject(objectId) {
        const target = this.state.scene.objects.find((o) => o.id === objectId);
        this.state.scene.objects = this.state.scene.objects.filter((obj) => obj.id !== objectId);
        if (target && target.points) {
            target.points.forEach((ptName) => {
                const stillUsed = this.state.scene.objects.some((o) => o.points && o.points.includes(ptName));
                if (!stillUsed) delete this.state.scene.points[ptName];
            });
        }
        if (this.state.selectedObject === objectId) {
            this.state.selectedObject = this.state.scene.objects[0]?.id || null;
        }
        this.updateInspector();
        this.drawScene();
        this.renderLivePreview();
        this.pushHistory();
    },

    translateObject(objectId, dx, dy) {
        const obj = this.state.scene.objects.find((o) => o.id === objectId);
        if (!obj || obj.locked) return;
        if (obj.type === 'freehand') {
            if (obj.props && obj.props.path) {
                obj.props.path = obj.props.path.map((p) => ({ x: p.x + dx, y: p.y + dy }));
            }
        } else {
            obj.points.forEach((name) => {
                const p = this.state.scene.points[name];
                if (!p) return;
                p.x += dx;
                p.y += dy;
            });
        }
        this.drawScene();
    },

    _ensurePointsExist(points) {
        return points.map((p) => {
            if (p.name) return p.name;
            const existing = Object.entries(this.state.scene.points)
                .find(([, pos]) => Math.abs(pos.x - p.x) < 4 && Math.abs(pos.y - p.y) < 4);
            return existing ? existing[0] : this.addPoint(p.x, p.y);
        });
    },

    // ==================== محرك الرسم (HiDPI) ====================
    _getThemeColors() {
        const dark = document.body.classList.contains('dark-mode');
        const styles = getComputedStyle(document.body);
        const primary = (styles.getPropertyValue('--primary-color') || '').trim() || (dark ? '#60a5fa' : '#1d4ed8');
        const bg = (styles.getPropertyValue('--bg-container') || '').trim() || (dark ? '#0f172a' : '#ffffff');
        return {
            dark,
            bg,
            primary,
            defaultStroke: dark ? '#93c5fd' : '#1d4ed8',
            selectedStroke: '#f59e0b',
            gridMinor: dark ? 'rgba(148, 163, 184, 0.08)' : 'rgba(15, 23, 42, 0.05)',
            gridMajor: dark ? 'rgba(148, 163, 184, 0.18)' : 'rgba(29, 78, 216, 0.12)',
            axisText: dark ? 'rgba(148, 163, 184, 0.7)' : 'rgba(71, 85, 105, 0.7)',
            sideLabel: dark ? '#fda4af' : '#be123c',
            angleLabel: dark ? '#34d399' : '#047857',
            auxLabel: dark ? '#cbd5e1' : '#334155',
            pointText: dark ? '#f1f5f9' : '#0f172a',
            labelHalo: dark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.92)'
        };
    },

    drawScene() {
        if (!this.ctx || !this.dom.canvas) return;
        const ctx = this.ctx;
        const w = this.state.canvas.width;
        const h = this.state.canvas.height;
        const theme = this._getThemeColors();
        const { points, objects } = this.state.scene;

        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = theme.bg;
        ctx.fillRect(0, 0, w, h);

        this._drawGridBackground(theme);
        this._drawLivePreview(theme);

        objects.forEach((obj) => {
            if (!obj.hidden) this._drawObject(obj, theme);
        });

        for (const name in points) {
            this._drawPoint(name, points[name], theme);
        }
    },

    _drawGridBackground(theme) {
        const ctx = this.ctx;
        const w = this.state.canvas.width;
        const h = this.state.canvas.height;
        const step = this.state.grid.size || 24;
        const majorEvery = 5;

        // شبكة فرعية
        ctx.beginPath();
        for (let x = 0; x <= w; x += step) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
        }
        for (let y = 0; y <= h; y += step) {
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
        }
        ctx.strokeStyle = theme.gridMinor;
        ctx.lineWidth = 1;
        ctx.stroke();

        // شبكة رئيسية كل 5 وحدات
        ctx.beginPath();
        for (let i = 0, x = 0; x <= w; i++, x += step) {
            if (i % majorEvery === 0) {
                ctx.moveTo(x, 0);
                ctx.lineTo(x, h);
            }
        }
        for (let j = 0, y = h; y >= 0; j++, y -= step) {
            if (j % majorEvery === 0) {
                ctx.moveTo(0, y);
                ctx.lineTo(w, y);
            }
        }
        ctx.strokeStyle = theme.gridMajor;
        ctx.lineWidth = 1;
        ctx.stroke();

        // أرقام المحاور
        ctx.font = '600 10px "IBM Plex Mono", monospace';
        ctx.fillStyle = theme.axisText;
        ctx.textAlign = 'center';
        for (let i = majorEvery, x = majorEvery * step; x < w - 12; i += majorEvery, x += majorEvery * step) {
            ctx.fillText(String(i), x, h - 5);
        }
        ctx.textAlign = 'start';
        for (let j = majorEvery, y = h - majorEvery * step; y > 14; j += majorEvery, y -= majorEvery * step) {
            ctx.fillText(String(j), 5, y + 3);
        }
    },

    _drawLivePreview(theme) {
        const isFreehand = this.state.activeTool === 'freehand';
        if (isFreehand && this.state.freehand.currentStroke.length < 2) return;
        if (!isFreehand && this.state.tempPoints.length === 0) return;

        const ctx = this.ctx;
        const points = isFreehand ? this.state.freehand.currentStroke : this.state.tempPoints;
        const currentPos = this.state.mousePos;

        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = isFreehand ? theme.primary : '#ef4444';
        ctx.lineWidth = 2;
        if (!isFreehand) ctx.setLineDash([5, 5]);

        if (isFreehand) {
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
        } else if (['line', 'triangle', 'polygon'].includes(this.state.activeTool)) {
            ctx.moveTo(points[0].x, points[0].y);
            points.forEach((p) => ctx.lineTo(p.x, p.y));
            ctx.lineTo(currentPos.x, currentPos.y);
        } else if (this.state.activeTool === 'rectangle') {
            const [start] = points;
            ctx.rect(start.x, start.y, currentPos.x - start.x, currentPos.y - start.y);
        } else if (this.state.activeTool === 'cone') {
            const [tip] = points;
            const r = Math.abs(currentPos.x - tip.x);
            ctx.moveTo(tip.x, tip.y);
            ctx.lineTo(tip.x - r, currentPos.y);
            ctx.lineTo(tip.x + r, currentPos.y);
            ctx.closePath();
        } else if (this.state.activeTool === 'circle') {
            const radius = this._getDistance(points[0], currentPos);
            ctx.arc(points[0].x, points[0].y, radius, 0, 2 * Math.PI);
        } else if (this.state.activeTool === 'ellipse') {
            if (points.length === 1) {
                ctx.moveTo(points[0].x, points[0].y);
                ctx.lineTo(currentPos.x, currentPos.y);
            } else {
                const rx = Math.max(4, Math.abs(points[0].x - points[1].x));
                const ry = Math.max(4, Math.abs(points[0].y - currentPos.y));
                ctx.ellipse(points[0].x, points[0].y, rx, ry, 0, 0, 2 * Math.PI);
            }
        }

        ctx.stroke();

        // رسم نقاط التثبيت المؤقتة
        if (!isFreehand) {
            ctx.setLineDash([]);
            ctx.fillStyle = '#ef4444';
            points.forEach((pt) => {
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, 4, 0, 2 * Math.PI);
                ctx.fill();
            });
        }
        ctx.restore();
    },

    _drawObject(obj, theme) {
        const points = obj.type === 'freehand' ? [] : obj.points.map((name) => this.state.scene.points[name]);
        if (obj.type !== 'freehand' && points.some((p) => !p)) return;

        const ctx = this.ctx;
        const isSelected = this.state.selectedObject === obj.id;
        const strokeColor = isSelected ? theme.selectedStroke : (obj.color || theme.defaultStroke);
        const fillAlpha = isSelected ? 0.14 : 0.08;
        const fillColor = this._hexToRgba(strokeColor, fillAlpha);

        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = strokeColor;
        ctx.fillStyle = fillColor;
        ctx.lineWidth = isSelected ? Math.max((obj.lineWidth || 2.5) + 1, 3.2) : (obj.lineWidth || 2.5);
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        if (obj.type === 'line') {
            ctx.moveTo(points[0].x, points[0].y);
            ctx.lineTo(points[1].x, points[1].y);
            ctx.stroke();
            this._drawLineAnnotations(points[0], points[1], theme);
        } else if (obj.type === 'triangle') {
            ctx.moveTo(points[0].x, points[0].y);
            ctx.lineTo(points[1].x, points[1].y);
            ctx.lineTo(points[2].x, points[2].y);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            this._drawTriangleLabels(points, theme);
        } else if (obj.type === 'rectangle') {
            const [p1, p2] = points;
            const rx = Math.min(p1.x, p2.x);
            const ry = Math.min(p1.y, p2.y);
            const rw = Math.abs(p2.x - p1.x);
            const rh = Math.abs(p2.y - p1.y);
            ctx.rect(rx, ry, rw, rh);
            ctx.fill();
            ctx.stroke();
            this._drawRectangleLabels(rx, ry, rw, rh, theme);
        } else if (obj.type === 'circle') {
            const radius = this._getDistance(points[0], points[1]);
            ctx.arc(points[0].x, points[0].y, radius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            this._drawCircleLabels(points[0], points[1], radius, theme);
        } else if (obj.type === 'ellipse') {
            const rx = Math.max(4, Math.abs(points[0].x - points[1].x));
            const ry = Math.max(4, Math.abs(points[0].y - points[2].y));
            ctx.ellipse(points[0].x, points[0].y, rx, ry, 0, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            this._drawEllipseLabels(points[0], rx, ry, theme);
        } else if (obj.type === 'polygon') {
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            this._drawPolygonLabels(points, theme);
        } else if (obj.type === 'cone') {
            this._drawCone(points[0], points[1], strokeColor, fillColor, theme);
        } else if (obj.type === 'freehand') {
            const path = (obj.props && obj.props.path) || [];
            if (path.length > 1) {
                ctx.strokeStyle = isSelected ? theme.selectedStroke : (obj.color || (theme.dark ? '#fcd34d' : '#0f172a'));
                ctx.moveTo(path[0].x, path[0].y);
                for (let i = 1; i < path.length - 1; i++) {
                    const midX = (path[i].x + path[i + 1].x) / 2;
                    const midY = (path[i].y + path[i + 1].y) / 2;
                    ctx.quadraticCurveTo(path[i].x, path[i].y, midX, midY);
                }
                ctx.lineTo(path[path.length - 1].x, path[path.length - 1].y);
                ctx.stroke();
            }
        }

        ctx.restore();
    },

    _drawLineAnnotations(p1, p2, theme) {
        const ctx = this.ctx;
        const mid = this._getMidpoint(p1, p2);
        const len = this._getDistance(p1, p2) / (this.state.canvas.scale || 24);
        ctx.fillStyle = theme.sideLabel;
        ctx.beginPath();
        ctx.arc(mid.x, mid.y, 3, 0, 2 * Math.PI);
        ctx.fill();
        this._drawCanvasPillText(`L = ${len.toFixed(2)}`, mid.x, mid.y - 12, theme.sideLabel, theme.labelHalo);
    },

    _drawRectangleLabels(rx, ry, rw, rh, theme) {
        const scale = this.state.canvas.scale || 24;
        const w = (rw / scale).toFixed(2);
        const h = (rh / scale).toFixed(2);
        this._drawCanvasPillText(`w = ${w}`, rx + rw / 2, ry - 10, theme.sideLabel, theme.labelHalo);
        this._drawCanvasPillText(`h = ${h}`, rx + rw + 26, ry + rh / 2 + 4, theme.sideLabel, theme.labelHalo);
    },

    _drawCircleLabels(center, rimPt, radiusPx, theme) {
        const ctx = this.ctx;
        const scale = this.state.canvas.scale || 24;
        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = theme.auxLabel;
        ctx.lineWidth = 1.5;
        ctx.moveTo(center.x, center.y);
        ctx.lineTo(rimPt.x, rimPt.y);
        ctx.stroke();
        ctx.restore();
        const mid = this._getMidpoint(center, rimPt);
        this._drawCanvasPillText(`r = ${(radiusPx / scale).toFixed(2)}`, mid.x, mid.y - 10, theme.sideLabel, theme.labelHalo);
    },

    _drawEllipseLabels(center, rx, ry, theme) {
        const ctx = this.ctx;
        const scale = this.state.canvas.scale || 24;
        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = theme.auxLabel;
        ctx.lineWidth = 1.4;
        ctx.moveTo(center.x, center.y);
        ctx.lineTo(center.x + rx, center.y);
        ctx.moveTo(center.x, center.y);
        ctx.lineTo(center.x, center.y - ry);
        ctx.stroke();
        ctx.restore();
        this._drawCanvasPillText(`a = ${(rx / scale).toFixed(1)}`, center.x + rx / 2, center.y + 14, theme.sideLabel, theme.labelHalo);
        this._drawCanvasPillText(`b = ${(ry / scale).toFixed(1)}`, center.x + 22, center.y - ry / 2, theme.angleLabel, theme.labelHalo);
    },

    _drawPolygonLabels(points, theme) {
        for (let i = 0; i < points.length; i++) {
            this._drawLabel(points[i], points[(i + 1) % points.length], theme);
        }
    },

    _drawCone(tip, baseEdge, strokeColor, fillColor, theme) {
        const ctx = this.ctx;
        const scale = this.state.canvas.scale || 24;
        const radiusPx = Math.max(8, Math.abs(baseEdge.x - tip.x));
        const ryPx = Math.max(5, radiusPx * 0.28);
        const heightPx = Math.abs(baseEdge.y - tip.y);

        // جسم المخروط
        ctx.beginPath();
        ctx.moveTo(tip.x, tip.y);
        ctx.lineTo(tip.x - radiusPx, baseEdge.y);
        ctx.lineTo(tip.x + radiusPx, baseEdge.y);
        ctx.closePath();
        ctx.fillStyle = fillColor;
        ctx.fill();
        ctx.strokeStyle = strokeColor;
        ctx.stroke();

        // القاعدة الإهليلجية
        ctx.beginPath();
        ctx.ellipse(tip.x, baseEdge.y, radiusPx, ryPx, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        // الارتفاع ونصف القطر المتقطعين
        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = theme.auxLabel;
        ctx.lineWidth = 1.5;
        ctx.moveTo(tip.x, tip.y);
        ctx.lineTo(tip.x, baseEdge.y);
        ctx.lineTo(tip.x + radiusPx, baseEdge.y);
        ctx.stroke();
        ctx.restore();

        this._drawCanvasPillText(`h = ${(heightPx / scale).toFixed(1)}`, tip.x - 24, (tip.y + baseEdge.y) / 2, theme.angleLabel, theme.labelHalo);
        this._drawCanvasPillText(`r = ${(radiusPx / scale).toFixed(1)}`, tip.x + radiusPx / 2, baseEdge.y + ryPx + 14, theme.sideLabel, theme.labelHalo);
    },

    _drawTriangleLabels(points, theme) {
        this._drawLabel(points[0], points[1], theme);
        this._drawLabel(points[1], points[2], theme);
        this._drawLabel(points[2], points[0], theme);

        this._drawAngleLabel(points[1], points[0], points[2], theme);
        this._drawAngleLabel(points[0], points[1], points[2], theme);
        this._drawAngleLabel(points[0], points[2], points[1], theme);
    },

    _drawPoint(name, p, theme) {
        const ctx = this.ctx;
        const isSel = this.state.selectedPoint === name;
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, isSel ? 6.5 : 5, 0, 2 * Math.PI);
        ctx.fillStyle = isSel ? '#f59e0b' : theme.primary;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = '700 13px "IBM Plex Mono", sans-serif';
        ctx.fillStyle = theme.pointText;
        ctx.fillText(name, p.x + 8, p.y - 8);
        ctx.restore();
    },

    _drawCanvasPillText(text, x, y, color, haloColor) {
        const ctx = this.ctx;
        ctx.save();
        ctx.font = '700 11.5px "IBM Plex Mono", monospace';
        ctx.textAlign = 'center';
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = haloColor;
        ctx.strokeText(text, x, y);
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
        ctx.restore();
    },

    _drawLabel(p1, p2, theme) {
        const dist = this._getDistance(p1, p2) / (this.state.canvas.scale || 24);
        const mid = this._getMidpoint(p1, p2);
        this._drawCanvasPillText(dist.toFixed(1), mid.x, mid.y - 7, theme.sideLabel, theme.labelHalo);
    },

    _drawAngleLabel(p1, p2, p3, theme) {
        const angle = this._calculateAngle(p1, p2, p3);
        if (!Number.isFinite(angle)) return;

        const offset = 22;
        const angle1 = Math.atan2(p1.y - p2.y, p1.x - p2.x);
        const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
        let bisectorAngle = (angle1 + angle2) / 2;
        if (Math.abs(angle1 - angle2) > Math.PI) bisectorAngle += Math.PI;

        // علامة الزاوية القائمة إذا كانت 90°
        if (Math.abs(angle - 90) < 0.8) {
            const ctx = this.ctx;
            const s = 11;
            const u1 = { x: Math.cos(angle1) * s, y: Math.sin(angle1) * s };
            const u2 = { x: Math.cos(angle2) * s, y: Math.sin(angle2) * s };
            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = theme.angleLabel;
            ctx.lineWidth = 1.6;
            ctx.moveTo(p2.x + u1.x, p2.y + u1.y);
            ctx.lineTo(p2.x + u1.x + u2.x, p2.y + u1.y + u2.y);
            ctx.lineTo(p2.x + u2.x, p2.y + u2.y);
            ctx.stroke();
            ctx.restore();
        }

        const textX = p2.x + offset * Math.cos(bisectorAngle);
        const textY = p2.y + offset * Math.sin(bisectorAngle) + 4;
        this._drawCanvasPillText(`${angle.toFixed(0)}°`, textX, textY, theme.angleLabel, theme.labelHalo);
    },

    // ==================== تصدير المعاينة ====================
    createPreviewImage() {
        const bounds = this.getSceneBounds();
        const padding = 24;
        const targetW = 560;
        const targetH = 340;
        const dpr = this.state.canvas.dpr || 1;

        const sourceCanvas = this.dom.canvas;
        const off = document.createElement('canvas');
        off.width = targetW;
        off.height = targetH;
        const ctx = off.getContext('2d');

        const theme = this._getThemeColors();
        ctx.fillStyle = theme.bg;
        ctx.fillRect(0, 0, targetW, targetH);

        const minX = Math.max(0, bounds.minX - 28);
        const minY = Math.max(0, bounds.minY - 28);
        const maxX = Math.min(this.state.canvas.width, bounds.maxX + 28);
        const maxY = Math.min(this.state.canvas.height, bounds.maxY + 28);

        const srcW = Math.max(40, maxX - minX);
        const srcH = Math.max(40, maxY - minY);
        const scale = Math.min((targetW - padding * 2) / srcW, (targetH - padding * 2) / srcH);
        const drawW = srcW * scale;
        const drawH = srcH * scale;
        const dx = (targetW - drawW) / 2;
        const dy = (targetH - drawH) / 2;

        ctx.drawImage(
            sourceCanvas,
            minX * dpr,
            minY * dpr,
            srcW * dpr,
            srcH * dpr,
            dx,
            dy,
            drawW,
            drawH
        );
        return off.toDataURL('image/png');
    },

    getSceneBounds() {
        const width = this.state.canvas.width || 720;
        const height = this.state.canvas.height || 380;
        let minX = width, minY = height, maxX = 0, maxY = 0;

        const addPoint = (p) => {
            if (!p) return;
            minX = Math.min(minX, p.x);
            minY = Math.min(minY, p.y);
            maxX = Math.max(maxX, p.x);
            maxY = Math.max(maxY, p.y);
        };

        this.state.scene.objects.forEach((obj) => {
            if (obj.hidden) return;
            if (obj.type === 'freehand' && obj.props?.path) {
                obj.props.path.forEach(addPoint);
            } else if (obj.type === 'circle' && obj.points.length >= 2) {
                const c = this.state.scene.points[obj.points[0]];
                const rPt = this.state.scene.points[obj.points[1]];
                if (c && rPt) {
                    const r = this._getDistance(c, rPt);
                    addPoint({ x: c.x - r, y: c.y - r });
                    addPoint({ x: c.x + r, y: c.y + r });
                }
            } else if (obj.type === 'ellipse' && obj.points.length >= 3) {
                const c = this.state.scene.points[obj.points[0]];
                const pX = this.state.scene.points[obj.points[1]];
                const pY = this.state.scene.points[obj.points[2]];
                if (c && pX && pY) {
                    const rx = Math.abs(c.x - pX.x);
                    const ry = Math.abs(c.y - pY.y);
                    addPoint({ x: c.x - rx, y: c.y - ry });
                    addPoint({ x: c.x + rx, y: c.y + ry });
                }
            } else {
                obj.points.forEach((n) => addPoint(this.state.scene.points[n]));
            }
        });

        Object.values(this.state.scene.points).forEach(addPoint);

        if (minX > maxX || minY > maxY) {
            return { minX: 0, minY: 0, maxX: width, maxY: height };
        }
        return { minX, minY, maxX, maxY };
    },

    serializeScene() {
        const scale = this.state.canvas.scale || 24;
        const objects = this.state.scene.objects.map((obj) => this.serializeObject(obj, scale));
        return {
            canvas: {
                width: this.state.canvas.width,
                height: this.state.canvas.height,
                scale
            },
            selected_object_id: this.state.selectedObject,
            objects
        };
    },

    serializeObject(obj, scale) {
        if (obj.type === 'freehand') {
            const path = (obj.props && obj.props.path) || [];
            const reduced = this.downsamplePath(path, 60).map((p) => this._toMathCoords(p));
            return {
                id: obj.id,
                type: obj.type,
                props: { length: +(obj.props.length || 0).toFixed(3) },
                path_units: reduced,
                style: { color: obj.color || null, lineWidth: obj.lineWidth || 2.5 },
                flags: { hidden: !!obj.hidden, locked: !!obj.locked }
            };
        }

        const pointsPx = obj.points.map((name) => this.state.scene.points[name]).filter(Boolean);
        const pointsUnits = pointsPx.map((p) => this._toMathCoords(p));
        return {
            id: obj.id,
            type: obj.type,
            props: obj.props,
            points_units: pointsUnits,
            style: { color: obj.color || null, lineWidth: obj.lineWidth || 2.5 },
            flags: { hidden: !!obj.hidden, locked: !!obj.locked }
        };
    },

    downsamplePath(path, maxPoints) {
        if (!path || path.length <= maxPoints) return path;
        const result = [];
        const step = Math.ceil(path.length / maxPoints);
        for (let i = 0; i < path.length; i += step) {
            result.push(path[i]);
        }
        if (path.length) result.push(path[path.length - 1]);
        return result;
    },

    // ==================== خصائص وحسابات هندسية ====================
    _getDistance(p1, p2) {
        if (!p1 || !p2) return 0;
        return Math.hypot(p2.x - p1.x, p2.y - p1.y);
    },

    _getMidpoint(p1, p2) {
        if (!p1 || !p2) return { x: 0, y: 0 };
        return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
    },

    _getPathLength(path) {
        let length = 0;
        for (let i = 1; i < path.length; i++) {
            length += this._getDistance(path[i - 1], path[i]);
        }
        return length;
    },

    _isPointNearStroke(pos, path, tolerance) {
        if (!path || path.length < 2) return false;
        for (let i = 1; i < path.length; i++) {
            if (this._distanceToSegment(pos, path[i - 1], path[i]) <= tolerance) return true;
        }
        return false;
    },

    _distanceToSegment(p, a, b) {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        if (dx === 0 && dy === 0) return this._getDistance(p, a);
        const t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy);
        const clamped = Math.max(0, Math.min(1, t));
        return this._getDistance(p, { x: a.x + clamped * dx, y: a.y + clamped * dy });
    },

    _calculateAngle(p1, p2, p3) {
        const a = this._getDistance(p2, p3);
        const b = this._getDistance(p1, p2);
        const c = this._getDistance(p1, p3);
        if (a < 1e-6 || b < 1e-6) return NaN;
        const cosVal = Math.max(-1, Math.min(1, (a * a + b * b - c * c) / (2 * a * b)));
        return Math.acos(cosVal) * (180 / Math.PI);
    },

    _hexToRgba(hex, alpha) {
        const clean = String(hex || '').replace('#', '').trim();
        if (!/^[0-9a-fA-F]{6}$/.test(clean)) return `rgba(29, 78, 216, ${alpha})`;
        const r = parseInt(clean.slice(0, 2), 16);
        const g = parseInt(clean.slice(2, 4), 16);
        const b = parseInt(clean.slice(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },

    // ==================== المحرر ثنائي الاتجاه ====================
    updateInspector() {
        const title = document.getElementById('geo-inspector-title');
        const icon = document.getElementById('geo-inspector-icon');
        const content = this.dom.inspector;
        if (!content || !title || !icon) return;

        this.updateLayersList();
        content.innerHTML = '';

        if (!this.state.selectedObject) {
            title.textContent = 'خصائص الشكل المحدد';
            icon.textContent = '📐';
            content.innerHTML = '<p class="geo-empty-hint">ارسم شكلاً على اللوحة أو اختر قالباً جاهزاً لعرض أبعاده وتعديلها.</p>';
            return;
        }

        const obj = this.state.scene.objects.find((o) => o.id === this.state.selectedObject);
        if (!obj) return;

        title.textContent = `خصائص ${this._getObjectTypeName(obj.type)}`;
        icon.textContent = this._getObjectIcon(obj.type);

        const fields = this._generateInspectorFields(obj);
        fields.forEach((group) => {
            content.innerHTML += this._createInputGroup(group.title, group.fields);
        });

        content.innerHTML += `
            <div class="input-group">
                <div class="input-group-title">المظهر</div>
                <div class="input-row">
                    <label>لون الشكل:</label>
                    <input type="color" class="geo-style-color" value="${obj.color || '#1d4ed8'}" data-object-id="${obj.id}">
                </div>
                <div class="input-row">
                    <label>سماكة الخط:</label>
                    <input type="number" class="geo-style-width" min="1" max="8" step="0.5" value="${obj.lineWidth || 2.5}" data-object-id="${obj.id}">
                </div>
            </div>
        `;

        const results = this._computeObjectResults(obj);
        if (results.length) {
            content.innerHTML += this._createInputGroup('الحسابات الفورية', results);
        }

        this._bindInspectorInputs();
    },

    updateLayersList() {
        const list = this.dom.layersList;
        const empty = this.dom.layersEmpty;
        if (!list || !empty) return;

        list.innerHTML = '';
        const objects = this.state.scene.objects;
        if (this.dom.layersCount) {
            this.dom.layersCount.textContent = String(objects.length);
        }

        if (!objects.length) {
            empty.style.display = 'block';
            return;
        }

        empty.style.display = 'none';
        objects.forEach((obj, index) => {
            const item = document.createElement('div');
            item.role = 'button';
            item.tabIndex = 0;
            item.className = `geo-layer-item${this.state.selectedObject === obj.id ? ' active' : ''}`;
            item.dataset.objectId = obj.id;
            const label = this._getObjectLabel(obj, index);
            const meta = this._getObjectMeta(obj);
            item.innerHTML = `
                <div class="geo-layer-main">
                    <span class="geo-layer-icon">${this._getObjectIcon(obj.type)}</span>
                    <span class="geo-layer-title">${label}</span>
                    <span class="geo-layer-meta" dir="ltr">${meta}</span>
                </div>
                <div class="geo-layer-actions">
                    <button type="button" class="geo-layer-btn" data-action="toggle-visibility" data-object-id="${obj.id}" title="${obj.hidden ? 'إظهار' : 'إخفاء'}">${obj.hidden ? '○' : '◉'}</button>
                    <button type="button" class="geo-layer-btn" data-action="toggle-lock" data-object-id="${obj.id}" title="${obj.locked ? 'فك القفل' : 'قفل'}">${obj.locked ? 'ق' : 'ح'}</button>
                    <button type="button" class="geo-layer-btn" data-action="delete-object" data-object-id="${obj.id}" title="حذف الشكل">×</button>
                </div>
            `;
            list.appendChild(item);
        });
    },

    updateHelperText() {
        if (!this.dom.helperText) return;
        const stepCount = this.state.tempPoints.length;
        const textMap = {
            select: 'اسحب أي نقطة أو شكل لتحريكه، أو عدّل القيم من الخصائص',
            point: 'انقر في أي موضع لإضافة نقطة إحداثية',
            line: stepCount === 1 ? 'انقر لتحديد نهاية القطعة المستقيمة' : 'انقر لتحديد بداية ونهاية القطعة المستقيمة',
            freehand: 'اسحب بإصبعك أو الماوس للرسم الحر على اللوحة',
            triangle: `اختر رؤوس المثلث الثلاثة (${stepCount}/3)`,
            rectangle: stepCount === 1 ? 'انقر لتحديد الركن المقابل للمستطيل' : 'انقر لتحديد ركنين متقابلين للمستطيل',
            circle: stepCount === 1 ? 'انقر لتحديد نقطة على محيط الدائرة' : 'انقر لتحديد المركز ثم نقطة على المحيط',
            ellipse: `اختر المركز ثم طرف المحور الأفقي ثم العمودي (${stepCount}/3)`,
            cone: stepCount === 1 ? 'انقر لتحديد حافة قاعدة المخروط' : 'انقر لتحديد قمة المخروط ثم حافة القاعدة',
            polygon: `اختر 4 رؤوس لتكوين المضلع (${stepCount}/4)`,
            delete: 'انقر فوق أي شكل أو نقطة لحذفها'
        };
        this.dom.helperText.textContent = textMap[this.state.activeTool] || 'اختر أداة للرسم أو أنشئ قالباً جاهزاً';
    },

    updateSnapUI() {
        if (!this.dom.snapToggle) return;
        const isOn = this.state.grid.snap;
        this.dom.snapToggle.textContent = `الشبكة: ${isOn ? 'مفعّل' : 'متوقف'}`;
        this.dom.snapToggle.classList.toggle('active', isOn);
    },

    pushHistory() {
        const snapshot = this._cloneState();
        this.state.history.undo.push(snapshot);
        if (this.state.history.undo.length > 40) {
            this.state.history.undo.shift();
        }
        this.state.history.redo = [];
        this.updateHistoryUI();
    },

    undo() {
        if (this.state.history.undo.length <= 1) return;
        const current = this.state.history.undo.pop();
        this.state.history.redo.push(current);
        this._restoreState(this.state.history.undo[this.state.history.undo.length - 1]);
        this.updateHistoryUI();
    },

    redo() {
        if (this.state.history.redo.length === 0) return;
        const next = this.state.history.redo.pop();
        this.state.history.undo.push(next);
        this._restoreState(next);
        this.updateHistoryUI();
    },

    updateHistoryUI() {
        if (this.dom.undoBtn) this.dom.undoBtn.disabled = this.state.history.undo.length <= 1;
        if (this.dom.redoBtn) this.dom.redoBtn.disabled = this.state.history.redo.length === 0;
    },

    _cloneState() {
        return {
            scene: JSON.parse(JSON.stringify(this.state.scene)),
            selectedObject: this.state.selectedObject,
            selectedPoint: this.state.selectedPoint
        };
    },

    _restoreState(snapshot) {
        this.state.scene = JSON.parse(JSON.stringify(snapshot.scene));
        this.state.selectedObject = snapshot.selectedObject || null;
        this.state.selectedPoint = snapshot.selectedPoint || null;
        this.drawScene();
        this.updateInspector();
        this.renderLivePreview();
    },

    updateCoordDisplay(pos) {
        if (!this.dom.coordDisplay) return;
        const coords = this._toMathCoords(pos);
        this.dom.coordDisplay.textContent = `x: ${coords.x.toFixed(2)} , y: ${coords.y.toFixed(2)}`;
    },

    recomputeAllProps() {
        this.state.scene.objects.forEach((obj) => {
            if (obj.type === 'freehand') {
                if (obj.props && obj.props.path) {
                    obj.props.length = this._getPathLength(obj.props.path) / (this.state.canvas.scale || 24);
                }
                return;
            }
            const points = obj.points.map((name) => this.state.scene.points[name]).filter(Boolean);
            if (!points.length) return;
            obj.props = this._generateDefaultProps(obj.type, points);
        });
        this.updateInspector();
    },

    toggleObjectVisibility(objectId) {
        const obj = this.state.scene.objects.find((o) => o.id === objectId);
        if (!obj) return;
        obj.hidden = !obj.hidden;
        this.updateInspector();
        this.drawScene();
        this.pushHistory();
    },

    toggleObjectLock(objectId) {
        const obj = this.state.scene.objects.find((o) => o.id === objectId);
        if (!obj) return;
        obj.locked = !obj.locked;
        this.updateInspector();
        this.drawScene();
        this.pushHistory();
    },

    _getObjectLabel(obj, index) {
        return `${this._getObjectTypeName(obj.type)} ${index + 1}`;
    },

    _getObjectMeta(obj) {
        if (!obj || !obj.props) return '';
        if (obj.type === 'circle') return `r=${(obj.props.radius || 0).toFixed(2)}`;
        if (obj.type === 'rectangle') return `${(obj.props.width || 0).toFixed(1)}×${(obj.props.height || 0).toFixed(1)}`;
        if (obj.type === 'cone') return `r=${(obj.props.radius || obj.props.width || 0).toFixed(1)} h=${(obj.props.height || 0).toFixed(1)}`;
        if (obj.type === 'triangle') return `a=${obj.props.sides.a.toFixed(1)} b=${obj.props.sides.b.toFixed(1)} c=${obj.props.sides.c.toFixed(1)}`;
        if (obj.type === 'ellipse') return `a=${obj.props.radiusX.toFixed(1)} b=${obj.props.radiusY.toFixed(1)}`;
        if (obj.type === 'line') return `L=${(obj.props.length || 0).toFixed(2)}`;
        if (obj.type === 'polygon') return `P=${(obj.props.perimeter || 0).toFixed(1)}`;
        if (obj.type === 'freehand') return `L≈${(obj.props.length || 0).toFixed(1)}`;
        return '';
    },

    _getObjectTypeName(type) {
        const names = {
            triangle: 'المثلث',
            rectangle: 'المستطيل',
            square: 'المربع',
            circle: 'الدائرة',
            line: 'القطعة المستقيمة',
            cone: 'المخروط',
            ellipse: 'القطع الناقص',
            polygon: 'المضلع',
            freehand: 'رسم حر'
        };
        return names[type] || type;
    },

    _getObjectIcon(type) {
        const icons = {
            triangle: '△',
            rectangle: '▭',
            circle: '◯',
            line: '╱',
            cone: '▽',
            ellipse: '⬭',
            polygon: '⬠',
            freehand: '✎'
        };
        return icons[type] || '◇';
    },

    _generateInspectorFields(obj) {
        const groups = [];
        const unk = obj.manualUnknowns || {};

        if (obj.type === 'triangle') {
            groups.push({
                title: 'الأضلاع (امسح القيمة إذا كانت مجهولة)',
                fields: [
                    { label: 'الضلع a', value: unk.side_a ? '' : obj.props.sides.a.toFixed(2), key: 'side_a', placeholder: 'مجهول' },
                    { label: 'الضلع b', value: unk.side_b ? '' : obj.props.sides.b.toFixed(2), key: 'side_b', placeholder: 'مجهول' },
                    { label: 'الضلع c', value: unk.side_c ? '' : obj.props.sides.c.toFixed(2), key: 'side_c', placeholder: 'مجهول' }
                ]
            });
            groups.push({
                title: 'الزوايا (°)',
                fields: [
                    { label: 'الزاوية A', value: unk.angle_A ? '' : obj.props.angles.A.toFixed(1), key: 'angle_A', placeholder: 'مجهول' },
                    { label: 'الزاوية B', value: unk.angle_B ? '' : obj.props.angles.B.toFixed(1), key: 'angle_B', placeholder: 'مجهول' },
                    { label: 'الزاوية C', value: unk.angle_C ? '' : obj.props.angles.C.toFixed(1), key: 'angle_C', placeholder: 'مجهول' }
                ]
            });
        } else if (obj.type === 'rectangle') {
            groups.push({
                title: 'الأبعاد (قابلة للتعديل)',
                fields: [
                    { label: 'العرض (w)', value: obj.props.width.toFixed(2), key: 'width' },
                    { label: 'الارتفاع (h)', value: obj.props.height.toFixed(2), key: 'height' }
                ]
            });
        } else if (obj.type === 'cone') {
            groups.push({
                title: 'أبعاد المخروط (قابلة للتعديل)',
                fields: [
                    { label: 'نصف القطر (r)', value: (obj.props.radius ?? obj.props.width ?? 0).toFixed(2), key: 'radius' },
                    { label: 'الارتفاع (h)', value: obj.props.height.toFixed(2), key: 'height' }
                ]
            });
        } else if (obj.type === 'circle') {
            groups.push({
                title: 'الأبعاد (قابلة للتعديل)',
                fields: [
                    { label: 'نصف القطر (r)', value: obj.props.radius.toFixed(2), key: 'radius' }
                ]
            });
        } else if (obj.type === 'ellipse') {
            groups.push({
                title: 'نصفا المحورين (قابلة للتعديل)',
                fields: [
                    { label: 'نصف المحور الأفقي (a)', value: obj.props.radiusX.toFixed(2), key: 'radiusX' },
                    { label: 'نصف المحور العمودي (b)', value: obj.props.radiusY.toFixed(2), key: 'radiusY' }
                ]
            });
        } else if (obj.type === 'line') {
            groups.push({
                title: 'إحداثيات النقطتين',
                fields: [
                    { label: 'x₁', value: obj.props.x1.toFixed(2), key: 'x1' },
                    { label: 'y₁', value: obj.props.y1.toFixed(2), key: 'y1' },
                    { label: 'x₂', value: obj.props.x2.toFixed(2), key: 'x2' },
                    { label: 'y₂', value: obj.props.y2.toFixed(2), key: 'y2' }
                ]
            });
        } else if (obj.type === 'polygon') {
            groups.push({
                title: 'أطوال أضلاع المضلع',
                fields: (obj.props.edges || []).map((len, idx) => ({
                    label: `الضلع ${idx + 1}`,
                    value: len.toFixed(2),
                    key: `edge_${idx + 1}`,
                    readonly: true
                }))
            });
        } else if (obj.type === 'freehand') {
            groups.push({
                title: 'الخصائص',
                fields: [
                    { label: 'طول المسار التقريبي', value: obj.props.length.toFixed(2), key: 'path_length', readonly: true }
                ]
            });
        }

        return groups;
    },

    _bindInspectorInputs() {
        if (!this.dom.inspector) return;

        this.dom.inspector.querySelectorAll('.geo-style-color').forEach((input) => {
            input.addEventListener('input', (e) => {
                const obj = this.state.scene.objects.find((o) => o.id === e.target.dataset.objectId);
                if (!obj) return;
                obj.color = e.target.value;
                this.drawScene();
            });
            input.addEventListener('change', () => this.pushHistory());
        });

        this.dom.inspector.querySelectorAll('.geo-style-width').forEach((input) => {
            input.addEventListener('input', (e) => {
                const obj = this.state.scene.objects.find((o) => o.id === e.target.dataset.objectId);
                if (!obj) return;
                obj.lineWidth = parseFloat(e.target.value) || obj.lineWidth;
                this.drawScene();
            });
            input.addEventListener('change', () => this.pushHistory());
        });

        // ربط تعديل الأبعاد مباشرة بالرسم والنتائج
        this.dom.inspector.querySelectorAll('input.geo-input:not([readonly])').forEach((input) => {
            input.addEventListener('change', (e) => {
                this._handleInspectorFieldEdit(e.target.dataset.objectKey, e.target.value);
            });
        });
    },

    _handleInspectorFieldEdit(key, rawVal) {
        const obj = this.state.scene.objects.find((o) => o.id === this.state.selectedObject);
        if (!obj || !key) return;

        const trimmed = String(rawVal || '').trim();
        const num = parseFloat(trimmed);
        const scale = this.state.canvas.scale || 24;
        const canvasH = this.state.canvas.height || 380;

        if (!obj.manualUnknowns) obj.manualUnknowns = {};

        // السماح بجعل حقل من المثلث مجهولاً لحله بالمحلل
        if (obj.type === 'triangle' && (!trimmed || trimmed === '?' || !Number.isFinite(num))) {
            obj.manualUnknowns[key] = true;
            this.renderLivePreview();
            return;
        }
        delete obj.manualUnknowns[key];

        if (!Number.isFinite(num)) return;

        const pts = obj.points.map((n) => this.state.scene.points[n]).filter(Boolean);

        if (obj.type === 'circle' && key === 'radius' && num > 0 && pts.length >= 2) {
            const [c, rim] = pts;
            const ang = Math.atan2(rim.y - c.y, rim.x - c.x);
            rim.x = c.x + num * scale * Math.cos(ang);
            rim.y = c.y + num * scale * Math.sin(ang);
        } else if (obj.type === 'rectangle' && (key === 'width' || key === 'height') && num > 0 && pts.length >= 2) {
            const [p1, p2] = pts;
            if (key === 'width') {
                const signX = p2.x >= p1.x ? 1 : -1;
                p2.x = p1.x + signX * num * scale;
            } else {
                const signY = p2.y >= p1.y ? 1 : -1;
                p2.y = p1.y + signY * num * scale;
            }
        } else if (obj.type === 'cone' && (key === 'radius' || key === 'height') && num > 0 && pts.length >= 2) {
            const [tip, base] = pts;
            if (key === 'radius') {
                const signX = base.x >= tip.x ? 1 : -1;
                base.x = tip.x + signX * num * scale;
            } else {
                const signY = base.y >= tip.y ? 1 : -1;
                base.y = tip.y + signY * num * scale;
            }
        } else if (obj.type === 'ellipse' && (key === 'radiusX' || key === 'radiusY') && num > 0 && pts.length >= 3) {
            const [c, pX, pY] = pts;
            if (key === 'radiusX') pX.x = c.x + num * scale;
            if (key === 'radiusY') pY.y = c.y - num * scale;
        } else if (obj.type === 'line' && ['x1', 'y1', 'x2', 'y2'].includes(key) && pts.length >= 2) {
            if (key === 'x1') pts[0].x = num * scale;
            if (key === 'y1') pts[0].y = canvasH - num * scale;
            if (key === 'x2') pts[1].x = num * scale;
            if (key === 'y2') pts[1].y = canvasH - num * scale;
        } else if (obj.type === 'triangle' && num > 0) {
            // تحديث أضلاع المثلث أو زواياه وإعادة تشكيل الرؤوس إذا اكتملت الأضلاع الثلاثة
            if (key.startsWith('side_')) {
                const sKey = key.replace('side_', '');
                obj.props.sides[sKey] = num;
            } else if (key.startsWith('angle_')) {
                const aKey = key.replace('angle_', '');
                obj.props.angles[aKey] = num;
            }

            const a = Number(obj.props.sides.a);
            const b = Number(obj.props.sides.b);
            const c = Number(obj.props.sides.c);
            if (key.startsWith('side_') && Object.keys(obj.manualUnknowns).length === 0 && a + b > c && a + c > b && b + c > a && pts.length >= 3) {
                // إعادة تموضع الرؤوس بحيث تطابق الأضلاع a, b, c (P0=A, P1=B, P2=C)
                const A = pts[0];
                const B = pts[1];
                const C = pts[2];
                B.x = A.x + c * scale;
                B.y = A.y;
                const cosA = Math.max(-1, Math.min(1, (b * b + c * c - a * a) / (2 * b * c)));
                const sinA = Math.sqrt(Math.max(0, 1 - cosA * cosA));
                C.x = A.x + b * cosA * scale;
                C.y = A.y - b * sinA * scale;
            }
        }

        if (obj.type !== 'triangle' || Object.keys(obj.manualUnknowns).length === 0) {
            obj.props = this._generateDefaultProps(obj.type, pts);
            this.updateInspector();
        } else {
            this._refreshInspectorResultsOnly(obj);
        }

        this.drawScene();
        this.renderLivePreview();
        this.pushHistory();
    },

    _refreshInspectorResultsOnly(obj) {
        const results = this._computeObjectResults(obj);
        results.forEach((res) => {
            const input = this.dom.inspector?.querySelector(`input[data-object-key="${res.key}"]`);
            if (input) input.value = res.value;
        });
    },

    _computeObjectResults(obj) {
        const results = [];
        if (obj.type === 'rectangle') {
            const w = obj.props.width || 0;
            const h = obj.props.height || 0;
            results.push({ label: 'المساحة', value: (w * h).toFixed(3), key: 'area' });
            results.push({ label: 'المحيط', value: (2 * (w + h)).toFixed(3), key: 'perimeter' });
            results.push({ label: 'القطر', value: Math.hypot(w, h).toFixed(3), key: 'diagonal' });
        } else if (obj.type === 'cone') {
            const r = obj.props.radius ?? obj.props.width ?? 0;
            const h = obj.props.height || 0;
            const l = Math.hypot(r, h);
            const totalA = Math.PI * r * (r + l);
            const vol = (1 / 3) * Math.PI * r * r * h;
            results.push({ label: 'الراسم (l)', value: l.toFixed(3), key: 'slant' });
            results.push({ label: 'المساحة الكلية', value: totalA.toFixed(3), key: 'total_area' });
            results.push({ label: 'الحجم', value: vol.toFixed(3), key: 'volume' });
        } else if (obj.type === 'circle') {
            const r = obj.props.radius || 0;
            results.push({ label: 'المساحة', value: (Math.PI * r * r).toFixed(3), key: 'area' });
            results.push({ label: 'المحيط', value: (2 * Math.PI * r).toFixed(3), key: 'circumference' });
            results.push({ label: 'القطر', value: (2 * r).toFixed(3), key: 'diameter' });
        } else if (obj.type === 'triangle') {
            const a = obj.props.sides.a || 0;
            const b = obj.props.sides.b || 0;
            const c = obj.props.sides.c || 0;
            const s = (a + b + c) / 2;
            const area = Math.sqrt(Math.max(s * (s - a) * (s - b) * (s - c), 0));
            results.push({ label: 'المحيط', value: (a + b + c).toFixed(3), key: 'perimeter' });
            results.push({ label: 'المساحة', value: area.toFixed(3), key: 'area' });
        } else if (obj.type === 'ellipse') {
            const rx = obj.props.radiusX || 0;
            const ry = obj.props.radiusY || 0;
            results.push({ label: 'المساحة', value: (Math.PI * rx * ry).toFixed(3), key: 'area' });
        } else if (obj.type === 'line') {
            const len = obj.props.length || 0;
            const dx = (obj.props.x2 ?? 0) - (obj.props.x1 ?? 0);
            const dy = (obj.props.y2 ?? 0) - (obj.props.y1 ?? 0);
            results.push({ label: 'الطول', value: len.toFixed(3), key: 'length' });
            results.push({ label: 'الميل (m)', value: Math.abs(dx) < 1e-9 ? 'غير معرّف' : (dy / dx).toFixed(3), key: 'slope' });
        } else if (obj.type === 'polygon') {
            results.push({ label: 'المحيط', value: (obj.props.perimeter || 0).toFixed(3), key: 'perimeter' });
            results.push({ label: 'المساحة', value: (obj.props.area || 0).toFixed(3), key: 'area' });
        }
        return results;
    },

    _createInputGroup(title, fields) {
        let html = `<div class="input-group"><div class="input-group-title">${title}</div>`;
        fields.forEach((field) => {
            html += `
                <div class="input-row" data-key="${field.key}">
                    <label>${field.label}:</label>
                    <input type="text" class="geo-input" value="${field.value}" placeholder="${field.placeholder || ''}" data-object-key="${field.key}" ${field.readonly || title === 'الحسابات الفورية' ? 'readonly' : ''}>
                </div>
            `;
        });
        html += '</div>';
        return html;
    },

    // ==================== المعاينة الفورية والإرسال ====================
    _collectUserInputs() {
        const userInputs = {};
        if (!this.dom.inspector) return userInputs;
        this.dom.inspector.querySelectorAll('.input-row').forEach((row) => {
            const key = row.dataset.key;
            const input = row.querySelector('input');
            if (!key || !input) return;
            const raw = String(input.value || '').trim();
            if (!raw || raw === '?') {
                userInputs[key] = null; // حقل مجهول/مفرغ صراحة
                return;
            }
            const value = parseFloat(raw);
            if (Number.isFinite(value)) {
                userInputs[key] = value;
            }
        });
        return userInputs;
    },

    renderLivePreview(options = {}) {
        if (!this.dom.livePreview) return;
        const obj = this.state.scene.objects.find((o) => o.id === this.state.selectedObject) || this.state.scene.objects[0];
        if (!obj) {
            this.dom.livePreview.style.display = 'none';
            if (options.scrollIntoView) {
                window.MathApp?.ui?.showToast('يرجى رسم شكل أو اختيار قالب جاهز أولاً.', 'warning');
            }
            return;
        }

        if (!this.state.selectedObject) {
            this.state.selectedObject = obj.id;
        }

        const userInputs = this._collectUserInputs();
        const payload = this.formatProblemData(obj, userInputs, { skipImage: true });
        this.dom.livePreview.style.display = 'block';

        try {
            const solved = geometrySolver.solve(payload);
            if (!solved) {
                this.dom.previewTitle.textContent = 'تحليل عبر المستشار الذكي';
                this.dom.previewConfidence.textContent = 'بانتظار الإرسال';
                this.dom.previewMath.innerHTML = '';
                this.dom.previewSteps.textContent = 'هذه المسألة تتضمن برهاناً أو رسماً مركباً — اضغط "حل وإرسال للمستشار" لتحليلها بصرياً.';
            } else if (solved.error) {
                this.dom.previewTitle.textContent = 'تنبيه في القيم المدخلة';
                this.dom.previewConfidence.textContent = '';
                this.dom.previewMath.innerHTML = '';
                this.dom.previewSteps.textContent = solved.error;
            } else {
                const conf = localSolver.assessConfidence(payload, solved);
                this.dom.previewTitle.textContent = solved.title || 'النتيجة الهندسية';
                this.dom.previewConfidence.textContent = conf ? `تحقق ذاتي: ${conf.score}% (${conf.label})` : '';
                this.dom.previewMath.innerHTML = `$$${solved.finalResult || ''}$$`;
                this.dom.previewSteps.textContent = Array.isArray(solved.steps)
                    ? solved.steps.slice(0, 3).map((s) => s.explanation).filter(Boolean).join(' • ')
                    : '';
            }

            if (window.MathApp?.ui?.renderMathInElement) {
                window.MathApp.ui.renderMathInElement(this.dom.livePreview);
            }
            if (options.scrollIntoView) {
                this.dom.livePreview.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        } catch (err) {
            this.dom.previewTitle.textContent = 'تعذر المعاينة المحلية';
            this.dom.previewConfidence.textContent = '';
            this.dom.previewMath.innerHTML = '';
            this.dom.previewSteps.textContent = err.message;
        }
    },

    solve() {
        let obj = this.state.scene.objects.find((o) => o.id === this.state.selectedObject);
        if (!obj && this.state.scene.objects.length > 0) {
            obj = this.state.scene.objects[this.state.scene.objects.length - 1];
            this.state.selectedObject = obj.id;
        }

        const questionText = this.dom.questionInput ? this.dom.questionInput.value.trim() : '';

        // إذا لم يرسم المستخدم شكلاً ولكن كتب سؤالاً هندسياً نصياً واضحاً، نرسله مباشرة للدردشة
        if (!obj) {
            if (questionText) {
                const parsed = geometrySolver.parseTextProblem ? geometrySolver.parseTextProblem(questionText) : null;
                window.MathApp.chat.send(parsed || questionText);
                this.dom.modal.style.display = 'none';
                return;
            }
            window.MathApp?.ui?.showToast('يرجى رسم شكل هندسي، اختيار قالب، أو كتابة سؤالك أولاً.', 'error');
            return;
        }

        const userInputs = this._collectUserInputs();
        const problemData = this.formatProblemData(obj, userInputs);
        window.MathApp.chat.send(problemData);
        this.dom.modal.style.display = 'none';
    },

    formatProblemData(obj, userInputs = {}, options = {}) {
        const questionText = this.dom.questionInput ? this.dom.questionInput.value.trim() : '';
        let previewImage = null;
        if (!options.skipImage) {
            try {
                if (this.dom.canvas) previewImage = this.createPreviewImage();
            } catch {
                previewImage = null;
            }
        }
        const unit = this.dom.unitSelect ? this.dom.unitSelect.value : 'unit';
        const data = {
            type: 'structured_problem',
            tool: 'geometry_solver',
            shape: obj.type,
            givens: {},
            solve_for: { type: 'all' },
            question: questionText || null,
            selected_object_id: obj.id,
            scene_summary: this.serializeScene(),
            preview_image: previewImage,
            unit
        };

        if (obj.type === 'triangle') {
            data.givens = { sides: {}, angles: {} };
            const unknowns = obj.manualUnknowns || {};
            const hasManualUnknowns = Object.keys(unknowns).length > 0;

            ['side_a', 'side_b', 'side_c'].forEach((key) => {
                const v = userInputs[key];
                if (v !== null && Number.isFinite(v) && !unknowns[key]) {
                    data.givens.sides[key.replace('side_', '')] = v;
                }
            });

            ['angle_A', 'angle_B', 'angle_C'].forEach((key) => {
                const v = userInputs[key];
                if (v !== null && Number.isFinite(v) && !unknowns[key]) {
                    data.givens.angles[key.replace('angle_', '')] = v;
                }
            });

            if (hasManualUnknowns) {
                const missingSide = ['side_a', 'side_b', 'side_c'].find((k) => unknowns[k] || userInputs[k] === null);
                const missingAngle = ['angle_A', 'angle_B', 'angle_C'].find((k) => unknowns[k] || userInputs[k] === null);
                if (missingSide) data.solve_for = { type: 'side', target: missingSide.replace('side_', '') };
                else if (missingAngle) data.solve_for = { type: 'angle', target: missingAngle.replace('angle_', '') };
            }
        } else if (obj.type === 'rectangle') {
            data.givens = {
                width: userInputs.width ?? obj.props.width,
                height: userInputs.height ?? obj.props.height
            };
        } else if (obj.type === 'cone') {
            data.givens = {
                radius: userInputs.radius ?? obj.props.radius ?? obj.props.width,
                height: userInputs.height ?? obj.props.height
            };
        } else if (obj.type === 'circle') {
            data.givens = {
                radius: userInputs.radius ?? obj.props.radius
            };
        } else if (obj.type === 'ellipse') {
            data.givens = {
                radiusX: userInputs.radiusX ?? obj.props.radiusX,
                radiusY: userInputs.radiusY ?? obj.props.radiusY
            };
        } else if (obj.type === 'line') {
            const pts = obj.points.map((n) => this.state.scene.points[n]).filter(Boolean).map((p) => this._toMathCoords(p));
            data.givens = {
                x1: userInputs.x1 ?? pts[0]?.x ?? obj.props.x1,
                y1: userInputs.y1 ?? pts[0]?.y ?? obj.props.y1,
                x2: userInputs.x2 ?? pts[1]?.x ?? obj.props.x2,
                y2: userInputs.y2 ?? pts[1]?.y ?? obj.props.y2
            };
        } else if (obj.type === 'polygon') {
            const pts = obj.points.map((n) => this.state.scene.points[n]).filter(Boolean).map((p) => this._toMathCoords(p));
            data.givens = { points: pts };
        } else if (obj.type === 'freehand') {
            data.givens = {
                path_length: userInputs.path_length ?? obj.props.length
            };
        }

        return data;
    },

    formatProblemToHTML(data) {
        let html = '<h3>📐 مسألة هندسية من ورشة الهندسة</h3>';
        if (data.preview_image) {
            html += `<div class="geo-chat-preview"><img src="${data.preview_image}" alt="معاينة الرسم الهندسي"></div>`;
        }
        html += `<p><strong>الشكل:</strong> ${this._getObjectTypeName(data.shape)}</p>`;
        if (data.unit && data.unit !== 'unit') {
            html += `<p><strong>الوحدة:</strong> ${data.unit}</p>`;
        }
        html += '<p><strong>المعطيات:</strong></p><ul>';

        if (data.shape === 'triangle') {
            if (data.givens.sides) {
                Object.entries(data.givens.sides).forEach(([key, val]) => {
                    html += `<li>الضلع ${key} = ${val}</li>`;
                });
            }
            if (data.givens.angles) {
                Object.entries(data.givens.angles).forEach(([key, val]) => {
                    html += `<li>الزاوية ${key} = ${val}°</li>`;
                });
            }
        } else if (data.shape === 'rectangle') {
            html += `<li>العرض = ${data.givens.width}</li>`;
            html += `<li>الارتفاع = ${data.givens.height}</li>`;
        } else if (data.shape === 'cone') {
            html += `<li>نصف قطر القاعدة = ${data.givens.radius}</li>`;
            html += `<li>الارتفاع = ${data.givens.height}</li>`;
        } else if (data.shape === 'circle') {
            html += `<li>نصف القطر = ${data.givens.radius}</li>`;
        } else if (data.shape === 'ellipse') {
            html += `<li>نصف المحور الأفقي = ${data.givens.radiusX}</li>`;
            html += `<li>نصف المحور العمودي = ${data.givens.radiusY}</li>`;
        } else if (data.shape === 'line') {
            html += `<li dir="ltr">P₁(${data.givens.x1}, ${data.givens.y1}) → P₂(${data.givens.x2}, ${data.givens.y2})</li>`;
        } else if (data.shape === 'polygon' && Array.isArray(data.givens.points)) {
            html += `<li dir="ltr">${data.givens.points.map((p, i) => `P${i + 1}(${p.x}, ${p.y})`).join(' , ')}</li>`;
        }

        html += '</ul>';
        if (data.question) {
            html += `<p><strong>سؤال المسألة:</strong> ${data.question}</p>`;
        }
        return html;
    }
};
