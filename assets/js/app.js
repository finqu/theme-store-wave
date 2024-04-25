import { Collapse, Dropdown, Popover, Tooltip, Modal } from 'bootstrap';
import * as utils from './components/utils';
import Renderer from './components/renderer';
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

		this.store = window.store || {};
		this.utils = utils;
		this.renderer = new Renderer();
		this.cart = new Cart(this.store.cart?.data || {});
		this.bs = {
			Collapse: Collapse,
			Dropdown: Dropdown,
			Popover: Popover,
			Tooltip: Tooltip,
			Modal: Modal
		};

		this.lazyLoadInstances = [
			new LazyLoad({
				elements_selector: 'img.lazy, iframe.lazy, video.lazy',
				use_native: true,
				callback_error: (el) => {
					if (el.tagName === 'IMG') {
						el.src = this.store.placeholderSvgs['image'];
						el.classList.add('svg-placeholder');
					}
				}
			}),
			new LazyLoad({
				elements_selector: '[data-bg-multi].lazy, [data-bg-multi-hidpi].lazy, [data-bg-set].lazy'
			})
		];

		this.lazyLoad = (fs, ...args) => this.lazyLoadInstances.forEach((instance) => instance[fs](...args));

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
				disable: () => !document.body.classList.contains('animations-enabled'),
                startEvent: 'DOMContentLoaded',
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

		const bodyObserver = new MutationObserver((mutations) => {

			for (const { addedNodes } of mutations) {

				for (const node of addedNodes) {

					if (node.tagName && node.nodeType === 1) {

						for (const el of node.querySelectorAll('[data-bs-toggle="tooltip"]')) {
							new Tooltip(el);
						}

						for (const el of node.querySelectorAll('[data-bs-toggle="popover"]')) {
							new Popover(el);
						}

						for (const el of node.querySelectorAll('img, [data-bg-multi], [data-bg-multi-hidpi], [data-bg-set]')) {

				        	if (el.classList.contains('svg-inline')) {

				        		this.SVGInject(el);

				        	} else {

				        		if (el.classList.contains('lazy')) {
				        			this.lazyLoad('update');
				        		}
					        }
				        }

						for (const el of node.querySelectorAll('.product-card-grid-item input[name="product-variant-img"]')) {
							this.utils.productGridItemVariantImgSwapper(el);
						};
					}
			    }
			}
		});

		bodyObserver.observe(document.body, {
			childList: true,
			subtree: true
		});

		for (const el of document.querySelectorAll('img')) {
        	if (el.classList.contains('svg-inline')) {
        		this.SVGInject(el);
        	}
        }

		[...document.querySelectorAll('[data-bs-toggle="tooltip"]')].map(tooltipEl => new Tooltip(tooltipEl));
		[...document.querySelectorAll('[data-bs-toggle="popover"]')].map(popoverEl => new Popover(popoverEl));

	    document.dispatchEvent(new CustomEvent('theme:ready', {
	    	detail: this
	    }));

        common.init();
	}
}