export default function() {
    
    const containerEl = document.querySelector('.section-account-edit');
    const countrySelectEl = containerEl.querySelector('#edit-account-country');
    const regionSelectEl = containerEl.querySelector('#edit-account-region');
    const regionContainerEl = containerEl.querySelector('#edit-account-region-container');

    if (countrySelectEl && regionSelectEl && regionContainerEl) {

        countrySelectEl.addEventListener('change', () => {

            const selectedOption = countrySelectEl.options[countrySelectEl.selectedIndex];
            const regions = JSON.parse(selectedOption.getAttribute('data-regions') || '[]');
            const defaultValue = regionSelectEl.getAttribute('data-value');

            regionSelectEl.innerHTML = '';

            if (regions.length > 0) {

                regions.forEach(region => {

                    const option = document.createElement('option');

                    option.value = region[0];
                    option.textContent = region[1];

                    if (defaultValue && defaultValue === region[0]) {
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

        const defaultValue = countrySelectEl.getAttribute('data-value');

        if (defaultValue) {
            countrySelectEl.value = defaultValue;
        }

        countrySelectEl.dispatchEvent(new Event('change'));
    }
}
