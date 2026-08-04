document.addEventListener('DOMContentLoaded', () => {
    // Form Elements
    const form = document.getElementById('calculator-form');
    const ageInput = document.getElementById('age');
    const weightInput = document.getElementById('weight');
    const weightSuffix = document.getElementById('weight-suffix');
    
    // Height Inputs
    const heightImperialContainer = document.getElementById('height-imperial-inputs');
    const heightMetricContainer = document.getElementById('height-metric-inputs');
    const heightFtInput = document.getElementById('height-ft-val');
    const heightInInput = document.getElementById('height-in-val');
    const heightCmInput = document.getElementById('height-cm-val');
    
    // Activity Select
    const activitySelect = document.getElementById('activity');
    
    // Error & Results Containers
    const errorMessage = document.getElementById('error-message');
    const resultsSection = document.getElementById('results');
    
    // Results Values
    const bmrValue = document.getElementById('bmr-value');
    const tdeeValue = document.getElementById('tdee-value');
    const targetMildLoss = document.getElementById('target-mild-loss');
    const targetLoss = document.getElementById('target-loss');
    const targetExtremeLoss = document.getElementById('target-extreme-loss');
    const targetGain = document.getElementById('target-gain');

    // Unit Toggles Logic
    const weightRadios = document.querySelectorAll('input[name="weight-unit"]');
    weightRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'lbs') {
                weightSuffix.textContent = 'lbs';
                weightInput.placeholder = 'e.g. 160';
            } else {
                weightSuffix.textContent = 'kg';
                weightInput.placeholder = 'e.g. 75';
            }
            hideResults();
        });
    });

    const heightRadios = document.querySelectorAll('input[name="height-unit"]');
    heightRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'ft') {
                heightImperialContainer.classList.remove('hidden');
                heightMetricContainer.classList.add('hidden');
            } else {
                heightImperialContainer.classList.add('hidden');
                heightMetricContainer.classList.remove('hidden');
            }
            hideResults();
        });
    });

    // Hide results on input change to prevent outdated data from showing
    const inputsToWatch = [ageInput, weightInput, heightFtInput, heightInInput, heightCmInput, activitySelect];
    inputsToWatch.forEach(input => {
        input.addEventListener('input', hideResults);
    });

    const genderRadios = document.querySelectorAll('input[name="gender"]');
    genderRadios.forEach(radio => {
        radio.addEventListener('change', hideResults);
    });

    function hideResults() {
        resultsSection.classList.add('hidden');
        errorMessage.classList.add('hidden');
    }

    function showError(msg) {
        errorMessage.textContent = msg;
        errorMessage.classList.remove('hidden');
        resultsSection.classList.add('hidden');
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // 1. Get Values
        const gender = document.querySelector('input[name="gender"]:checked').value;
        const weightUnit = document.querySelector('input[name="weight-unit"]:checked').value;
        const heightUnit = document.querySelector('input[name="height-unit"]:checked').value;
        const activity = activitySelect.value;
        
        const age = parseInt(ageInput.value, 10);
        const weight = parseFloat(weightInput.value);
        
        // 2. Validate
        if (isNaN(age) || age <= 0 || age > 120) {
            return showError('Please enter a valid age between 1 and 120.');
        }
        if (isNaN(weight) || weight <= 0) {
            return showError('Please enter a valid weight.');
        }

        // 3. Convert Weight to kg (Mifflin-St Jeor requires metric)
        let weightInKg = weight;
        if (weightUnit === 'lbs') {
            weightInKg = weight * 0.453592;
        }

        // 4. Convert Height to cm
        let heightInCm = 0;
        if (heightUnit === 'cm') {
            heightInCm = parseFloat(heightCmInput.value);
            if (isNaN(heightInCm) || heightInCm <= 0) {
                return showError('Please enter a valid height in cm.');
            }
        } else {
            const ft = parseInt(heightFtInput.value, 10) || 0;
            const inch = parseInt(heightInInput.value, 10) || 0;
            
            if (ft <= 0 && inch <= 0) {
                return showError('Please enter a valid height in feet and inches.');
            }
            heightInCm = (ft * 12 + inch) * 2.54;
        }

        // 5. Calculate BMR (Mifflin-St Jeor)
        let bmr = (10 * weightInKg) + (6.25 * heightInCm) - (5 * age);
        if (gender === 'male') {
            bmr += 5;
        } else {
            bmr -= 161;
        }

        // 6. Calculate TDEE
        const multipliers = {
            sedentary: 1.2,
            light: 1.375,
            moderate: 1.55,
            active: 1.725,
            very_active: 1.9
        };
        const tdee = bmr * multipliers[activity];

        // 7. Display Results
        errorMessage.classList.add('hidden');
        resultsSection.classList.remove('hidden');

        bmrValue.textContent = Math.round(bmr).toLocaleString();
        tdeeValue.textContent = Math.round(tdee).toLocaleString();
        
        const mildLossVal = Math.round(tdee - 250);
        const lossVal = Math.round(tdee - 500);
        const extremeLossVal = Math.round(tdee - 1000);
        const gainVal = Math.round(tdee + 250);

        targetMildLoss.textContent = mildLossVal.toLocaleString();
        targetLoss.textContent = lossVal.toLocaleString();
        targetExtremeLoss.textContent = extremeLossVal.toLocaleString();
        targetGain.textContent = gainVal.toLocaleString();

        // Add safety warnings if calories are too low
        const minCals = gender === 'female' ? 1200 : 1500;
        [targetLoss, targetExtremeLoss].forEach(el => {
            const val = parseInt(el.textContent.replace(/,/g, ''));
            const warningId = `${el.id}-warning`;
            let warningEl = document.getElementById(warningId);
            
            if (val < minCals) {
                if (!warningEl) {
                    warningEl = document.createElement('span');
                    warningEl.id = warningId;
                    warningEl.className = 'warning-text';
                    warningEl.textContent = 'Below recommended minimum';
                    el.parentNode.appendChild(warningEl);
                }
            } else if (warningEl) {
                warningEl.remove();
            }
        });
        
        // Scroll to results smoothly
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
});