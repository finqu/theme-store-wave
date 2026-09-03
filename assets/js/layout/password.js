export default function() {
    
    const containerEl = document.querySelector('.section-password');

    if (!containerEl) {
        return;
    }

    const passwordOverlayContainerEl = containerEl.querySelector('.password-overlay-container')
        || document.querySelector('.password-overlay-container');
    const passwordOverlayActionShowEl = containerEl.querySelector('#password-overlay-action-show');
    const passwordOverlayActionHideEl = containerEl.querySelector('#password-overlay-action-hide')
        || document.querySelector('#password-overlay-action-hide');

    if (passwordOverlayActionShowEl && passwordOverlayContainerEl) {
        passwordOverlayActionShowEl.addEventListener('click', () => {
            passwordOverlayContainerEl.classList.add('active');
        });
    }

    if (passwordOverlayActionHideEl && passwordOverlayContainerEl) {
        passwordOverlayActionHideEl.addEventListener('click', () => {
            passwordOverlayContainerEl.classList.remove('active');
        });
    }
}
