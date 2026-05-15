// ============================================================
// TPS LIVE DATA PATCH (Ultimate Dribbble UI Edition - SAFE MODE 100%)
// ล็อคข้อมูล 100% + ปลอดภัยต่อโครงสร้างเว็บ 100% (No Layout Break)
// ============================================================

// 🌟 1. ระบบเติมความสวยงามอัตโนมัติ (CSS Injection)
function injectPremiumCSS() {
    if (document.getElementById('tps-premium-style')) {
        document.getElementById('tps-premium-style').remove();
    }
    const style = document.createElement('style');
    style.id = 'tps-premium-style';
    
    // ฟังก์ชันสร้าง Prefix เพื่อป้องกัน CSS รั่วไหลไปกวนแท็บอื่น
    const S = (selector) => {
        const tabs = ['#tps-ov', '#tps-p1', '#tps-p2', '#tps-p3', '#tps-r1', '#tps-r2', '#tps-fin'];
        return tabs.map(tab => `${tab} ${selector}`).join(',\n');
    };

    style.innerHTML = `
        /* -------------------------------------------
           1. Main KPI Card
        ------------------------------------------- */
        ${S('.nt-kpi')} {
            position: relative !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: flex-start !important;
            background: #ffffff !important;
            border-radius: 20px !important; 
            border: 1px solid rgba(226, 232, 240, 0.8) !important;
            box-shadow: 0 4px 20px -10px rgba(15, 23, 42, 0.05) !important; 
            padding: 20px 24px 16px 20px !important; 
            min-height: 140px !important; 
            overflow: hidden !important;
            transition: all 0.3s ease !important;
            z-index: 1 !important;
        }

        ${S('.nt-kpi.c-green')}, ${S('.nt-kpi.c-red')}, ${S('.nt-kpi.c-amber')}, ${S('.nt-kpi.c-blue')} {
            border-top-color: rgba(226, 232, 240, 0.8) !important;
            border-top-width: 1px !important;
        }

        ${S('.nt-kpi:hover')} {
            transform: translateY(-4px) !important;
            box-shadow: 0 16px 32px -12px rgba(15, 23, 42, 0.1) !important;
            border-color: rgba(203, 213, 225, 0.8) !important;
        }

        /* -------------------------------------------
           2. Typography
        ------------------------------------------- */
        ${S('.nt-lbl')} {
            color: #475569 !important;
            font-weight: 600 !important;
            font-size: 0.85rem !important; 
            line-height: 1.5 !important;
            max-width: calc(100% - 50px) !important; 
            display: -webkit-box !important;
            -webkit-line-clamp: 2 !important; 
            -webkit-box-orient: vertical !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            margin-bottom: 8px !important; 
            min-height: 2.5em !important; 
        }
        
        ${S('.nt-lbl-code')} {
            color: #94a3b8 !important;
            font-weight: 500 !important;
            font-size: 0.75rem !important; 
            display: block !important;
            margin-bottom: 2px !important;
            letter-spacing: 0.02em !important;
        }

        ${S('.nt-val')} {
            font-weight: 800 !important;
            font-size: 1.8rem !important; 
            color: #0f172a !important;
            letter-spacing: -0.04em !important; 
            margin: 0 0 12px 0 !important; 
            display: flex !important;
            align-items: baseline !important;
            flex-wrap: wrap !important;
            gap: 6px !important;
            line-height: 1 !important;
        }
        ${S('.nt-val small')} {
            font-weight: 600 !important;
            font-size: 0.9rem !important; 
            color: #64748b !important;
        }

        /* -------------------------------------------
           3. Badges & Footer
        ------------------------------------------- */
        ${S('.nt-pill')} {
            position: absolute !important;
            top: 24px !important;
            right: 24px !important;
            padding: 4px 8px !important;
            border-radius: 6px !important;
            font-size: 0.75rem !important;
            font-weight: 700 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 2px !important;
        }
        ${S('.nt-pill.good')} { background: #ecfdf5 !important; color: #059669 !important; }
        ${S('.nt-pill.warn')} { background: #fffbeb !important; color: #d97706 !important; }
        ${S('.nt-pill.bad')}  { background: #fef2f2 !important; color: #dc2626 !important; }

        ${S('.nt-foot')} {
            margin-top: auto !important; 
            color: #94a3b8 !important;
            font-size: 0.8rem !important;
            font-weight: 500 !important;
            display: flex !important;
            align-items: center !important;
            gap: 6px !important;
        }
        
        ${S('.nt-foot::before')} {
            content: '' !important;
            display: inline-block !important;
            width: 6px !important;
            height: 6px !important;
            border-radius: 50% !important;
        }
        ${S('.nt-kpi.c-green .nt-foot::before')} { background-color: #10b981 !important; }
        ${S('.nt-kpi.c-amber .nt-foot::before')} { background-color: #f59e0b !important; }
        ${S('.nt-kpi.c-red .nt-foot::before')} { background-color: #ef4444 !important; }
        ${S('.nt-kpi.c-blue .nt-foot::before')} { display: none !important; }

        /* -------------------------------------------
           4. Progress Bars 
        ------------------------------------------- */
        ${S('.erp-card-body .progress-bg')} {
            background: #f1f5f9 !important;
            border-radius: 999px !important;
            overflow: hidden !important;
        }
        ${S('.erp-card-body .nt-score-fill')} {
            border-radius: 999px !important;
            transition: width 1.5s ease-out !important;
        }

        /* -------------------------------------------
           5. 1.3 (P3) Layout - บน 5 ล่าง 4
        ------------------------------------------- */
        @media (min-width: 1025px) {
            #tps-p3 .nt-kpi-row {
                display: grid !important;
                grid-template-columns: repeat(5, 1fr) !important; 
                gap: 12px !important; 
            }
            #tps-p3 .nt-kpi {
                padding: 14px 12px !important; 
                min-height: 110px !important;
            }
            #tps-p3 .nt-val {
                font-size: 1.35rem !important; 
                margin-bottom: 4px !important;
            }
            #tps-p3 .nt-lbl {
                font-size: 0.75rem !important;
                max-width: calc(100% - 35px) !important;
            }
            #tps-p3 .nt-pill {
                top: 12px !important;
                right: 12px !important;
                font-size: 0.65rem !important;
            }
        }

        /* -------------------------------------------
           6. Premium Alert Banners
        ------------------------------------------- */
        ${S('.premium-alert')} {
            display: flex !important;
            align-items: center !important;
            gap: 16px !important;
            padding: 16px 24px !important;
            border-radius: 16px !important;
            margin-bottom: 24px !important;
            font-size: 0.95rem !important;
            font-weight: 500 !important;
            box-shadow: 0 4px 20px rgba(0,0,0,0.04) !important;
            border: 1px solid transparent !important;
            width: 100% !important;
            animation: slideInPremium 0.4s ease-out forwards !important;
        }
        @keyframes slideInPremium {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
        }
        ${S('.premium-alert .icon')} {
            font-size: 1.4rem !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
        }
        ${S('.premium-alert.danger')} { background: #fff1f2 !important; color: #9f1239 !important; border-color: #fecdd3 !important; }
        ${S('.premium-alert.warn')} { background: #fffbeb !important; color: #92400e !important; border-color: #fde68a !important; }
        ${S('.premium-alert.success')} { background: #f0fdf4 !important; color: #166534 !important; border-color: #bbf7d0 !important; }
    `;
    document.head.appendChild(style);
}
injectPremiumCSS();

// ============================================================
// ตัวแปรและฟังก์ชันดึงข้อมูล (ปลอดภัย 100%)
// ============================================================
var tpsLiveData = null;

function safeParse(val) {
    if(val === null || val === undefined || val === '') return null;
    const clean = String(val).replace(/,/g, '').trim();
    const n = parseFloat(clean);
    return isNaN(n) ? null : n;
}

function parseMean(item, fallback) {
    if(!item || !item.criteria) return fallback;
    const cleanStr = String(item.criteria).replace(/,/g, '');
    const m = cleanStr.match(/(\d+(\.\d+)?)/);
    return m ? parseFloat(m[1]) : fallback;
}

// ============================================================
// 1. LOAD TPS FROM GAS WEB APP
// ============================================================
async function loadTPSFromGAS() {
    if (typeof TPS__WEB_APP_URL === 'undefined' || !TPS__WEB_APP_URL) {
        console.warn('⚠ ไม่พบลิงก์ TPS__WEB_APP_URL');
        return;
    }
    try {
        const resp = await fetch(TPS__WEB_APP_URL + '?action=tps', { redirect: 'follow' });
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        const json = await resp.json();

        if (json && json.indicators && json.indicators.length > 0) {
            tpsLiveData = json;
            applyTPSLiveData(json);
        }
    } catch (e) {
        console.error('❌ TPS โหลดล้มเหลว:', e);
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

    const catMap = buildCategoryMap(indicators);
    if(typeof updateScoreBars === 'function') updateScoreBars(catMap, totalScore, totalMax, gi.color);
    if(typeof updateTPSKpiCards === 'function') updateTPSKpiCards(catMap);
    if(typeof updateGradeTable === 'function') updateGradeTable(totalScore, grade);
    if(typeof renderTPSChartsFromData === 'function') renderTPSChartsFromData(catMap, totalScore, totalMax);
    if(typeof updateERPOverviewTPS === 'function') updateERPOverviewTPS(totalScore, totalMax, grade, gi, catMap);
    
    updateTPSSubTabs(catMap, indicators);
    renderTPSSubCharts(catMap, indicators);
}

// ============================================================
// 3. HELPER: จัดกลุ่ม indicators
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
        if (c.startsWith('2.1') || n.includes('กำไร') || n.includes('margin') || n.includes('roa') || n.includes('ebitda')) targetCat = cats.profit; 
        else if (c.startsWith('1.1') || n.includes('planfin') || n.includes('แผน')) targetCat = cats.planfin;
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
        let sumScore = 0; let sumMax = 0;
        validItems.forEach(ind => { sumScore += Number(ind.score) || 0; sumMax += Number(ind.maxScore) || 0; });
        cat.score = sumScore; cat.maxScore = sumMax; cat.items = validItems;
    });

    return cats;
}

// ============================================================
// 7. ✅ อัปเดตข้อมูลแท็บย่อย 
// ============================================================
function updateTPSSubTabs(catMap, indicators) {
    updateSubTabKPIs('tps-p1', catMap.planfin.items);
    updateSubTabKPIs('tps-p2', catMap.asset.items);

    const p3Items = indicators.filter(i => {
        const code = String(i.code || '').trim();
        const name = String(i.name || '').trim();
        if (code === '1.3.1' || name.includes('การบริหารต้นทุนและค่าใช้')) return false;
        if (code === '1.3.3' || name.includes('ผลผลิต (PRODUCTIVITY)')) return false;
        return code.startsWith('1.3.1') || code.startsWith('1.3.2') || code.startsWith('1.3.3') ||
               name.startsWith('1.3.1') || name.startsWith('1.3.2') || name.startsWith('1.3.3');
    });
    updateSubTabKPIs('tps-p3', p3Items);

    const r1Valid = catMap.profit.items;
    updateSubTabKPIs('tps-r1', r1Valid);

    const r2Valid = catMap.liquidity.items;
    updateSubTabKPIs('tps-r2', r2Valid);

    const finItems = indicators.filter(i => {
        const n = String(i.name).toLowerCase();
        return n.includes('ebitda') || n.includes('nwc') || n.includes('ทุนสำรอง') || n.includes('ni') || n.includes('รายได้สูง (ต่ำ)');
    });
    const uniqueFinItems = []; const finNames = new Set();
    for(const item of finItems) {
        if(!finNames.has(item.name)) { finNames.add(item.name); uniqueFinItems.push(item); }
    }
    updateSubTabKPIs('tps-fin', uniqueFinItems);

    // อัปเดต Alert
    upgradeAllAlertBanners(catMap, indicators);
}

// ============================================================
// 8. ✅ วาดกราฟแท็บย่อย (ปลอดภัย 100% ไม่ทำลาย Layout หลัก)
// ============================================================
function renderTPSSubCharts(catMap, indicators) {
    const commonPlugins = {
        legend: { position: 'bottom', labels: { usePointStyle: true, padding: 15 } },
        tooltip: { mode: 'index', intersect: false, backgroundColor: 'rgba(15, 23, 42, 0.9)', titleFont: {size: 13}, bodyFont: {size: 13}, padding: 12, cornerRadius: 10 },
        datalabels: { anchor: 'end', align: 'end', color: '#334155', font: { weight: 'bold', size: 11 }, formatter: (v) => v.toLocaleString('en-US', {maximumFractionDigits: 1}) }
    };

    // ----------------------------------------------------
    // P1 (บริหารแผน)
    // ----------------------------------------------------
    if (catMap.planfin.items.length >= 2 && typeof Chart !== 'undefined' && document.getElementById('tps_p1bar')) {
        const revPct = Number(catMap.planfin.items[0].actual) || 0;
        const expPct = Number(catMap.planfin.items[1].actual) || 0;
        if(typeof destroyChart === 'function') destroyChart('tps_p1bar');
        new Chart(document.getElementById('tps_p1bar'), {
            type: 'bar',
            data: {
                labels: ['มิติรายได้', 'มิติค่าใช้จ่าย'],
                datasets: [
                    { label: 'ค่าจริง (%)', data: [revPct, expPct], backgroundColor: 'rgba(16,185,129,0.85)', borderRadius: 6, maxBarThickness: 50 },
                    { label: 'เกณฑ์ +5%', data: [5, 5], type: 'line', borderColor: 'rgba(245,158,11,0.8)', borderDash: [6, 4] },
                    { label: 'เกณฑ์ -5%', data: [-5, -5], type: 'line', borderColor: 'rgba(245,158,11,0.5)', borderDash: [6, 4] }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: commonPlugins }
        });
    }

    // ----------------------------------------------------
    // P2 (บริหารสินทรัพย์)
    // ----------------------------------------------------
    const p2Items = catMap.asset.items;
    if (p2Items.length > 0 && document.getElementById('tps_p2bar')) {
        const origP2Canvas = document.getElementById('tps_p2bar');
        origP2Canvas.style.display = 'none'; 
        let parentBody = origP2Canvas.closest('.erp-card-body');
        
        // 🔥 ปลดล็อคความสูงอย่างปลอดภัย เฉพาะ Body นี้เท่านั้น! ไม่ทะลุไปถึงกล่องแม่
        if (parentBody) {
            parentBody.style.height = 'auto';
            parentBody.style.overflow = 'visible';
            parentBody.style.minHeight = '400px';
        }

        let oldCustomP2 = document.getElementById('custom_p2_container');
        if (oldCustomP2) oldCustomP2.remove();
        
        let customContainerP2 = document.createElement('div');
        customContainerP2.id = 'custom_p2_container';
        customContainerP2.style.display = 'grid';
        customContainerP2.style.gridTemplateColumns = 'repeat(auto-fit, minmax(280px, 1fr))';
        customContainerP2.style.gap = '20px';
        customContainerP2.style.paddingTop = '15px';
        origP2Canvas.parentElement.appendChild(customContainerP2);

        if(typeof destroyChart === 'function') destroyChart('tps_p2bar');

        p2Items.forEach((ind, index) => {
            let name = String(ind.name || ind.code);
            let title = name; let nameUpper = name.toUpperCase();
            if(name.startsWith('1.2.1') || name.includes('เจ้าหนี้')) title = 'ระยะเวลาชำระเจ้าหนี้การค้า';
            else if(name.startsWith('1.2.2') || nameUpper.includes('UC') || name.includes('บัตรทอง')) title = 'ระยะเรียกเก็บหนี้สิทธิ UC';
            else if(name.startsWith('1.2.3') || name.includes('ขรก') || name.includes('ข้าราชการ')) title = 'ระยะเรียกเก็บหนี้สิทธิ OFC';
            else if(name.startsWith('1.2.4') || name.includes('คงคลัง') || name.includes('สินค้า')) title = 'การบริหารสินคงคลัง';

            let val = safeParse(ind.actual) || 0;
            let limit = 60;
            if (title.includes('เจ้าหนี้')) limit = 180;

            const wrapper = document.createElement('div');
            wrapper.style.height = '140px'; 
            wrapper.style.position = 'relative';
            const canvasId = 'p2_chart_' + index;
            wrapper.innerHTML = `<canvas id="${canvasId}"></canvas>`;
            customContainerP2.appendChild(wrapper);

            const valColor = val <= limit ? 'rgba(16, 185, 129, 0.9)' : 'rgba(244, 63, 94, 0.9)'; 

            if (typeof Chart !== 'undefined') {
                new Chart(document.getElementById(canvasId), {
                    type: 'bar',
                    data: {
                        labels: [title],
                        datasets: [
                            { label: 'รพ.เสลภูมิ (วัน)', data: [val], backgroundColor: valColor, borderRadius: 100, borderSkipped: false, maxBarThickness: 32 },
                            { label: 'เกณฑ์สูงสุด (วัน)', data: [limit], backgroundColor: 'rgba(245, 158, 11, 0.18)', borderRadius: 100, borderSkipped: false, maxBarThickness: 32 }
                        ]
                    },
                    options: {
                        responsive: true, maintainAspectRatio: false, indexAxis: 'y', 
                        plugins: { legend: { display: false }, datalabels: { anchor: 'end', align: 'end', offset: 8, font: { weight: '800', size: 14 } } },
                        scales: { x: { display: true, beginAtZero: true }, y: { grid: { display: false }, ticks: { font: { weight: '700' } } } },
                        layout: { padding: { right: 50, left: 10 } }
                    }
                });
            }
        });
    }

    // ----------------------------------------------------
    // P3 (ต้นทุน / การจัดการ)
    // ----------------------------------------------------
    const p3Items = indicators.filter(i => String(i.code || '').startsWith('1.3'));
    const opdItem = p3Items.find(i => String(i.name).toUpperCase().includes('OPD'));
    const ipdItem = p3Items.find(i => String(i.name).toUpperCase().includes('IPD') && !String(i.name).includes('ครองเตียง'));
    
    if (document.getElementById('tps_p3unit')) {
        let p3unitCanvas = document.getElementById('tps_p3unit');
        let origMcCanvas = document.getElementById('tps_p3mc');
        
        // 🔥 เปลี่ยนความกว้างอย่างปลอดภัยโดยใช้ Bootstrap Class ไม่ทะลุเลย์เอาต์!
        if (p3unitCanvas && origMcCanvas) {
            let leftCol = p3unitCanvas.closest('[class*="col-"]');
            let rightCol = origMcCanvas.closest('[class*="col-"]');
            if (leftCol && rightCol) {
                leftCol.className = 'col-lg-4 col-md-12 mb-3'; // สัดส่วนประมาณ 33%
                rightCol.className = 'col-lg-8 col-md-12 mb-3'; // สัดส่วนประมาณ 66%
            }
        }

        let p3UnitBody = p3unitCanvas.closest('.erp-card-body');
        if (p3UnitBody) p3UnitBody.style.height = 'auto';
        p3unitCanvas.parentElement.style.height = '320px';

        if(typeof destroyChart === 'function') destroyChart('tps_p3unit');
        new Chart(p3unitCanvas, {
            type: 'bar',
            data: {
                labels: [['OPD', '(บาท/ครั้ง)'], ['IPD', '(บาท/AdjRW)']], 
                datasets: [
                    { label: 'รพ.เสลภูมิ', data: [safeParse(opdItem?.actual)||0, safeParse(ipdItem?.actual)||0], backgroundColor: 'rgba(16,185,129,0.85)', borderRadius: 12, maxBarThickness: 60 },
                    { label: 'ค่ากลาง', data: [1010.51, 16120], backgroundColor: 'rgba(245,158,11,0.18)', borderRadius: 12, maxBarThickness: 60 }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { datalabels: { anchor: 'end', align: 'top', offset: 8 } }, layout: { padding: { top: 35 } } }
        });
    }

    if (document.getElementById('tps_p3mc')) {
        let origMcCanvas = document.getElementById('tps_p3mc');
        origMcCanvas.style.display = 'none'; 
        let parentMc = origMcCanvas.parentElement;

        let p3McBody = parentMc.closest('.erp-card-body');
        if (p3McBody) { p3McBody.style.height = 'auto'; p3McBody.style.overflow = 'visible'; }

        let oldCustom = document.getElementById('custom_mc_container');
        if (oldCustom) oldCustom.remove();
        
        let customContainer = document.createElement('div');
        customContainer.id = 'custom_mc_container';
        customContainer.style.display = 'grid';
        customContainer.style.gridTemplateColumns = 'repeat(2, 1fr)';
        customContainer.style.gap = '20px';
        parentMc.appendChild(customContainer);

        const createBar = (id, title, val, mean) => {
            const wrapper = document.createElement('div');
            wrapper.style.height = '145px'; wrapper.style.position = 'relative';
            wrapper.innerHTML = `<canvas id="p3mc_chart_${id}"></canvas>`;
            customContainer.appendChild(wrapper);

            if (typeof Chart !== 'undefined') {
                new Chart(wrapper.querySelector('canvas'), {
                    type: 'bar',
                    data: {
                        labels: [title],
                        datasets: [
                            { label: 'รพ.เสลภูมิ (%)', data: [val], backgroundColor: val <= mean ? 'rgba(16,185,129,0.9)' : 'rgba(244,63,94,0.9)', borderRadius: 100, maxBarThickness: 32 },
                            { label: 'ค่ากลาง (%)', data: [mean], backgroundColor: 'rgba(245,158,11,0.18)', borderRadius: 100, maxBarThickness: 32 }
                        ]
                    },
                    options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false }, datalabels: { anchor: 'end', align: 'end', offset: 8 } }, layout: { padding: { right: 50, left: 10 } }, scales: { y: { grid: { display: false } } } }
                });
            }
        };

        const lcItem = p3Items.find(i => String(i.name).includes('แรงงาน') || String(i.code).includes('1.3.1.3'));
        const mcDrugItem = p3Items.find(i => String(i.name).includes('ค่ายา') || String(i.code).includes('1.3.1.4'));
        const mcSciItem = p3Items.find(i => String(i.name).includes('วิทยาศาสตร์'));
        const mcMedItem = p3Items.find(i => String(i.name).includes('มิใช่ยา') || String(i.name).includes('วัสดุการแพทย์') && !String(i.name).includes('วิทยาศาสตร์'));

        createBar('1', 'LC ค่าแรงบุคลากร', safeParse(lcItem?.actual)||0, parseMean(lcItem, 49.09));
        createBar('2', 'MC ค่ายา', safeParse(mcDrugItem?.actual)||0, parseMean(mcDrugItem, 10.71));
        createBar('3', 'MC ค่าวัสดุวิทย์ฯ', safeParse(mcSciItem?.actual)||0, parseMean(mcSciItem, 3.37));
        createBar('4', 'MC ค่าเวชภัณฑ์ฯ', safeParse(mcMedItem?.actual)||0, parseMean(mcMedItem, 5.17));
    }

    // ----------------------------------------------------
    // 🔥 R2 (สภาพคล่อง) - จัดเรียงแถวเดียวกันแบบปลอดภัยสุดๆ
    // ----------------------------------------------------
    const cashItem = catMap.liquidity.items.find(i => String(i.name).toLowerCase().includes('cash'));
    const cashVal = cashItem ? safeParse(cashItem.actual) : 0;
    
    if (typeof Chart !== 'undefined' && document.getElementById('tps_r2bar')) {
        let r2Canvas = document.getElementById('tps_r2bar');
        let r2Panel = document.getElementById('tps-r2');
        
        if (r2Canvas && r2Panel && !document.getElementById('r2_safe_row')) {
            // ดึง Node ที่เราต้องการ
            let kpiRow = r2Panel.querySelector('.nt-kpi-row');
            let chartCard = r2Canvas.closest('.erp-card');
            
            // สร้าง Bootstrap Row แบบมาตรฐาน
            let row = document.createElement('div');
            row.id = 'r2_safe_row';
            row.className = 'row align-items-stretch mb-4';
            
            let colLeft = document.createElement('div');
            colLeft.className = 'col-lg-6 col-md-12 mb-3';
            if (kpiRow) {
                kpiRow.style.display = 'grid';
                kpiRow.style.gridTemplateColumns = '1fr 1fr'; // เรียง 2 กล่อง
                kpiRow.style.gap = '16px';
                colLeft.appendChild(kpiRow);
            }
            
            let colRight = document.createElement('div');
            colRight.className = 'col-lg-6 col-md-12 mb-3';
            if (chartCard) {
                chartCard.style.height = '100%';
                chartCard.style.margin = '0';
                colRight.appendChild(chartCard);
            }
            
            row.appendChild(colLeft);
            row.appendChild(colRight);
            r2Panel.insertBefore(row, r2Panel.firstChild);
            
            // ปรับขนาดกราฟ
            r2Canvas.parentElement.style.height = '180px';
        }

        if(typeof destroyChart === 'function') destroyChart('tps_r2bar');
        new Chart(document.getElementById('tps_r2bar'), {
            type: 'bar',
            data: {
                labels: ['Cash Ratio'],
                datasets: [
                    { label: 'ค่า', data: [cashVal], backgroundColor: cashVal >= 0.8 ? 'rgba(16,185,129,0.85)' : 'rgba(244,63,94,0.85)', borderRadius: 100, maxBarThickness: 32 },
                    { label: 'เกณฑ์ขั้นต่ำ', data: [0.80], type: 'line', borderColor: '#f59e0b', borderDash: [5,4] }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false }, datalabels: { anchor: 'end', align: 'end', offset: 12 } }, scales: { y: { grid: { display: false } } }, layout: { padding: { right: 60 } } }
        });
    }
}

// ============================================================
// 9. ฟังก์ชันเสริมวาดการ์ด KPI 
// ============================================================
function updateSubTabKPIs(panelId, items) {
    const panel = document.getElementById(panelId);
    if (!panel) return;
    const kpiRow = panel.querySelector('.nt-kpi-row');
    if (!kpiRow || !items || items.length === 0) return;

    let cards = kpiRow.querySelectorAll('.nt-kpi');
    if (items.length > cards.length && cards.length > 0) {
        const template = cards[0].cloneNode(true);
        for (let i = cards.length; i < items.length; i++) kpiRow.appendChild(template.cloneNode(true));
        cards = kpiRow.querySelectorAll('.nt-kpi'); 
    }

    if (panelId !== 'tps-p3' && panelId !== 'tps-r2') {
        kpiRow.style.display = 'grid';
        kpiRow.style.gridTemplateColumns = 'repeat(auto-fit, minmax(280px, 1fr))';
        kpiRow.style.gap = '24px'; 
    }

    cards.forEach((card, i) => {
        if (i >= items.length) { card.style.display = 'none'; return; }
        card.style.display = 'flex'; card.style.margin = '0'; 

        const ind = items[i];
        const lblEl = card.querySelector('.nt-lbl');
        const valEl = card.querySelector('.nt-val');
        const footEl = card.querySelector('.nt-foot');
        const pillEl = card.querySelector('.nt-pill');

        if (lblEl) {
            let rawName = ind.name || ind.code || '';
            if (panelId === 'tps-p2') {
                if (rawName.startsWith('1.2.1')) rawName = rawName.replace(/^([\d\.]+\s).*/, '$1ระยะเวลาชำระเจ้าหนี้การค้า');
                else if (rawName.startsWith('1.2.2')) rawName = rawName.replace(/^([\d\.]+\s).*/, '$1ระยะเรียกเก็บหนี้สิทธิ UC');
                else if (rawName.startsWith('1.2.3')) rawName = rawName.replace(/^([\d\.]+\s).*/, '$1ระยะเรียกเก็บหนี้สิทธิ OFC');
                else if (rawName.startsWith('1.2.4')) rawName = rawName.replace(/^([\d\.]+\s).*/, '$1การบริหารสินคงคลัง');
            }
            lblEl.innerHTML = rawName.replace(/^([\d\.]+\s)/, '<span class="nt-lbl-code">$1</span>');
        }
        
        if (valEl) {
            const actNum = safeParse(ind.actual);
            valEl.innerHTML = (actNum !== null ? actNum.toLocaleString('en-US', {maximumFractionDigits: 2}) : '-') + ' <small>' + (ind.unit || '') + '</small>';
        }
        if (footEl) footEl.textContent = (ind.criteria || '') + (ind.result ? ' | ' + ind.result : '');
        
        if (pillEl) {
            if(!ind.maxScore) { pillEl.style.display = 'none'; } 
            else {
                 pillEl.style.display = 'flex'; 
                 pillEl.innerHTML = `<span>${ind.score || 0}</span><span style="opacity:0.4; margin:0 2px;">/</span><span style="opacity:0.6;">${ind.maxScore}</span>`;
                 pillEl.className = 'nt-pill ' + ((ind.score || 0) >= ind.maxScore ? 'good' : (ind.score || 0) > 0 ? 'warn' : 'bad');
            }
        }
        card.className = 'nt-kpi ' + (!ind.maxScore ? 'c-blue' : ((ind.score || 0) >= ind.maxScore ? 'c-green' : (ind.score || 0) > 0 ? 'c-amber' : 'c-red'));
    });
}

// ============================================================
// 🔥 10. ฟังก์ชันสแกนและซ่อมแซมกล่องแจ้งเตือน (แม่นยำ 100%)
// ============================================================
function applyAggressiveAlert(panelId, alertHtml, typeClass) {
    let counts = 0;
    let interval = setInterval(() => {
        counts++; if(counts > 10) clearInterval(interval);
        const panel = document.getElementById(panelId);
        if (!panel) return;

        const oldAlerts = panel.querySelectorAll('.alert:not(.premium-alert)');
        oldAlerts.forEach(a => { a.style.display = 'none'; a.style.opacity = '0'; a.style.position = 'absolute'; });

        let pAlert = panel.querySelector('.premium-alert');
        if (!pAlert) {
            pAlert = document.createElement('div');
            let kpiRow = panel.querySelector('.nt-kpi-row') || panel.querySelector('.row');
            if (kpiRow && kpiRow.parentNode) kpiRow.parentNode.insertBefore(pAlert, kpiRow);
            else panel.prepend(pAlert);
        }
        pAlert.className = 'premium-alert ' + typeClass;
        pAlert.innerHTML = alertHtml;
    }, 300);
}

function upgradeAllAlertBanners(catMap, indicators) {
    let p1Cat = catMap.planfin;
    if (p1Cat && p1Cat.items && p1Cat.items.length >= 2) {
        let s = p1Cat.score || 0; let ms = p1Cat.maxScore || 0;
        let v1 = safeParse(p1Cat.items[0].actual); let v2 = safeParse(p1Cat.items[1].actual);
        let s1 = v1 !== null ? v1.toLocaleString('en-US') : '-'; let s2 = v2 !== null ? v2.toLocaleString('en-US') : '-';
        if (s >= ms && ms > 0) applyAggressiveAlert('tps-p1', '<span class="icon">✅</span> <div><strong>ผ่านเต็ม ' + s + '/' + ms + ' คะแนน:</strong> มิติรายได้ ' + s1 + '% และมิติค่าใช้จ่าย ' + s2 + '% อยู่ในเกณฑ์ ±5% ทั้งคู่</div>', 'success');
        else applyAggressiveAlert('tps-p1', '<span class="icon">🚨</span> <div><strong>ไม่ผ่านเกณฑ์ (' + s + '/' + ms + ' คะแนน):</strong> มิติรายได้ ' + s1 + '% และมิติค่าใช้จ่าย ' + s2 + '% (เกณฑ์ ±5%)</div>', 'danger');
    }

    let p2Cat = catMap.asset;
    if (p2Cat && p2Cat.items && p2Cat.items.length > 0) {
        let s = p2Cat.score || 0; let ms = p2Cat.maxScore || 0;
        if (s >= ms && ms > 0) applyAggressiveAlert('tps-p2', '<span class="icon">✨</span> <div><strong>ยอดเยี่ยม!</strong> ผ่านเกณฑ์การบริหารสินทรัพย์ทุกตัวชี้วัด (' + s + '/' + ms + ' คะแนน)</div>', 'success');
        else {
            let worstName = ''; let worstVal = 0; let worstDiff = -9999;
            p2Cat.items.forEach(ind => {
                let title = String(ind.name || ind.code); let tName = title;
                if(title.startsWith('1.2.1')) tName = 'ระยะเวลาชำระเจ้าหนี้การค้า';
                else if(title.startsWith('1.2.2')) tName = 'ระยะเรียกเก็บหนี้สิทธิ UC';
                else if(title.startsWith('1.2.3')) tName = 'ระยะเรียกเก็บหนี้สิทธิ OFC';
                else if(title.startsWith('1.2.4')) tName = 'การบริหารสินคงคลัง';
                
                let val = safeParse(ind.actual);
                if (val !== null) {
                    let limit = title.includes('เจ้าหนี้') ? 180 : 60;
                    if (val > limit && (val - limit) > worstDiff) { worstDiff = val - limit; worstName = tName; worstVal = val; }
                }
            });
            applyAggressiveAlert('tps-p2', '<span class="icon">⚠</span> <div><strong>ไม่ผ่าน ' + s + '/' + ms + ' คะแนน:</strong> ' + worstName + ' ' + worstVal + ' วัน เกินเกณฑ์มากที่สุด</div>', 'danger');
        }
    }

    let p3Cat = catMap.cost;
    if (p3Cat) {
        let s = p3Cat.score || 0; let ms = p3Cat.maxScore || 0;
        if (ms > 0) {
            if (s >= ms) applyAggressiveAlert('tps-p3', '<span class="icon">✨</span> <div><strong>ยอดเยี่ยม!</strong> ผ่านเกณฑ์การบริหารจัดการ (' + s + '/' + ms + ' คะแนน)</div>', 'success');
            else applyAggressiveAlert('tps-p3', '<span class="icon">⚠</span> <div><strong>แจ้งเตือน:</strong> มีตัวชี้วัดที่ต้องปรับปรุงในหมวดการบริหารจัดการ (' + s + '/' + ms + ' คะแนน)</div>', 'warn');
        }
    }

    if (catMap.profit) {
        let s = catMap.profit.score || 0; let ms = catMap.profit.maxScore || 0;
        if (ms > 0) {
            if (s >= ms) applyAggressiveAlert('tps-r1', '<span class="icon">✨</span> <div><strong>ยอดเยี่ยม!</strong> ผ่านเกณฑ์ความสามารถในการทำกำไร (' + s + '/' + ms + ' คะแนน)</div>', 'success');
            else applyAggressiveAlert('tps-r1', '<span class="icon">⚠</span> <div><strong>แจ้งเตือน:</strong> ความสามารถในการทำกำไรต่ำกว่าเกณฑ์ (' + s + '/' + ms + ' คะแนน)</div>', 'warn');
        }
    }

    if (catMap.liquidity) {
        let s = catMap.liquidity.score || 0; let ms = catMap.liquidity.maxScore || 0;
        if (ms > 0) {
            if (s >= ms) applyAggressiveAlert('tps-r2', '<span class="icon">✨</span> <div><strong>ยอดเยี่ยม!</strong> สภาพคล่องอยู่ในเกณฑ์ปลอดภัย (' + s + '/' + ms + ' คะแนน)</div>', 'success');
            else applyAggressiveAlert('tps-r2', '<span class="icon">🚨</span> <div><strong>แจ้งเตือน:</strong> สภาพคล่องทางการเงินต่ำ ควรเฝ้าระวัง (' + s + '/' + ms + ' คะแนน)</div>', 'danger');
        }
    }

    let ebitdaVal = 0, niVal = 0, nwcVal = 0, netMaintVal = 0, cashRatioVal = 0;
    let ebitdaFound = false, niFound = false, nwcFound = false, netMaintFound = false, cashRatioFound = false;

    indicators.forEach(ind => {
        let n = String(ind.name).toLowerCase(); let val = safeParse(ind.actual);
        if (val === null) return;
        if (n.includes('ebitda')) { ebitdaVal = val; ebitdaFound = true; }
        else if (n === 'ni' || n.includes('รายได้สูง (ต่ำ)')) { niVal = val; niFound = true; }
        else if (n.includes('nwc') || n.includes('ทุนสำรอง')) { nwcVal = val; nwcFound = true; }
        else if (n.includes('เงินบำรุง')) { netMaintVal = val; netMaintFound = true; }
        else if (n.includes('cash ratio') || n.includes('สภาพคล่อง')) { cashRatioVal = val; cashRatioFound = true; }
    });

    const formatM = (v) => {
        let formatted = Math.abs(v) > 10000 ? (v / 1000000).toFixed(2) : v.toFixed(2);
        return (v > 0 ? '+' + formatted : formatted) + ' M';
    };

    let ebitdaStr = ebitdaFound ? formatM(ebitdaVal) : '-'; let niStr = niFound ? formatM(niVal) : '-';
    let nwcStr = nwcFound ? formatM(nwcVal) : '-'; let cashRatioStr = cashRatioFound ? cashRatioVal.toFixed(2) : '-';
    let niSign = niVal >= 0 ? 'เป็นบวก' : 'ติดลบ'; let statusText = (cashRatioVal >= 0.8) ? 'สภาพคล่องดี' : 'สภาพคล่องตึงตัว';
    let alertClass = (cashRatioVal >= 0.8 && ebitdaVal > 0) ? 'success' : 'warn';
    if (cashRatioVal < 0.5 || ebitdaVal < 0) alertClass = 'danger';
    
    let icon = alertClass === 'success' ? '📊' : alertClass === 'danger' ? '🚨' : '⚠️';
    let msg = '<span class="icon">' + icon + '</span> <div><strong>สรุปฐานะการเงินปัจจุบัน:</strong> EBITDA <b>' + ebitdaStr + '</b>, NI <b>' + niStr + '</b> ' + niSign + ' NWC <b>' + nwcStr + '</b>';
    if (netMaintFound) msg += ' แต่เงินบำรุงสุทธิ <b>' + formatM(netMaintVal) + '</b>';
    msg += ' และ Cash Ratio <b>' + cashRatioStr + '</b> ' + statusText + '</div>';

    applyAggressiveAlert('tps-fin', msg, alertClass);
}

function updateERPOverviewTPS() {}
function renderTPSChartsHardcoded() { console.log("ใช้ข้อมูล Hardcode สำรองเนื่องจากโหลด Live Data ไม่สำเร็จ"); }
function renderTPSCharts() { loadTPSFromGAS(); }
