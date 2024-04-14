import Countdown from './countdown';

const debounce = function (func, wait, immediate = false) {

	let timeout = null;

	return function () {

		const context = this;
		const args = arguments;
		const later = function () {

			timeout = null;

			if (!immediate) {
				func.apply(context, args);
			}
		};

		let callNow = immediate && !timeout;

		clearTimeout(timeout);

		timeout = setTimeout(later, wait);

		if (callNow) {
			func.apply(context, args);
		}
	};
};

const extend = function () {

    let extended = {};
    let deep = false;
    let i = 0;
    const length = arguments.length;

    if (Object.prototype.toString.call(arguments[0]) === '[object Boolean]') {
        deep = arguments[0];
        i++;
    }

    const merge = (obj) => {

        for (const prop in obj) {

        	if (Object.prototype.hasOwnProperty.call(obj, prop)) {

	            if (deep && Object.prototype.toString.call(obj[prop]) === '[object Object]') {
	                extended[prop] = extend(true, extended[prop], obj[prop]);
	            } else {
	                extended[prop] = obj[prop];
	            }
        	}
        }
    };

    for (; i < length; i++) {
        const obj = arguments[i];
        merge(obj);
    }

    return extended;
};

const t = function (key, vars = {}) {

	let str = theme.store.translations[key];

	if (!str) {

		str = 'Translation '+key+' is not defined.';

	} else {

		const matches = str.match(/{{(.*?)}}/g) || [];

		if (matches.length > 0) {

			for (const index in matches) {

				let varKey = matches[index];

				varKey = varKey.replaceAll('{{', '').replaceAll('}}', '').trim();
				str = str.replace(matches[index], vars[varKey] || '');
			}

			str = str.trim();
		}
	}

    return str;
};

const formatCurrency = function (opts = {}) {

	const settings = Object.assign({
		value: 0,
		style: 'currency',
        currency: theme.store.currency.code,
		minimumFractionDigits: theme.store.currency.decimalPlaces,
		maximumFractionDigits: theme.store.currency.decimalPlaces
	}, opts);

	let number = settings.value;

	if (typeof number === 'string' || number instanceof String) {
		number = number.replace(/[^0-9\.,]+/g, '').trim();
	}

	if (typeof number === 'string' || number instanceof String) {
		number = number.replace(/,/, '.');
	}

    const formatter = Intl.NumberFormat(theme.store.locale, settings);

    let currencySymbolLeft = null;
    let currencySymbolRight = null;
    let currencyGroup = null;
    let currencyDecimal = null;
    const testGroup1 = ['ZAR', 'EUR', 'AUD', 'PLN'];
    const testGroup2 = ['THB', 'TRY', 'GBP', 'BGN', 'JPY', 'USD', 'CAD', 'CNY', 'HKD', 'PHP', 'NZD', 'MYR', 'MXN', 'KRW', 'INR', 'SGD', 'ILS'];
    const testDecimals1 = ['SEK', 'KRW', 'JPY', 'HUF'];
    const testDecimals2 = ['EUR', 'HRK', 'RUB', 'BRL'];

    if (testGroup1.includes(theme.store.currency.code)) {
    	currencyGroup = ' ';
    } else if (testGroup2.includes(theme.store.currency.code)) {
    	currencyGroup = ',';
    } else {
    	currencyGroup = '.';
    }

    if (testDecimals1.includes(theme.store.currency.code)) {
    	currencyDecimal = ' ';
    } else if (testDecimals2.includes(theme.store.currency.code)) {
    	currencyDecimal = ',';
    } else if (theme.store.currency.code === 'CHF') {
    	currencyDecimal = "'";
    } else {
    	currencyDecimal = '.';
    }

    const currencyParts = formatter.formatToParts(parseFloat(number, 10));
    const currencySymbol = currencyParts.find(obj => obj.type === 'currency').value;
    const currencyValue = currencyParts.map(item => {

    	if (item.type === 'literal' || item.type === 'currency') {
    		return;
    	} else if (item.type === 'group') {
    		return currencyGroup;
    	} else if (item.type === 'decimal') {
    		return currencyDecimal;
    	}

    	return item.value;

    }).join('');

    if (theme.store.currency.code === 'USD' || theme.store.currency.code === 'GBP') {
    	currencySymbolLeft = currencySymbol;
    } else {
    	currencySymbolRight = currencySymbol;
    }

    return `${currencySymbolLeft ? currencySymbolLeft+' ' : ''}${currencyValue}${currencySymbolRight ? ' '+currencySymbolRight : ''}`;
};

const formatNumber = function (opts = {}) {

	const settings = Object.assign({
		style: 'decimal',
		value: 0
	}, opts);

	let number = settings.value;

	if (typeof number === 'string' || number instanceof String) {
		number = number.replace(/[^0-9\.,]+/g, '').trim();
	}

	if (typeof number === 'string' || number instanceof String) {
		number = number.replace(/,/, '.');
	}

	return Intl.NumberFormat(theme.store.locale, settings).format(parseFloat(number, 10));
};

const animate = function (el, animation, delay, duration) {

	const prefix = 'animate__';

	return new Promise((resolve, reject) => {

		const node = el && el.nodeType ? el : document.querySelector(el);

		let classes = [
			prefix+'animated',
			prefix+animation
		];

		if (delay) {
			classes.push(prefix+'delay-'+delay);
		}

		if (duration) {
			classes.push(prefix+duration);
		}

		if (node) {

			node.classList.add(...classes);

			function handleAnimationEnd(e) {

				e.stopPropagation();
				node.classList.remove(...classes);

				resolve('Animation ended');
			}

			node.addEventListener('animationend', handleAnimationEnd, {
				once: true
			});

		} else {

			resolve('Element not found');
		}
	});
};

const loadScript = function (src, data = {}, onLoad, onError) {

	return new Promise((resolve, reject) => {

		if (!src) {
			return;
		}

		let script = document.querySelector('script[src="'+src+'"]') || null;

		if (script) {
			script.remove();
		}

	    script = document.createElement('script');

	    script.src = src;

	    if (typeof onLoad === 'function') {
	    	script.onload = onLoad;
		}

		if (typeof onError === 'function') {
	    	script.onerror = onError;
		}

	    if (Object.entries(data).length > 0) {

	    	for (const key of Object.keys(data)) {
				script.dataset[key] = data[key];
			}
	    }

	    document.head.appendChild(script);
	});
};

const generateUuid = function () {

	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = (Math.random() * 16) | 0,
            v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

const filterInput = function (el, filter, defaultVal, cb = null) {

	if (!el || !filter) {
		return false;
	}

    const events = [
    	'change',
        'blur'
    ];

    let oldValue = defaultVal ? defaultVal : el.value;
    let oldSelectionStart = el.selectionStart;
    let oldSelectionEnd = el.selectionEnd;

    events.forEach(function(e) {

        el.addEventListener(e, function() {

            if (filter(this.value)) {

                oldValue = this.value;
                oldSelectionStart = this.selectionStart;
                oldSelectionEnd = this.selectionEnd;

                if (typeof cb === 'function') {
                	cb(true);
                }

            } else if (oldValue) {

                this.value = oldValue;
                this.setSelectionRange(oldSelectionStart, oldSelectionEnd);

                if (typeof cb === 'function') {
                	cb(false);
                }

            } else {

                this.value = '';

                if (typeof cb === 'function') {
                	cb(false);
                }
            }
        });
    });
};

const placeholderSvg = function (data) {

	const type = data.type || 'image';
	let placeholders = null;

	switch(type) {

		case 'category':
			placeholders = [
				'category-1',
				'category-2',
				'category-3',
				'category-4',
				'category-5',
				'category-6',
				'category-7'
			];
			break;

		case 'background':
			placeholders = [
				'background-1',
				'background-2',
				'background-3'
			];
			break;

		case 'product':
			placeholders = [
				'product-1',
				'product-2',
				'product-3',
				'product-4',
				'product-5',
				'product-6',
				'product-7',
				'product-8',
				'product-9',
				'product-10',
				'product-11',
				'product-12'
			];
			break;

		case 'image':
			placeholders = [
				'image'
			];
			break;
	}

	const placeholder = placeholders[Math.floor(Math.random() * placeholders.length)];

	if (data.base64) {

		return 'data:image/svg+xml;base64,'+theme.store.placeholderSvgs[placeholder];

	} else {

		return `<img src="data:image/svg+xml;base64,${theme.store.placeholderSvgs[placeholder]}" class="svg-placeholder${data.class ? ' '+data.class : ''}"${data.width ? ' width="'+data.width+'"' : ''}${data.height ? ' height="'+data.height+'"' : ''} alt="">`;
	}
}

const image = function(data) {

	const url = new URL(data.src);
	const scale = parseInt(data.scale, 10) || 1;
	const sizeArr = data.size.split(',');
	const width = scale * sizeArr[0];
	const height = scale * (sizeArr[1] || sizeArr[0]);

	url.searchParams.set('w', width);
	url.searchParams.set('h', height);

	return url.href;
}

const icon = function(data) {
	return `<img src="${theme.store.routes.assetUrl}/assets/icon/${data.icon}.svg" class="svg-inline svg-lazy${data.class ? ' '+data.class : ''}" alt="">`;
}

const getCssVariable = function(variable = null, el = null) {
	if (!variable) {
		return;
	}

	return getComputedStyle(el || document.documentElement).getPropertyValue(variable);
}

const productGridItemVariantImgSwapper = function (productVariantImgEl) {

	if (!productVariantImgEl.value) {
		return;
	}

	const productCardGridItemEl = productVariantImgEl.closest('.product-card-grid-item');
	const productMediaEl = productCardGridItemEl.querySelector('.product-media');

	const addProductImg = (containerEl, imgUrl) => {

		const productImgEl = containerEl.querySelector('.featured-img');
		const productImgContainerEl = productImgEl.closest('.product-media-img-container');
		const productImgUrl = new URL(productImgEl.getAttribute('src'));

		productImgUrl.search = '';

		const el = document.createElement(productImgContainerEl.nodeName);
		const html = productImgContainerEl.innerHTML.trim().replaceAll(productImgUrl.href, imgUrl);

		el.className = productImgContainerEl.className;
		el.innerHTML = html;

		containerEl.prepend(el);
	};

	const removeProductImg = (containerEl) => {
		containerEl.children[0].remove();
	};

	productVariantImgEl.parentElement.addEventListener('mouseenter', addProductImg.bind(null, productMediaEl, productVariantImgEl.value));
	productVariantImgEl.parentElement.addEventListener('mouseleave', removeProductImg.bind(null, productMediaEl));
};

const cookies = {
	get: (name) => {
		const data = document.cookie.split(';').map(cookie => cookie.split('=')).reduce((accumulator, [key, value]) => ({...accumulator, [key.trim()]: decodeURIComponent(value)}), {});
		return data[name];
	},
	set: (name, value, days = 365) => {
		const date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
	},
	remove: (name) => {
		document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
	}
};

const countdown = function (opts = {}) {
	return new Countdown(opts);
};

const checkVisibility = function (el) {

    if (!(el instanceof Element)) {
		return false;
	}

    const style = getComputedStyle(el);

    if (style.display === 'none') return false;

    if (style.visibility !== 'visible') return false;

    if (style.opacity < 0.1) return false;

    if (el.offsetWidth + el.offsetHeight + el.getBoundingClientRect().height + el.getBoundingClientRect().width === 0) {
        return false;
    }
    const elCenter = {
        x: el.getBoundingClientRect().left + el.offsetWidth / 2,
        y: el.getBoundingClientRect().top + el.offsetHeight / 2
    };

    if (elCenter.x < 0) return false;

    if (elCenter.x > (document.documentElement.clientWidth || window.innerWidth)) return false;

    if (elCenter.y < 0) return false;

    if (elCenter.y > (document.documentElement.clientHeight || window.innerHeight)) return false;

    let pointContainer = document.elementFromPoint(elCenter.x, elCenter.y);

    do {
        if (pointContainer === el) return true;
    } while (pointContainer = pointContainer.parentNode);
	
    return false;
}

export {
	debounce,
	extend,
	t,
	formatCurrency,
	formatNumber,
	animate,
	loadScript,
	generateUuid,
	filterInput,
	placeholderSvg,
	image,
	icon,
	getCssVariable,
	productGridItemVariantImgSwapper,
	cookies,
	countdown,
	checkVisibility
};