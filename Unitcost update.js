// UNIT COST DATA UPDATE — Q2/2569
// อัปเดต fallback data จาก Excel ล่าสุด
// วางใน index.html ก่อนฟังก์ชัน renderUnitCostFromData หรือโหลดเป็นไฟล์แยก

// Override fallback data ทันทีหลัง fetchUnitCostSheet ทำงาน
(function() {
    // รอให้ renderUnitCostFromData ถูกสร้างก่อน
    var origRender = null;
    var checkInterval = setInterval(function() {
        if (typeof renderUnitCostFromData === 'function' && !origRender) {
            origRender = renderUnitCostFromData;

            // Override renderUnitCostFromData
            window.renderUnitCostFromData = function(gsData) {
                // ถ้ามี gsData จาก GAS ให้ใช้ (แต่เพิ่ม Q2 data)
                // ถ้าไม่มี ใช้ Q2 fallback
                var allHospitals = [];
                var selaphum = null;

                if (gsData && gsData.length > 0) {
                    // GAS ส่งมา — ใช้เลย + เช็คว่ามี Q2 ไหม
                    origRender(gsData);
                    return;
                }

                // ── Fallback: ใช้ข้อมูล Q2/2569 จาก Excel ──
                updateUnitCostQ2();
            };
            clearInterval(checkInterval);
        }
    }, 500);

    // ถ้ารอนานเกิน 10 วิ ให้หยุด
    setTimeout(function() { clearInterval(checkInterval); }, 10000);
})();

function updateUnitCostQ2() {
    var SELAPHUM_CODE = (typeof window.SELAPHUM_CODE !== 'undefined') ? window.SELAPHUM_CODE : '11069';
    var nf = function(n) { return Number(n).toLocaleString('th-TH'); };
    var setEl = function(id, html) { var el = document.getElementById(id); if(el) el.innerHTML = html; };

    // ── Q2 Data จาก Excel ──
    var Q2 = {
        code: '11069', name: 'รพ.เสลภูมิ',
        opdCost: 1020, ipdCost: 11359,
        opdMean1SD: 1046, ipdMean1SD: 16584,
        opdTotal: 123531436.01, opdVisits: 121082,
        ipdTotal: 84279285.03, adjRW: 7419.53,
        opdEval: 1, ipdEval: 1, result: 'ผ่าน'
    };

    var Q1 = {
        code: '11069', name: 'รพ.เสลภูมิ',
        opdCost: 1038, ipdCost: 10743,
        opdMean1SD: 1010, ipdMean1SD: 16120,
        opdTotal: 59551810.74, opdVisits: 57366,
        ipdTotal: 42464368.44, adjRW: 3952.77,
        opdEval: 0, ipdEval: 1, result: 'ไม่ผ่าน'
    };

    // All hospitals Q2
    var allQ2 = [
        { code:'11078', name:'รพ.กมลาไสย', province:'กาฬสินธุ์', opdCost:897, ipdCost:12474 },
        { code:'11081', name:'รพ.ยางตลาด', province:'กาฬสินธุ์', opdCost:1039, ipdCost:12529 },
        { code:'11087', name:'รพ.สมเด็จ', province:'กาฬสินธุ์', opdCost:890, ipdCost:13797 },
        { code:'11000', name:'รพ.น้ำพอง', province:'ขอนแก่น', opdCost:665, ipdCost:11204 },
        { code:'11002', name:'รพ.บ้านไผ่', province:'ขอนแก่น', opdCost:924, ipdCost:14102 },
        { code:'11004', name:'รพ.พล', province:'ขอนแก่น', opdCost:889, ipdCost:11441 },
        { code:'11445', name:'รพร.กระนวน', province:'ขอนแก่น', opdCost:895, ipdCost:14259 },
        { code:'11052', name:'รพ.โกสุมพิสัย', province:'มหาสารคาม', opdCost:974, ipdCost:11717 },
        { code:'11055', name:'รพ.บรบือ', province:'มหาสารคาม', opdCost:925, ipdCost:15181 },
        { code:'11057', name:'รพ.พยัคฆภูมิฯ', province:'มหาสารคาม', opdCost:907, ipdCost:19540 },
        { code:'11058', name:'รพ.วาปีปทุม', province:'มหาสารคาม', opdCost:987, ipdCost:12792 },
        { code:'11061', name:'รพ.เกษตรวิสัย', province:'ร้อยเอ็ด', opdCost:797, ipdCost:14843 },
        { code:'11066', name:'รพ.โพนทอง', province:'ร้อยเอ็ด', opdCost:1020, ipdCost:11359 },
        { code:'11069', name:'รพ.เสลภูมิ', province:'ร้อยเอ็ด', opdCost:1020, ipdCost:11359 },
        { code:'11070', name:'รพ.สุวรรณภูมิ', province:'ร้อยเอ็ด', opdCost:1006, ipdCost:11065 }
    ];

    var opdMean = Q2.opdMean1SD;
    var ipdMean = Q2.ipdMean1SD;
    var opdPass = Q2.opdCost <= opdMean;
    var ipdPass = Q2.ipdCost <= ipdMean;
    var opdPctDiff = (((Q2.opdCost - opdMean) / opdMean) * 100).toFixed(1);
    var ipdPctDiff = (((Q2.ipdCost - ipdMean) / ipdMean) * 100).toFixed(1);

    // IPD rank
    var ipdSorted = allQ2.slice().sort(function(a,b) { return a.ipdCost - b.ipdCost; });
    var ipdRank = 0;
    for (var i = 0; i < ipdSorted.length; i++) {
        if (ipdSorted[i].code === '11069') { ipdRank = i + 1; break; }
    }

    // ── Update KPI Cards ──
    setEl('ucKpiOPD', nf(Q2.opdCost) + ' <small>บาท/ครั้ง</small>');
    setEl('ucKpiOPDfoot', 'Mean+1SD = ' + nf(opdMean));
    setEl('ucKpiOPDpill', opdPass ? '✓ ผ่านเกณฑ์' : '⬆ เกิน Mean');
    var opdPillEl = document.getElementById('ucKpiOPDpill');
    if (opdPillEl) opdPillEl.className = 'nt-pill ' + (opdPass ? 'good' : 'warn');
    var opdCard = opdPillEl ? opdPillEl.closest('.nt-kpi') : null;
    if (opdCard) opdCard.className = 'nt-kpi ' + (opdPass ? 'c-green' : 'c-amber');

    setEl('ucKpiIPD', nf(Q2.ipdCost) + ' <small>บาท/AdjRW</small>');
    setEl('ucKpiIPDfoot', 'Mean+1SD = ' + nf(ipdMean));
    setEl('ucKpiIPDpill', ipdRank <= 3 ? '🏆 อันดับ ' + ipdRank + '/' + allQ2.length : 'อันดับ ' + ipdRank + '/' + allQ2.length);

    setEl('ucKpiOPDresult', opdPass ? 'ผ่าน ✓' : 'ไม่ผ่าน');
    setEl('ucKpiOPDresultFoot', opdPass ? 'OPD ≤ Mean+1SD' : 'OPD > Mean+1SD');
    var opdResultPill = document.getElementById('ucKpiOPDresultPill');
    if (opdResultPill) { opdResultPill.textContent = opdPass ? 'OPD ผ่านเกณฑ์' : 'OPD ไม่ผ่าน'; opdResultPill.className = 'nt-pill ' + (opdPass ? 'good' : 'bad'); }

    setEl('ucKpiIPDresult', ipdPass ? 'ผ่าน ✓' : 'ไม่ผ่าน');
    setEl('ucKpiIPDresultFoot', ipdPass ? 'IPD ≤ Mean+1SD' : 'IPD > Mean+1SD');
    var ipdResultPill = document.getElementById('ucKpiIPDresultPill');
    if (ipdResultPill) { ipdResultPill.textContent = ipdPass ? 'IPD ผ่านเกณฑ์' : 'IPD ไม่ผ่าน'; ipdResultPill.className = 'nt-pill ' + (ipdPass ? 'good' : 'bad'); }

    // ── Update title ──
    var titles = document.querySelectorAll('#tab-unitcost .erp-section-head h3');
    if (titles.length > 0) titles[0].textContent = '🏷️ Unit Cost Dashboard • รพ.เสลภูมิ (Q2/2569 — Live Data)';

    // ── Update labels from Q1 to Q2 ──
    var lblOPD = document.getElementById('ucLblOPD');
    if (lblOPD) lblOPD.textContent = 'OPD UNIT COST Q2/2569';
    var lblIPD = document.getElementById('ucLblIPD');
    if (lblIPD) lblIPD.textContent = 'IPD UNIT COST Q2/2569';

    // ── Q1→Q2 comparison ──
    var opdChange = Q2.opdCost - Q1.opdCost;
    var ipdChange = Q2.ipdCost - Q1.ipdCost;
    var opdChangePct = ((opdChange / Q1.opdCost) * 100).toFixed(1);
    var ipdChangePct = ((ipdChange / Q1.ipdCost) * 100).toFixed(1);

    // Update insight boxes
    var insightBoxes = document.querySelectorAll('#uc-ov .nt-insight');
    insightBoxes.forEach(function(box) {
        if (box.textContent.indexOf('OPD') > -1 && box.textContent.indexOf('Mean') > -1) {
            if (opdPass && ipdPass) {
                box.className = 'premium-alert success';
                box.innerHTML = '<span class="icon">✅</span> <div><strong>ผ่านเกณฑ์ทั้ง OPD และ IPD (Q2/2569)</strong> OPD ' + nf(Q2.opdCost) + ' บาท/ครั้ง (Mean+1SD ' + nf(opdMean) + ') | IPD ' + nf(Q2.ipdCost) + ' บาท/AdjRW (Mean+1SD ' + nf(ipdMean) + ') | เทียบ Q1→Q2: OPD ' + (opdChange >= 0 ? '+' : '') + nf(opdChange) + ' (' + opdChangePct + '%), IPD ' + (ipdChange >= 0 ? '+' : '') + nf(ipdChange) + ' (' + ipdChangePct + '%)</div>';
            }
        }
    });

    // ── Update ERP Overview cards ──
    var erpOPD = document.getElementById('erpOvOPDbody');
    if (erpOPD) {
        erpOPD.innerHTML = '<div style="text-align:center;padding:8px">' +
            '<div style="font-size:28px;font-weight:800;color:' + (opdPass ? '#10b981' : '#f59e0b') + '">' + nf(Q2.opdCost) + '</div>' +
            '<div style="font-size:11px;color:#64748b">บาท/ครั้ง (Q2/2569)</div>' +
            '<div style="font-size:10px;color:#94a3b8;margin-top:4px">Mean+1SD = ' + nf(opdMean) + ' | ' + (opdPass ? '✓ ผ่าน' : '⬆ เกิน ' + opdPctDiff + '%') + '</div>' +
            '<div style="font-size:10px;color:#64748b;margin-top:2px">Q1→Q2: ' + nf(Q1.opdCost) + '→' + nf(Q2.opdCost) + ' (' + (opdChange >= 0 ? '+' : '') + opdChangePct + '%)</div>' +
        '</div>';
    }
    var erpOPDbadge = document.getElementById('erpOvOPDbadge');
    if (erpOPDbadge) { erpOPDbadge.textContent = opdPass ? '✓ ผ่านเกณฑ์' : 'เกิน Mean'; erpOPDbadge.style.color = opdPass ? '#10b981' : '#f59e0b'; erpOPDbadge.style.background = opdPass ? 'rgba(16,185,129,.1)' : 'rgba(245,158,11,.1)'; }

    var erpIPD = document.getElementById('erpOvIPDbody');
    if (erpIPD) {
        erpIPD.innerHTML = '<div style="text-align:center;padding:8px">' +
            '<div style="font-size:28px;font-weight:800;color:' + (ipdPass ? '#10b981' : '#f59e0b') + '">' + nf(Q2.ipdCost) + '</div>' +
            '<div style="font-size:11px;color:#64748b">บาท/AdjRW (Q2/2569)</div>' +
            '<div style="font-size:10px;color:#94a3b8;margin-top:4px">Mean+1SD = ' + nf(ipdMean) + ' | ' + (ipdPass ? '✓ ผ่าน' : '⬆ เกิน') + '</div>' +
            '<div style="font-size:10px;color:#64748b;margin-top:2px">Q1→Q2: ' + nf(Q1.ipdCost) + '→' + nf(Q2.ipdCost) + ' (' + (ipdChange >= 0 ? '+' : '') + ipdChangePct + '%)</div>' +
        '</div>';
    }
    var erpIPDbadge = document.getElementById('erpOvIPDbadge');
    if (erpIPDbadge) { erpIPDbadge.textContent = ipdPass ? '✓ ผ่าน' : 'เกิน Mean'; erpIPDbadge.style.color = ipdPass ? '#10b981' : '#f59e0b'; erpIPDbadge.style.background = ipdPass ? 'rgba(16,185,129,.1)' : 'rgba(245,158,11,.1)'; }

    console.log('[UnitCost] ✅ Updated to Q2/2569: OPD=' + Q2.opdCost + ' (' + (opdPass ? 'ผ่าน' : 'ไม่ผ่าน') + '), IPD=' + Q2.ipdCost + ' (' + (ipdPass ? 'ผ่าน' : 'ไม่ผ่าน') + ')');
}
