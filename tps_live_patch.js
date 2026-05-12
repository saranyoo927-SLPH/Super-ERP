// ============================================================
// TPS LIVE DATA PATCH — แทนที่ข้อมูล hardcoded ด้วย Google Sheet
// ============================================================
// วิธีใช้: คัดลอกโค้ดทั้งหมดนี้ไปวางในแท็ก <script> ของ Dashboard
//          **แทนที่** ฟังก์ชัน renderTPSCharts() เดิม
//          และเพิ่มฟังก์ชัน loadTPSFromGAS() + renderTPSFromData()
//
// ★ ใช้ GS_WEB_APP_URL ตัวเดียวกันที่มีอยู่แล้ว เรียก ?action=tps
// ★ Fallback: ถ้า GAS ไม่ตอบ → ลอง gviz → ใช้ hardcoded เดิม
// ============================================================

// ── TPS Sheet ID (อ้างอิงจาก GAS SHEET_IDS.tps) ──
const TPS_SHEET_ID = '1yfjMsHAHTiDxpYgb2MvcI-k_KKBlvCkiUQnQPH-tEl0';

// ── TPS Hardcoded Fallback (ข้อมูลเดิมจาก Dashboard) ──
const TPS_FALLBACK = {
    summary: { totalScore: 9, totalMax: 15, grade: 'C' },
    categories: [
        { name: '1.1 บริหารแผน Planfin', score: 2, maxScore: 2, details: 'มิติรายได้ −1.68% | มิติค่าใช้จ่าย −4.98%', passed: true },
        { name: '1.2 บริหารสินทรัพย์', score: 0, maxScore: 3, details: 'เจ้าหนี้ยา 210 วัน | UC 74 วัน | ขรก. 65 วัน', passed: false },
        { name: '1.3 บริหารต้นทุน/จัดการ', score: 1, maxScore: 2, details: 'IPD unit cost ผ่าน | OPD, LC, MC ไม่ผ่าน', passed: null },
        { name: '1.3 บัญชี/งบทดลอง', score: 1, maxScore: 1, details: 'งบทดลอง 300 คะแนน', passed: true },
        { name: '1.3 ผลผลิต', score: 2, maxScore: 2, details: 'ครองเตียง 98.1%', passed: true },
        { name: '2.1 ความสามารถกำไร', score: 2, maxScore: 3, details: 'ROA ผ่าน | EBITDA ผ่าน | OM ไม่ผ่าน', passed: null },
        { name: '2.2 สภาพคล่อง', score: 1, maxScore: 2, details: 'NWC ผ่าน (+7.53 M) | Cash Ratio ไม่ผ่าน', passed: null }
    ],
    // Sub-indicators สำหรับ sub-tabs
    p1: { revPct: -1.68, expPct: -4.98 },
    p2: { drugDays: 210, ucDays: 74, govDays: 65, invDays: 73 },
    p3: { opdUC: 1038, ipdUC: 10743, opdMean: 1010, ipdMean: 16120, trialScore: 300, bedRate: 98.1, sumAdjRW: 3808 },
    r1: { om: 13.87, roa: 4.20, ebitda: 14.08, omMean: 17.83, roaMean: 3.02 },
    r2: { nwc: 7.53, cashRatio: 0.26 },
    fin: { riskScore: 3, nwc: 7.53, netCash: -62.83, ebitda: 14.08, ni: 13.49 }
};

// ── ตัวแปรเก็บข้อมูล TPS ที่โหลดจาก GAS ──
let tpsLiveData = null;

// ============================================================
// 1. LOAD TPS FROM GAS WEB APP
// ============================================================
async function loadTPSFromGAS() {
    // ── Layer 1: GAS Web App (?action=tps) ──
    if (GS_WEB_APP_URL) {
        try {
            console.log('🔄 TPS: โหลดจาก GAS Web App...');
            const resp = await fetch(GS_WEB_APP_URL + '?action=tps', { redirect: 'follow' });
            if (!resp.ok) throw new Error('HTTP ' + resp.status);
            const json = await resp.json();

            if (json && json.indicators && json.indicators.length > 0) {
                tpsLiveData = json;
                console.log('✅ TPS GAS loaded:', json.indicators.length, 'indicators, score:', json.summary?.totalScore + '/' + json.summary?.totalMax, 'grade:', json.summary?.grade);
                applyTPSLiveData(json);
                return;
            } else if (json && json.error) {
                console.warn('⚠ TPS GAS error:', json.error);
            }
        } catch (e) {
            console.warn('⚠ TPS GAS Web App failed:', e.message, '→ ลอง gviz...');
        }
    }

    // ── Layer 2: gviz (public sheet fallback) ──
    try {
        console.log('🔄 TPS: โหลดจาก gviz...');
        const url = 'https://docs.google.com/spreadsheets/d/' + TPS_SHEET_ID + '/gviz/tq?tqx=out:json';
        const resp = await fetch(url);
        const text = await resp.text();
        const json = JSON.parse(text.substring(47).slice(0, -2));
        const rows = json.table.rows;

        if (!rows || rows.length < 2) throw new Error('ข้อมูลไม่พอ');

        // Parse gviz rows → indicators format เดียวกับ GAS
        const indicators = [];
        for (let i = 1; i < rows.length; i++) {
            const cells = rows[i].c;
            if (!cells || !cells[0]) continue;
            const code = cells[0] ? String(cells[0].v || '').trim() : '';
            const name = cells[1] ? String(cells[1].v || '').trim() : '';
            if (!code && !name) continue;

            indicators.push({
                code: code,
                name: name,
                actual: cells[2] ? parseFloat(cells[2].v) || null : null,
                unit: cells[3] ? String(cells[3].v || '').trim() : '',
                criteria: cells[4] ? String(cells[4].v || '').trim() : '',
                score: cells[5] ? parseFloat(cells[5].v) || 0 : 0,
                maxScore: cells[6] ? parseFloat(cells[6].v) || 0 : 0,
                result: cells[7] ? String(cells[7].v || '').trim() : ''
            });
        }

        if (indicators.length > 0) {
            let totalScore = 0, totalMax = 0;
            indicators.forEach(ind => {
                if (ind.score !== null) totalScore += ind.score;
                if (ind.maxScore !== null) totalMax += ind.maxScore;
            });
            const grade = totalScore > 12 ? 'A' : totalScore > 10.5 ? 'B' : totalScore > 9 ? 'C' : totalScore > 7.5 ? 'D' : 'F';

            tpsLiveData = {
                indicators: indicators,
                summary: { totalScore, totalMax, grade }
            };

            console.log('✅ TPS gviz loaded:', indicators.length, 'indicators');
            applyTPSLiveData(tpsLiveData);
            return;
        }
    } catch (e) {
        console.warn('⚠ TPS gviz failed:', e.message);
    }

    // ── Layer 3: Hardcoded fallback ──
    console.log('TPS: ใช้ hardcoded fallback');
    renderTPSChartsHardcoded();
}

// ============================================================
// 2. APPLY TPS LIVE DATA → อัปเดต KPI Cards + กราฟ
// ============================================================
function applyTPSLiveData(data) {
    if (!data || !data.indicators) {
        renderTPSChartsHardcoded();
        return;
    }

    const indicators = data.indicators;
    const summary = data.summary || {};
    const totalScore = summary.totalScore || 0;
    const totalMax = summary.totalMax || 15;
    const grade = summary.grade || 'C';

    // ── Grade mapping ──
    const gradeInfo = {
        'A': { label: 'ดีมาก', color: '#10b981', bgColor: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.25)' },
        'B': { label: 'ดี', color: '#3b82f6', bgColor: 'rgba(59,130,246,0.08)', borderColor: 'rgba(59,130,246,0.25)' },
        'C': { label: 'พอใช้', color: '#f59e0b', bgColor: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.25)' },
        'D': { label: 'ต้องปรับปรุง', color: '#f97316', bgColor: 'rgba(249,115,22,0.08)', borderColor: 'rgba(249,115,22,0.25)' },
        'F': { label: 'ไม่ผ่าน', color: '#ef4444', bgColor: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.25)' }
    };
    const gi = gradeInfo[grade] || gradeInfo['C'];

    // ── อัปเดต TPS Overview (tps-ov) ──

    // 1) Grade card
    const gradeEl = document.querySelector('#tps-ov .nt-grade');
    if (gradeEl) {
        gradeEl.style.background = gi.bgColor;
        gradeEl.style.border = '2px solid ' + gi.borderColor;
        const letterEl = gradeEl.querySelector('.letter');
        if (letterEl) { letterEl.textContent = grade; letterEl.style.color = gi.color; }
        const labelEl = gradeEl.querySelector('.label');
        if (labelEl) { labelEl.textContent = gi.label; }
        const scoreEl = gradeEl.querySelector('.score');
        if (scoreEl) { scoreEl.textContent = 'คะแนน ' + totalScore + ' / ' + totalMax; }
    }

    // 2) Section header — อัปเดตชื่อ section
    const sectionHead = document.querySelector('#tab-tps-score .erp-section-head h3');
    if (sectionHead) {
        sectionHead.textContent = '📊 Total Performance Score • รพ.เสลภูมิ (Live Data)';
    }

    // 3) Score breakdown bars — จัดกลุ่ม indicators ตาม code pattern
    const catMap = buildCategoryMap(indicators);
    updateScoreBars(catMap, totalScore, totalMax, gi.color);

    // 4) KPI cards row — อัปเดต 6 cards
    updateTPSKpiCards(catMap);

    // 5) Criteria table — อัปเดตว่า grade ไหนถูกไฮไลท์
    updateGradeTable(totalScore, grade);

    // 6) Re-render กราฟ radar + bar
    renderTPSChartsFromData(catMap, totalScore, totalMax);

    // 7) อัปเดต sub-tabs (P1, P2, P3, R1, R2, Financial) ถ้ามีข้อมูลละเอียด
    updateTPSSubTabs(indicators);

    // 8) อัปเดต ERP Overview card TPS
    updateERPOverviewTPS(totalScore, totalMax, grade, gi, catMap);

    console.log('✅ TPS Dashboard อัปเดตจาก live data สำเร็จ: ' + grade + ' (' + totalScore + '/' + totalMax + ')');
}

// ============================================================
// 3. HELPER: จัดกลุ่ม indicators → categories
// ============================================================
function buildCategoryMap(indicators) {
    // แมป indicators เข้ากลุ่มตาม code/name pattern
    // GAS returns: code, name, actual, unit, criteria, score, maxScore, result
    const cats = {
        planfin: { name: '1.1 บริหารแผน Planfin', score: 0, maxScore: 0, items: [] },
        asset: { name: '1.2 บริหารสินทรัพย์', score: 0, maxScore: 0, items: [] },
        cost: { name: '1.3 บริหารต้นทุน/จัดการ', score: 0, maxScore: 0, items: [] },
        accounting: { name: '1.3 บัญชี/งบทดลอง', score: 0, maxScore: 0, items: [] },
        output: { name: '1.3 ผลผลิต', score: 0, maxScore: 0, items: [] },
        profit: { name: '2.1 ความสามารถกำไร', score: 0, maxScore: 0, items: [] },
        liquidity: { name: '2.2 สภาพคล่อง', score: 0, maxScore: 0, items: [] }
    };

    indicators.forEach(ind => {
        const c = (ind.code || '').toLowerCase();
        const n = (ind.name || '').toLowerCase();

        // จัดกลุ่มตาม code pattern ของ TPS
        if (c.includes('1.1') || n.includes('planfin') || n.includes('แผน')) {
            cats.planfin.items.push(ind);
            cats.planfin.score += (ind.score || 0);
            cats.planfin.maxScore += (ind.maxScore || 0);
        } else if (c.includes('1.2') || n.includes('สินทรัพย์') || n.includes('เจ้าหนี้') || n.includes('ลูกหนี้') || n.includes('สินค้าคงคลัง')) {
            cats.asset.items.push(ind);
            cats.asset.score += (ind.score || 0);
            cats.asset.maxScore += (ind.maxScore || 0);
        } else if (n.includes('unit cost') || n.includes('ต้นทุน') || c.includes('1.3.1')) {
            cats.cost.items.push(ind);
            cats.cost.score += (ind.score || 0);
            cats.cost.maxScore += (ind.maxScore || 0);
        } else if (n.includes('งบทดลอง') || n.includes('บัญชี') || c.includes('1.3.2')) {
            cats.accounting.items.push(ind);
            cats.accounting.score += (ind.score || 0);
            cats.accounting.maxScore += (ind.maxScore || 0);
        } else if (n.includes('ผลผลิต') || n.includes('ครองเตียง') || n.includes('adjrw') || c.includes('1.3.3')) {
            cats.output.items.push(ind);
            cats.output.score += (ind.score || 0);
            cats.output.maxScore += (ind.maxScore || 0);
        } else if (c.includes('2.1') || n.includes('กำไร') || n.includes('margin') || n.includes('roa') || n.includes('ebitda')) {
            cats.profit.items.push(ind);
            cats.profit.score += (ind.score || 0);
            cats.profit.maxScore += (ind.maxScore || 0);
        } else if (c.includes('2.2') || n.includes('สภาพคล่อง') || n.includes('nwc') || n.includes('cash ratio')) {
            cats.liquidity.items.push(ind);
            cats.liquidity.score += (ind.score || 0);
            cats.liquidity.maxScore += (ind.maxScore || 0);
        } else {
            // ถ้าจัดกลุ่มไม่ได้ → ใส่ cost (1.3) เป็น default
            cats.cost.items.push(ind);
            cats.cost.score += (ind.score || 0);
            cats.cost.maxScore += (ind.maxScore || 0);
        }
    });

    return cats;
}

// ============================================================
// 4. UPDATE SCORE BARS (คะแนนแยกหมวด)
// ============================================================
function updateScoreBars(catMap, totalScore, totalMax, gradeColor) {
    const barContainer = document.querySelector('#tps-ov .erp-card-body');
    if (!barContainer) return;

    // หา element ที่มี score-rows
    const scoreRows = barContainer.querySelectorAll('.nt-score-row');
    if (scoreRows.length < 8) return; // ต้องมี 8 แถว (7 หมวด + 1 รวม)

    const catKeys = ['planfin', 'asset', 'cost', 'accounting', 'output', 'profit', 'liquidity'];

    catKeys.forEach((key, i) => {
        if (i >= scoreRows.length - 1) return;
        const cat = catMap[key];
        const row = scoreRows[i];
        const lbl = row.querySelector('.nt-score-lbl b');
        const fill = row.querySelector('.nt-score-fill');
        const max = row.querySelector('.nt-score-max');

        if (lbl) lbl.textContent = cat.name;
        if (max) max.textContent = cat.maxScore;
        if (fill) {
            const pct = cat.maxScore > 0 ? (cat.score / cat.maxScore * 100) : 0;
            fill.style.width = Math.max(pct, 2) + '%';
            fill.textContent = cat.score + ' / ' + cat.maxScore;

            // สีตาม %
            if (pct >= 100) { fill.className = 'nt-score-fill full'; }
            else if (pct > 0) { fill.className = 'nt-score-fill part'; }
            else { fill.className = 'nt-score-fill zero'; }
        }
    });

    // แถวรวม
    const totalRow = scoreRows[scoreRows.length - 1];
    if (totalRow) {
        const fill = totalRow.querySelector('.nt-score-fill');
        const max = totalRow.querySelector('.nt-score-max');
        if (fill) {
            const pct = totalMax > 0 ? (totalScore / totalMax * 100) : 0;
            fill.style.width = Math.max(pct, 2) + '%';
            fill.textContent = totalScore + ' / ' + totalMax;
            fill.style.background = 'linear-gradient(90deg, ' + (gradeColor || '#f59e0b') + ', ' + (gradeColor || '#fbbf24') + ')';
        }
        if (max) max.textContent = totalMax;
    }
}

// ============================================================
// 5. UPDATE KPI CARDS (6 cards ใน tps-ov)
// ============================================================
function updateTPSKpiCards(catMap) {
    const kpiRow = document.querySelector('#tps-ov .nt-kpi-row');
    if (!kpiRow) return;

    const cards = kpiRow.querySelectorAll('.nt-kpi');
    const catKeys = ['planfin', 'asset', 'cost', 'accounting_output', 'profit', 'liquidity'];

    // Merge accounting + output for card 4
    const merged = {
        planfin: catMap.planfin,
        asset: catMap.asset,
        cost: catMap.cost,
        accounting_output: {
            name: '1.3 งบทดลอง+ผลผลิต',
            score: catMap.accounting.score + catMap.output.score,
            maxScore: catMap.accounting.maxScore + catMap.output.maxScore,
            items: [...catMap.accounting.items, ...catMap.output.items]
        },
        profit: catMap.profit,
        liquidity: catMap.liquidity
    };

    catKeys.forEach((key, i) => {
        if (i >= cards.length) return;
        const card = cards[i];
        const cat = merged[key];
        if (!cat) return;

        const lblEl = card.querySelector('.nt-lbl');
        const valEl = card.querySelector('.nt-val');
        const footEl = card.querySelector('.nt-foot');
        const pillEl = card.querySelector('.nt-pill');

        if (lblEl) lblEl.textContent = cat.name;
        if (valEl) valEl.innerHTML = cat.score + ' <small>/ ' + cat.maxScore + '</small>';

        // Details from items
        if (footEl && cat.items.length > 0) {
            const details = cat.items.map(ind => {
                const val = ind.actual !== null ? ind.actual : '-';
                const res = ind.result || '';
                return (ind.name || ind.code) + ' ' + val + (ind.unit ? ' ' + ind.unit : '') + (res ? ' ' + res : '');
            }).join(' | ');
            footEl.textContent = details.substring(0, 80) + (details.length > 80 ? '...' : '');
        }

        // Status pill
        if (pillEl) {
            const pct = cat.maxScore > 0 ? (cat.score / cat.maxScore) : 0;
            if (pct >= 1) {
                pillEl.className = 'nt-pill good';
                pillEl.textContent = '✓ ผ่านครบ';
                card.className = 'nt-kpi c-green';
            } else if (pct > 0) {
                pillEl.className = 'nt-pill warn';
                pillEl.textContent = 'ผ่านบางส่วน';
                card.className = 'nt-kpi c-amber';
            } else {
                pillEl.className = 'nt-pill bad';
                pillEl.textContent = '✗ ไม่ผ่านทุกข้อ';
                card.className = 'nt-kpi c-red';
            }
        }
    });
}

// ============================================================
// 6. UPDATE GRADE TABLE
// ============================================================
function updateGradeTable(totalScore, grade) {
    const table = document.querySelector('#tps-ov .erp-tbl-wrap table');
    if (!table) return;

    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        row.style.background = '';
        const cells = row.querySelectorAll('td');
        const lastCell = cells[cells.length - 1];
        if (lastCell) lastCell.innerHTML = '—';
    });

    // ไฮไลท์แถวที่ตรงกับ grade ปัจจุบัน
    const gradeIdx = { 'A': 0, 'B': 1, 'C': 2, 'D': 3, 'F': 4 };
    const idx = gradeIdx[grade];
    if (idx !== undefined && rows[idx]) {
        rows[idx].style.background = 'rgba(245,158,11,0.06)';
        const cells = rows[idx].querySelectorAll('td');
        if (cells.length > 0) cells[0].innerHTML = '<strong>' + cells[0].textContent + '</strong>';
        const lastCell = cells[cells.length - 1];
        if (lastCell) lastCell.innerHTML = '<strong>← รพ.เสลภูมิ (' + totalScore + ' คะแนน)</strong>';
    }
}

// ============================================================
// 7. RENDER TPS CHARTS FROM DATA
// ============================================================
function renderTPSChartsFromData(catMap, totalScore, totalMax) {
    const catKeys = ['planfin', 'cost', 'accounting', 'asset', 'profit', 'liquidity'];
    const radarLabels = catKeys.map(k => catMap[k].name + '\n(' + catMap[k].maxScore + ')');
    const radarScores = catKeys.map(k => catMap[k].score);
    const radarMax = catKeys.map(k => catMap[k].maxScore);
    const maxVal = Math.max(...radarMax, 3);

    // Radar
    destroyChart('tps_radar');
    new Chart(document.getElementById('tps_radar'), {
        type: 'radar',
        data: {
            labels: radarLabels,
            datasets: [
                { label: 'คะแนนได้', data: radarScores, borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.1)', borderWidth: 2, pointRadius: 4, pointBackgroundColor: '#f59e0b' },
                { label: 'คะแนนเต็ม', data: radarMax, borderColor: 'rgba(99,102,241,0.3)', backgroundColor: 'rgba(99,102,241,0.03)', borderWidth: 1.5, borderDash: [4, 4], pointRadius: 3, pointBackgroundColor: 'rgba(99,102,241,0.4)' }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { font: { size: 10 }, color: '#64748b', boxWidth: 10, padding: 12 } }, tooltip: LT_TT },
            scales: { r: { grid: { color: 'rgba(0,0,0,0.06)' }, angleLines: { color: 'rgba(0,0,0,0.06)' }, ticks: { display: false, stepSize: 1 }, pointLabels: { font: { size: 10 }, color: '#64748b' }, min: 0, max: maxVal } }
        }
    });

    // Bar Score
    const barLabels = Object.values(catMap).map(c => c.name);
    const barScores = Object.values(catMap).map(c => c.score);
    const barMaxes = Object.values(catMap).map(c => c.maxScore);

    destroyChart('tps_barScore');
    ltChart('tps_barScore', 'bar', {
        labels: barLabels,
        datasets: [
            { label: 'ได้', data: barScores, backgroundColor: 'rgba(245,158,11,0.8)', borderRadius: 5 },
            { label: 'เต็ม', data: barMaxes, backgroundColor: 'rgba(99,102,241,0.15)', borderRadius: 5 }
        ]
    }, { ytick: { stepSize: 1 } });

    // ยังต้อง render sub-tab charts ด้วย (P1, P2, P3, R1, R2)
    // ใช้ข้อมูลจาก indicators โดยตรง ถ้ามี ถ้าไม่มี fallback เป็น hardcoded
    renderTPSSubCharts(catMap);
}

// ============================================================
// 8. RENDER SUB-TAB CHARTS (ใช้ข้อมูล indicator จริง ถ้ามี)
// ============================================================
function renderTPSSubCharts(catMap) {
    // P1: Planfin — ถ้ามี 2 items (มิติรายได้ + มิติค่าใช้จ่าย)
    const p1Items = catMap.planfin.items;
    if (p1Items.length >= 2) {
        const revPct = p1Items[0].actual || TPS_FALLBACK.p1.revPct;
        const expPct = p1Items[1].actual || TPS_FALLBACK.p1.expPct;
        destroyChart('tps_p1bar');
        ltChart('tps_p1bar', 'bar', {
            labels: [p1Items[0].name || 'มิติรายได้', p1Items[1].name || 'มิติค่าใช้จ่าย'],
            datasets: [
                { label: 'ค่าจริง (%)', data: [revPct, expPct], backgroundColor: ['rgba(16,185,129,0.8)', 'rgba(16,185,129,0.8)'], borderRadius: 6 },
                { label: 'เกณฑ์ +5%', data: [5, 5], type: 'line', borderColor: 'rgba(245,158,11,0.8)', borderWidth: 2, borderDash: [6, 4], pointRadius: 4, pointBackgroundColor: '#f59e0b', fill: false },
                { label: 'เกณฑ์ -5%', data: [-5, -5], type: 'line', borderColor: 'rgba(245,158,11,0.5)', borderWidth: 2, borderDash: [6, 4], pointRadius: 4, pointBackgroundColor: '#f59e0b', fill: false }
            ]
        }, { ytick: { callback: v => v + '%' } });

        // อัปเดต KPI cards ใน P1
        updateSubTabKPIs('tps-p1', p1Items);
    } else {
        // Fallback: ใช้ hardcoded
        destroyChart('tps_p1bar');
        ltChart('tps_p1bar', 'bar', { labels: ['มิติรายได้', 'มิติค่าใช้จ่าย'], datasets: [{ label: 'ค่าจริง (%)', data: [TPS_FALLBACK.p1.revPct, TPS_FALLBACK.p1.expPct], backgroundColor: ['rgba(16,185,129,0.8)', 'rgba(16,185,129,0.8)'], borderRadius: 6 }, { label: 'เกณฑ์ +5%', data: [5, 5], type: 'line', borderColor: 'rgba(245,158,11,0.8)', borderWidth: 2, borderDash: [6, 4], pointRadius: 4, pointBackgroundColor: '#f59e0b', fill: false }, { label: 'เกณฑ์ -5%', data: [-5, -5], type: 'line', borderColor: 'rgba(245,158,11,0.5)', borderWidth: 2, borderDash: [6, 4], pointRadius: 4, pointBackgroundColor: '#f59e0b', fill: false }] }, { ytick: { callback: v => v + '%' } });
    }

    // P2: สินทรัพย์ — ใช้ items จาก catMap.asset
    const p2Items = catMap.asset.items;
    if (p2Items.length >= 2) {
        const labels = p2Items.map(ind => (ind.name || ind.code) + (ind.criteria ? ' (' + ind.criteria + ')' : ''));
        const values = p2Items.map(ind => ind.actual || 0);
        // หาเกณฑ์จาก criteria string (เช่น "≤90 วัน")
        const limits = p2Items.map(ind => {
            const m = (ind.criteria || '').match(/(\d+)/);
            return m ? parseInt(m[1]) : 60;
        });

        destroyChart('tps_p2bar');
        ltChart('tps_p2bar', 'bar', {
            labels: labels,
            datasets: [
                { label: 'ค่าจริง', data: values, backgroundColor: values.map((v, i) => v > limits[i] ? 'rgba(244,63,94,0.8)' : 'rgba(16,185,129,0.8)'), borderRadius: 6 },
                { label: 'เกณฑ์สูงสุด', data: limits, type: 'line', borderColor: '#f59e0b', borderWidth: 2, borderDash: [5, 4], pointRadius: 5, pointBackgroundColor: '#f59e0b', fill: false }
            ]
        });

        updateSubTabKPIs('tps-p2', p2Items);
    } else {
        // Fallback
        destroyChart('tps_p2bar');
        ltChart('tps_p2bar', 'bar', { labels: ['เจ้าหนี้ยา (≤90วัน)', 'ลูกหนี้ UC (≤60วัน)', 'ลูกหนี้ขรก. (≤60วัน)', 'สินคงคลัง (≤60วัน)'], datasets: [{ label: 'ค่าจริง (วัน)', data: [TPS_FALLBACK.p2.drugDays, TPS_FALLBACK.p2.ucDays, TPS_FALLBACK.p2.govDays, TPS_FALLBACK.p2.invDays], backgroundColor: 'rgba(244,63,94,0.8)', borderRadius: 6 }, { label: 'เกณฑ์สูงสุด', data: [90, 60, 60, 60], type: 'line', borderColor: '#f59e0b', borderWidth: 2, borderDash: [5, 4], pointRadius: 5, pointBackgroundColor: '#f59e0b', fill: false }] }, { ytick: { callback: v => v + ' วัน' } });
    }

    // P3: ต้นทุน — ใช้ fallback เพราะ sub-detail มักไม่อยู่ใน TPS sheet หลัก
    destroyChart('tps_p3unit');
    ltChart('tps_p3unit', 'bar', { labels: ['OPD (บาท/ครั้ง)', 'IPD (บาท/AdjRW)'], datasets: [{ label: 'รพ.เสลภูมิ', data: [TPS_FALLBACK.p3.opdUC, TPS_FALLBACK.p3.ipdUC], backgroundColor: ['rgba(244,63,94,0.8)', 'rgba(16,185,129,0.8)'], borderRadius: 6 }, { label: 'ค่ากลาง', data: [TPS_FALLBACK.p3.opdMean, TPS_FALLBACK.p3.ipdMean], backgroundColor: 'rgba(245,158,11,0.3)', borderRadius: 6 }] });
    destroyChart('tps_p3mc');
    ltChart('tps_p3mc', 'bar', { labels: ['LC แรงงาน', 'MC ยา', 'MC วัสดุวิทย์', 'MC วัสดุแพทย์'], datasets: [{ label: 'รพ.เสลภูมิ (ลบ.)', data: [51.39, 14.30, 5.82, 7.59], backgroundColor: 'rgba(244,63,94,0.8)', borderRadius: 6 }, { label: 'ค่ากลาง (ลบ.)', data: [49.09, 10.71, 3.37, 5.17], backgroundColor: 'rgba(245,158,11,0.3)', borderRadius: 6 }] });

    // R1: Profitability
    const r1Items = catMap.profit.items;
    if (r1Items.length >= 2) {
        destroyChart('tps_r1bar');
        ltChart('tps_r1bar', 'bar', {
            labels: r1Items.map(ind => ind.name || ind.code),
            datasets: [
                { label: 'รพ.เสลภูมิ', data: r1Items.map(ind => ind.actual || 0), backgroundColor: r1Items.map(ind => (ind.score || 0) > 0 ? 'rgba(16,185,129,0.8)' : 'rgba(244,63,94,0.8)'), borderRadius: 6 }
            ]
        });
        updateSubTabKPIs('tps-r1', r1Items);
    } else {
        destroyChart('tps_r1bar');
        ltChart('tps_r1bar', 'bar', { labels: ['Operating Margin (%)', 'Return on Asset (%)'], datasets: [{ label: 'รพ.เสลภูมิ', data: [TPS_FALLBACK.r1.om, TPS_FALLBACK.r1.roa], backgroundColor: ['rgba(244,63,94,0.8)', 'rgba(16,185,129,0.8)'], borderRadius: 6 }, { label: 'ค่ากลาง', data: [TPS_FALLBACK.r1.omMean, TPS_FALLBACK.r1.roaMean], backgroundColor: 'rgba(245,158,11,0.3)', borderRadius: 6 }] }, { ytick: { callback: v => v + '%' } });
    }

    // R2: Liquidity
    const r2Items = catMap.liquidity.items;
    if (r2Items.length >= 1) {
        // หา Cash Ratio item
        const cashItem = r2Items.find(ind => (ind.name || '').toLowerCase().includes('cash'));
        const cashVal = cashItem ? cashItem.actual : TPS_FALLBACK.r2.cashRatio;
        destroyChart('tps_r2bar');
        ltChart('tps_r2bar', 'bar', {
            labels: ['Cash Ratio', 'เกณฑ์ขั้นต่ำ'],
            datasets: [{ label: 'ค่า', data: [cashVal, 0.80], backgroundColor: [cashVal >= 0.8 ? 'rgba(16,185,129,0.8)' : 'rgba(244,63,94,0.8)', 'rgba(245,158,11,0.5)'], borderRadius: 8 }]
        }, { leg: false, ytick: { callback: v => v + 'x' } });
        updateSubTabKPIs('tps-r2', r2Items);
    } else {
        destroyChart('tps_r2bar');
        ltChart('tps_r2bar', 'bar', { labels: ['Cash Ratio', 'เกณฑ์ขั้นต่ำ'], datasets: [{ label: 'ค่า', data: [TPS_FALLBACK.r2.cashRatio, 0.80], backgroundColor: ['rgba(244,63,94,0.8)', 'rgba(245,158,11,0.5)'], borderRadius: 8 }] }, { leg: false, ytick: { callback: v => v + 'x' } });
    }
}

// ============================================================
// 9. UPDATE SUB-TAB KPI CARDS
// ============================================================
function updateSubTabKPIs(panelId, items) {
    const panel = document.getElementById(panelId);
    if (!panel) return;
    const kpiRow = panel.querySelector('.nt-kpi-row');
    if (!kpiRow || !items || items.length === 0) return;

    const cards = kpiRow.querySelectorAll('.nt-kpi');
    items.forEach((ind, i) => {
        if (i >= cards.length) return;
        const card = cards[i];
        const lblEl = card.querySelector('.nt-lbl');
        const valEl = card.querySelector('.nt-val');
        const footEl = card.querySelector('.nt-foot');
        const pillEl = card.querySelector('.nt-pill');

        if (lblEl) lblEl.textContent = ind.name || ind.code || '';
        if (valEl) {
            const unit = ind.unit || '';
            valEl.innerHTML = (ind.actual !== null ? ind.actual : '-') + ' <small>' + unit + '</small>';
        }
        if (footEl) {
            footEl.textContent = (ind.criteria || '') + (ind.result ? ' | ' + ind.result : '');
        }
        if (pillEl) {
            pillEl.textContent = (ind.score || 0) + ' / ' + (ind.maxScore || 0) + ' คะแนน';
            pillEl.className = 'nt-pill ' + ((ind.score || 0) >= (ind.maxScore || 1) ? 'good' : (ind.score || 0) > 0 ? 'warn' : 'bad');
        }

        // Card color
        card.className = 'nt-kpi ' + ((ind.score || 0) >= (ind.maxScore || 1) ? 'c-green' : (ind.score || 0) > 0 ? 'c-amber' : 'c-red');
    });
}

// ============================================================
// 10. UPDATE SUB-TAB DETAILS (Insight boxes etc.)
// ============================================================
function updateTPSSubTabs(indicators) {
    // อัปเดต insight boxes ตาม live data

    // P1 insight
    const p1Insight = document.querySelector('#tps-p1 .nt-insight');
    if (p1Insight) {
        const planfinItems = indicators.filter(ind => {
            const c = (ind.code || '').toLowerCase();
            const n = (ind.name || '').toLowerCase();
            return c.includes('1.1') || n.includes('planfin') || n.includes('แผน');
        });
        const allPass = planfinItems.every(ind => (ind.score || 0) >= (ind.maxScore || 1));
        const totalS = planfinItems.reduce((a, b) => a + (b.score || 0), 0);
        const totalM = planfinItems.reduce((a, b) => a + (b.maxScore || 0), 0);

        if (allPass) {
            p1Insight.className = 'nt-insight good';
            p1Insight.innerHTML = '<strong>✅ ผ่านเต็ม ' + totalS + '/' + totalM + ' คะแนน</strong> ' + planfinItems.map(ind => ind.name + ' ' + ind.actual + (ind.unit || '')).join(' | ');
        } else {
            p1Insight.className = 'nt-insight warn';
            p1Insight.innerHTML = '<strong>⚠ ผ่าน ' + totalS + '/' + totalM + ' คะแนน</strong>';
        }
    }

    // P2 insight
    const p2Insight = document.querySelector('#tps-p2 .nt-insight');
    if (p2Insight) {
        const assetItems = indicators.filter(ind => {
            const c = (ind.code || '').toLowerCase();
            const n = (ind.name || '').toLowerCase();
            return c.includes('1.2') || n.includes('สินทรัพย์') || n.includes('เจ้าหนี้') || n.includes('ลูกหนี้');
        });
        const totalS = assetItems.reduce((a, b) => a + (b.score || 0), 0);
        const totalM = assetItems.reduce((a, b) => a + (b.maxScore || 0), 0);

        if (totalS === 0) {
            p2Insight.className = 'nt-insight danger';
            p2Insight.innerHTML = '<strong>⚠ ไม่ผ่านทุกตัวชี้วัด ' + totalS + '/' + totalM + ' คะแนน</strong> ' + assetItems.map(ind => ind.name + ' ' + ind.actual + (ind.unit || '')).join(' | ');
        }
    }
}

// ============================================================
// 11. UPDATE ERP OVERVIEW CARD — TPS
// ============================================================
function updateERPOverviewTPS(totalScore, totalMax, grade, gi, catMap) {
    // อัปเดต card TPS ใน ERP Overview tab

    // หา TPS card (มี title "TPS Score")
    const allCards = document.querySelectorAll('#tab-erp-overview .ov-sc');
    let tpsCard = null;
    allCards.forEach(card => {
        const title = card.querySelector('.st');
        if (title && title.textContent.includes('TPS')) tpsCard = card;
    });
    if (!tpsCard) return;

    // Badge
    const badge = tpsCard.querySelector('.sb');
    if (badge) {
        badge.textContent = grade + ' ' + gi.label;
        badge.style.background = gi.bgColor;
        badge.style.color = gi.color;
    }

    // Ring score
    const ring = tpsCard.querySelector('.ov-ring');
    if (ring) {
        const pct = totalMax > 0 ? Math.round(totalScore / totalMax * 100) : 0;
        ring.style.background = 'conic-gradient(' + gi.color + ' 0% ' + pct + '%, #f1f5f9 ' + pct + '% 100%)';
        const span = ring.querySelector('span');
        if (span) { span.textContent = totalScore; span.style.color = gi.color; }
    }

    // Score text
    const scoreText = tpsCard.querySelector('.ov-ring + div');
    if (scoreText) scoreText.textContent = 'คะแนน ' + totalScore + ' / ' + totalMax;

    // Category bars
    const barRows = tpsCard.querySelectorAll('.ov-brow');
    const catKeys = ['planfin', 'asset', 'cost', 'profit', 'liquidity'];
    const catLabels = ['1.1 แผน', '1.2 สินทรัพย์', '1.3 ต้นทุน', '2.1 กำไร', '2.2 คล่อง'];

    catKeys.forEach((key, i) => {
        if (i >= barRows.length) return;
        const row = barRows[i];
        const cat = catMap[key];
        if (!cat) return;

        const lbl = row.querySelector('.bl');
        const fill = row.querySelector('.bf');
        const val = row.querySelector('.bv');

        if (lbl) lbl.textContent = catLabels[i];
        const pct = cat.maxScore > 0 ? (cat.score / cat.maxScore * 100) : 0;
        if (fill) {
            fill.style.width = Math.max(pct, 3) + '%';
            fill.style.background = pct >= 100 ? '#10b981' : pct > 0 ? '#f59e0b' : '#f43f5e';
        }
        if (val) {
            val.textContent = cat.score + '/' + cat.maxScore;
            val.style.color = pct >= 100 ? '#10b981' : pct > 0 ? '#f59e0b' : '#f43f5e';
        }
    });

    // Bottom warning
    const warning = tpsCard.querySelector('div[style*="border-radius:6px"]');
    if (warning) {
        // หา indicator ที่แย่ที่สุด
        const worstItems = catMap.asset.items.filter(ind => (ind.score || 0) === 0 && ind.actual > 0);
        if (worstItems.length > 0) {
            const worst = worstItems.sort((a, b) => (b.actual || 0) - (a.actual || 0))[0];
            warning.textContent = '⚠ ' + (worst.name || worst.code) + ' ' + worst.actual + ' ' + (worst.unit || '') + (worst.criteria ? ' (เกณฑ์ ' + worst.criteria + ')' : '');
        }
    }
}

// ============================================================
// 12. HARDCODED CHARTS (fallback — เหมือนโค้ดเดิม)
// ============================================================
function renderTPSChartsHardcoded() {
    // Radar
    new Chart(document.getElementById('tps_radar'),{type:'radar',data:{labels:['บริหารแผน\n(2)','บริหารต้นทุน\n(2)','บัญชี/การเงิน\n(1)','บริหารสินทรัพย์\n(3)','OM (1)','ROA (1)','NWC (1)','EBITDA (1)','Cash Ratio (1)'],datasets:[{label:'คะแนนได้',data:[2,1,1,0,0,1,1,1,0],borderColor:'#f59e0b',backgroundColor:'rgba(245,158,11,0.1)',borderWidth:2,pointRadius:4,pointBackgroundColor:'#f59e0b'},{label:'คะแนนเต็ม',data:[2,2,1,3,1,1,1,1,1],borderColor:'rgba(99,102,241,0.3)',backgroundColor:'rgba(99,102,241,0.03)',borderWidth:1.5,borderDash:[4,4],pointRadius:3,pointBackgroundColor:'rgba(99,102,241,0.4)'}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{font:{size:10},color:'#64748b',boxWidth:10,padding:12}},tooltip:LT_TT},scales:{r:{grid:{color:'rgba(0,0,0,0.06)'},angleLines:{color:'rgba(0,0,0,0.06)'},ticks:{display:false,stepSize:1},pointLabels:{font:{size:10},color:'#64748b'},min:0,max:3}}}});
    ltChart('tps_barScore','bar',{labels:['บริหารแผน','บริหารสินทรัพย์','บริหารต้นทุน','บัญชี/งบทดลอง','ผลผลิต','OM','ROA+EBITDA','สภาพคล่อง'],datasets:[{label:'ได้',data:[2,0,1,1,2,0,2,1],backgroundColor:'rgba(245,158,11,0.8)',borderRadius:5},{label:'เต็ม',data:[2,3,2,1,2,1,2,2],backgroundColor:'rgba(99,102,241,0.15)',borderRadius:5}]},{ytick:{stepSize:1}});
    ltChart('tps_p1bar','bar',{labels:['มิติรายได้','มิติค่าใช้จ่าย'],datasets:[{label:'ค่าจริง (%)',data:[-1.68,-4.98],backgroundColor:['rgba(16,185,129,0.8)','rgba(16,185,129,0.8)'],borderRadius:6},{label:'เกณฑ์ +5%',data:[5,5],type:'line',borderColor:'rgba(245,158,11,0.8)',borderWidth:2,borderDash:[6,4],pointRadius:4,pointBackgroundColor:'#f59e0b',fill:false},{label:'เกณฑ์ -5%',data:[-5,-5],type:'line',borderColor:'rgba(245,158,11,0.5)',borderWidth:2,borderDash:[6,4],pointRadius:4,pointBackgroundColor:'#f59e0b',fill:false}]},{ytick:{callback:v=>v+'%'}});
    ltChart('tps_p2bar','bar',{labels:['เจ้าหนี้ยา (≤90วัน)','ลูกหนี้ UC (≤60วัน)','ลูกหนี้ขรก. (≤60วัน)','สินคงคลัง (≤60วัน)'],datasets:[{label:'ค่าจริง (วัน)',data:[210,74,65,73],backgroundColor:'rgba(244,63,94,0.8)',borderRadius:6},{label:'เกณฑ์สูงสุด',data:[90,60,60,60],type:'line',borderColor:'#f59e0b',borderWidth:2,borderDash:[5,4],pointRadius:5,pointBackgroundColor:'#f59e0b',fill:false}]},{ytick:{callback:v=>v+' วัน'}});
    ltChart('tps_p3unit','bar',{labels:['OPD (บาท/ครั้ง)','IPD (บาท/AdjRW)'],datasets:[{label:'รพ.เสลภูมิ',data:[1038,10743],backgroundColor:['rgba(244,63,94,0.8)','rgba(16,185,129,0.8)'],borderRadius:6},{label:'ค่ากลาง',data:[1010,16120],backgroundColor:'rgba(245,158,11,0.3)',borderRadius:6}]});
    ltChart('tps_p3mc','bar',{labels:['LC แรงงาน','MC ยา','MC วัสดุวิทย์','MC วัสดุแพทย์'],datasets:[{label:'รพ.เสลภูมิ (ลบ.)',data:[51.39,14.30,5.82,7.59],backgroundColor:'rgba(244,63,94,0.8)',borderRadius:6},{label:'ค่ากลาง (ลบ.)',data:[49.09,10.71,3.37,5.17],backgroundColor:'rgba(245,158,11,0.3)',borderRadius:6}]});
    ltChart('tps_r1bar','bar',{labels:['Operating Margin (%)','Return on Asset (%)'],datasets:[{label:'รพ.เสลภูมิ',data:[13.87,4.20],backgroundColor:['rgba(244,63,94,0.8)','rgba(16,185,129,0.8)'],borderRadius:6},{label:'ค่ากลาง',data:[17.83,3.02],backgroundColor:'rgba(245,158,11,0.3)',borderRadius:6}]},{ytick:{callback:v=>v+'%'}});
    ltChart('tps_r2bar','bar',{labels:['Cash Ratio','เกณฑ์ขั้นต่ำ'],datasets:[{label:'ค่า',data:[0.26,0.80],backgroundColor:['rgba(244,63,94,0.8)','rgba(245,158,11,0.5)'],borderRadius:8}]},{leg:false,ytick:{callback:v=>v+'x'}});
}

// ============================================================
// 13. OVERRIDE renderTPSCharts() → เรียก loadTPSFromGAS()
// ============================================================
// ★ ฟังก์ชันนี้แทนที่ renderTPSCharts() เดิมทั้งหมด
function renderTPSCharts() {
    // แสดง hardcoded ก่อนทันที (ไม่ต้องรอ)
    renderTPSChartsHardcoded();

    // แล้วโหลด live data async → อัปเดตทับเมื่อได้ข้อมูล
    loadTPSFromGAS();
}
