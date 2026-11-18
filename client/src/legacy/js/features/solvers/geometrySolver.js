// features/solvers/geometrySolver.js - المحلل الهندسي الشامل (مستوي وفراغي وتحليلي)

import { toLatinDigits } from '../../tools/mathNormalize.js';

const fmt = (n, decimals = 4) => {
    if (!Number.isFinite(n)) return String(n);
    const cleaned = Math.abs(n) < 1e-10 ? 0 : Number(n.toFixed(decimals));
    return String(cleaned);
};

const degToRad = (deg) => (deg * Math.PI) / 180;
const radToDeg = (rad) => (rad * 180) / Math.PI;

const detectQuestionFocus = (solveFor, question) => {
    if (solveFor && solveFor.type && solveFor.type !== 'all') {
        return solveFor.type;
    }
    const q = String(question || '').trim().toLowerCase();
    if (!q) return 'all';
    if (/(?:معادلة|الميل|ميل\s*المستقيم|equation|slope|midpoint|منتصف)/i.test(q)) return 'equation';
    if (/(?:فيثاغورس|pythagor|الوتر|hypotenuse)/i.test(q)) return 'pythagorean';
    if (/(?:زاوية|الزوايا|angle)/i.test(q) && !/(?:مساحة|محيط|تحليل\s*كامل|الكل|كامل)/i.test(q)) return 'angle';
    if (/(?:حجم|volume)/i.test(q) && !/(?:مساحة|الكل|كامل|تحليل)/i.test(q)) return 'volume';
    if (/(?:محيط|perimeter|circumference)/i.test(q) && !/(?:مساحة|الكل|كامل|تحليل)/i.test(q)) return 'perimeter';
    if (/(?:مساحة|area)/i.test(q) && !/(?:محيط|حجم|الكل|كامل|تحليل)/i.test(q)) return 'area';
    if (/(?:قطر|diagonal|diameter)/i.test(q) && !/(?:مساحة|محيط|الكل|كامل|تحليل)/i.test(q)) return 'diagonal';
    return 'all';
};

const requiresVisualAI = (data) => {
    const q = String(data?.question || '').trim();
    if (!q) return false;
    // استفسارات هندسية تركيبية أو برهانية تتطلب تحليل الرسم بالذكاء الاصطناعي
    const proofOrComplex = /(?:برهن|أثبت|اثبت|تطابق|تشابه|مماس|منصف|عمود\s*منصف|متوازي|توازي|تقاطع|الدائرتين|الشكلين|المظلل|الجزء\s*المظلل|prove|similarity|congruent|tangent|shaded)/i.test(q);
    const objCount = Array.isArray(data?.scene_summary?.objects) ? data.scene_summary.objects.length : 1;
    if (proofOrComplex) return true;
    if (objCount > 1 && /(?:بين|كلا|الشكلين|الأشكال|المشترك|المسافة\s*بين)/i.test(q)) return true;
    return false;
};

export const geometrySolver = {
    solve(data) {
        if (!data || typeof data !== 'object') return null;

        // إذا كان السؤال يطلب برهاناً أو علاقة بين عدة أشكال مرسومة، نتركه للذكاء الاصطناعي (مع صورة الرسم)
        if (requiresVisualAI(data)) return null;

        const shape = data.shape;
        const givens = data.givens || {};
        const focus = detectQuestionFocus(data.solve_for, data.question);

        if (shape === 'freehand') {
            // الرسم الحر قد يحمل سؤالاً بصرياً للذكاء الاصطناعي؛ إذا وُجد سؤال نُحيله للـ AI، وإلا نُرجع طول المسار محلياً
            if (data.question && String(data.question).trim().length > 0) return null;
            return this.solveFreehand(givens);
        }

        switch (shape) {
            case 'triangle':
                return this.solveTriangle(givens, data.solve_for, focus);
            case 'line':
                return this.solveLine(givens, focus);
            case 'polygon':
                return this.solvePolygon(givens, focus);
            case 'rectangle':
                return this.solveRectangle(givens, focus);
            case 'square':
                return this.solveSquare(givens, focus);
            case 'circle':
                return this.solveCircle(givens, focus);
            case 'ellipse':
                return this.solveEllipse(givens, focus);
            case 'cone':
                return this.solveCone(givens, focus);
            case 'cylinder':
                return this.solveCylinder(givens, focus);
            case 'sphere':
                return this.solveSphere(givens, focus);
            default:
                return null;
        }
    },

    // ==================== المثلث ====================
    solveTriangle(givens, solveFor = { type: 'all' }, focus = 'all') {
        const rawSides = givens?.sides || {};
        const rawAngles = givens?.angles || {};

        const sides = {};
        for (const k of ['a', 'b', 'c']) {
            const val = Number(rawSides[k] ?? rawSides[k.toUpperCase()]);
            if (Number.isFinite(val) && val > 0) sides[k] = val;
        }

        const angles = {};
        for (const k of ['A', 'B', 'C']) {
            const val = Number(rawAngles[k] ?? rawAngles[k.toLowerCase()]);
            if (Number.isFinite(val) && val > 0 && val < 180) angles[k] = val;
        }

        const knownSides = Object.keys(sides).length;
        const knownAngles = Object.keys(angles).length;

        // 1) طلب زاوية ناقصة من زاويتين فقط (أو بدون أضلاع كافية)
        if ((solveFor?.type === 'angle' || focus === 'angle') && knownAngles === 2 && knownSides < 1) {
            const missingKey = ['A', 'B', 'C'].find((k) => angles[k] === undefined) || 'C';
            return this.triangleAngleSum(angles, missingKey);
        }

        // 2) زاويتان فقط معلومتان بدون أضلاع
        if (knownAngles === 2 && knownSides === 0) {
            const missingKey = ['A', 'B', 'C'].find((k) => angles[k] === undefined) || 'C';
            return this.triangleAngleSum(angles, missingKey);
        }

        // 3) نظرية فيثاغورس (زاوية 90° + ضلعان)
        const rightAngle = Object.entries(angles).find(([, v]) => Math.abs(v - 90) < 1e-6);
        if (rightAngle && knownSides === 2) {
            return this.pythagorean(sides, rightAngle[0], solveFor?.target);
        }

        // 4) إذا كانت الأضلاع الثلاثة معلومة (SSS) - الحالة الأكثر شمولاً
        if (knownSides === 3) {
            return this.triangleSidesOnly(sides, focus);
        }

        // 5) ضلعان وزاوية (SAS أو SSA)
        if (knownSides === 2 && knownAngles === 1) {
            const angleKey = Object.keys(angles)[0];
            const oppSideKey = angleKey.toLowerCase();
            if (sides[oppSideKey] === undefined) {
                return this.triangleSAS(sides, angles);
            }
            return this.triangleSSA(sides, angles);
        }

        // 6) ضلع وزاويتان (ASA / AAS)
        if (knownSides >= 1 && knownAngles >= 2) {
            return this.triangleASA(sides, angles);
        }

        return null;
    },

    triangleAngleSum(angles, targetAngle = 'C') {
        const vals = Object.values(angles).map(Number);
        const sum = vals.reduce((a, b) => a + b, 0);
        if (!Number.isFinite(sum) || sum <= 0 || sum >= 180) {
            return { error: 'مجموع الزاويتين يجب أن يكون موجباً وأقل من 180°.' };
        }
        const missing = 180 - sum;

        return {
            title: `حساب الزاوية المجهولة في المثلث (${targetAngle})`,
            finalResult: `\\angle ${targetAngle} = ${fmt(missing)}^\\circ`,
            steps: [
                { explanation: 'القاعدة: مجموع الزوايا الداخلية لأي مثلث يساوي 180°', equation: '\\angle A + \\angle B + \\angle C = 180^\\circ' },
                { explanation: 'طرح مجموع الزاويتين المعلومتين من 180°:', equation: `\\angle ${targetAngle} = 180^\\circ - (${vals.map((v) => `${fmt(v)}^\\circ`).join(' + ')}) = ${fmt(missing)}^\\circ` }
            ],
            meta: { shape: 'triangle_angles', angleSum: sum + missing }
        };
    },

    pythagorean(sides, rightAngleKey = 'C') {
        const hyp = String(rightAngleKey).toLowerCase();
        const legs = ['a', 'b', 'c'].filter((s) => s !== hyp);
        const knownLegs = legs.filter((l) => sides[l] !== undefined);

        if (sides[hyp] !== undefined && knownLegs.length === 1) {
            const known = knownLegs[0];
            const missing = legs.find((l) => sides[l] === undefined);
            const hVal = Number(sides[hyp]);
            const kVal = Number(sides[known]);
            if (!Number.isFinite(hVal) || !Number.isFinite(kVal) || hVal <= 0 || kVal <= 0) {
                return { error: 'أطوال الأضلاع يجب أن تكون قيماً موجبة.' };
            }
            if (hVal <= kVal) {
                return { error: 'طول الوتر يجب أن يكون أكبر من طول الضلع القائم.' };
            }
            const diffSq = hVal ** 2 - kVal ** 2;
            const result = Math.sqrt(diffSq);
            const area = 0.5 * kVal * result;
            const perimeter = hVal + kVal + result;
            const otherAngles = {};
            otherAngles[rightAngleKey] = 90;
            otherAngles[known.toUpperCase()] = radToDeg(Math.asin(kVal / hVal));
            otherAngles[missing.toUpperCase()] = 90 - otherAngles[known.toUpperCase()];

            const fullSides = { [hyp]: hVal, [known]: kVal, [missing]: result };

            return {
                title: `حساب الضلع القائم ${missing} (نظرية فيثاغورس)`,
                finalResult: `${missing} = ${fmt(result)}, \\quad \\text{المساحة} = ${fmt(area)}`,
                steps: [
                    { explanation: `المثلث قائم في الزاوية ${rightAngleKey}، إذن الوتر هو ${hyp} = ${fmt(hVal)}:`, equation: `${missing}^2 = ${hyp}^2 - ${known}^2` },
                    { explanation: 'التعويض بالقيم المعطاة:', equation: `${missing}^2 = ${fmt(hVal)}^2 - ${fmt(kVal)}^2 = ${fmt(diffSq)}` },
                    { explanation: 'أخذ الجذر التربيعي الموجب:', equation: `${missing} = \\sqrt{${fmt(diffSq)}} = ${fmt(result)}` },
                    { explanation: 'المحيط والمساحة والزوايا الحادة:', equation: `P = ${fmt(perimeter)}, \\; A = ${fmt(area)}, \\; \\angle ${known.toUpperCase()} = ${fmt(otherAngles[known.toUpperCase()], 2)}^\\circ, \\; \\angle ${missing.toUpperCase()} = ${fmt(otherAngles[missing.toUpperCase()], 2)}^\\circ` }
                ],
                meta: { shape: 'triangle', isRight: true, hypKey: hyp, sides: fullSides, angles: otherAngles, perimeter, area }
            };
        }

        if (knownLegs.length === 2) {
            const l1 = knownLegs[0];
            const l2 = knownLegs[1];
            const v1 = Number(sides[l1]);
            const v2 = Number(sides[l2]);
            if (!Number.isFinite(v1) || !Number.isFinite(v2) || v1 <= 0 || v2 <= 0) {
                return { error: 'أطوال الأضلاع القائمة يجب أن تكون موجبة.' };
            }
            const sumSq = v1 ** 2 + v2 ** 2;
            const result = Math.sqrt(sumSq);
            const area = 0.5 * v1 * v2;
            const perimeter = v1 + v2 + result;
            const otherAngles = {};
            otherAngles[rightAngleKey] = 90;
            otherAngles[l1.toUpperCase()] = radToDeg(Math.atan2(v1, v2));
            otherAngles[l2.toUpperCase()] = 90 - otherAngles[l1.toUpperCase()];

            const fullSides = { [hyp]: result, [l1]: v1, [l2]: v2 };

            return {
                title: `حساب الوتر ${hyp} (نظرية فيثاغورس)`,
                finalResult: `${hyp} = ${fmt(result)}, \\quad \\text{المساحة} = ${fmt(area)}`,
                steps: [
                    { explanation: `المثلث قائم في الزاوية ${rightAngleKey}، تطبيق نظرية فيثاغورس:`, equation: `${hyp}^2 = ${l1}^2 + ${l2}^2` },
                    { explanation: 'التعويض وحساب المجموع:', equation: `${hyp}^2 = ${fmt(v1)}^2 + ${fmt(v2)}^2 = ${fmt(sumSq)}` },
                    { explanation: 'الوتر والمحيط والمساحة:', equation: `${hyp} = \\sqrt{${fmt(sumSq)}} = ${fmt(result)}, \\quad P = ${fmt(perimeter)}, \\quad A = ${fmt(area)}` },
                    { explanation: 'الزوايا الحادة للمثلث:', equation: `\\angle ${l1.toUpperCase()} = ${fmt(otherAngles[l1.toUpperCase()], 2)}^\\circ, \\quad \\angle ${l2.toUpperCase()} = ${fmt(otherAngles[l2.toUpperCase()], 2)}^\\circ` }
                ],
                meta: { shape: 'triangle', isRight: true, hypKey: hyp, sides: fullSides, angles: otherAngles, perimeter, area }
            };
        }

        return null;
    },

    triangleSidesOnly(sides, focus = 'all') {
        const a = Number(sides.a);
        const b = Number(sides.b);
        const c = Number(sides.c);
        if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c) || a <= 0 || b <= 0 || c <= 0) {
            return { error: 'جميع أضلاع المثلث يجب أن تكون أعداداً موجبة.' };
        }
        if (a + b <= c + 1e-9 || a + c <= b + 1e-9 || b + c <= a + 1e-9) {
            return { error: 'الأطوال المعطاة لا تحقق متباينة المثلث (مجموع أي ضلعين يجب أن يكون أكبر من الثالث).' };
        }

        const clampCos = (v) => Math.max(-1, Math.min(1, v));
        const angleA = radToDeg(Math.acos(clampCos((b ** 2 + c ** 2 - a ** 2) / (2 * b * c))));
        const angleB = radToDeg(Math.acos(clampCos((a ** 2 + c ** 2 - b ** 2) / (2 * a * c))));
        const angleC = 180 - angleA - angleB;

        const perimeter = a + b + c;
        const s = perimeter / 2;
        const area = Math.sqrt(Math.max(0, s * (s - a) * (s - b) * (s - c)));

        const ha = (2 * area) / a;
        const hb = (2 * area) / b;
        const hc = (2 * area) / c;
        const inradius = area / s;
        const circumradius = (a * b * c) / (4 * area);

        // تصنيف المثلث
        const eps = 1e-3;
        let sideType = 'مختلف الأضلاع';
        if (Math.abs(a - b) < eps && Math.abs(b - c) < eps) sideType = 'متساوي الأضلاع';
        else if (Math.abs(a - b) < eps || Math.abs(b - c) < eps || Math.abs(a - c) < eps) sideType = 'متساوي الساقين';

        const maxAng = Math.max(angleA, angleB, angleC);
        let angleType = 'حاد الزوايا';
        if (Math.abs(maxAng - 90) < 0.05) angleType = 'قائم الزاوية';
        else if (maxAng > 90) angleType = 'منفرج الزاوية';

        let finalResult = `\\text{المساحة} = ${fmt(area)}, \\quad P = ${fmt(perimeter)}`;
        if (focus === 'perimeter') {
            finalResult = `P = ${fmt(perimeter)}`;
        } else if (focus === 'angle') {
            finalResult = `A=${fmt(angleA, 2)}^\\circ, \\; B=${fmt(angleB, 2)}^\\circ, \\; C=${fmt(angleC, 2)}^\\circ`;
        }

        return {
            title: `تحليل المثلث (${sideType} • ${angleType})`,
            finalResult,
            steps: [
                { explanation: 'المحيط ونصف المحيط:', equation: `P = ${fmt(a)} + ${fmt(b)} + ${fmt(c)} = ${fmt(perimeter)}, \\quad s = \\frac{P}{2} = ${fmt(s)}` },
                { explanation: 'المساحة بصيغة هيرون:', equation: `A = \\sqrt{s(s-a)(s-b)(s-c)} = ${fmt(area)}` },
                { explanation: 'حساب الزوايا بقانون جيب التمام:', equation: `A = ${fmt(angleA, 2)}^\\circ, \\; B = ${fmt(angleB, 2)}^\\circ, \\; C = ${fmt(angleC, 2)}^\\circ` },
                { explanation: 'الارتفاعات ونصفا قطري الدائرة الداخلية والمحيطة:', equation: `h_a=${fmt(ha)}, \\; h_b=${fmt(hb)}, \\; h_c=${fmt(hc)}, \\; r=${fmt(inradius)}, \\; R=${fmt(circumradius)}` }
            ],
            meta: {
                shape: 'triangle',
                sides: { a, b, c },
                angles: { A: angleA, B: angleB, C: angleC },
                perimeter,
                area
            }
        };
    },

    triangleSAS(sides, angles) {
        const sideEntries = Object.entries(sides);
        const angleEntries = Object.entries(angles);
        if (sideEntries.length !== 2 || angleEntries.length !== 1) return null;

        const [k1, s1] = sideEntries[0];
        const [k2, s2] = sideEntries[1];
        const [angKey, angDeg] = angleEntries[0];
        const missingSideKey = ['a', 'b', 'c'].find((k) => k !== k1 && k !== k2) || angKey.toLowerCase();

        if (!Number.isFinite(s1) || !Number.isFinite(s2) || !Number.isFinite(angDeg) || s1 <= 0 || s2 <= 0 || angDeg <= 0 || angDeg >= 180) {
            return { error: 'معطيات المثلث (الضلعان والزاوية المحصورة) غير صالحة.' };
        }
        const rad = degToRad(angDeg);
        const third = Math.sqrt(Math.max(0, s1 ** 2 + s2 ** 2 - 2 * s1 * s2 * Math.cos(rad)));
        const area = 0.5 * s1 * s2 * Math.sin(rad);
        const perimeter = s1 + s2 + third;

        const fullSides = { [k1]: s1, [k2]: s2, [missingSideKey]: third };
        const clampCos = (v) => Math.max(-1, Math.min(1, v));
        const a = fullSides.a, b = fullSides.b, c = fullSides.c;
        const A = radToDeg(Math.acos(clampCos((b ** 2 + c ** 2 - a ** 2) / (2 * b * c))));
        const B = radToDeg(Math.acos(clampCos((a ** 2 + c ** 2 - b ** 2) / (2 * a * c))));
        const C = 180 - A - B;

        return {
            title: 'حل المثلث (ضلعان وزاوية محصورة SAS)',
            finalResult: `${missingSideKey} = ${fmt(third)}, \\quad \\text{المساحة} = ${fmt(area)}`,
            steps: [
                { explanation: 'تطبيق قانون جيب التمام لإيجاد الضلع الثالث:', equation: `${missingSideKey} = \\sqrt{${fmt(s1)}^2 + ${fmt(s2)}^2 - 2(${fmt(s1)})(${fmt(s2)})\\cos(${fmt(angDeg)}^\\circ)} = ${fmt(third)}` },
                { explanation: 'حساب مساحة المثلث:', equation: `A = \\frac{1}{2}(${fmt(s1)})(${fmt(s2)})\\sin(${fmt(angDeg)}^\\circ) = ${fmt(area)}` },
                { explanation: 'المحيط وبقية الزوايا:', equation: `P = ${fmt(perimeter)}, \\; A=${fmt(A, 2)}^\\circ, \\; B=${fmt(B, 2)}^\\circ, \\; C=${fmt(C, 2)}^\\circ` }
            ],
            meta: { shape: 'triangle', sides: fullSides, angles: { A, B, C }, perimeter, area }
        };
    },

    triangleSSA(sides, angles) {
        const [angKey, angDeg] = Object.entries(angles)[0];
        const oppKey = angKey.toLowerCase();
        const oppSide = sides[oppKey];
        const adjEntry = Object.entries(sides).find(([k]) => k !== oppKey);
        if (!oppSide || !adjEntry) return null;

        const [adjKey, adjSide] = adjEntry;
        const sinAdj = (adjSide * Math.sin(degToRad(angDeg))) / oppSide;
        if (sinAdj > 1 + 1e-9) {
            return { error: 'لا يوجد مثلث يحقق هذه المعطيات (جيب الزاوية أكبر من 1).' };
        }
        const adjAngleDeg = radToDeg(Math.asin(Math.min(1, sinAdj)));
        const remKey = ['a', 'b', 'c'].find((k) => k !== oppKey && k !== adjKey);
        const remAngleDeg = 180 - angDeg - adjAngleDeg;
        if (remAngleDeg <= 0) {
            return { error: 'لا يمكن تكوين مثلث بهذه المعطيات (مجموع الزوايا يتجاوز 180°).' };
        }
        const remSide = (oppSide * Math.sin(degToRad(remAngleDeg))) / Math.sin(degToRad(angDeg));
        const fullSides = { [oppKey]: oppSide, [adjKey]: adjSide, [remKey]: remSide };
        const fullAngles = {
            [angKey]: angDeg,
            [adjKey.toUpperCase()]: adjAngleDeg,
            [remKey.toUpperCase()]: remAngleDeg
        };
        const perimeter = oppSide + adjSide + remSide;
        const area = 0.5 * oppSide * adjSide * Math.sin(degToRad(remAngleDeg));

        return {
            title: 'حل المثلث بقانون الجيوب (SSA)',
            finalResult: `${remKey} = ${fmt(remSide)}, \\quad \\text{المساحة} = ${fmt(area)}`,
            steps: [
                { explanation: 'حساب الزاوية الثانية بقانون الجيوب:', equation: `\\sin(${adjKey.toUpperCase()}) = \\frac{${fmt(adjSide)}\\sin(${fmt(angDeg)}^\\circ)}{${fmt(oppSide)}} \\Rightarrow \\angle ${adjKey.toUpperCase()} \\approx ${fmt(adjAngleDeg, 2)}^\\circ` },
                { explanation: 'الزاوية الثالثة والضلع الثالث:', equation: `\\angle ${remKey.toUpperCase()} = ${fmt(remAngleDeg, 2)}^\\circ, \\quad ${remKey} = ${fmt(remSide)}` },
                { explanation: 'المحيط والمساحة:', equation: `P = ${fmt(perimeter)}, \\quad A = ${fmt(area)}` }
            ],
            meta: { shape: 'triangle', sides: fullSides, angles: fullAngles, perimeter, area }
        };
    },

    triangleASA(sides, angles) {
        const A = angles.A ?? (angles.B && angles.C ? 180 - angles.B - angles.C : undefined);
        const B = angles.B ?? (angles.A && angles.C ? 180 - angles.A - angles.C : undefined);
        const C = angles.C ?? (angles.A && angles.B ? 180 - angles.A - angles.B : undefined);
        if (!A || !B || !C || A <= 0 || B <= 0 || C <= 0) {
            return { error: 'زوايا المثلث غير متسقة (يجب أن يكون مجموعها أقل من 180°).' };
        }
        const knownSideEntry = Object.entries(sides)[0];
        if (!knownSideEntry) return null;
        const [k, sVal] = knownSideEntry;
        const ratio = sVal / Math.sin(degToRad({ a: A, b: B, c: C }[k]));
        const a = ratio * Math.sin(degToRad(A));
        const b = ratio * Math.sin(degToRad(B));
        const c = ratio * Math.sin(degToRad(C));
        const perimeter = a + b + c;
        const area = 0.5 * a * b * Math.sin(degToRad(C));

        return {
            title: 'حل المثلث بقانون الجيوب (زاويتان وضلع)',
            finalResult: `\\text{المساحة} = ${fmt(area)}, \\quad P = ${fmt(perimeter)}`,
            steps: [
                { explanation: 'إكمال الزاوية الثالثة:', equation: `A=${fmt(A, 2)}^\\circ, \\; B=${fmt(B, 2)}^\\circ, \\; C=${fmt(C, 2)}^\\circ` },
                { explanation: 'حساب باقي الأضلاع بقانون الجيوب ($\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C}$):', equation: `a=${fmt(a)}, \\; b=${fmt(b)}, \\; c=${fmt(c)}` },
                { explanation: 'المحيط والمساحة:', equation: `P = ${fmt(perimeter)}, \\quad \\text{المساحة} = ${fmt(area)}` }
            ],
            meta: { shape: 'triangle', sides: { a, b, c }, angles: { A, B, C }, perimeter, area }
        };
    },

    // ==================== القطعة المستقيمة والمستقيم ====================
    solveLine(givens, focus = 'all') {
        const pts = Array.isArray(givens?.points) ? givens.points : null;
        let x1 = Number(givens?.x1 ?? pts?.[0]?.x);
        let y1 = Number(givens?.y1 ?? pts?.[0]?.y);
        let x2 = Number(givens?.x2 ?? pts?.[1]?.x);
        let y2 = Number(givens?.y2 ?? pts?.[1]?.y);

        if (![x1, y1, x2, y2].every(Number.isFinite)) {
            const length = Number(givens?.length);
            if (!Number.isFinite(length) || length <= 0) return null;
            return {
                title: 'خصائص القطعة المستقيمة',
                finalResult: `L = ${fmt(length)}`,
                steps: [{ explanation: 'طول القطعة المستقيمة:', equation: `L = ${fmt(length)}` }],
                meta: { shape: 'line', length }
            };
        }

        const dx = x2 - x1;
        const dy = y2 - y1;
        const length = Math.hypot(dx, dy);
        if (length < 1e-9) {
            return { error: 'النقطتان متطابقتان؛ يرجى اختيار نقطتين مختلفتين لتكوين قطعة مستقيمة.' };
        }

        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const isVertical = Math.abs(dx) < 1e-9;
        const isHorizontal = Math.abs(dy) < 1e-9;

        let slopeLatex = '\\text{غير معرّف (رأسي)}';
        let eqLatex = `x = ${fmt(x1)}`;
        let standardLatex = `x - (${fmt(x1)}) = 0`;
        let angleDeg = 90;

        if (!isVertical) {
            const m = dy / dx;
            const b = y1 - m * x1;
            slopeLatex = fmt(m);
            angleDeg = radToDeg(Math.atan2(dy, dx));
            if (isHorizontal) {
                eqLatex = `y = ${fmt(y1)}`;
            } else {
                const bSign = b >= 0 ? `+ ${fmt(b)}` : `- ${fmt(Math.abs(b))}`;
                eqLatex = Math.abs(b) < 1e-9 ? `y = ${fmt(m)}x` : `y = ${fmt(m)}x ${bSign}`;
            }
            const A = fmt(-dy, 3);
            const B = fmt(dx, 3);
            const C = fmt(dy * x1 - dx * y1, 3);
            standardLatex = `${A}x + (${B})y + (${C}) = 0`;
        }

        const finalResult = focus === 'equation'
            ? eqLatex
            : `L = ${fmt(length)}, \\quad ${eqLatex}`;

        return {
            title: 'التحليل الهندسي للقطعة المستقيمة',
            finalResult,
            steps: [
                { explanation: 'إحداثيات نقطتي البداية والنهاية:', equation: `P_1(${fmt(x1, 2)}, ${fmt(y1, 2)}), \\quad P_2(${fmt(x2, 2)}, ${fmt(y2, 2)})` },
                { explanation: 'حساب المسافة (طول القطعة المستقيمة):', equation: `d = \\sqrt{(${fmt(dx, 2)})^2 + (${fmt(dy, 2)})^2} = ${fmt(length)}` },
                { explanation: 'نقطة المنتصف:', equation: `M = \\left(${fmt(midX, 2)}, ${fmt(midY, 2)}\\right)` },
                { explanation: 'الميل وزاوية الميل:', equation: `m = ${slopeLatex}, \\quad \\theta = ${fmt(angleDeg, 2)}^\\circ` },
                { explanation: 'معادلة المستقيم المار بالنقطتين:', equation: `${eqLatex} \\quad \\Longleftrightarrow \\quad ${standardLatex}` }
            ],
            meta: {
                shape: 'line',
                x1, y1, x2, y2,
                length,
                midX, midY,
                slope: isVertical ? null : dy / dx
            }
        };
    },

    // ==================== المضلع العام والمنتظم ====================
    solvePolygon(givens, focus = 'all') {
        const pts = Array.isArray(givens?.points) ? givens.points : null;

        if (pts && pts.length >= 3) {
            const valid = pts.every((p) => Number.isFinite(Number(p.x)) && Number.isFinite(Number(p.y)));
            if (!valid) return null;

            const n = pts.length;
            const edges = [];
            let perimeter = 0;
            let signedArea2 = 0;
            let cx = 0;
            let cy = 0;

            for (let i = 0; i < n; i++) {
                const p1 = { x: Number(pts[i].x), y: Number(pts[i].y) };
                const p2 = { x: Number(pts[(i + 1) % n].x), y: Number(pts[(i + 1) % n].y) };
                const edgeLen = Math.hypot(p2.x - p1.x, p2.y - p1.y);
                edges.push(edgeLen);
                perimeter += edgeLen;

                const cross = p1.x * p2.y - p2.x * p1.y;
                signedArea2 += cross;
                cx += (p1.x + p2.x) * cross;
                cy += (p1.y + p2.y) * cross;
            }

            const area = Math.abs(signedArea2) / 2;
            if (area < 1e-7) {
                return { error: 'رؤوس المضلع تقع على استقامة واحدة (المساحة تساوي صفراً).' };
            }
            const centroidX = cx / (3 * signedArea2);
            const centroidY = cy / (3 * signedArea2);
            const interiorSum = (n - 2) * 180;

            const finalResult = focus === 'perimeter'
                ? `P = ${fmt(perimeter)}`
                : `\\text{المساحة} = ${fmt(area)}, \\quad P = ${fmt(perimeter)}`;

            return {
                title: `تحليل المضلع (${n} أضلاع — صيغة الرباط / غاوس)`,
                finalResult,
                steps: [
                    { explanation: 'أطوال الأضلاع المتتالية:', equation: edges.map((e, i) => `s_${i + 1} = ${fmt(e)}`).join(',\\; ') },
                    { explanation: 'محيط المضلع (مجموع أطوال الأضلاع):', equation: `P = ${edges.map((e) => fmt(e, 2)).join(' + ')} = ${fmt(perimeter)}` },
                    { explanation: 'المساحة بصيغة غاوس (Shoelace Formula):', equation: `A = \\frac{1}{2}\\left|\\sum_{i=1}^{${n}}(x_i y_{i+1} - x_{i+1} y_i)\\right| = ${fmt(area)}` },
                    { explanation: 'مجموع الزوايا الداخلية ومركز الثقل:', equation: `\\Sigma\\theta = (${n}-2)\\times 180^\\circ = ${interiorSum}^\\circ, \\quad G\\left(${fmt(centroidX, 2)}, ${fmt(centroidY, 2)}\\right)` }
                ],
                meta: {
                    shape: 'polygon',
                    n,
                    edges,
                    perimeter,
                    area,
                    interiorSum
                }
            };
        }

        // مضلع منتظم بعدد أضلاع وطول ضلع
        const n = parseInt(givens?.sidesCount ?? givens?.n, 10);
        const s = Number(givens?.sideLength ?? givens?.side);
        if (!Number.isFinite(n) || n < 3 || !Number.isFinite(s) || s <= 0) return null;

        const perimeter = n * s;
        const apothem = s / (2 * Math.tan(Math.PI / n));
        const area = 0.5 * perimeter * apothem;
        const interiorAngle = ((n - 2) * 180) / n;

        return {
            title: `خصائص المضلع المنتظم (${n} أضلاع)`,
            finalResult: `\\text{المساحة} = ${fmt(area)}, \\quad P = ${fmt(perimeter)}`,
            steps: [
                { explanation: 'المحيط:', equation: `P = n \\cdot s = ${n} \\times ${fmt(s)} = ${fmt(perimeter)}` },
                { explanation: 'العامد (Apothem):', equation: `a = \\frac{s}{2\\tan(\\pi/n)} = ${fmt(apothem)}` },
                { explanation: 'المساحة:', equation: `A = \\frac{1}{2} P \\cdot a = ${fmt(area)}` },
                { explanation: 'قياس كل زاوية داخلية:', equation: `\\theta = \\frac{(${n}-2)\\times 180^\\circ}{${n}} = ${fmt(interiorAngle, 2)}^\\circ` }
            ],
            meta: { shape: 'polygon', n, perimeter, area }
        };
    },

    // ==================== المربع والمستطيل ====================
    solveSquare(givens, focus = 'all') {
        const side = Number(givens?.side ?? givens?.width);
        if (!Number.isFinite(side) || side <= 0) return null;
        const area = side ** 2;
        const perimeter = 4 * side;
        const diagonal = side * Math.SQRT2;

        let finalResult = `\\text{المساحة} = ${fmt(area)}, \\quad \\text{المحيط} = ${fmt(perimeter)}`;
        if (focus === 'area') finalResult = `A = ${fmt(area)}`;
        else if (focus === 'perimeter') finalResult = `P = ${fmt(perimeter)}`;
        else if (focus === 'diagonal') finalResult = `d = ${fmt(diagonal)}`;

        return {
            title: 'خصائص المربع',
            finalResult,
            steps: [
                { explanation: 'مساحة المربع:', equation: `A = s^2 = ${fmt(side)}^2 = ${fmt(area)}` },
                { explanation: 'محيط المربع:', equation: `P = 4s = 4 \\times ${fmt(side)} = ${fmt(perimeter)}` },
                { explanation: 'طول القطر:', equation: `d = s\\sqrt{2} = ${fmt(diagonal)}` }
            ],
            meta: { shape: 'square', side, area, perimeter, diagonal }
        };
    },

    solveRectangle(givens, focus = 'all') {
        const width = Number(givens?.width);
        const height = Number(givens?.height);
        if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return null;

        if (Math.abs(width - height) < 1e-7) {
            return this.solveSquare({ side: width }, focus);
        }

        const area = width * height;
        const perimeter = 2 * (width + height);
        const diagonal = Math.sqrt(width ** 2 + height ** 2);

        let finalResult = `\\text{المساحة} = ${fmt(area)}, \\quad \\text{المحيط} = ${fmt(perimeter)}`;
        if (focus === 'area') finalResult = `A = ${fmt(area)}`;
        else if (focus === 'perimeter') finalResult = `P = ${fmt(perimeter)}`;
        else if (focus === 'diagonal') finalResult = `d = ${fmt(diagonal)}`;

        return {
            title: 'خصائص المستطيل',
            finalResult,
            steps: [
                { explanation: 'المساحة:', equation: `A = w \\times h = ${fmt(width)} \\times ${fmt(height)} = ${fmt(area)}` },
                { explanation: 'المحيط:', equation: `P = 2(w + h) = 2(${fmt(width)} + ${fmt(height)}) = ${fmt(perimeter)}` },
                { explanation: 'طول القطر (فيثاغورس):', equation: `d = \\sqrt{${fmt(width)}^2 + ${fmt(height)}^2} = ${fmt(diagonal)}` }
            ],
            meta: { shape: 'rectangle', width, height, area, perimeter, diagonal }
        };
    },

    // ==================== الدائرة والقطع الناقص ====================
    solveCircle(givens, focus = 'all') {
        const radius = Number(givens?.radius);
        if (!Number.isFinite(radius) || radius <= 0) return null;

        const diameter = 2 * radius;
        const area = Math.PI * radius ** 2;
        const circumference = 2 * Math.PI * radius;

        let finalResult = `\\text{المساحة} = ${fmt(area)}, \\quad \\text{المحيط} = ${fmt(circumference)}`;
        if (focus === 'area') finalResult = `A = ${fmt(radius ** 2)}\\pi \\approx ${fmt(area)}`;
        else if (focus === 'perimeter') finalResult = `C = ${fmt(2 * radius)}\\pi \\approx ${fmt(circumference)}`;
        else if (focus === 'diagonal') finalResult = `d = ${fmt(diameter)}`;

        return {
            title: 'خصائص الدائرة',
            finalResult,
            steps: [
                { explanation: 'طول القطر:', equation: `d = 2r = ${fmt(diameter)}` },
                { explanation: 'المساحة (πr²):', equation: `A = \\pi \\times ${fmt(radius)}^2 = ${fmt(radius ** 2)}\\pi \\approx ${fmt(area)}` },
                { explanation: 'المحيط (2πr):', equation: `C = 2\\pi \\times ${fmt(radius)} = ${fmt(2 * radius)}\\pi \\approx ${fmt(circumference)}` }
            ],
            meta: { shape: 'circle', radius, diameter, area, circumference }
        };
    },

    solveEllipse(givens, focus = 'all') {
        const radiusX = Number(givens?.radiusX ?? givens?.a ?? givens?.rx);
        const radiusY = Number(givens?.radiusY ?? givens?.b ?? givens?.ry);
        if (!Number.isFinite(radiusX) || !Number.isFinite(radiusY) || radiusX <= 0 || radiusY <= 0) return null;

        const area = Math.PI * radiusX * radiusY;
        const h = ((radiusX - radiusY) ** 2) / ((radiusX + radiusY) ** 2);
        const perimeter = Math.PI * (radiusX + radiusY) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
        const aMajor = Math.max(radiusX, radiusY);
        const bMinor = Math.min(radiusX, radiusY);
        const cFocus = Math.sqrt(Math.max(0, aMajor ** 2 - bMinor ** 2));
        const eccentricity = cFocus / aMajor;

        const finalResult = focus === 'perimeter'
            ? `P \\approx ${fmt(perimeter)}`
            : `\\text{المساحة} = ${fmt(area)}, \\quad P \\approx ${fmt(perimeter)}`;

        return {
            title: 'خصائص القطع الناقص',
            finalResult,
            steps: [
                { explanation: 'نصفا المحورين:', equation: `a = ${fmt(radiusX)}, \\; b = ${fmt(radiusY)}` },
                { explanation: 'المساحة:', equation: `A = \\pi a b = \\pi \\times ${fmt(radiusX)} \\times ${fmt(radiusY)} = ${fmt(area)}` },
                { explanation: 'المحيط التقريبي (صيغة رامانوجان):', equation: `P \\approx ${fmt(perimeter)}` },
                { explanation: 'البعد البؤري والاختلاف المركزي:', equation: `c = ${fmt(cFocus)}, \\quad e = \\frac{c}{a} = ${fmt(eccentricity)}` }
            ],
            meta: { shape: 'ellipse', radiusX, radiusY, area, perimeter }
        };
    },

    // ==================== المجسمات الفراغية ====================
    solveCone(givens, focus = 'all') {
        const radius = Number(givens?.radius ?? givens?.width);
        const height = Number(givens?.height);
        if (!Number.isFinite(radius) || !Number.isFinite(height) || radius <= 0 || height <= 0) return null;

        const slantHeight = Math.sqrt(radius ** 2 + height ** 2);
        const baseArea = Math.PI * radius ** 2;
        const lateralArea = Math.PI * radius * slantHeight;
        const totalArea = baseArea + lateralArea;
        const volume = (1 / 3) * Math.PI * radius ** 2 * height;

        let finalResult = `V = ${fmt(volume)}, \\quad A_{\\text{total}} = ${fmt(totalArea)}`;
        if (focus === 'volume') finalResult = `V = ${fmt(volume)}`;
        else if (focus === 'area') finalResult = `A_{\\text{total}} = ${fmt(totalArea)}`;

        return {
            title: 'خصائص المخروط القائم',
            finalResult,
            steps: [
                { explanation: 'نصف قطر القاعدة والارتفاع:', equation: `r = ${fmt(radius)}, \\; h = ${fmt(height)}` },
                { explanation: 'طول الراسم (فيثاغورس):', equation: `l = \\sqrt{r^2 + h^2} = \\sqrt{${fmt(radius)}^2 + ${fmt(height)}^2} = ${fmt(slantHeight)}` },
                { explanation: 'المساحة الجانبية والكلية:', equation: `A_{\\text{lat}} = \\pi r l = ${fmt(lateralArea)}, \\quad A_{\\text{total}} = ${fmt(baseArea)} + ${fmt(lateralArea)} = ${fmt(totalArea)}` },
                { explanation: 'حجم المخروط:', equation: `V = \\frac{1}{3}\\pi r^2 h = ${fmt(volume)}` }
            ],
            meta: { shape: 'cone', radius, height, slantHeight, baseArea, lateralArea, totalArea, volume }
        };
    },

    solveCylinder(givens, focus = 'all') {
        const radius = Number(givens?.radius);
        const height = Number(givens?.height);
        if (!Number.isFinite(radius) || !Number.isFinite(height) || radius <= 0 || height <= 0) return null;

        const volume = Math.PI * radius ** 2 * height;
        const lateralArea = 2 * Math.PI * radius * height;
        const totalArea = lateralArea + 2 * Math.PI * radius ** 2;

        let finalResult = `V = ${fmt(volume)}, \\quad A_{\\text{total}} = ${fmt(totalArea)}`;
        if (focus === 'volume') finalResult = `V = ${fmt(volume)}`;
        else if (focus === 'area') finalResult = `A_{\\text{total}} = ${fmt(totalArea)}`;

        return {
            title: 'خصائص الأسطوانة القائمة',
            finalResult,
            steps: [
                { explanation: 'المساحة الجانبية:', equation: `A_{\\text{lat}} = 2\\pi r h = ${fmt(lateralArea)}` },
                { explanation: 'المساحة الكلية:', equation: `A_{\\text{total}} = 2\\pi r(h + r) = ${fmt(totalArea)}` },
                { explanation: 'الحجم:', equation: `V = \\pi r^2 h = ${fmt(volume)}` }
            ],
            meta: { shape: 'cylinder', radius, height, lateralArea, totalArea, volume }
        };
    },

    solveSphere(givens, focus = 'all') {
        const radius = Number(givens?.radius);
        if (!Number.isFinite(radius) || radius <= 0) return null;

        const surfaceArea = 4 * Math.PI * radius ** 2;
        const volume = (4 / 3) * Math.PI * radius ** 3;

        let finalResult = `V = ${fmt(volume)}, \\quad A = ${fmt(surfaceArea)}`;
        if (focus === 'volume') finalResult = `V = ${fmt(volume)}`;
        else if (focus === 'area') finalResult = `A = ${fmt(surfaceArea)}`;

        return {
            title: 'خصائص الكرة',
            finalResult,
            steps: [
                { explanation: 'المساحة السطحية:', equation: `A = 4\\pi r^2 = ${fmt(surfaceArea)}` },
                { explanation: 'حجم الكرة:', equation: `V = \\frac{4}{3}\\pi r^3 = ${fmt(volume)}` }
            ],
            meta: { shape: 'sphere', radius, surfaceArea, volume }
        };
    },

    solveFreehand(givens) {
        const length = Number(givens?.path_length);
        if (!Number.isFinite(length) || length <= 0) return null;
        return {
            title: 'تحليل المسار المرسوم يدوياً',
            finalResult: `L \\approx ${fmt(length)}`,
            steps: [
                { explanation: 'مجموع أطوال القطع المكونة للمسار اليدوي:', equation: `L \\approx ${fmt(length)}` }
            ],
            meta: { shape: 'freehand', length }
        };
    },

    // ==================== محلل المسائل النصية المباشرة ====================
    parseTextProblem(text) {
        if (!text || typeof text !== 'string') return null;
        const clean = toLatinDigits(text).trim();
        if (!clean || clean.length > 260) return null;

        // استبعاد المسائل البرهانية المعقدة أو الجبرية العامة
        if (/(?:برهن|أثبت|اثبت|تشابه|تطابق|مصفوفة|مشتق|تكامل|نهاية|معادلة\s*تفاضلية)/i.test(clean)) return null;

        const nums = (clean.match(/-?\d+(?:\.\d+)?/g) || []).map(Number).filter(Number.isFinite);
        const focus = detectQuestionFocus(null, clean);

        // 1) معادلة مستقيم أو مسافة بين نقطتين: (x1, y1) و (x2, y2)
        const ptMatches = [...clean.matchAll(/\(\s*(-?\d+(?:\.\d+)?)\s*[,،]\s*(-?\d+(?:\.\d+)?)\s*\)/g)];
        if (ptMatches.length === 2 && /(?:مستقيم|ميل|مسافة|منتصف|قطعة|line|distance|slope|midpoint)/i.test(clean)) {
            return {
                type: 'structured_problem',
                tool: 'geometry_solver',
                shape: 'line',
                givens: {
                    x1: Number(ptMatches[0][1]),
                    y1: Number(ptMatches[0][2]),
                    x2: Number(ptMatches[1][1]),
                    y2: Number(ptMatches[1][2])
                },
                solve_for: { type: focus },
                question: clean
            };
        }

        // 2) الدائرة
        if (/(?:دائرة|الدائرة|circle)/i.test(clean) && nums.length === 1) {
            const isDiameter = /(?:قطرها|القطر|diameter)/i.test(clean) && !/(?:نصف\s*قطر|نصف\s*القطر|نق|radius)/i.test(clean);
            const r = isDiameter ? nums[0] / 2 : nums[0];
            if (r > 0) {
                return {
                    type: 'structured_problem',
                    tool: 'geometry_solver',
                    shape: 'circle',
                    givens: { radius: r },
                    solve_for: { type: focus },
                    question: clean
                };
            }
        }

        // 3) المربع
        if (/(?:مربع|المربع|square)/i.test(clean) && nums.length === 1 && nums[0] > 0) {
            return {
                type: 'structured_problem',
                tool: 'geometry_solver',
                shape: 'square',
                givens: { side: nums[0] },
                solve_for: { type: focus },
                question: clean
            };
        }

        // 4) المستطيل
        if (/(?:مستطيل|المستطيل|rectangle)/i.test(clean) && nums.length === 2 && nums[0] > 0 && nums[1] > 0) {
            return {
                type: 'structured_problem',
                tool: 'geometry_solver',
                shape: 'rectangle',
                givens: { width: nums[0], height: nums[1] },
                solve_for: { type: focus },
                question: clean
            };
        }

        // 5) المخروط / الأسطوانة / الكرة
        if (/(?:مخروط|المخروط|cone)/i.test(clean) && nums.length === 2 && nums[0] > 0 && nums[1] > 0) {
            return {
                type: 'structured_problem',
                tool: 'geometry_solver',
                shape: 'cone',
                givens: { radius: nums[0], height: nums[1] },
                solve_for: { type: focus },
                question: clean
            };
        }
        if (/(?:أسطوانة|اسطوانة|الأسطوانة|cylinder)/i.test(clean) && nums.length === 2 && nums[0] > 0 && nums[1] > 0) {
            return {
                type: 'structured_problem',
                tool: 'geometry_solver',
                shape: 'cylinder',
                givens: { radius: nums[0], height: nums[1] },
                solve_for: { type: focus },
                question: clean
            };
        }
        if (/(?:كرة|الكرة|sphere)/i.test(clean) && nums.length === 1 && nums[0] > 0) {
            return {
                type: 'structured_problem',
                tool: 'geometry_solver',
                shape: 'sphere',
                givens: { radius: nums[0] },
                solve_for: { type: focus },
                question: clean
            };
        }

        // 6) المثلث (3 أضلاع أو فيثاغورس)
        if (/(?:مثلث|المثلث|triangle|فيثاغورس|pythagor)/i.test(clean)) {
            if (nums.length === 3 && nums.every((n) => n > 0)) {
                return {
                    type: 'structured_problem',
                    tool: 'geometry_solver',
                    shape: 'triangle',
                    givens: { sides: { a: nums[0], b: nums[1], c: nums[2] } },
                    solve_for: { type: focus },
                    question: clean
                };
            }
            if (nums.length === 2 && nums.every((n) => n > 0) && /(?:قائم|فيثاغورس|الوتر|right|hypotenuse)/i.test(clean)) {
                const isHypGiven = /(?:وتر|الوتر|hypotenuse)/i.test(clean);
                const sides = isHypGiven
                    ? { c: Math.max(nums[0], nums[1]), a: Math.min(nums[0], nums[1]) }
                    : { a: nums[0], b: nums[1] };
                return {
                    type: 'structured_problem',
                    tool: 'geometry_solver',
                    shape: 'triangle',
                    givens: { sides, angles: { C: 90 } },
                    solve_for: { type: 'side' },
                    question: clean
                };
            }
        }

        return null;
    }
};