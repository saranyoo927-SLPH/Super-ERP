// ============================================================
// TPS LIVE DATA PATCH (Stable + อัปเดตเฉพาะ 1.3, 2.1, 2.2, การเงิน)
// ============================================================
let tpsLiveData = null;

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
    
    // 🎯 แปลงค่าให้เป็นตัวเลขเสมอ ป้องกันปัญหา NaN
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

    // อัปเดต Grade Card มุมซ้ายบน
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

    // เปลี่ยนชื่อหัวข้อ
    const sectionHead = document.querySelector('#tab-tps-score .erp-section-head h3');
    if (sectionHead) sectionHead.textContent = '📊 Total Performance Score (Live Data)';

    // จัดกลุ่มข้อมูลและวาดกราฟ (เวอร์ชัน Stable ที่ผ่านการทดสอบแล้ว)
    const catMap = buildCategoryMap(indicators);
    if(typeof updateScoreBars === 'function') updateScoreBars(catMap, totalScore, totalMax, gi.color);
    if(typeof updateTPSKpiCards === 'function') updateTPSKpiCards(catMap);
    if(typeof updateGradeTable === 'function') updateGradeTable(totalScore, grade);
    if(typeof renderTPSChartsFromData === 'function') renderTPSChartsFromData(catMap, totalScore, totalMax);
    if(typeof updateTPSSubTabs === 'function') updateTPSSubTabs(indicators); // ✅ สวิตช์อัปเดตแท็บย่อย
    if(typeof updateERPOverviewTPS === 'function') updateERPOverviewTPS(totalScore, totalMax, grade, gi, catMap);
}

// ============================================================
// 3. HELPER: จัดกลุ่ม indicators (อิง Stable เดิมที่ไว้ใจได้ 100%)
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

        let targetCat = cats.cost; // ค่าเริ่มต้น
        if (c.startsWith('1.1') || n.includes('planfin') || n.includes('แผน')) targetCat = cats.planfin;
        else if (c.startsWith('1.2') || n.includes('สินทรัพย์') || n.includes('เจ้าหนี้') || n.includes('ลูกหนี้')) targetCat = cats.asset;
        else if (c.startsWith('1.3.1') || n.includes('unit cost') || n.includes('opd') || n.includes('ipd') || n.includes('ต้นทุน')) targetCat = cats.cost;
        else if (c.startsWith('1.3.2') || n.includes('งบทดลอง') || n.includes('บัญชี')) targetCat = cats.accounting;
        else if (c.startsWith('1.3.3') || n.includes('ผลผลิต') || n.includes('ครองเตียง') || n.includes('adjrw')) targetCat = cats.output;
        else if (c.startsWith('2.1') || n.includes('กำไร') || n.includes('margin') || n.includes('roa') || n.includes('ebitda')) targetCat = cats.profit;
        else if (c.startsWith('2.2') || n.includes('สภาพคล่อง') || n.includes('nwc') || n.includes('cash ratio')) targetCat = cats.liquidity;

        targetCat.items.push(ind);
    });

    // คัดกรองและบวกคะแนนอย่างปลอดภัย (อิง Stable เดิม)
    Object.values(cats).forEach(cat => {
        // กรองเอาเฉพาะข้อย่อยที่มีการกรอกผลงานหรือหน่วยนับ
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
// 4. อัปเดตคะแนนแถบสี (อิง Stable)
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
// 5. อัปเดตการ์ดข้อมูล KPI (อิง Stable + เพิ่มคอมม่าให้ตัวเลขใหญ่)
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

        const lblEl = card.querySelector('.nt-lbl');
        const valEl = card.querySelector('.nt-val');
        const footEl = card.querySelector('.nt-foot');
        const pillEl = card.querySelector('.nt-pill');

        if (lblEl) lblEl.textContent = cat.name;
        if (valEl) valEl.innerHTML = cat.score + ' <small>/ ' + cat.maxScore + '</small>';

        if (footEl && cat.items.length > 0) {
            const details = cat.items.map(ind => {
                let val = ind.actual !== null ? ind.actual : '-';
                // จัดรูปแบบตัวเลขให้มีลูกน้ำ (Comma) หากเป็นตัวเลขยาวๆ 
                if (typeof val === 'number') {
                    val = val.toLocaleString('en-US', {maximumFractionDigits: 2});
                } else if (!isNaN(Number(val)) && val !== '') {
                    val = Number(val).toLocaleString('en-US', {maximumFractionDigits: 2});
                }
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
// 6. RENDER กราฟหลัก (Radar & Bar) (อิง Stable)
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
                    { label: 'คะแนนได้', data: radarScores, borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.1)', borderWidth: 2, pointRadius: 4, pointBackgroundColor: '#f59e0b' },
                    { label: 'คะแนนเต็ม', data: radarMax, borderColor: 'rgba(99,102,241,0.3)', backgroundColor: 'rgba(99,102,241,0.03)', borderWidth: 1.5, borderDash: [4, 4], pointRadius: 3, pointBackgroundColor: 'rgba(99,102,241,0.4)' }
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
                { label: 'ได้', data: barScores, backgroundColor: 'rgba(245,158,11,0.8)', borderRadius: 5 },
                { label: 'เต็ม', data: barMaxes, backgroundColor: 'rgba(99,102,241,0.15)', borderRadius: 5 }
            ]
        }, { ytick: { stepSize: 1 } });
    }
}

// ============================================================
// 7. ✅ อัปเดตข้อมูลแท็บย่อย (เฉพาะ 1.3, 2.1, 2.2, ข้อมูลการเงิน)
// ============================================================
function updateTPSSubTabs(indicators) {
    // ฟังก์ชันช่วยกรองตัวชี้วัด
    const getItemsByPrefix = (prefix) => indicators.filter(i => {
        const code = String(i.code || '').trim();
        const name = String(i.name || '').trim();
        return code.startsWith(prefix) || name.startsWith(prefix);
    });

    // ==========================================
    // 📊 1.3 การบริหารจัดการ (p3)
    // ==========================================
    const p3Items = indicators.filter(i => {
        const code = String(i.code || '').trim();
        const name = String(i.name || '').trim();
        return code.startsWith('1.3.1') || code.startsWith('1.3.2') || code.startsWith('1.3.3') ||
               name.startsWith('1.3.1') || name.startsWith('1.3.2') || name.startsWith('1.3.3');
    });
    // อัปเดตการ์ด
    updateSubTabKPIs('tps-p3', p3Items);
    
    // อัปเดตกราฟ 1.3 (OPD/IPD)
    const opdItem = p3Items.find(i => String(i.name).toLowerCase().includes('opd') || String(i.name).includes('ผู้ป่วยนอก'));
    const ipdItem = p3Items.find(i => String(i.name).toLowerCase().includes('ipd') || String(i.name).includes('ผู้ป่วยใน'));
    const opdVal = opdItem && opdItem.actual !== null ? Number(opdItem.actual) : 1038;
    const ipdVal = ipdItem && ipdItem.actual !== null ? Number(ipdItem.actual) : 10743;

    if(typeof destroyChart === 'function') destroyChart('tps_p3unit');
    if(typeof ltChart === 'function') {
        ltChart('tps_p3unit', 'bar', { 
            labels: ['OPD (บาท/ครั้ง)', 'IPD (บาท/AdjRW)'], 
            datasets: [
                { label: 'รพ.เสลภูมิ', data: [opdVal, ipdVal], backgroundColor: ['rgba(244,63,94,0.8)', 'rgba(16,185,129,0.8)'], borderRadius: 6 }, 
                { label: 'ค่ากลาง', data: [1010, 16120], backgroundColor: 'rgba(245,158,11,0.3)', borderRadius: 6 }
            ] 
        });
    }

    // ==========================================
    // 📊 2.1 ความสามารถในการทำกำไร (r1)
    // ==========================================
    const r1Items = getItemsByPrefix('2.1');
    const r1Valid = r1Items.filter(i => i.actual !== null || i.unit !== '');
    
    // อัปเดตการ์ด
    updateSubTabKPIs('tps-r1', r1Valid);

    // อัปเดตกราฟ 2.1 (ดึงเฉพาะเปอร์เซ็นต์ ไม่เอา EBITDA ที่เป็นเงินบาท)
    const chartableR1 = r1Valid.filter(i => !String(i.name).toLowerCase().includes('ebitda') && !String(i.unit).includes('บาท'));
    if (chartableR1.length > 0) {
        if(typeof destroyChart === 'function') destroyChart('tps_r1bar');
        if(typeof ltChart === 'function') {
            ltChart('tps_r1bar', 'bar', {
                labels: chartableR1.map(ind => ind.name || ind.code),
                datasets: [{ 
                    label: 'รพ.เสลภูมิ (%)', 
                    data: chartableR1.map(ind => Number(ind.actual) || 0), 
                    backgroundColor: chartableR1.map(ind => (Number(ind.score) || 0) >= (Number(ind.maxScore) || 1) ? 'rgba(16,185,129,0.8)' : 'rgba(244,63,94,0.8)'), 
                    borderRadius: 6 
                }]
            }, { ytick: { callback: v => v + '%' } });
        }
    }

    // ==========================================
    // 📊 2.2 การวัดสภาพคล่อง (r2)
    // ==========================================
    const r2Items = getItemsByPrefix('2.2');
    const r2Valid = r2Items.filter(i => i.actual !== null || i.unit !== '');
    
    // อัปเดตการ์ด
    updateSubTabKPIs('tps-r2', r2Valid);

    // อัปเดตกราฟ 2.2 (Cash Ratio)
    const cashItem = r2Valid.find(i => String(i.name).toLowerCase().includes('cash') || String(i.name).includes('สภาพคล่อง'));
    const cashVal = cashItem && cashItem.actual !== null ? Number(cashItem.actual) : 0.26;
    
    if(typeof destroyChart === 'function') destroyChart('tps_r2bar');
    if(typeof ltChart === 'function') {
        ltChart('tps_r2bar', 'bar', {
            labels: ['Cash Ratio', 'เกณฑ์ขั้นต่ำ'],
            datasets: [{ label: 'ค่า', data: [cashVal, 0.80], backgroundColor: [cashVal >= 0.8 ? 'rgba(16,185,129,0.8)' : 'rgba(244,63,94,0.8)', 'rgba(245,158,11,0.5)'], borderRadius: 8 }]
        }, { leg: false, ytick: { callback: v => v + 'x' } });
    }

    // ==========================================
    // 💰 ข้อมูลการเงิน (tps-fin)
    // ==========================================
    const finItems = indicators.filter(i => {
        const n = String(i.name).toLowerCase();
        return n.includes('ebitda') || n.includes('nwc') || n.includes('ทุนสำรอง') || n.includes('ni') || n.includes('รายได้สูง (ต่ำ)');
    });
    
    // กรองตัวที่ชื่อซ้ำกันออก
    const uniqueFinItems = [];
    const finNames = new Set();
    for(const item of finItems) {
        if(!finNames.has(item.name)) {
            finNames.add(item.name);
            uniqueFinItems.push(item);
        }
    }
    // อัปเดตการ์ด
    updateSubTabKPIs('tps-fin', uniqueFinItems);
}

// 📌 ฟังก์ชันช่วยเหลือสำหรับสร้างการ์ดในแท็บย่อย (แยกจัดการโดยเฉพาะ)
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
            const actNum = Number(ind.actual);
            // เพิ่มการใส่ลูกน้ำ (Comma) ลงในตัวเลขให้ดูง่าย
            const valStr = (!isNaN(actNum) && ind.actual !== null && ind.actual !== '') ? actNum.toLocaleString('en-US', {maximumFractionDigits: 2}) : '-';
            valEl.innerHTML = valStr + ' <small>' + (ind.unit || '') + '</small>';
        }
        if (footEl) footEl.textContent = (ind.criteria || '') + (ind.result ? ' | ' + ind.result : '');
        
        if (pillEl) {
            // ซ่อนป้ายคะแนนถ้าเป็นหมวดการเงิน (เพราะไม่มีคะแนนเต็ม)
            if(ind.maxScore === null || ind.maxScore === undefined || ind.maxScore === 0) {
                 pillEl.style.display = 'none';
            } else {
                 pillEl.style.display = 'inline-block';
                 pillEl.textContent = (ind.score || 0) + ' / ' + (ind.maxScore || 0) + ' คะแนน';
                 pillEl.className = 'nt-pill ' + ((ind.score || 0) >= (ind.maxScore || 1) ? 'good' : (ind.score || 0) > 0 ? 'warn' : 'bad');
            }
        }
        
        // ใส่สีให้การ์ด
        if(ind.maxScore > 0) {
            card.className = 'nt-kpi ' + ((ind.score || 0) >= (ind.maxScore || 1) ? 'c-green' : (ind.score || 0) > 0 ? 'c-amber' : 'c-red');
        } else {
            card.className = 'nt-kpi c-blue'; // สีพื้นฐานสำหรับหน้าข้อมูลการเงิน
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
