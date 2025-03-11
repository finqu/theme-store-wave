export default function() {
    
    const containerEl = document.querySelector('.section-register');
    const registerCtaEl = containerEl.querySelector('#register-cta');
    const checkInputEls = containerEl.querySelectorAll('.form-check-input-required');
    
    if (registerCtaEl && checkInputEls.length > 0) {
        checkInputEls.forEach(el => { el.addEventListener('change', () => {

            if ([...checkInputEls].every(inputEl => inputEl.checked)) {
                registerCtaEl.disabled = false;
            } else {
                registerCtaEl.disabled = true;
            }
        })});
    }

    const countrySelectEl = containerEl.querySelector('#register-country');
    const regionSelectEl = containerEl.querySelector('#register-region');
    const regionContainerEl = containerEl.querySelector('#register-region-container');

    if (countrySelectEl && regionSelectEl && regionContainerEl) {

        countrySelectEl.addEventListener('change', () => {

            const selectedOption = countrySelectEl.options[countrySelectEl.selectedIndex];
            const regions = JSON.parse(selectedOption.getAttribute('data-regions') || '[]');
            const submittedValue = regionSelectEl.getAttribute('data-value');

            regionSelectEl.innerHTML = '';

            if (regions.length > 0) {

                regions.forEach(region => {

                    const option = document.createElement('option');

                    option.value = region[0];
                    option.textContent = region[1];

                    if (submittedValue && submittedValue === region[0]) {
                        option.selected = true;
                    }

                    regionSelectEl.appendChild(option);
                });

                regionContainerEl.classList.remove('d-none');

            } else {

                regionContainerEl.classList.add('d-none');
            }
        });
    }

    if (countrySelectEl) {

        const submittedValue = countrySelectEl.getAttribute('data-value');

        if (submittedValue) {
            countrySelectEl.value = submittedValue;
        }

        countrySelectEl.dispatchEvent(new Event('change'));
    }
}