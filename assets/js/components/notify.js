import AWN from 'awesome-notifications';
import { extend } from './utils';

export default class Notify {

    constructor() {

        this.opts = {
            position: 'top-right',
            maxNotifications: 5,
            animationDuration: 400,
            durations: {
                global: 5000,
                tip: 5000,
                info: 5000,
                success: 5000,
                warning: 5000,
                alert: 5000,
            },
            icons: {
                enabled: false
            }
        };

        this.awn = new AWN(this.opts)
    }

    tip(title = null, message = null, icon = null, onclick = null, opts = {}) {

        let settings = {};

        extend(true, settings, {
            labels: {
                tip: ''
            }
        }, opts);

        const template = `
            ${title ? `
                <span class="d-block h5 mb-0">
                    ${title}
                </span>
            ` : '' }
            ${message ? `
                <p class="mb-0${title ? ' mt-3' : '' }">
                    ${message}
                </p>
            ` : '' }
        `;

        const el = this.awn.tip(template, settings);

        if (typeof onclick === 'function') {
            el.addEventListener('click', onclick);
        }

        return el;
    }

    info(title = null, message = null, icon = null, onclick = null, opts = {}) {

        let settings = {};

        extend(true, settings, {
            labels: {
                info: ''
            }
        }, opts);

        const template = `
            ${title ? `
                <span class="d-block h5 mb-0">
                    ${title}
                </span>
            ` : '' }
            ${message ? `
                <p class="mb-0${title ? ' mt-3' : '' }">
                    ${message}
                </p>
            ` : '' }
        `;

        const el = this.awn.info(template, settings);

        if (typeof onclick === 'function') {
            el.addEventListener('click', onclick);
        }

        return el;
    }

    warning(title = null, message = null, icon = null, onclick = null, opts = {}) {

        let settings = {};

        extend(true, settings, {
            labels: {
                warning: ''
            }
        }, opts);

        const template = `
            ${title ? `
                <span class="d-block h5 mb-0">
                    ${title}
                </span>
            ` : '' }
            ${message ? `
                <p class="mb-0${title ? ' mt-3' : '' }">
                    ${message}
                </p>
            ` : '' }
        `;

        const el = this.awn.warning(template, settings);

        if (typeof onclick === 'function') {
            el.addEventListener('click', onclick);
        }

        return el;
    }

    success(title = null, message = null, icon = null, onclick = null, opts = {}) {

        let settings = {};

        extend(true, settings, {
            labels: {
                success: ''
            }
        }, opts);

        const template = `
            ${title ? `
                <span class="d-block h5 mb-0">
                    ${title}
                </span>
            ` : '' }
            ${message ? `
                <p class="mb-0${title ? ' mt-3' : '' }">
                    ${message}
                </p>
            ` : '' }
        `;

        const el = this.awn.success(template, settings);

        if (typeof onclick === 'function') {
            el.addEventListener('click', onclick);
        }

        return el;
    }

    alert(title = null, message = null, icon = null, onclick = null, opts = {}) {

        let settings = {};

        extend(true, settings, {
            labels: {
                alert: ''
            }
        }, opts);

        const template = `
            ${title ? `
                <span class="d-block h5 mb-0">
                    ${title}
                </span>
            ` : '' }
            ${message ? `
                <p class="mb-0${title ? ' mt-3' : '' }">
                    ${message}
                </p>
            ` : '' }
        `;

        const el = this.awn.alert(template, settings);

        if (typeof onclick === 'function') {
            el.addEventListener('click', onclick);
        }

        return el;
    }

    async(promise, contentResolve = '', contentReject = '', contentLoading = '') {
        return this.awn.async(promise, contentResolve, contentReject, contentLoading);
    }

    modal(content = null, size = 'modal-tiny', opts = {}) {
        return this.awn.modal(content, size, opts);
    }

    confirm(title = null, message = null, confirmCb = false, cancelCb =  false, opts = {}) {

        let settings = {};

        extend(true, settings, {
            labels: {
                confirm: title
            }
        }, opts);

        return this.awn.confirm(message, confirmCb, cancelCb, opts)
    }

    asyncBlock(promise, contentResolve = '', contentReject = '', contentLoading = '') {
        return this.awn.asyncBlock(promise, contentResolve, contentReject, contentLoading);
    }
}