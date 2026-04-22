// --- 1. USERS DATABASE (Offline) ---
const USERS = [
    { u: "raj", p: "raj123", role: "admin" },
    { u: "staff", p: "dfurn@12", role: "user" }
];

// --- 2. GLOBAL SETTINGS (With LocalStorage Fallback) ---
let ADMIN_DATA = { "MS Rate": 72, "Dealer Margin": 0.07, "PC Rate": 17, "Markup": 0.40, "Wasteage": 0.05, "Track Rate": 840 };
let DENSITIES = { "Base Frame": 1.46, "Shelf": 0.59, "Body": 0.59, "Stiffner": 0.59, "Front Cover": 0.59, "Back Cover": 0.59, "Middle Cover": 0.59, "Door Frame": 0.66, "Shutter": 0.59 };

// Load custom settings if saved in browser
function loadSavedAdminData() {
    const savedAdmin = localStorage.getItem('dfurn_admin_data');
    const savedDensities = localStorage.getItem('dfurn_densities');
    if(savedAdmin) ADMIN_DATA = JSON.parse(savedAdmin);
    if(savedDensities) DENSITIES = JSON.parse(savedDensities);
}
loadSavedAdminData(); // Initial load

// --- UI LOGIC ---
function togglePass() {
    let p = document.getElementById('pass');
    let eye = document.getElementById('eye');
    p.type = p.type === "password" ? "text" : "password";
    eye.classList.toggle('fa-eye-slash');
}

function checkLogin() {
    const u = document.getElementById('user').value;
    const p = document.getElementById('pass').value;
    const found = USERS.find(user => user.u === u && user.p === p);
    
    if (found) {
        document.getElementById('login-view').classList.add('hidden');
        document.getElementById('calc-view').classList.remove('hidden');
        
        // Show Admin button only for admins
        if(found.role === 'admin') {
            document.getElementById('btn-admin').classList.remove('hidden');
        }
    } else {
        document.getElementById('login-err').classList.remove('hidden');
    }
}

function showLogout() { document.getElementById('logout-modal').classList.remove('hidden'); }
function hideLogout() { document.getElementById('logout-modal').classList.add('hidden'); }
function fmt(num) { return Math.round(num).toLocaleString('en-IN'); }

// --- ADMIN PANEL LOGIC ---
function showAdmin() {
    document.getElementById('calc-view').classList.add('hidden');
    document.getElementById('admin-view').classList.remove('hidden');
    
    // Populate inputs
    document.getElementById('msRate').value = ADMIN_DATA["MS Rate"];
    document.getElementById('dealerMargin').value = ADMIN_DATA["Dealer Margin"];
    document.getElementById('pcRate').value = ADMIN_DATA["PC Rate"];
    document.getElementById('markup').value = ADMIN_DATA["Markup"];
    document.getElementById('wasteage').value = ADMIN_DATA["Wasteage"];
    document.getElementById('trackRate').value = ADMIN_DATA["Track Rate"];
    
    document.getElementById('dBase').value = DENSITIES["Base Frame"];
    document.getElementById('dShelf').value = DENSITIES["Shelf"];
    document.getElementById('dBody').value = DENSITIES["Body"];
    document.getElementById('dStiff').value = DENSITIES["Stiffner"];
    document.getElementById('dFront').value = DENSITIES["Front Cover"];
    document.getElementById('dBack').value = DENSITIES["Back Cover"];
    document.getElementById('dMid').value = DENSITIES["Middle Cover"];
    document.getElementById('dDoor').value = DENSITIES["Door Frame"];
    document.getElementById('dShut').value = DENSITIES["Shutter"];
}

function hideAdmin() {
    document.getElementById('admin-view').classList.add('hidden');
    document.getElementById('calc-view').classList.remove('hidden');
}

function saveAdmin() {
    ADMIN_DATA = {
        "MS Rate": parseFloat(document.getElementById('msRate').value),
        "Dealer Margin": parseFloat(document.getElementById('dealerMargin').value),
        "PC Rate": parseFloat(document.getElementById('pcRate').value),
        "Markup": parseFloat(document.getElementById('markup').value),
        "Wasteage": parseFloat(document.getElementById('wasteage').value),
        "Track Rate": parseFloat(document.getElementById('trackRate').value)
    };
    
    DENSITIES = {
        "Base Frame": parseFloat(document.getElementById('dBase').value),
        "Shelf": parseFloat(document.getElementById('dShelf').value),
        "Body": parseFloat(document.getElementById('dBody').value),
        "Stiffner": parseFloat(document.getElementById('dStiff').value),
        "Front Cover": parseFloat(document.getElementById('dFront').value),
        "Back Cover": parseFloat(document.getElementById('dBack').value),
        "Middle Cover": parseFloat(document.getElementById('dMid').value),
        "Door Frame": parseFloat(document.getElementById('dDoor').value),
        "Shutter": parseFloat(document.getElementById('dShut').value)
    };

    // Save to browser memory
    localStorage.setItem('dfurn_admin_data', JSON.stringify(ADMIN_DATA));
    localStorage.setItem('dfurn_densities', JSON.stringify(DENSITIES));
    
    alert("✅ Admin Settings Saved Successfully!");
    hideAdmin();
}

// --- CALCULATION LOGIC ---
function getLabourCost(type, width, height) {
    if (height === 2170) {
        if (type === "DFM") return width === 900 ? 2100 : (width === 750 ? 1750 : 1515);
        if (type === "SFS" || type === "SFM") return width === 900 ? 1050 : (width === 750 ? 875 : 750);
        if (type === "DFS") return width === 900 ? 2750 : (width === 750 ? 2400 : 2100);
    } else { 
        if (type === "DFM") return width === 900 ? 2520 : (width === 750 ? 2100 : 1800);
        if (type === "SFS" || type === "SFM") return width === 900 ? 1260 : (width === 750 ? 1050 : 900);
        if (type === "DFS") return width === 900 ? 3300 : (width === 750 ? 2850 : 2520);
    }
    return 0;
}

function getHardwareQtyA(depth, bays) {
    if (depth <= 900) return bays < 4 ? 20 : (bays === 4 ? 28 : 32);
    if (depth === 1050 || depth === 1180) return bays < 3 ? 20 : (bays === 3 ? 28 : (bays === 4 ? 32 : 36));
    return 0;
}

function getHardwareQtyB(depth, bays) {
    if (depth <= 900) return bays < 4 ? 4 : (bays === 4 ? 6 : 8);
    if (depth === 1050 || depth === 1180) return bays < 3 ? 4 : (bays === 3 ? 6 : (bays === 4 ? 6 : 8));
    return 0;
}

function calculateQuotes() {
    const width = parseFloat(document.getElementById('w').value);
    const height = parseFloat(document.getElementById('h').value);
    const bays = parseFloat(document.getElementById('b').value);
    const depth = parseFloat(document.getElementById('d').value);
    const passage = parseFloat(document.getElementById('pas').value);
    
    const qDFM = parseInt(document.getElementById('qDFM').value) || 0;
    const qSFS = parseInt(document.getElementById('qSFS').value) || 0;
    const qSFM = parseInt(document.getElementById('qSFM').value) || 0;
    const qDFS = parseInt(document.getElementById('qDFS').value) || 0;

    const msRate = ADMIN_DATA["MS Rate"];           
    const dealerMargin = ADMIN_DATA["Dealer Margin"];   
    const wasteagePercent = ADMIN_DATA["Wasteage"]; 
    const pcRate = ADMIN_DATA["PC Rate"]; 
    const markupPercent = ADMIN_DATA["Markup"]; 
    const trackRate = ADMIN_DATA["Track Rate"]; 

    const hwA = getHardwareQtyA(depth, bays);
    const hwB = getHardwareQtyB(depth, bays);

    function calcProduct(type) {
        let parts = [], hw = [];
        let totalLabour = getLabourCost(type, width, height) * bays; 
        let totalFitting = (type === "SFS" || type === "SFM") ? 450 * bays : 900 * bays;
        
        let shelfQty = (type === "SFS" || type === "SFM") ? (6 * bays) : (12 * bays);
        let sideQty = (type === "SFS" || type === "SFM") ? (bays + 1) : ((2 * bays) + 2);
        let angleQty = (type === "SFS" || type === "SFM") ? (4 * bays) : (8 * bays);
        let pattiQty = (type === "SFS" || type === "SFM") ? (3 * bays) : (6 * bays);
        let baseFrameQty = (bays === 1 ? 6 : (bays === 2 ? 7 : (bays === 3 ? 8 : (bays === 4 ? 9 : 10))));
        let sidePattaQty = (type === "SFS" || type === "SFM") ? ((2 * bays) - 2) : ((4 * bays) - 4);
        if(bays === 1) sidePattaQty = 0;
        let stiffnerQty = (depth === 900) ? 0 : (type.includes("SF") ? (shelfQty + (bays * 2)) : shelfQty);

        let hwQty1 = bays * (height === 2170 ? 20 : 24), hwQty3 = bays * (height === 2170 ? 40 : 48), hwQty1_2 = bays * (height === 2170 ? 16 : 20);

        if (type === "DFM") {
            parts = [ { l: (width / 2) + 118, w: height - 140, q: sideQty, f: DENSITIES["Body"] }, { l: 70, w: width / 2, q: angleQty, f: DENSITIES["Body"] }, { l: 100, w: height - 140, q: sidePattaQty, f: DENSITIES["Body"] }, { l: (width / 2) + 45, w: depth + 60, q: shelfQty, f: DENSITIES["Shelf"] }, { l: 50, w: depth, q: pattiQty, f: DENSITIES["Body"] }, { l: depth, w: (height - 140) + 20, q: bays, f: DENSITIES["Middle Cover"] }, { l: 416, w: height + 200, q: 1, f: DENSITIES["Front Cover"] }, { l: 200, w: width, q: baseFrameQty, f: DENSITIES["Base Frame"] }, { l: 120, w: depth, q: stiffnerQty, f: DENSITIES["Stiffner"] }, { l: 150, w: bays * depth, q: 2, f: DENSITIES["Base Frame"] } ];
            hw = [[0.65, hwQty1_2], [0.35, hwQty1_2], [0.24, bays*(height===2170?32:40)], [3.5, hwA], [1, hwA], [0.35, 2 * hwA], [0.35, bays*(height===2170?15:20)], [0.25, bays*(height===2170?15:20)], [0.24, bays*(height===2170?30:40)], [10, 0], [5, 6], [1, 2], [1, 2], [20, 1], [1000, 1], [155, 0.5 * hwA], [5, 1], [5, 2], [5, hwB], [310, hwB], [78.5, hwB * 0.5], [80, 1], [295, 3], [0.55, 8], [1, 4], [0.65, 4], [2400, 1], [660, 1]];
        }
        else if (type === "SFS") {
            let bfQtyStat = bays > 1 ? (bays < 5 ? (2 * bays) + 1 : 2 * bays) : 4; if (bays === 3) bfQtyStat = 7; 
            parts = [{ l: (width / 2) + 118, w: height - 140, q: sideQty, f: DENSITIES["Body"] }, { l: 70, w: width / 2, q: angleQty, f: DENSITIES["Body"] }, { l: 100, w: height - 140, q: sidePattaQty, f: DENSITIES["Body"] }, { l: (width / 2) + 45, w: depth + 60, q: shelfQty, f: DENSITIES["Shelf"] }, { l: 50, w: depth, q: pattiQty, f: DENSITIES["Body"] }, { l: depth + 95, w: ((height - 140) / 2) + 95, q: 2 * bays, f: DENSITIES["Back Cover"] }, { l: 200, w: (width / 2) + 25, q: bfQtyStat, f: DENSITIES["Base Frame"] }, { l: 150, w: depth * bays, q: 2, f: DENSITIES["Base Frame"] }, { l: 120, w: depth, q: stiffnerQty, f: DENSITIES["Stiffner"] }];
            hw = [[0.65, hwQty1], [0.35, hwQty1], [0.24, hwQty3], [10, bays < 3 ? 6 : (bays > 3 ? 12 : 9)], [1, 2], [1, 2], [7, bays * (height === 2170 ? 16 : 20)], [80, 1]];
        }
        else if (type === "SFM") {
            parts = [{ l: 568, w: height - 140, q: sideQty, f: DENSITIES["Body"] }, { l: 70, w: 450, q: angleQty, f: DENSITIES["Body"] }, { l: 100, w: height - 140, q: sidePattaQty, f: DENSITIES["Body"] }, { l: 495, w: depth + 60, q: shelfQty, f: DENSITIES["Shelf"] }, { l: 50, w: depth, q: pattiQty, f: DENSITIES["Body"] }, { l: depth + 95, w: ((height - 140) / 2) + 95, q: 2 * bays, f: DENSITIES["Back Cover"] }, { l: 200, w: 450 + 25, q: baseFrameQty, f: DENSITIES["Base Frame"] }, { l: 150, w: depth * bays, q: 2, f: DENSITIES["Base Frame"] }, { l: 120, w: depth, q: stiffnerQty, f: DENSITIES["Stiffner"] }, { l: 416, w: height + 200, q: 1, f: DENSITIES["Front Cover"] }];
            hw = [[0.65, hwQty1], [0.35, hwQty1], [0.24, hwQty3], [3.5, hwA], [1, hwA], [0.35, 2 * hwA], [10, 0], [5, 6], [1, 2], [1, 2], [20, 1], [1000, 1], [155, 0.5 * hwA], [5, 1], [5, 2], [5, hwB], [325, 1], [7, bays*(height===2170?16:20)], [6, 2 * hwB], [310, hwB], [78.5, 0.5 * hwB], [80, 1], [295, 3], [0.55, 8], [1, 4], [0.65, 4], [2400, 1], [660, 1]];
        }
        else if (type === "DFS") {
            parts = [{ l: (width / 2) + 118, w: height - 140, q: sideQty, f: DENSITIES["Body"] }, { l: 70, w: width / 2, q: angleQty, f: DENSITIES["Body"] }, { l: 100, w: height - 140, q: sidePattaQty, f: DENSITIES["Body"] }, { l: (width / 2) + 45, w: depth + 60, q: shelfQty, f: DENSITIES["Shelf"] }, { l: 50, w: depth, q: pattiQty, f: DENSITIES["Body"] }, { l: depth, w: (height - 140) + 20, q: bays, f: DENSITIES["Middle Cover"] }, { l: 416, w: height, q: 1, f: DENSITIES["Front Cover"] }, { l: 200, w: width, q: baseFrameQty, f: DENSITIES["Base Frame"] }, { l: 150, w: depth * bays, q: 2, f: DENSITIES["Base Frame"] }, { l: 120, w: depth, q: stiffnerQty, f: DENSITIES["Stiffner"] }, { l: 70, w: height - 140, q: 2 * bays, f: DENSITIES["Door Frame"] }, { l: 70, w: depth, q: 2 * bays, f: DENSITIES["Door Frame"] }, { l: (depth > 900 ? 525 + ((depth - 900) / 2) : 525), w: height - 60, q: 2 * bays, f: DENSITIES["Shutter"] }, { l: 130, w: height - 140, q: 2 * bays, f: DENSITIES["Stiffner"] }];
            hw = [[0.65, hwQty1_2], [0.35, hwQty1_2], [0.24, bays*(height===2170?32:40)], [3.5, hwA], [1, hwA], [0.35, 2 * hwA], [0.35, bays*(height===2170?15:20)], [0.25, bays*(height===2170?15:20)], [0.24, bays*(height===2170?30:40)], [10, 0], [5, 6], [1, 2], [1, 2], [20, 1], [1000, 1], [155, 0.5 * hwA], [5, 1], [5, 2], [5, hwB], [325, bays + 1], [7, bays*(height===2170?32:40)], [6, 2 * hwB], [310, hwB], [78.5, 0.5 * hwB], [80, 1], [295, 3], [0.55, 8], [1, 4], [0.65, 4], [2400, 1], [660, 1], [1.5, bays*(height===2170?6:8)], [1.5, bays*(height===2170?10:14)], [0.3, bays*(height===2170?10:14)], [0.24, bays*(height===2170?10:14)], [6, bays*(height===2170?6:8)]];
        }

        let totalAreaSqFt = 0, partsWeight = 0;
        parts.forEach(p => {
            let sqFt = (p.l * p.w * p.q) / 93025;
            totalAreaSqFt += sqFt;
            partsWeight += (sqFt * p.f); 
        });

        let totalWeight = partsWeight;
        let sheetMetalCost = partsWeight * msRate; 
        let hardwareCost = 0;
        hw.forEach(item => { hardwareCost += (item[0] * item[1]); });

        if (type === "DFS") {
            let dfsRodWeight = ((2 * bays) + 1) * 0.62;
            sheetMetalCost += (dfsRodWeight * 110); 
        }

        let wasteageCost = sheetMetalCost * wasteagePercent;
        let basicPrice = sheetMetalCost + wasteageCost + (totalAreaSqFt * pcRate) + totalLabour + totalFitting + hardwareCost;
        return basicPrice * (1 + markupPercent); 
    }

    let sellDFM = calcProduct("DFM"), sellSFS = calcProduct("SFS"), sellSFM = calcProduct("SFM"), sellDFS = calcProduct("DFS");
    let sumSelling = (sellDFM * qDFM) + (sellSFS * qSFS) + (sellSFM * qSFM) + (sellDFS * qDFS);
    
    let finalTrack = 0;
    if ((qDFM + qSFM + qDFS) > 0) {
        let trackLength_m = ((qDFM * width) + (qSFM * 475) + (qDFS * (width + 30)) + passage) / 1000;
        let trackBasic = trackLength_m * trackRate * 2; 
        finalTrack = (trackBasic * (1 + markupPercent)) / (1 - dealerMargin);
    }

    let fSFS = (sellSFS * qSFS) / (1 - dealerMargin);
    let fSFM = (sellSFM * qSFM) / (1 - dealerMargin);
    let fDFM = (sellDFM * qDFM) / (1 - dealerMargin);
    let fDFS = (sellDFS * qDFS) / (1 - dealerMargin);
    let finalGrand = (sumSelling / (1 - dealerMargin)) + finalTrack;

    document.getElementById('res-dfm').innerText = "₹ " + fmt(fDFM);
    document.getElementById('res-sfs').innerText = "₹ " + fmt(fSFS);
    document.getElementById('res-sfm').innerText = "₹ " + fmt(fSFM);
    document.getElementById('res-dfs').innerText = "₹ " + fmt(fDFS);
    document.getElementById('grand-total').innerText = "₹ " + fmt(finalGrand);
}
