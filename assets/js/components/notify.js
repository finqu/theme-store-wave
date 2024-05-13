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

        this.awn = new AWN(this.opts);
    }

    createTemplate(title, message) {
        return `
            ${title ? `<span class="d-block h5 text-title mb-0">${title}</span>` : ''}
            ${message ? `<p class="mb-0${title ? ' mt-3' : ''}">${message}</p>` : ''}
        `;
    }

    createNotification(type, title, message, onClick, opts) {
        const settings = {
            labels: {
                [type]: ''
            }
        };

        extend(true, settings, opts);

        const template = this.createTemplate(title, message);
        const el = this.awn[type](template, settings);

        if (typeof onClick === 'function') {
            el.addEventListener('click', onClick);
        }

        return el;
    }

    tip(title = null, message = null, onClick = null, opts = {}) {
        return this.createNotification('tip', title, message, onClick, opts);
    }

    info(title = null, message = null, onClick = null, opts = {}) {
        return this.createNotification('info', title, message, onClick, opts);
    }

    warning(title = null, message = null, onClick = null, opts = {}) {
        return this.createNotification('warning', title, message, onClick, opts);
    }

    success(title = null, message = null, onClick = null, opts = {}) {
        return this.createNotification('success', title, message, onClick, opts);
    }

    alert(title = null, message = null, onClick = null, opts = {}) {
        return this.createNotification('alert', title, message, onClick, opts);
    }

    async(promise, contentResolve = '', contentReject = '', contentLoading = '') {
        return this.awn.async(promise, contentResolve, contentReject, contentLoading);
    }

    modal(content = null, size = 'modal-tiny', opts = {}) {
        return this.awn.modal(content, size, opts);
    }

    confirm(title = null, message = null, confirmCb = false, cancelCb = false, opts = {}) {
        const settings = {
            labels: {
                confirm: title
            }
        };

        extend(true, settings, opts);

        return this.awn.confirm(message, confirmCb, cancelCb, opts);
    }

    asyncBlock(promise, contentResolve = '', contentReject = '', contentLoading = '') {
        return this.awn.asyncBlock(promise, contentResolve, contentReject, contentLoading);
    }
}