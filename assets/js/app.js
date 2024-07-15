import { Collapse, Dropdown, Popover, Tooltip, Modal } from 'bootstrap';
import * as utils from './components/utils';
import Renderer from './components/renderer';
import Cart from './components/cart';
import CookiePolicy from './components/cookie-policy';
import common from './components/common';
import editor from './components/editor';
import Slider from './components/slider';
import Gallery from './components/gallery';
import Masonry from 'masonry-layout';
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
		this.cookiePolicy = new CookiePolicy();
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
				use_native: this.store.designMode !== 'edit' ? true : false,
				callback_error: (el) => {
					if (el.tagName === 'IMG') {

						el.src = 'data:image/svg+xml;base64,' + this.store.placeholderSvgs['image'];
						el.classList.add('svg-placeholder');

						if (el.hasAttribute('srcset')) {
							el.removeAttribute('srcset');
						}

						if (el.hasAttribute('data-srcset')) {
							el.removeAttribute('data-srcset');
						}

						if (el.hasAttribute('data-src')) {
							el.removeAttribute('data-src');
						}

						[...el.parentNode.children].forEach((siblingEl) => {
							if (siblingEl.tagName === 'SOURCE') {
								siblingEl.remove();
							}
						});
					}
				}
			}),
			new LazyLoad({
				elements_selector: '[data-bg-multi].lazy, [data-bg-multi-hidpi].lazy, [data-bg-set].lazy'
			})
		];

		this.lazyLoad = {
			call: (fs, ...args) => this.lazyLoadInstances.forEach((instance) => instance[fs](...args)),
			load: (el, ...args) => LazyLoad.load(el, ...args),
			resetStatus: (el) => LazyLoad.resetStatus(el)
		};

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

		this.masonry = Masonry;

		if (this.store.accessibility.showAnimations && this.store.designMode !== 'edit') {
			this.aos = AOS;
			this.aos.init({
				disable: () => !document.body.classList.contains('animations-enabled'),
                startEvent: 'DOMContentLoaded',
                initClassName: false,
                animatedClassName: 'animation-animated',
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

		document.addEventListener('theme:tooltip:init', e => {
			Array.isArray(e.detail.el) || e.detail.el instanceof NodeList ? e.detail.el.forEach(el => new Tooltip(el)) : new Tooltip(e.detail.el);
		});

		document.addEventListener('theme:popover:init', e => {
			Array.isArray(e.detail.el) || e.detail.el instanceof NodeList ? e.detail.el.forEach(el => new Popover(el)) : new Popover(e.detail.el);
        });

		document.addEventListener('theme:slider:init', e => {
			Array.isArray(e.detail.el) || e.detail.el instanceof NodeList ? e.detail.el.forEach(el => new Slider(el)) : new Slider(e.detail.el);
        });

        document.addEventListener('theme:gallery:init', e => {
			Array.isArray(e.detail.el) || e.detail.el instanceof NodeList ? e.detail.el.forEach(el => new Gallery(el)) : new Gallery(e.detail.el);
        });

        document.addEventListener('theme:masonry:init', e => {

			if (Array.isArray(e.detail.el) || e.detail.el instanceof NodeList) {

				e.detail.el.forEach(el => new Masonry(el, Object.assign({
					percentPosition: true
				}, el.dataset || {})));

			} else {

				new Masonry(e.detail.el, Object.assign({
					percentPosition: true
				}, e.detail.el.dataset || {}));
			}
        });

		const bodyObserver = new MutationObserver((mutations) => {

			for (const { addedNodes } of mutations) {

				for (const node of addedNodes) {

					if (node.tagName && node.nodeType === 1) {

						const componentsToInit = [
							{
								name: 'tooltip',
								selector: node.querySelectorAll('[data-bs-toggle="tooltip"]')
							},
							{
								name: 'popover',
								selector: node.querySelectorAll('[data-bs-toggle="popover"]')
							},
							{
								name: 'slider',
								selector: node.querySelectorAll('.swiper.swiper-standalone')
							},
							{
								name: 'gallery',
								selector: node.querySelectorAll('.gallery')
							},
							{
								name: 'masonry',
								selector: node.querySelectorAll('.masonry') 
							}
						];
			
						componentsToInit.forEach((component) => {
							if (component.selector.length) {
								theme.utils.initComponent(component.name, component.selector);
							}
						});

						for (const el of node.querySelectorAll('img, [data-bg-multi], [data-bg-multi-hidpi], [data-bg-set]')) {

				        	if (el.classList.contains('svg-inline')) {

				        		this.SVGInject(el);

				        	} else {

				        		if (el.classList.contains('lazy')) {
				        			this.lazyLoad.call('update');
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

		if (theme.store.designMode === 'edit') {

			editor.init();

		} else {

			const componentsToInit = [
				{
					name: 'tooltip',
					selector: document.querySelectorAll('[data-bs-toggle="tooltip"]')
				},
				{
					name: 'popover',
					selector: document.querySelectorAll('[data-bs-toggle="popover"]')
				},
				{
					name: 'slider',
					selector: document.querySelectorAll('.swiper.swiper-standalone')
				},
				{
					name: 'gallery',
					selector: document.querySelectorAll('.gallery')
				},
				{
					name: 'masonry',
					selector: document.querySelectorAll('.masonry') 
				}
			];

			componentsToInit.forEach((component) => {
				if (component.selector.length) {
					theme.utils.initComponent(component.name, component.selector);
				}
			});
		}

	    document.dispatchEvent(new CustomEvent('theme:ready', {
	    	detail: this
	    }));

        common.init();
	}
}