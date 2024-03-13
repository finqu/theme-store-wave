export default function() {
    
    const containerEl = document.querySelector('.section-register');
    const registerCtaEl = containerEl.querySelector('#register-cta');
    const checkInputEls = containerEl.querySelectorAll('.form-check-input');
    
    checkInputEls.forEach(el => { el.addEventListener('change', () => {

        if (Array.from(checkInputEls).every(el => el.checked)) {
            registerCtaEl.disabled = false;
        } else {
            registerCtaEl.disabled = true;
        }
    })});
}