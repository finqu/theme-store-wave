class CookiePolicy {

    constructor() {
        this.consent = null;
        this.containerEl = null;
        this.formEl = null;
        this.consentCheckInterval = null;
    }

    init() {

        this.consent = theme.store.cookiePolicy.status;
        this.containerEl = document.querySelector('.cookie-policy');
        this.formEl = this.containerEl ? this.containerEl.querySelector('#cookie-policy-form') : null;

        if (this.consent === null) {

            if (!this.containerEl) {

                this.setConsent('required');
                
            } else {

                this.check();
            }
        }

        this.bindEvents();
    }

    async setConsent(value) {

        if (!value) {
            return;
        }

        let isDefaultConsent = false;
        let updateConsent = false;
        
        if (value === 'required' && theme.store.cookiePolicy.status === null) {
            isDefaultConsent = true;
        }

        const formData = this.formEl ? new FormData(this.formEl) : null;
        const consentParamEl = this.formEl ? this.formEl.querySelector('.cookie-policy-consents input') : null;
        const consentParam = consentParamEl ? consentParamEl.name : null;

        if (consentParam) {
            formData.append(consentParam, 'required');
        }

        if (formData) {

            if (value === 'custom' && formData.values() !== theme.store.cookiePolicy.consents) {
                updateConsent = true;
            } else if (value !== 'custom' && theme.store.cookiePolicy.status !== value) {
                updateConsent = true;
            } else if (isDefaultConsent) {
                updateConsent = true;
            }
        }

        if (updateConsent) {

            formData.set('cookie_policy', value);

            if (consentParam && value === 'required') {
                formData.set(consentParam, 'required');
            }

            await fetch(this.formEl.action, {
                method: this.formEl.method,
                body: formData
            });

            theme.store.cookiePolicy.status = value;

            if (consentParam) {
                theme.store.cookiePolicy.consents = formData.getAll(consentParam);
            }

            this.consent = value;

            document.dispatchEvent(new CustomEvent('theme:cookiePolicy:consentGranted', {
                detail: this.consent
            }));

            if (!isDefaultConsent) {
                setTimeout(() => {
                    location.reload()
                }, 200);
            }
            
        } else {

            document.dispatchEvent(new CustomEvent('theme:cookiePolicy:consentRequested'));
        }

        this.hide();
    }

    async check() {

        if ((!this.containerEl || !theme.utils.checkVisibility(this.containerEl)) && theme.store.cookiePolicy.status === null) {

            if (this.consentCheckInterval !== null) {
                clearInterval(this.consentCheckInterval);
            }

            await this.setConsent('required');

            return;

        } else if (this.consentCheckInterval && theme.utils.checkVisibility(this.containerEl)) {

            clearInterval(this.consentCheckInterval);

            return;
        }

        if (this.consentCheckInterval === null) {
            this.consentCheckInterval = setInterval(this.check.bind(this), 1000);
        }
    }

    show() {
        
        if (document.body.classList.contains('cookie-policy-visible')) {
            return;
        }

        if (this.containerEl && this.containerEl.classList.contains('d-none')) {
            this.containerEl.classList.remove('d-none');
        }

        document.body.classList.add('cookie-policy-visible');

        if (theme.store.cookiePolicy.position === 'middle' && !document.body.classList.contains('disable-scroll')) {
            document.body.classList.add('disable-scroll');
        }
    }

    hide() {

        if (document.body.classList.contains('cookie-policy-visible')) {
            document.body.classList.remove('cookie-policy-visible');
        }

        if (this.containerEl && !this.containerEl.classList.contains('d-none')) {
            this.containerEl.classList.add('d-none');
        }

        if (theme.store.cookiePolicy.position === 'middle' && document.body.classList.contains('disable-scroll')) {
            document.body.classList.remove('disable-scroll');
        }
    }

    bindEvents() {

        const getTargetEl = (selector, e) => {
            return e.target.matches(selector) ? e.target : e.target.closest(selector);
        };

        const actionHandler = (e) => {

            if (getTargetEl('[data-cookie-policy-hide]', e)) {
                return this.hide();
            }

            if (getTargetEl('[data-cookie-policy-show]', e)) {
                return this.show();
            }

            if (getTargetEl('[data-cookie-policy-apply]', e)) {
                return this.setConsent(e.target?.value ? e.target.value : 'required');
            }
        };

        document.addEventListener('click', actionHandler);

        document.addEventListener('theme:cookiePolicy:setConsent', e => this.setConsent(e.detail.value).bind(this));

        document.addEventListener('theme:cookiePolicy:check', this.check.bind(this));

        document.addEventListener('theme:cookiePolicy:show', this.show.bind(this));
        
        document.addEventListener('theme:cookiePolicy:hide', this.hide.bind(this));
    }
}

export default CookiePolicy;