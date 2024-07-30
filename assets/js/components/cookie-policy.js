class CookiePolicy {

    constructor(data = {}) {
        this.mode = data.mode || null;
        this.layout = data.layout || null;
        this.consents = data.consents || null;
        this.availableConsents = data.availableConsents || null;
        this.containerEl = null;
        this.formEl = null;
        this.consentCheckInterval = null;
    }

    init() {

        this.mode = theme.store.cookiePolicy.mode;
        this.layout = theme.store.cookiePolicy.layout;
        this.consents = theme.store.cookiePolicy.consents;
        this.availableConsents = theme.store.cookiePolicy.availableConsents;
        this.containerEl = document.querySelector('.cookie-policy');

        if (this.containerEl) {

            const formEl = this.containerEl.querySelector('#cookie-policy-form');

            if (formEl) {
                this.formEl = formEl;
            }
        }

        if (this.mode === null) {

            if (!this.containerEl) {

                this.setConsent('required');
                
            } else {

                this.check();
            }
        }

        this.bindEvents();
    }

    async setConsent(mode) {

        if (!mode) {
            return;
        }

        let formData = null;
        let isDefaultConsent = false;
        let updateConsent = false;

        if (this.formEl) {
            formData = new FormData(this.formEl);
        } else {
            formData = new FormData();
        }
        
        if (mode === 'required' && theme.store.cookiePolicy.mode === null) {
            isDefaultConsent = true;
        }

        if (mode === 'custom' && formData.values() !== theme.store.cookiePolicy.consents) {
            updateConsent = true;
        } else if (mode !== 'custom' && theme.store.cookiePolicy.mode !== mode) {
            updateConsent = true;
        } else if (isDefaultConsent) {
            updateConsent = true;
        }

        if (updateConsent) {

            const consentParamEl = this.formEl ? this.formEl.querySelector('.cookie-policy-consents input') : null;
            const consentParam = consentParamEl ? consentParamEl.name : 'cookie_policy_consents[]';
            const formAction = this.formEl ? this.formEl.action : '/cookie-policy';
            const formMethod = this.formEl ? this.formEl.method : 'POST';

            formData.set('cookie_policy', mode);

            if (mode === 'custom') {

                if (formData.getAll(consentParam).length === 0) {
                    formData.set(consentParam, 'required');
                } else {
                    formData.append(consentParam, 'required');
                }

            } else if (mode === 'required') {

                formData.set(consentParam, 'required');

            } else if (mode === 'all') {

                this.availableConsents.forEach(value => {
                    formData.append(consentParam, value);
                });
            }

            await fetch(formAction, {
                method: formMethod,
                body: formData
            });

            theme.store.cookiePolicy.mode = mode;
            theme.store.cookiePolicy.consents = formData.getAll(consentParam)

            this.mode = mode;
            this.consents = formData.getAll(consentParam);

            document.dispatchEvent(new CustomEvent('theme:cookiePolicy:consentGranted', {
                detail: {
                    consents: this.consents
                }
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

        if ((!this.containerEl || !theme.utils.checkVisibility(this.containerEl)) && theme.store.cookiePolicy.mode === null) {

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

    getMode() {
        return this.mode;
    }

    getLayout() {
        return this.layout;
    }

    getConsents() {
        return this.consents;
    }

    getAvailableConsents() {
        return this.availableConsents;
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