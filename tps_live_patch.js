// ============================================================
// TPS LIVE DATA PATCH (Final Mixed: ล็อค 1.1, 1.2 และอัปเดต 1.3, 2.1, 2.2 ตามสั่ง)
// 🌟 ตกแต่ง UI/UX ให้กราฟและการ์ดมีความสมดุลและสวยงามขึ้น
// ============================================================
let tpsLiveData = null;

// ============================================================
// ฟังก์ชันตัวช่วยดึงตัวเลข (ป้องกัน NaN และดึงค่ากลางจากเกณฑ์)
// ============================================================
const safeParse = (val) => {
    if(val === null || val === undefined || val === '') return null;
    const clean = String(val).replace(/,/g, '').trim();
    const n = parseFloat(clean);
    return isNaN(n) ? null : n;
};

const parseMean = (item, fallback) => {
    if(!item || !item.criteria) return fallback;
    const cleanStr = String(item.criteria).replace(/,/g, '');
    const m = cleanStr.match(/(\d+(\.\d+)?)/);
    return m ? parseFloat(m[1]) : fallback;
};

// ============================================================
// 1. LOAD TPS FROM GAS WEB APP
// ============================================================
async function loadTPSFromGAS() {
    if (!TPS__WEB_APP_URL) {
        console.warn('⚠ ไม่พบลิงก์ TPS__WEB_APP_URL');
        renderTPSChartsHardcoded();
        return;
    }
    
    try {
        console.log('🔄 TPS: กำลังโหลดข้อมูลจากหลังบ้าน...');
        const resp = await fetch(TPS__WEB_APP_URL + '?action=tps', { redirect: 'follow' });
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        const json = await resp.json();

        if (json && json.indicators && json.indicators.length > 0) {
            tpsLiveData = json;
            console.log('✅ TPS โหลดสำเร็จ! คะแนนรวม:', json.summary?.totalScore);
            applyTPSLiveData(json);
        } else {
            console.warn('⚠ ข้อมูล TPS ไม่สมบูรณ์ ลองใช้ข้อมูลสำรอง');
            renderTPSChartsHardcoded();
        }
    } catch (e) {
        console.error('❌ TPS โหลดล้มเหลว:', e);
        renderTPSChartsHardcoded();
    }
}

// ============================================================
// 2. APPLY TPS LIVE DATA
// ============================================================
function applyTPSLiveData(data) {
    if (!data || !data.indicators) return;

    const indicators = data.indicators;
    const summary = data.summary || {};
    
    const totalScore = Number(summary.totalScore) || 0;
    const totalMax = Number(summary.totalMax) || 15;
    const grade = String(summary.grade || 'C').trim();

    const gradeInfo = {
        'A': { label: 'ดีมาก', color: '#10b981', bgColor: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.25)' },
        'B': { label: 'ดี', color: '#3b82f6', bgColor: 'rgba(59,130,246,0.08)', borderColor: 'rgba(59,130,246,0.25)' },
        'C': { label: 'พอใช้', color: '#f59e0b', bgColor: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.25)' },
        'D': { label: 'ต้องปรับปรุง', color: '#f97316', bgColor: 'rgba(249,115,22,0.08)', borderColor: 'rgba(249,115,22,0.25)' },
        'F': { label: 'ไม่ผ่าน', color: '#ef4444', bgColor: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.25)' }
    };
    const gi = gradeInfo[grade] || gradeInfo['C'];

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

    const sectionHead = document.querySelector('#tab-tps-score .erp-section-head h3');
    if (sectionHead) sectionHead.textContent = '📊 Total Performance Score (Live Data)';

    // 🎯 โครงสร้างภาพรวม (ล็อค Stable 100%)
    const catMap = buildCategoryMap(indicators);
    if(typeof updateScoreBars === 'function') updateScoreBars(catMap, totalScore, totalMax, gi.color);
    if(typeof updateTPSKpiCards === 'function') updateTPSKpiCards(catMap);
    if(typeof updateGradeTable === 'function') updateGradeTable(totalScore, grade);
    if(typeof renderTPSChartsFromData === 'function') renderTPSChartsFromData(catMap, totalScore, totalMax);
    if(typeof updateERPOverviewTPS === 'function') updateERPOverviewTPS(totalScore, totalMax, grade, gi, catMap);
    
    // 🎯 โครงสร้างแท็บย่อย (ผสมผสาน)
    if(typeof updateTPSSubTabs === 'function') updateTPSSubTabs(catMap, indicators);
    if(typeof renderTPSSubCharts === 'function') renderTPSSubCharts(catMap, indicators);
}

// ============================================================
// 3. HELPER: จัดกลุ่ม indicators (ล็อค Stable 100%)
// ============================================================
function buildCategoryMap(indicators) {
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
        const c = String(ind.code || '').toLowerCase();
        const n = String(ind.name || '').toLowerCase();

        let targetCat = cats.cost; 
        if (c.startsWith('1.1') || n.includes('planfin') || n.includes('แผน')) targetCat = cats.planfin;
        else if (c.startsWith('1.2') || n.includes('สินทรัพย์') || n.includes('เจ้าหนี้') || n.includes('ลูกหนี้')) targetCat = cats.asset;
        else if (c.startsWith('1.3.1') || n.includes('unit cost') || n.includes('opd') || n.includes('ipd') || n.includes('ต้นทุน')) targetCat = cats.cost;
        else if (c.startsWith('1.3.2') || n.includes('งบทดลอง') || n.includes('บัญชี')) targetCat = cats.accounting;
        else if (c.startsWith('1.3.3') || n.includes('ผลผลิต') || n.includes('ครองเตียง') || n.includes('adjrw')) targetCat = cats.output;
        else if (c.startsWith('2.1') || n.includes('กำไร') || n.includes('margin') || n.includes('roa') || n.includes('ebitda')) targetCat = cats.profit;
        else if (c.startsWith('2.2') || n.includes('สภาพคล่อง') || n.includes('nwc') || n.includes('cash ratio')) targetCat = cats.liquidity;

        targetCat.items.push(ind);
    });

    Object.values(cats).forEach(cat => {
        const validItems = cat.items.filter(ind => ind.actual !== null || ind.unit !== '' || ind.criteria !== '');
        let sumScore = 0;
        let sumMax = 0;
        
        validItems.forEach(ind => {
            sumScore += Number(ind.score) || 0;
            sumMax += Number(ind.maxScore) || 0;
        });

        cat.score = sumScore;
        cat.maxScore = sumMax;
        cat.items = validItems;
    });

    return cats;
}

// ============================================================
// 4. อัปเดตคะแนนแถบสี (ล็อค Stable 100%)
// ============================================================
function updateScoreBars(catMap, totalScore, totalMax, gradeColor) {
    const barContainer = document.querySelector('#tps-ov .erp-card-body');
    if (!barContainer) return;
    const scoreRows = barContainer.querySelectorAll('.nt-score-row');
    if (scoreRows.length < 8) return; 

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
            if (pct >= 100) fill.className = 'nt-score-fill full';
            else if (pct > 0) fill.className = 'nt-score-fill part';
            else fill.className = 'nt-score-fill zero';
        }
    });

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
// 5. อัปเดตการ์ด Overview (ปรับสมดุลกล่องการ์ดให้สวยงามขึ้น)
// ============================================================
function updateTPSKpiCards(catMap) {
    const kpiRow = document.querySelector('#tps-ov .nt-kpi-row');
    if (!kpiRow) return;
    const cards = kpiRow.querySelectorAll('.nt-kpi');
    const catKeys = ['planfin', 'asset', 'cost', 'accounting_output', 'profit', 'liquidity'];

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
        
        // 🌟 ปรับสมดุลกล่องให้ดูพอดี ไม่ยืดหรือหดเกินไป
        card.style.flex = '1 1 min(280px, 100%)';
        card.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';

        const lblEl = card.querySelector('.nt-lbl');
        const valEl = card.querySelector('.nt-val');
        const footEl = card.querySelector('.nt-foot');
        const pillEl = card.querySelector('.nt-pill');

        if (lblEl) lblEl.textContent = cat.name;
        if (valEl) valEl.innerHTML = cat.score + ' <small>/ ' + cat.maxScore + '</small>';

        if (footEl && cat.items.length > 0) {
            const details = cat.items.map(ind => {
                const val = ind.actual !== null ? ind.actual : '-';
                const res = ind.result || '';
                return (ind.name || ind.code) + ' ' + val + (ind.unit ? ' ' + ind.unit : '') + (res ? ' ' + res : '');
            }).join(' | ');
            footEl.textContent = details.substring(0, 80) + (details.length > 80 ? '...' : '');
        }

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
// 6. RENDER กราฟหลัก (ปรับ Bar Thickness ให้สมดุลสวยงาม)
// ============================================================
function renderTPSChartsFromData(catMap, totalScore, totalMax) {
    const catKeys = ['planfin', 'cost', 'accounting', 'asset', 'profit', 'liquidity'];
    const radarLabels = catKeys.map(k => catMap[k].name + '\n(' + catMap[k].maxScore + ')');
    const radarScores = catKeys.map(k => catMap[k].score);
    const radarMax = catKeys.map(k => catMap[k].maxScore);
    const maxVal = Math.max(...radarMax, 3);

    if(typeof destroyChart === 'function') destroyChart('tps_radar');
    
    if (typeof Chart !== 'undefined' && document.getElementById('tps_radar')) {
        new Chart(document.getElementById('tps_radar'), {
            type: 'radar',
            data: {
                labels: radarLabels,
                datasets: [
                    { label: 'คะแนนได้', data: radarScores, borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.15)', borderWidth: 2, pointRadius: 4, pointBackgroundColor: '#f59e0b', pointHoverBackgroundColor: '#fff', borderJoinStyle: 'round' },
                    { label: 'คะแนนเต็ม', data: radarMax, borderColor: 'rgba(99,102,241,0.3)', backgroundColor: 'rgba(99,102,241,0.04)', borderWidth: 1.5, borderDash: [4, 4], pointRadius: 3, pointBackgroundColor: 'rgba(99,102,241,0.4)' }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { font: { size: 10 }, color: '#64748b', boxWidth: 10, padding: 12 } } },
                scales: { r: { min: 0, max: maxVal, ticks: { display: false, stepSize: 1 } } }
            }
        });
    }

    const barLabels = Object.values(catMap).map(c => c.name);
    const barScores = Object.values(catMap).map(c => c.score);
    const barMaxes = Object.values(catMap).map(c => c.maxScore);

    if(typeof destroyChart === 'function') destroyChart('tps_barScore');
    if(typeof ltChart === 'function') {
        ltChart('tps_barScore', 'bar', {
            labels: barLabels,
            datasets: [
                { label: 'ได้', data: barScores, backgroundColor: 'rgba(245,158,11,0.85)', borderRadius: 6, maxBarThickness: 45, hoverBackgroundColor: 'rgba(245,158,11,1)' },
                { label: 'เต็ม', data: barMaxes, backgroundColor: 'rgba(99,102,241,0.15)', borderRadius: 6, maxBarThickness: 45 }
            ]
        }, { ytick: { stepSize: 1 } });
    }
}

// ============================================================
// 7. ✅ อัปเดตข้อมูลแท็บย่อย (ล็อคข้อมูลเป๊ะๆ ตามเดิม 100%)
// ============================================================
function updateTPSSubTabs(catMap, indicators) {
    // 🔒 1.1 บริหารแผน (ล็อค Stable 100%)
    updateSubTabKPIs('tps-p1', catMap.planfin.items);
    
    // 🔒 1.2 สินทรัพย์ (ล็อค Stable 100%)
    updateSubTabKPIs('tps-p2', catMap.asset.items);

    // 🚀 1.3 บริหารจัดการ
    const p3Items = indicators.filter(i => {
        const code = String(i.code || '').trim();
        const name = String(i.name || '').trim();
        return code.startsWith('1.3.1') || code.startsWith('1.3.2') || code.startsWith('1.3.3') ||
               name.startsWith('1.3.1') || name.startsWith('1.3.2') || name.startsWith('1.3.3');
    });
    updateSubTabKPIs('tps-p3', p3Items);

    // 🚀 2.1 ความสามารถในการทำกำไร
    const r1Items = indicators.filter(i => String(i.code || '').trim().startsWith('2.1'));
    const r1Valid = r1Items.filter(i => i.actual !== null || i.unit !== '');
    updateSubTabKPIs('tps-r1', r1Valid);

    // 🚀 2.2 สภาพคล่อง
    const r2Items = indicators.filter(i => String(i.code || '').trim().startsWith('2.2'));
    const r2Valid = r2Items.filter(i => i.actual !== null || i.unit !== '');
    updateSubTabKPIs('tps-r2', r2Valid);

    // 🚀 ข้อมูลการเงิน
    const finPanel = document.getElementById('tps-fin');
    if (finPanel && indicators) {
        const finItems = indicators.filter(i => {
            const n = String(i.name).toLowerCase();
            return n.includes('ebitda') || n.includes('nwc') || n.includes('ทุนสำรอง') || n.includes('ni') || n.includes('รายได้สูง (ต่ำ)');
        });
        const uniqueFinItems = [];
        const finNames = new Set();
        for(const item of finItems) {
            if(!finNames.has(item.name)) {
                finNames.add(item.name);
                uniqueFinItems.push(item);
            }
        }
        updateSubTabKPIs('tps-fin', uniqueFinItems);
    }
}

// ============================================================
// 8. ✅ วาดกราฟแท็บย่อย (อัปเกรด UI: Bar Thickness, Layout)
// ============================================================
function renderTPSSubCharts(catMap, indicators) {
    // 🔒 P1 กราฟบริหารแผน
    const p1Items = catMap.planfin.items;
    if (p1Items.length >= 2) {
        const revPct = Number(p1Items[0].actual) || 0;
        const expPct = Number(p1Items[1].actual) || 0;
        if(typeof destroyChart === 'function') destroyChart('tps_p1bar');
        if(typeof ltChart === 'function') {
            ltChart('tps_p1bar', 'bar', {
                labels: ['มิติรายได้', 'มิติค่าใช้จ่าย'],
                datasets: [
                    { label: 'ค่าจริง (%)', data: [revPct, expPct], backgroundColor: ['rgba(16,185,129,0.85)', 'rgba(16,185,129,0.85)'], borderRadius: 6, maxBarThickness: 55 },
                    { label: 'เกณฑ์ +5%', data: [5, 5], type: 'line', borderColor: 'rgba(245,158,11,0.8)', borderWidth: 2, borderDash: [6, 4], pointRadius: 4, pointBackgroundColor: '#f59e0b', fill: false },
                    { label: 'เกณฑ์ -5%', data: [-5, -5], type: 'line', borderColor: 'rgba(245,158,11,0.5)', borderWidth: 2, borderDash: [6, 4], pointRadius: 4, pointBackgroundColor: '#f59e0b', fill: false }
                ]
            }, { ytick: { callback: v => v + '%' } });
        }
    }

    // 🔒 P2 กราฟสินทรัพย์ (แนวนอน)
    const p2Items = catMap.asset.items;
    if (p2Items.length > 0) {
        const labels = p2Items.map(ind => {
            let name = String(ind.name || ind.code);
            if(name.includes('เจ้าหนี้')) return 'เจ้าหนี้การค้า';
            if(name.includes('UC') || name.includes('บัตรทอง')) return 'ลูกหนี้ UC';
            if(name.includes('ขรก') || name.includes('เบิกจ่ายตรง')) return 'ลูกหนี้ ขรก.';
            if(name.includes('คงคลัง') || name.includes('สินค้า')) return 'วัสดุคงคลัง';
            return name.substring(0, 15) + '...';
        });
        
        const values = p2Items.map(ind => safeParse(ind.actual) || 0);
        const limits = p2Items.map(ind => parseMean(ind, 60)); 
        const colors = values.map((v, i) => v <= limits[i] ? 'rgba(16,185,129,0.85)' : 'rgba(244,63,94,0.85)');

        if(typeof destroyChart === 'function') destroyChart('tps_p2bar');
        if (typeof Chart !== 'undefined' && document.getElementById('tps_p2bar')) {
            new Chart(document.getElementById('tps_p2bar'), {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        { label: 'ค่าจริง (วัน)', data: values, backgroundColor: colors, borderRadius: 6, maxBarThickness: 35 },
                        { label: 'เกณฑ์สูงสุด (วัน)', data: limits, type: 'line', borderColor: '#f59e0b', borderWidth: 2, borderDash: [5, 4], pointRadius: 5, fill: false }
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    indexAxis: 'y', // กราฟแนวนอน
                    plugins: { legend: { position: 'bottom' } },
                    scales: { x: { grid: { color: '#f1f5f9' } }, y: { grid: { display: false } } }
                }
            });
        }
    }

    // 🚀 P3 กราฟต้นทุน 1.3 
    const p3Items = indicators.filter(i => {
        const code = String(i.code || '').trim();
        const name = String(i.name || '').trim();
        return code.startsWith('1.3.1') || code.startsWith('1.3.2') || code.startsWith('1.3.3') ||
               name.startsWith('1.3.1') || name.startsWith('1.3.2') || name.startsWith('1.3.3');
    });
    
    // 1. กราฟ Unit Cost
    const opdItem = p3Items.find(i => String(i.name).includes('1.3.1.1') || String(i.code).includes('1.3.1.1'));
    const ipdItem = p3Items.find(i => String(i.name).includes('1.3.1.2') || String(i.code).includes('1.3.1.2'));
    
    const opdVal = opdItem ? (safeParse(opdItem.actual) || 0) : 0;
    const ipdVal = ipdItem ? (safeParse(ipdItem.actual) || 0) : 0;
    const opdMean = parseMean(opdItem, 1010.51);
    const ipdMean = parseMean(ipdItem, 16120);

    const opdColor = opdVal <= opdMean ? 'rgba(16,185,129,0.85)' : 'rgba(244,63,94,0.85)';
    const ipdColor = ipdVal <= ipdMean ? 'rgba(16,185,129,0.85)' : 'rgba(244,63,94,0.85)';

    if(typeof destroyChart === 'function') destroyChart('tps_p3unit');
    if (typeof Chart !== 'undefined' && document.getElementById('tps_p3unit')) {
        new Chart(document.getElementById('tps_p3unit'), {
            type: 'bar',
            data: {
                labels: ['OPD (บาท/ครั้ง)', 'IPD (บาท/AdjRW)'],
                datasets: [
                    { label: 'รพ.เสลภูมิ', data: [opdVal, ipdVal], backgroundColor: [opdColor, ipdColor], borderRadius: 8, maxBarThickness: 55 },
                    { label: 'ค่ากลาง', data: [opdMean, ipdMean], backgroundColor: 'rgba(245,158,11,0.25)', borderRadius: 8, maxBarThickness: 55 }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, scales: { y: { grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } } }
        });
    }

    // 2. แยกกราฟต้นทุน 4 ประเภท (จัด Layout กล่องเป็น Grid สวยงามสไตล์ Card พรีเมียม)
    const lcItem = p3Items.find(i => String(i.name).includes('1.3.1.3') || String(i.code).includes('1.3.1.3'));
    const mcDrugItem = p3Items.find(i => String(i.name).includes('1.3.1.4') || String(i.code).includes('1.3.1.4'));
    const mcSciItem = p3Items.find(i => String(i.name).includes('1.3.1.5') || String(i.code).includes('1.3.1.5'));
    const mcMedItem = p3Items.find(i => String(i.name).includes('1.3.1.6') || String(i.code).includes('1.3.1.6'));

    const lcVal = lcItem ? (safeParse(lcItem.actual) || 0) : 0;
    const mcDrugVal = mcDrugItem ? (safeParse(mcDrugItem.actual) || 0) : 0;
    const mcSciVal = mcSciItem ? (safeParse(mcSciItem.actual) || 0) : 0;
    const mcMedVal = mcMedItem ? (safeParse(mcMedItem.actual) || 0) : 0;

    const lcMean = parseMean(lcItem, 49.09);
    const mcDrugMean = parseMean(mcDrugItem, 10.71);
    const mcSciMean = parseMean(mcSciItem, 3.37);
    const mcMedMean = parseMean(mcMedItem, 5.17);

    const origMcCanvas = document.getElementById('tps_p3mc');
    if (origMcCanvas) {
        origMcCanvas.style.display = 'none'; 
        let parent = origMcCanvas.parentElement;
        
        let oldCustom = document.getElementById('custom_mc_container');
        if (oldCustom) oldCustom.remove();
        
        let customContainer = document.createElement('div');
        customContainer.id = 'custom_mc_container';
        // 🌟 เปลี่ยนจากการซ้อนกันทื่อๆ เป็น Grid/Flex Card สวยๆ
        customContainer.style.display = 'grid';
        customContainer.style.gridTemplateColumns = 'repeat(auto-fit, minmax(300px, 1fr))';
        customContainer.style.gap = '16px';
        customContainer.style.width = '100%';
        customContainer.style.marginTop = '15px';
        customContainer.style.paddingBottom = '10px';
        parent.appendChild(customContainer);

        const createBar = (id, title, val, mean) => {
            const wrapper = document.createElement('div');
            // 🌟 ตกแต่ง Card ให้มีมิติ
            wrapper.style.height = '110px'; 
            wrapper.style.width = '100%';
            wrapper.style.backgroundColor = '#ffffff';
            wrapper.style.borderRadius = '12px';
            wrapper.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.04)';
            wrapper.style.border = '1px solid #f1f5f9';
            wrapper.style.padding = '12px 16px';
            wrapper.style.display = 'flex';
            wrapper.style.flexDirection = 'column';
            wrapper.style.justifyContent = 'center';
            wrapper.innerHTML = `<canvas id="${id}"></canvas>`;
            customContainer.appendChild(wrapper);

            const color = val <= mean ? 'rgba(16,185,129,0.85)' : 'rgba(244,63,94,0.85)';
            
            if (typeof Chart !== 'undefined') {
                new Chart(document.getElementById(id), {
                    type: 'bar',
                    data: {
                        labels: [title],
                        datasets: [
                            { label: 'รพ.เสลภูมิ (%)', data: [val], backgroundColor: color, borderRadius: 4, maxBarThickness: 25 },
                            { label: 'ค่ากลาง (%)', data: [mean], backgroundColor: 'rgba(245,158,11,0.25)', borderRadius: 4, maxBarThickness: 25 }
                        ]
                    },
                    options: {
                        responsive: true, maintainAspectRatio: false,
                        indexAxis: 'y', // กราฟแนวนอน
                        plugins: { 
                            legend: { display: false }, 
                            tooltip: { backgroundColor: 'rgba(15, 23, 42, 0.9)', padding: 10, cornerRadius: 8 } 
                        },
                        scales: { 
                            x: { display: true, beginAtZero: true, grid: { color: '#f1f5f9' } }, 
                            y: { display: true, grid: { display: false } } 
                        }
                    }
                });
            }
        };

        createBar('mc_chart_1', '1.3.1.3 LC ค่าแรงบุคลากร', lcVal, lcMean);
        createBar('mc_chart_2', '1.3.1.4 MC ค่ายา', mcDrugVal, mcDrugMean);
        createBar('mc_chart_3', '1.3.1.5 MC ค่าวัสดุวิทยาศาสตร์และการแพทย์', mcSciVal, mcSciMean);
        createBar('mc_chart_4', '1.3.1.6 MC ค่าเวชภัณฑ์มิใช่ยาและวัสดุการแพทย์', mcMedVal, mcMedMean);
    }

    // 🚀 R1 กราฟทำกำไร
    const r1Items = indicators.filter(i => String(i.code || '').trim().startsWith('2.1'));
    const omItem = r1Items.find(i => String(i.code).includes('2.1.1') || String(i.name).toLowerCase().includes('om') || String(i.name).includes('ดำเนินงาน'));
    const roaItem = r1Items.find(i => String(i.code).includes('2.1.2') || String(i.name).toLowerCase().includes('roa') || String(i.name).includes('สินทรัพย์'));

    if (omItem || roaItem) {
        const omVal = omItem ? safeParse(omItem.actual) || 0 : 0;
        const roaVal = roaItem ? safeParse(roaItem.actual) || 0 : 0;
        const omMean = parseMean(omItem, 16.68);
        const roaMean = parseMean(roaItem, 7.23);

        const omColor = omVal >= omMean ? 'rgba(16,185,129,0.85)' : 'rgba(244,63,94,0.85)';
        const roaColor = roaVal >= roaMean ? 'rgba(16,185,129,0.85)' : 'rgba(244,63,94,0.85)';

        if(typeof destroyChart === 'function') destroyChart('tps_r1bar');
        if (typeof Chart !== 'undefined' && document.getElementById('tps_r1bar')) {
            new Chart(document.getElementById('tps_r1bar'), {
                type: 'bar',
                data: {
                    labels: ['Operating Margin (%)', 'Return on Asset (%)'],
                    datasets: [
                        { label: 'รพ.เสลภูมิ', data: [omVal, roaVal], backgroundColor: [omColor, roaColor], borderRadius: 8, maxBarThickness: 55 },
                        { label: 'ค่ากลาง', data: [omMean, roaMean], backgroundColor: 'rgba(245,158,11,0.25)', borderRadius: 8, maxBarThickness: 55 }
                    ]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, scales: { y: { grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } } }
            });
        }
    }

    // 🚀 R2 กราฟสภาพคล่อง (Cash Ratio)
    const r2Items = indicators.filter(i => String(i.code || '').trim().startsWith('2.2'));
    const r2Valid = r2Items.filter(i => i.actual !== null || i.unit !== '');
    const cashItem = r2Valid.find(i => String(i.name).toLowerCase().includes('cash') || String(i.name).includes('สภาพคล่อง'));
    const cashVal = cashItem ? safeParse(cashItem.actual) || 0.26 : 0.26;
    
    if(typeof destroyChart === 'function') destroyChart('tps_r2bar');
    if (typeof Chart !== 'undefined' && document.getElementById('tps_r2bar')) {
        new Chart(document.getElementById('tps_r2bar'), {
            type: 'bar',
            data: {
                labels: ['Cash Ratio'],
                datasets: [
                    { label: 'ค่า', data: [cashVal], backgroundColor: cashVal >= 0.8 ? 'rgba(16,185,129,0.85)' : 'rgba(244,63,94,0.85)', borderRadius: 8, maxBarThickness: 55 },
                    { label: 'เกณฑ์ขั้นต่ำ', data: [0.80], type: 'line', borderColor: '#f59e0b', borderDash: [5,4], borderWidth: 2, fill: false }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, scales: { y: { grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } } }
        });
    }
}

// ============================================================
// 9. ฟังก์ชันเสริมวาดการ์ด KPI (เพิ่มลูกน้ำ ปรับสมดุลกล่อง)
// ============================================================
function updateSubTabKPIs(panelId, items) {
    const panel = document.getElementById(panelId);
    if (!panel) return;
    const kpiRow = panel.querySelector('.nt-kpi-row');
    if (!kpiRow || !items || items.length === 0) return;

    let cards = kpiRow.querySelectorAll('.nt-kpi');
    
    // 🌟 ระบบเพิ่มการ์ดอัตโนมัติ
    if (items.length > cards.length && cards.length > 0) {
        const template = cards[0].cloneNode(true);
        for (let i = cards.length; i < items.length; i++) {
            kpiRow.appendChild(template.cloneNode(true));
        }
        cards = kpiRow.querySelectorAll('.nt-kpi'); 
    }

    cards.forEach((card, i) => {
        if (i >= items.length) {
            card.style.display = 'none'; 
            return;
        }
        
        // 🌟 ปรับ Layout กล่อง Card ให้สมดุลเท่าๆ กันเมื่อแสดงผล
        card.style.display = 'flex';
        card.style.flex = '1 1 min(260px, 100%)'; 
        card.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';

        const ind = items[i];

        const lblEl = card.querySelector('.nt-lbl');
        const valEl = card.querySelector('.nt-val');
        const footEl = card.querySelector('.nt-foot');
        const pillEl = card.querySelector('.nt-pill');

        if (lblEl) lblEl.textContent = ind.name || ind.code || '';
        if (valEl) {
            const actNum = safeParse(ind.actual);
            const valStr = (actNum !== null) ? actNum.toLocaleString('en-US', {maximumFractionDigits: 2}) : '-';
            valEl.innerHTML = valStr + ' <small>' + (ind.unit || '') + '</small>';
        }
        if (footEl) footEl.textContent = (ind.criteria || '') + (ind.result ? ' | ' + ind.result : '');
        
        if (pillEl) {
            if(ind.maxScore === null || ind.maxScore === undefined || ind.maxScore === 0) {
                 pillEl.style.display = 'none';
            } else {
                 pillEl.style.display = 'inline-block';
                 pillEl.textContent = (ind.score || 0) + ' / ' + (ind.maxScore || 0) + ' คะแนน';
                 pillEl.className = 'nt-pill ' + ((ind.score || 0) >= (ind.maxScore || 1) ? 'good' : (ind.score || 0) > 0 ? 'warn' : 'bad');
            }
        }
        
        if((ind.maxScore || 0) > 0) {
            card.className = 'nt-kpi ' + ((ind.score || 0) >= (ind.maxScore || 1) ? 'c-green' : (ind.score || 0) > 0 ? 'c-amber' : 'c-red');
        } else {
            card.className = 'nt-kpi c-blue'; 
        }
    });
}

function updateERPOverviewTPS(totalScore, totalMax, grade, gi, catMap) {
    const allCards = document.querySelectorAll('#tab-erp-overview .ov-sc');
    let tpsCard = null;
    allCards.forEach(card => {
        const title = card.querySelector('.st');
        if (title && title.textContent.includes('TPS')) tpsCard = card;
    });
    if (!tpsCard) return;

    const badge = tpsCard.querySelector('.sb');
    if (badge) {
        badge.textContent = grade + ' ' + gi.label;
        badge.style.background = gi.bgColor;
        badge.style.color = gi.color;
    }

    const ring = tpsCard.querySelector('.ov-ring');
    if (ring) {
        const pct = totalMax > 0 ? Math.round(totalScore / totalMax * 100) : 0;
        ring.style.background = 'conic-gradient(' + gi.color + ' 0% ' + pct + '%, #f1f5f9 ' + pct + '% 100%)';
        const span = ring.querySelector('span');
        if (span) { span.textContent = totalScore; span.style.color = gi.color; }
    }

    const scoreText = tpsCard.querySelector('.ov-ring + div');
    if (scoreText) scoreText.textContent = 'คะแนน ' + totalScore + ' / ' + totalMax;
}

function renderTPSChartsHardcoded() {
    console.log("ใช้ข้อมูล Hardcode สำรองเนื่องจากโหลด Live Data ไม่สำเร็จ");
}

function renderTPSCharts() {
    loadTPSFromGAS();
}
