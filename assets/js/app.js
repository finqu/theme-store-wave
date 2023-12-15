import { Collapse, Dropdown, Popover, Tooltip } from 'bootstrap';
import 'intersection-observer';
import * as utils from './components/utils';
import Handlebars from './components/hbs';
import Cart from './components/cart';
import common from './components/common';
import SVGInject from '@iconfu/svg-inject';
import LazyLoad from 'vanilla-lazyload';
import AOS from 'aos';

export default class App {

	constructor() {

		if (('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0)) {
            document.body.classList.add('is-ios');
        }

		this.store = store || {};
		this.utils = utils;
		this.hbs = Handlebars;
		this.cart = new Cart();

		this.lazyLoad = new LazyLoad({
            show_while_loading: true,
            callback_error: (el) => {
            	el.src = this.store.placeholderSvgs['image'];
            	el.classList.add('svg-placeholder');
            }
        });

        this.SVGInject = SVGInject;
        this.SVGInject.setOptions({
			useCache: true,
			copyAttributes: true,
			makeIdsUnique: false,
			afterInject: (img, svg) => {

				svg.removeAttribute('width');
				svg.removeAttribute('height');

				svg.classList.remove('svg-inline');
				svg.classList.add('svg-icon');
			}
	    });

		if (this.store.accessibility.showAnimations && this.store.designMode !== 'edit') {
			this.aos = AOS;
			this.aos.init({
				disable: false,
                startEvent: 'load',
                initClassName: false,
                animatedClassName: 'animate__animated',
                useClassNames: true,
                disableMutationObserver: false,
                debounceDelay: 50,
                throttleDelay: 99,
                offset: 50,
                delay: 0,
                duration: 600,
                easing: 'ease',
                once: true,
                mirror: false
			});
		}

	    window.theme = this;
		window.themeApp = this; // Deprecated

	    document.dispatchEvent(new CustomEvent('theme:ready', {
	    	detail: this
	    }));

        common.init();
	}
}