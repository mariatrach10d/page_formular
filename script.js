const facilityType = document.getElementById('facility_type');
const facility = document.getElementById('facility');
const options = {
    gym:['Gym A', 'Gym B'],
    hall:['Tennis court','Volleyball court'],
    field:['Football field', 'Running track']
};
facilityType.addEventListener('change',() =>{
    const selected = facilityType.value;
    facility.innerHTML = '';
    if (options[selected]){
        options[selected].forEach(item => {
            const opt = document.createElement('option');
            opt.textContent = item;
            facility.appendChild(opt);
        });
    }else{
        const opt = document.createElement('option');
        opt.textContent = 'Select facility';
        facility.appendChild(opt);
    }
})
document.getElementById('date').addEventListener('change',function(){
    const timeSelect = document.getElementById('time');
    timeSelect.disabled = !this.value;
});
flatpickr("#date", {
    enableTime: false,
    dateFormat: "Y-m-d"
});
flatpickr("#time",{
    enableTime: true,
    noCalendar :true,
    dateFormat: "H:i"
});