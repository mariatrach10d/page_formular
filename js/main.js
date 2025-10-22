document.addEventListener('DOMContentLoaded', () => {
    const facilityType = document.getElementById('facility_type');
    const facility = document.getElementById('facility');
    const terrain = document.getElementById('terrain');
    const dateEl = document.getElementById('date');
    const timeFrom = document.getElementById('time_from');
    const timeTo = document.getElementById('time_to');
    const addEquip = document.getElementById('addEquipment');
    const equipBox = document.getElementById('equipmentBox');
    const birthEl = document.getElementById('birthDate');
    const ageEl = document.getElementById('age');
    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    const people = document.getElementById('peopleCount');

    const options = {
        gym: ['Gym A', 'Gym B'],
        hall: ['Tennis court','Volleyball court'],
        field: ['Football field', 'Running track']
    };
    const terrains = {
        'Gym A': ['Main hall', 'Small hall'],
        'Gym B': ['Weight area','Stretch zone'],
        'Tennis court': ['Clay court', 'Hard court'],
        'Volleyball court': ['Indoor','Outdoor'],
        'Football field': ['Grass','Artificial turf'],
        'Running track': ['Outdoor track','Indoor track']
    };

    function resetSelect(sel, placeholderText){
        if (!sel) return;
        sel.innerHTML = '';
        const ph = document.createElement('option');
        ph.value = '';
        ph.textContent = placeholderText;
        ph.disabled = true;
        ph.selected = true;
        sel.appendChild(ph);
        sel.disabled = true;
    }
    function fillSelect(sel, items, placeholderText){
        if (!sel) return;
        resetSelect(sel, placeholderText);
        items.forEach(t =>{
            const opt = document.createElement('option');
            opt.value = t;
            opt.textContent = t;
            sel.appendChild(opt);
        });
        sel.disabled = false;
    }

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
    function minutesToHM(mins) {
        const h = String(Math.floor(mins / 60)).padStart(2, '0');
        const m = String(mins % 60).padStart(2, '0');
        return `${h}:${m}`;
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

    if (facilityType && facility && terrain) {
        facilityType.addEventListener('change', () =>{
            const type = facilityType.value;
            const list = options[type] || [];
            fillSelect(facility, list, 'Select facility');
            resetSelect(terrain, 'Select zone');
        });
        facility.addEventListener('change', () =>{
            const fac = facility.value;
            const zones = terrains[fac] || [];
            if (zones.length) fillSelect(terrain, zones, 'Select zone');
            else resetSelect(terrain, 'Select zone');
        });
    }

    const today = new Date();
    if (dateEl) {
        dateEl.min = toYMD(today);
        dateEl.addEventListener('change', () => {
            const hasDate = !!dateEl.value;
            if (timeFrom) timeFrom.disabled = !hasDate;
            if (timeTo) timeTo.disabled = !hasDate;

            if (timeFrom) timeFrom.value = '';
            if (timeTo) timeTo.value = '';

            if (!hasDate) {
                if (timeFrom) timeFrom.removeAttribute('min');
                if (timeTo) timeTo.removeAttribute('min');
                return;
            }
            const selectedIsToday = dateEl.value === toYMD(new Date());
            const minStr = selectedIsToday ? roundUpHMto15(toHM(new Date())) : '00:00';
            if (timeFrom) timeFrom.min = minStr;
            if (timeTo) timeTo.min = minStr;
        });
    }
    if (timeFrom) {
        timeFrom.addEventListener('input', () => {
            if (!timeFrom.value) return;
            const minFrom = timeFrom.min || '00:00';
            if (hmToMinutes(timeFrom.value) < hmToMinutes(minFrom)) {
                timeFrom.value = minFrom;
            }
            timeFrom.value = roundUpHMto15(timeFrom.value);

            if (timeTo) {
                const minTo = minutesToHM(hmToMinutes(timeFrom.value) + 30);
                timeTo.min = minTo;
                if (timeTo.value) {
                    timeTo.value = lockEndTo30Grid(timeFrom.value, timeTo.value);
                }
            }
        });
    }
    if (timeTo) {
        timeTo.addEventListener('input', () => {
            if (!timeTo.value || !timeFrom || !timeFrom.value) return;
            timeTo.value = lockEndTo30Grid(timeFrom.value, timeTo.value);
        });
    }

    if (addEquip && equipBox) {
        addEquip.addEventListener('change', () => {
            equipBox.hidden = !addEquip.checked;
        });
    }

    if (birthEl && ageEl) {
        const maxDOB = toYMD(today);
        const minDOBDate = new Date(today);
        minDOBDate.setFullYear(today.getFullYear() - 110);
        const minDOB = toYMD(minDOBDate);
        birthEl.min = minDOB;
        birthEl.max = maxDOB;

        function recalcAge() {
            const v = birthEl.value;
            if (!v) { ageEl.value = ''; return; }
            const b = new Date(v);
            if (isNaN(b)) { ageEl.value = ''; return; }

            if (v < minDOB || v > maxDOB) {
                birthEl.setCustomValidity(`Date must be between ${minDOB} and ${maxDOB}.`);
                birthEl.reportValidity();
                ageEl.value = '';
                return;
            } else {
                birthEl.setCustomValidity('');
            }

            let age = today.getFullYear() - b.getFullYear();
            const md = today.getMonth() - b.getMonth();
            if (md < 0 || (md === 0 && today.getDate() < b.getDate())) age--;
            if (age < 0) age = 0;
            ageEl.value = age;
        }
        ['input', 'change'].forEach(evt => birthEl.addEventListener(evt, recalcAge));
        if (birthEl.value) recalcAge();
    }
    function lettersOnly(el) {
        el.value = el.value.replace(/[^A-Za-zÀ-žА-Яа-яЁёЇїІіЄєҐґ]/g, '').slice(0, 30);
    }
    [firstName, lastName].forEach(el => {
        if (!el) return;
        el.addEventListener('input', () => lettersOnly(el));
    });
    if (people) {
        people.addEventListener('keydown', e => e.preventDefault());
    }
});
const RATE_PER_30 = 2;
const ONSITE_DEPOSIT_RATE = 0.10;
const GROUP_DISCOUNT = { people: 12, minutes: 180, rate: 0.3 };
const CARD_DISCOUNT_RATE = 0.0;
const ONSITE_SURCHARGE_RATE = 0.10;
const FEMALE_DISCOUNT_RATE = 0.10;

function euro(n) { return (Math.max(0, n)).toFixed(2); }

function getDurationMinutes() {
    const tf = document.getElementById('time_from');
    const tt = document.getElementById('time_to');
    if (!tf || !tt || !tf.value || !tt.value) return 0;
    const [h1, m1] = tf.value.split(':').map(Number);
    const [h2, m2] = tt.value.split(':').map(Number);
    const from = h1 * 60 + m1, to = h2 * 60 + m2;
    return Math.max(0, to - from);
}

function getPeople() {
    const el = document.getElementById('peopleCount');
    const v = parseInt(el?.value ?? '0', 10);
    return Number.isFinite(v) ? Math.min(Math.max(v, 1), 20) : 0;
}

function isFemale() {
    const g = document.querySelector('input[name="gender"]:checked');
    return g && g.value === 'female';
}

function equipmentExtras() {
    let sum = 0;
    document.querySelectorAll('input[name="eq"]:checked').forEach(cb => {
        const p = parseFloat(cb.getAttribute('data-price') || '0');
        sum += p;
    });
    return sum;
}

function calcTotal() {
    const mins = getDurationMinutes();
    const halfHours = Math.ceil(mins / 30);
    const people = getPeople();

    const base = halfHours * people * RATE_PER_30;
    const extras = equipmentExtras();

    let discount = 0;

    if (people >= GROUP_DISCOUNT.people && mins >= GROUP_DISCOUNT.minutes) {
        discount += (base + extras) * GROUP_DISCOUNT.rate;
    }
    if (isFemale()) {
        discount += (base + extras - discount) * FEMALE_DISCOUNT_RATE;
    }

    const subtotal = Math.max(0, base + extras - discount);
    const payMethod = document.querySelector('input[name="payMethod"]:checked')?.value || 'card';
    const splitBox = byId('paymentSplit');

    let total = subtotal;
    let adj = 0;

    if (payMethod === 'card') {
        adj = -subtotal * CARD_DISCOUNT_RATE;
        total = subtotal + adj;
        splitBox.hidden = true;
        byId('depositNow').textContent = '0.00';
        byId('dueOnSite').textContent = '0.00';
    } else {
        adj = subtotal * ONSITE_SURCHARGE_RATE;
        total = subtotal + adj;
        const deposit = total * ONSITE_DEPOSIT_RATE;
        const due = total - deposit;
        splitBox.hidden = false;
        byId('depositNow').textContent = euro(deposit);
        byId('dueOnSite').textContent = euro(due);
    }

    byId('basePrice').textContent = euro(base);
    byId('extrasPrice').textContent = euro(extras);
    byId('discountsPrice').textContent = euro(discount);
    byId('totalPrice').textContent = euro(total);
}

function byId(id) { return document.getElementById(id); }

function hookPricingEvents() {
    const ids = ['time_from', 'time_to', 'peopleCount', 'date', 'firstName', 'lastName'];
    ids.forEach(id => byId(id)?.addEventListener('input', calcTotal));
    document.querySelectorAll('input[name="gender"]').forEach(r => r.addEventListener('change', calcTotal));
    document.querySelectorAll('input[name="eq"]').forEach(cb => cb.addEventListener('change', calcTotal));
    document.querySelectorAll('input[name="payMethod"]').forEach(r => r.addEventListener('change', calcTotal));
}

document.addEventListener('DOMContentLoaded', () => {
    hookPricingEvents();
    calcTotal();
});