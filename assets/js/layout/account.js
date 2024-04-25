export default function() {
    
    const containerEl = document.querySelector('.section-account');
    const localizationFormEl = containerEl.querySelector('#account-localization-form');
    const accountCurrencyEl = containerEl.querySelector('#edit-account-currency');
    const accountLocaleEl = containerEl.querySelector('#edit-account-locale');

    const submitFormHandler = () => {
        localizationFormEl.submit();
    };

    if (accountCurrencyEl) {
        accountCurrencyEl.addEventListener('change', submitFormHandler);
    }

    if (accountLocaleEl) {
        accountLocaleEl.addEventListener('change', submitFormHandler);
    }
}
