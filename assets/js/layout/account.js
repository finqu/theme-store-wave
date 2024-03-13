export default function() {
    
    const containerEl = document.querySelector('.section-account');
    const localizationFormEl = containerEl.querySelector('#account-localization-form');
    const accountCurrencyEl = containerEl.querySelector('#edit-account-currency');
    const accountLocaleEl = containerEl.querySelector('#edit-account-locale');

    if (accountCurrencyEl) {
        accountCurrencyEl.addEventListener('change', () => {
            localizationFormEl.submit();
        });
    }

    if (accountLocaleEl) {
        accountLocaleEl.addEventListener('change', ( )=> {
            localizationFormEl.submit();
        });
    }
}