// RISK SCORE LIVE DATA PATCH v2
// อัปเดต fallback 7 เดือน (ต.ค.68-เม.ย.69) + รายปี (2562-2569)

var riskLiveData = null;

var RISK_FALLBACK = {
    monthly: [
        { month:'ต.ค.68', currentRatio:1.20, quickRatio:0.95, cashRatio:0.46, nwc:19.28, niDep:22.66, ebitda:20.92, netCash:-51.40, riskScore:3 },
        { month:'พ.ย.68', currentRatio:1.19, quickRatio:0.90, cashRatio:0.27, nwc:16.05, niDep:18.53, ebitda:20.09, netCash:-63.10, riskScore:3 },
        { month:'ธ.ค.68', currentRatio:1.09, quickRatio:0.81, cashRatio:0.26, nwc:7.53,  niDep:13.49, ebitda:14.08, netCash:-62.83, riskScore:3 },
        { month:'ม.ค.69', currentRatio:1.13, quickRatio:0.87, cashRatio:0.19, nwc:11.69, niDep:13.63, ebitda:17.61, netCash:-71.70, riskScore:3 },
        { month:'ก.พ.69', currentRatio:1.06, quickRatio:0.79, cashRatio:0.25, nwc:5.56,  niDep:11.13, ebitda:12.25, netCash:-64.95, riskScore:3 },
        { month:'มี.ค.69', currentRatio:1.13, quickRatio:0.84, cashRatio:0.28, nwc:10.04, niDep:14.14, ebitda:18.63, netCash:-55.72, riskScore:3 },
        { month:'เม.ย.69', currentRatio:1.06, quickRatio:0.78, cashRatio:0.24, nwc:5.55,  niDep:16.54, ebitda:15.55, netCash:-64.71, riskScore:3 }
    ],
    annual: [
        { year:2562, currentRatio:0.74, quickRatio:0.54, cashRatio:0.31, riskScore:4 },
        { year:2563, currentRatio:0.85, quickRatio:0.64, cashRatio:0.26, riskScore:5 },
        { year:2564, currentRatio:1.52, quickRatio:1.29, cashRatio:0.17, riskScore:1 },
        { year:2565, currentRatio:1.85, quickRatio:1.62, cashRatio:0.54, riskScore:1 },
        { year:2566, currentRatio:2.17, quickRatio:1.83, cashRatio:1.05, riskScore:1 },
        { year:2567, currentRatio:1.26, quickRatio:1.02, cashRatio:0.39, riskScore:3 },
        { year:2568, currentRatio:1.00, quickRatio:0.76, cashRatio:0.19, riskScore:6 },
        { year:2569, currentRatio:1.20, quickRatio:0.95, cashRatio:0.46, riskScore:3 }
    ]
};

var RISK_COL = {1:'rgba(16,185,129,0.8)',2:'rgba(132,204,22,0.8)',3:'rgba(245,158,11,0.8)',4:'rgba(249,115,22,0.8)',5:'rgba(239,68,68,0.8)',6:'rgba(124,58,237,0.8)'};

async function loadRiskFromGAS() {
    var gasUrl = (typeof GS_WEB_APP_URL !== 'undefined') ? GS_WEB_APP_URL : null;
    if (gasUrl) {
        try {
            console.log('🔄 Risk: loading from GAS...');
            var resp = await fetch(gasUrl + '?action=risk', { redirect: 'follow' });
            if (!resp.ok) throw new Error('HTTP ' + resp.status);
            var json = await resp.json();
            if (json && json.monthly && json.monthly.length > 0) {
                riskLiveData = json;
                console.log('✅ Risk GAS loaded:', json.monthly.length, 'months');
                applyRiskLiveData(json);
                return;
            }
        } catch (e) { console.warn('⚠ Risk GAS failed:', e.message); }
    }
    var sheetId = '1sjKjR2XH568haiMSMnPo1k8RSYAjp3ocmvu7e5sgAB0';
    try {
        console.log('🔄 Risk: loading from gviz...');
        var resp2 = await fetch('https://docs.google.com/spreadsheets/d/' + sheetId + '/gviz/tq?tqx=out:json');
        var text = await resp2.text();
        var json2 = JSON.parse(text.substring(47).slice(0, -2));
        var rows = json2.table.rows;
        if (rows && rows.length > 1) {
            var monthly = [];
            for (var i = 1; i < rows.length; i++) {
                var c = rows[i].c;
                if (!c || !c[0]) continue;
                var m = String(c[0].v || '').trim();
                if (!m) continue;
                monthly.push({ month:m, currentRatio:c[1]?parseFloat(c[1].v)||0:0, quickRatio:c[2]?parseFloat(c[2].v)||0:0, cashRatio:c[3]?parseFloat(c[3].v)||0:0, nwc:c[4]?parseFloat(c[4].v)||0:0, niDep:c[5]?parseFloat(c[5].v)||0:0, ebitda:c[6]?parseFloat(c[6].v)||0:0, netCash:c[7]?parseFloat(c[7].v)||0:0, riskScore:c[11]?parseFloat(c[11].v)||0:0 });
            }
            if (monthly.length > 0) {
                riskLiveData = { monthly: monthly, latest: monthly[monthly.length - 1] };
                console.log('✅ Risk gviz loaded:', monthly.length, 'months');
                applyRiskLiveData(riskLiveData);
                return;
            }
        }
    } catch (e2) { console.warn('⚠ Risk gviz failed:', e2.message); }
    console.log('Risk: using hardcoded fallback');
}

function applyRiskLiveData(data) {
    if (!data || !data.monthly || data.monthly.length === 0) return;
    var monthly = data.monthly;
    var annual = data.annual || RISK_FALLBACK.annual;
    var latest = data.latest || monthly[monthly.length - 1];

    var panel = document.getElementById('risk-ov');
    if (panel) {
        var cards = panel.querySelectorAll('.nt-kpi');
        var cd = [
            { label:'RISK SCORE ล่าสุด ('+latest.month+')', val:latest.riskScore+' <small>/ 6</small>', foot:getRiskLabel(latest.riskScore), pill:getRiskPill(latest.riskScore), color:latest.riskScore<=2?'c-green':latest.riskScore<=3?'c-amber':'c-red' },
            { label:'CURRENT RATIO ('+latest.month+')', val:(latest.currentRatio||0).toFixed(2)+' <small>เท่า</small>', foot:'ค่ากลาง 1.5 | '+(latest.currentRatio>=1.5?'ผ่าน':'ต่ำกว่า'), pill:latest.currentRatio>=1.5?'ผ่านเกณฑ์':'ต่ำกว่าเกณฑ์', color:latest.currentRatio>=1.5?'c-green':'c-blue' },
            { label:'QUICK RATIO ('+latest.month+')', val:(latest.quickRatio||0).toFixed(2)+' <small>เท่า</small>', foot:'ค่ากลาง 1.0 | '+(latest.quickRatio>=1.0?'ผ่าน':'ต่ำกว่า'), pill:latest.quickRatio>=1.0?'ผ่านเกณฑ์':'ต่ำกว่าเกณฑ์', color:latest.quickRatio>=1.0?'c-green':'c-blue' },
            { label:'CASH RATIO ('+latest.month+')', val:(latest.cashRatio||0).toFixed(2)+' <small>เท่า</small>', foot:'ค่ากลาง 0.8 | '+(latest.cashRatio>=0.8?'ผ่าน':'ต่ำกว่ามาก'), pill:latest.cashRatio>=0.8?'ผ่านเกณฑ์':'ต่ำมาก', color:latest.cashRatio>=0.8?'c-green':'c-amber' },
            { label:'NWC ('+latest.month+')', val:(latest.nwc||0).toFixed(2)+' <small>MB</small>', foot:(latest.nwc>=0?'เป็นบวก ✓':'ติดลบ ⚠'), pill:latest.nwc>=0?'บวก ✓':'ติดลบ ⚠', color:latest.nwc>=0?'c-green':'c-red' },
            { label:'เงินบำรุงคงเหลือสุทธิ', val:(latest.netCash||0).toFixed(2)+' <small>MB</small>', foot:latest.month+' | '+(latest.netCash>=0?'เป็นบวก':'ติดลบ'), pill:latest.netCash>=0?'บวก ✓':'ติดลบ ⚠', color:latest.netCash>=0?'c-green':'c-red' }
        ];
        cd.forEach(function(d, i) {
            if (i >= cards.length) return;
            var card = cards[i];
            var lbl = card.querySelector('.nt-lbl'), val = card.querySelector('.nt-val'), ft = card.querySelector('.nt-foot'), pl = card.querySelector('.nt-pill');
            if (lbl) lbl.textContent = d.label;
            if (val) val.innerHTML = d.val;
            if (ft) ft.textContent = d.foot;
            if (pl) { pl.textContent = d.pill; pl.className = 'nt-pill ' + (d.color==='c-green'?'good':d.color==='c-red'?'bad':'warn'); }
            card.className = 'nt-kpi ' + d.color;
        });
    }

    var insightEl = document.querySelector('#risk-ov .nt-insight');
    if (insightEl && monthly.length > 0) {
        var scores = monthly.map(function(m){return m.riskScore;}), months = monthly.map(function(m){return m.month;});
        var allSame = scores.every(function(s){return s===scores[0];});
        insightEl.innerHTML = allSame
            ? '<strong>⚠ Risk Score ระดับ '+scores[0]+' ทุกเดือน '+months[0]+'–'+months[months.length-1]+'</strong>'
            : '<strong>📊 Risk Score '+months[0]+'–'+months[months.length-1]+':</strong> '+monthly.map(function(m){return m.month+'='+m.riskScore;}).join(', ');
    }

    var sHead = document.querySelector('#tab-risk-score .erp-section-head h3');
    if (sHead) sHead.textContent = '🏦 Risk Scoring Dashboard • รพ.เสลภูมิ (Live Data)';

    renderRiskChartsFromData(monthly, annual);
    updateERPOverviewRisk(latest);
    console.log('✅ Risk Dashboard updated: score='+latest.riskScore+', '+monthly.length+' months');
}

function renderRiskChartsFromData(monthly, annual) {
    var labels=monthly.map(function(m){return m.month;}), scores=monthly.map(function(m){return m.riskScore;});
    var CR=monthly.map(function(m){return m.currentRatio;}), QR=monthly.map(function(m){return m.quickRatio;}), CASHR=monthly.map(function(m){return m.cashRatio;});
    var NWC=monthly.map(function(m){return m.nwc;}), NC=monthly.map(function(m){return m.netCash;}), EB=monthly.map(function(m){return m.ebitda;}), ND=monthly.map(function(m){return m.niDep;});
    var n=labels.length;

    destroyChart('risk_monthly');
    ltChart('risk_monthly','bar',{labels:labels,datasets:[{label:'Risk Score',data:scores,backgroundColor:scores.map(function(v){return RISK_COL[v]||RISK_COL[3];}),borderRadius:6}]},{leg:false,ytick:{stepSize:1,callback:function(v){return 'ระดับ '+v;}}});

    if (annual && annual.length > 0) {
        var YRS=annual.map(function(a){return a.year;}), YRISK=annual.map(function(a){return a.riskScore;});
        var YCR=annual.map(function(a){return a.currentRatio;}), YQR=annual.map(function(a){return a.quickRatio;}), YCASHR=annual.map(function(a){return a.cashRatio;});
        destroyChart('risk_yearly');
        ltChart('risk_yearly','bar',{labels:YRS,datasets:[{label:'Risk Score',data:YRISK,backgroundColor:YRISK.map(function(v){return RISK_COL[v]||RISK_COL[3];}),borderRadius:6}]},{leg:false,ytick:{stepSize:1,callback:function(v){return 'ระดับ '+v;}}});
        destroyChart('risk_yrRisk');
        ltChart('risk_yrRisk','bar',{labels:YRS,datasets:[{label:'Risk Score',data:YRISK,backgroundColor:YRISK.map(function(v){return RISK_COL[v]||RISK_COL[3];}),borderRadius:6}]},{leg:false,ytick:{stepSize:1}});
        destroyChart('risk_yrRatio');
        ltChart('risk_yrRatio','line',{labels:YRS,datasets:[
            {label:'Current',data:YCR,borderColor:'#6366f1',borderWidth:2,pointRadius:4,pointBackgroundColor:'#6366f1',fill:false,tension:0.3},
            {label:'Quick',data:YQR,borderColor:'#10b981',borderWidth:2,pointRadius:4,pointBackgroundColor:'#10b981',fill:false,tension:0.3},
            {label:'Cash',data:YCASHR,borderColor:'#f97316',borderWidth:2,pointRadius:4,pointBackgroundColor:'#f97316',fill:false,tension:0.3}
        ]});
    }

    destroyChart('risk_ratios');
    ltChart('risk_ratios','line',{labels:labels,datasets:[
        {label:'Current Ratio',data:CR,borderColor:'#6366f1',borderWidth:2.5,pointRadius:5,pointBackgroundColor:'#6366f1',fill:false,tension:0.3},
        {label:'Quick Ratio',data:QR,borderColor:'#10b981',borderWidth:2.5,pointRadius:5,pointBackgroundColor:'#10b981',fill:false,tension:0.3},
        {label:'Cash Ratio',data:CASHR,borderColor:'#f97316',borderWidth:2.5,pointRadius:5,pointBackgroundColor:'#f97316',fill:false,tension:0.3},
        {label:'ค่ากลาง CR 1.5',data:Array(n).fill(1.5),borderColor:'rgba(99,102,241,0.4)',borderWidth:1.5,borderDash:[5,4],pointRadius:0,fill:false},
        {label:'ค่ากลาง QR 1.0',data:Array(n).fill(1.0),borderColor:'rgba(16,185,129,0.4)',borderWidth:1.5,borderDash:[5,4],pointRadius:0,fill:false},
        {label:'ค่ากลาง CashR 0.8',data:Array(n).fill(0.8),borderColor:'rgba(249,115,22,0.4)',borderWidth:1.5,borderDash:[5,4],pointRadius:0,fill:false}
    ]});

    destroyChart('risk_nwc');
    ltChart('risk_nwc','bar',{labels:labels,datasets:[{label:'NWC (MB)',data:NWC,backgroundColor:NWC.map(function(v){return v>=0?'rgba(16,185,129,0.8)':'rgba(239,68,68,0.8)';}),borderRadius:6}]},{leg:false});
    destroyChart('risk_netcash');
    ltChart('risk_netcash','bar',{labels:labels,datasets:[{label:'เงินบำรุง (MB)',data:NC,backgroundColor:'rgba(239,68,68,0.7)',borderRadius:6}]},{leg:false});
    destroyChart('risk_ebitda');
    ltChart('risk_ebitda','bar',{labels:labels,datasets:[{label:'EBITDA',data:EB,backgroundColor:'rgba(16,185,129,0.7)',borderRadius:5},{label:'Ni+Dep',data:ND,backgroundColor:'rgba(99,102,241,0.6)',borderRadius:5}]});
}

function updateERPOverviewRisk(latest) {
    if (!latest) return;
    var allCards = document.querySelectorAll('#tab-erp-overview .ov-sc');
    var riskCard = null;
    allCards.forEach(function(card) { var t = card.querySelector('.st'); if (t && t.textContent.indexOf('Risk') > -1) riskCard = card; });
    if (!riskCard) { console.log('⚠ Risk: ERP Overview card not found'); return; }

    var score = latest.riskScore || 3;
    var col = score <= 2 ? '#10b981' : score <= 3 ? '#f59e0b' : '#ef4444';
    var lbl = {1:'ดีมาก',2:'ดี',3:'ต้องระวัง',4:'เสี่ยง',5:'เสี่ยงสูง',6:'วิกฤต'};

    // Period
    var ss = riskCard.querySelector('.ss');
    if (ss) ss.textContent = latest.month ? latest.month : 'ล่าสุด';

    // Badge
    var badge = riskCard.querySelector('.sb');
    if (badge) { badge.textContent = 'ระดับ ' + score; badge.style.color = col; }

    // Ring
    var ring = riskCard.querySelector('.ov-ring');
    if (ring) {
        var pct = Math.round((score / 6) * 100);
        ring.style.background = 'conic-gradient(' + col + ' 0% ' + pct + '%, #f1f5f9 ' + pct + '% 100%)';
        var span = ring.querySelector('span');
        if (span) { span.textContent = score; span.style.color = col; }
    }

    // Ring label
    var ringParent = ring ? ring.parentElement : null;
    if (ringParent) {
        var ringLabel = ringParent.querySelectorAll('div');
        for (var rl = 0; rl < ringLabel.length; rl++) {
            if (ringLabel[rl].textContent.indexOf('Risk') > -1 || ringLabel[rl].textContent.indexOf('/') > -1) {
                ringLabel[rl].textContent = 'Risk ' + score + ' / 6 (' + (lbl[score] || '') + ')';
                break;
            }
        }
    }

    // 4 ratio boxes — หาด้วยข้อความ CURRENT/QUICK/CASH/NWC
    var allDivs = riskCard.querySelectorAll('div');
    var ratioMap = {
        'CURRENT': { val: (latest.currentRatio || 0).toFixed(2), color: latest.currentRatio >= 1.5 ? '#10b981' : '#f59e0b' },
        'QUICK': { val: (latest.quickRatio || 0).toFixed(2), color: latest.quickRatio >= 1.0 ? '#10b981' : '#f59e0b' },
        'CASH': { val: (latest.cashRatio || 0).toFixed(2), color: latest.cashRatio >= 0.8 ? '#10b981' : '#f43f5e' },
        'NWC': { val: (latest.nwc >= 0 ? '+' : '') + (latest.nwc || 0).toFixed(2) + 'M', color: latest.nwc >= 0 ? '#10b981' : '#f43f5e' }
    };
    var updated = 0;
    for (var d = 0; d < allDivs.length; d++) {
        var txt = allDivs[d].textContent.trim();
        if (ratioMap[txt]) {
            var parent = allDivs[d].parentElement;
            if (parent) {
                var children = parent.querySelectorAll('div');
                for (var ch = 0; ch < children.length; ch++) {
                    var style = children[ch].style;
                    if (style && style.fontSize && (style.fontSize.indexOf('17') > -1 || style.fontSize.indexOf('18') > -1 || style.fontSize.indexOf('16') > -1)) {
                        children[ch].textContent = ratioMap[txt].val;
                        children[ch].style.color = ratioMap[txt].color;
                        updated++;
                        break;
                    }
                }
            }
        }
    }

    // เงินบำรุงสุทธิ
    for (var d2 = 0; d2 < allDivs.length; d2++) {
        var t2 = allDivs[d2].textContent;
        if (t2.indexOf('เงินบำรุงสุทธิ') > -1 || (t2.indexOf('ลบ.') > -1 && t2.indexOf('64') > -1)) {
            var nc = latest.netCash || 0;
            allDivs[d2].innerHTML = 'เงินบำรุงสุทธิ <b>' + (nc >= 0 ? '+' : '') + nc.toFixed(2) + ' ลบ.</b>';
            updated++;
            break;
        }
    }

    console.log('✅ Risk ERP Overview card updated: ' + updated + ' elements, month=' + latest.month);
}

function getRiskLabel(score) { var l={1:'ดีมาก',2:'ดี',3:'พอใช้',4:'เสี่ยง',5:'เสี่ยงสูง',6:'วิกฤต'}; return 'ระดับ '+score+' = '+(l[score]||'ไม่ระบุ'); }
function getRiskPill(score) { if(score<=2) return '✓ ระดับ '+score; if(score<=3) return '⚠ ระดับ '+score; return '⚠ ระดับ '+score+' เสี่ยง'; }

function renderRiskCharts() {
    var fb = { monthly: RISK_FALLBACK.monthly, annual: RISK_FALLBACK.annual, latest: RISK_FALLBACK.monthly[RISK_FALLBACK.monthly.length - 1] };
    applyRiskLiveData(fb);
    setTimeout(function() { loadRiskFromGAS().catch(function(err) { console.error('Risk error:', err); }); }, 1000);
}
