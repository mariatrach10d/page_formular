const facilityType = document.getElementById('facility_type');
const facility = document.getElementById('facility');
const options = {
    gym:['Gym A', 'Gym B'],
    hall:['Tennis court','Volleyball court'],
    field:['Football field', 'Running track']
};

function resetSelect(sel,placeholderText){
    sel.innerHTML = '';
    const ph = document.createElement('option');
    ph.value = '';
    ph.textContent = placeholderText;
    ph.disabled = true;
    ph.selected = true;
    sel.appendChild(ph);
    sel.disabled = true;
}
function fillSelect(sel,items,placeholderText){
    resetSelect(sel,placeholderText);
    items.forEach(t =>{
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = t;
        sel.appendChild(opt);
    });
    sel.disabled = false;
}

const  terrain = document.getElementById('terrain');
const terrains = {
    'Gym A': ['Main hall', 'Small hall'],
    'Gym B': ['Weight area','Stretch zone'],
    'Tennis court': ['Clay court', 'Hard court'],
    'Volleyball court': ['Indoor','Outdoor'],
    'Football field': ['Grass','Artificial turf'],
    'Running track': ['Outdoor track','Indoor track']
};

facilityType.addEventListener('change', () =>{
    const type = facilityType.value;
    const list = options[type] || [];
    fillSelect(facility,list,'Select facility');
    resetSelect(terrain,'Select zone');
});
facility.addEventListener('change', () =>{
    const fac = facility.value;
    const zones = terrains[fac] || [];
    if (zones.length) fillSelect(terrain,zones,'Select zone');
    else resetSelect(terrain,'Select zone');
});


const dateEl = document.getElementById('date');
const timeFrom = document.getElementById('time_from');
const timeTo = document.getElementById('time_to');
function toYMD(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function toHM(d) {
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
}
function hmToMinutes(hm) {
    const [h, m] = hm.split(':').map(Number);
    return h * 60 + m;
}
function roundUpHMto15(hm) {
    const mins = hmToMinutes(hm);
    const up = Math.ceil(mins / 15) * 15;
    return minutesToHM(Math.min(up, 23 * 60 + 59));
}
function lockEndTo30Grid(fromHM, toHM) {
    const fromMin = hmToMinutes(fromHM);
    let toMin = hmToMinutes(toHM);
    if (toMin < fromMin + 30) toMin = fromMin + 30;
    const k = Math.ceil((toMin - fromMin) / 30);
    const snapped = fromMin + k * 30;
    return minutesToHM(Math.min(snapped, 23 * 60 + 59));
}
function minutesToHM(mins) {
    const h = String(Math.floor(mins / 60)).padStart(2, '0');
    const m = String(mins % 60).padStart(2, '0');
    return `${h}:${m}`;
}
const today = new Date();
dateEl.min = toYMD(today);

dateEl.addEventListener('change', () => {
    const hasDate = !!dateEl.value;
    timeFrom.disabled = !hasDate;
    timeTo.disabled = !hasDate;

    timeFrom.value = '';
    timeTo.value = '';

    if (!hasDate) {
        timeFrom.removeAttribute('min');
        timeTo.removeAttribute('min');
        return;
    }
    const selectedIsToday = dateEl.value === toYMD(new Date());
    if (selectedIsToday) {
        const now = new Date();
        const minStr = roundUpHMto15(toHM(now));
        timeFrom.min = minStr;
        timeTo.min = minStr;
    } else {
        timeFrom.min = '00:00';
        timeTo.min = '00:00';
    }
});
timeFrom.addEventListener('input', () => {
    if (!timeFrom.value) return;

    const minFrom = timeFrom.min || '00:00';
    if (hmToMinutes(timeFrom.value) < hmToMinutes(minFrom)) {
        timeFrom.value = minFrom;
    }
    timeFrom.value = roundUpHMto15(timeFrom.value);

    const minTo = minutesToHM(hmToMinutes(timeFrom.value) + 30);
    timeTo.min = minTo;
    if (timeTo.value) {
        timeTo.value = lockEndTo30Grid(timeFrom.value, timeTo.value);
    }
});
timeTo.addEventListener('input', () => {
    if (!timeTo.value || !timeFrom.value) return;
    timeTo.value = lockEndTo30Grid(timeFrom.value, timeTo.value);
});

const  addEquip = document.getElementById('addEquipment');
const equipBox = document.getElementById('equipmentBox');
addEquip.addEventListener('change', () => {
    equipBox.hidden = !addEquip.checked;
});