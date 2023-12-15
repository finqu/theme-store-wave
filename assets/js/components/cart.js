import Notify from './notify';

export default class Cart {

    constructor() {

        this.cart = {};
        this.items = {};
        this.queue = [];
        this.processing = false;
        this.initialized = false;
        this.notify = new Notify();
        this.cartTemplateEl = document.querySelector('#hbs-cart-template');
        this.cartMiniTemplateEl = document.querySelector('#hbs-cart-mini-template');
        this.cartOffcanvasTemplateEl = document.querySelector('#hbs-cart-offcanvas-template');
        this.cartTemplate = null;
        this.cartMiniTemplate = null;
        this.cartOffcanvasTemplate = null;
        this.cache = {};
    }

    init() {

        if (this.cartTemplateEl) {
            this.cartTemplate = theme.hbs.compile(this.cartTemplateEl.innerHTML);
        }

        if (this.cartMiniTemplateEl) {
            this.cartMiniTemplate = theme.hbs.compile(this.cartMiniTemplateEl.innerHTML);
        }

        if (this.cartOffcanvasTemplateEl) {
            this.cartOffcanvasTemplate = theme.hbs.compile(this.cartOffcanvasTemplateEl.innerHTML);
        }

        this.bindEvents();
        this.getCart();
    }

    bindEvents() {

        let isInitialRender = true;

        const add = (e) => {

            e.preventDefault();

            if (e.target.hasAttribute('data-cart-form')) {

                const cartFormVal = e.target.getAttribute('data-cart-form');
                let cartFormEl = null;

                if (cartFormVal) {

                    cartFormEl = document.querySelector(cartFormVal);

                } else {

                    cartFormEl = e.target.closest('form[name="product"]');
                }

                if (cartFormEl) {

                    e.preventDefault();

                    const formData = new FormData(cartFormEl);

                    let itemId = e.target.getAttribute('data-cart-add');
                    let quantity = e.target.getAttribute('data-cart-quantity');
                    let attributes = [];

                    formData.delete('form_type');
                    formData.delete('form_id'); 

                    for (const entry of formData.entries()) {

                        if (entry[0] === 'product_id') {

                            itemId = entry[1];

                        } else if (entry[0] === 'quantity') {

                            quantity = entry[1];

                        } else {

                            attributes.push({
                                name: entry[0],
                                value: entry[1]
                            });
                        }
                    };

                    let checkboxNames = [];

                    attributes.forEach((obj) => {

                        const name = obj.name.slice(0, -2);

                        if (obj.name.slice(-2) === '[]' && !checkboxNames.includes(name)) {
                            checkboxNames.push(name);
                        }
                    });

                    attributes = attributes.filter(obj => obj.name.slice(-2) !== '[]');

                    checkboxNames.forEach((name, i) => {

                        const domName = name+'[]';
                        const checkboxEls = cartFormEl.querySelectorAll('[name="'+domName+'"]');

                        let attribute = {
                            name: name,
                            value: []
                        };

                        checkboxEls.forEach((el) => {

                            if (el.checked && (el.offsetWidth || el.offsetHeight || el.getClientRects().length)) {
                                attribute.value.push(el.value)
                            }
                        });

                        attributes.push(attribute);
                    });

                    try {

                        attributes.forEach((obj) => {

                            const el = cartFormEl.querySelector('[name="'+obj.name+'"]');

                            if (el && el.nodeName === 'TEXTAREA') {

                                const minlength = el.getAttribute('minlength');
                                const maxlength = el.getAttribute('maxlength');

                                if (minlength && obj.value.length < minlength) {

                                    this.notify.warning(null, theme.utils.t('error.attribute_text_min_length'));

                                    throw new Error('Attribute text min length error.');

                                } else if (maxlength && obj.value.length > maxlength) {

                                    this.notify.warning(null, theme.utils.t('error.attribute_text_max_length'));

                                    throw new Error('Attribute text max length error.');
                                }
                            }
                        });

                    } catch (e) {

                        return;
                    }

                    if (!itemId || !quantity) {
                        return;
                    }

                    this.addItem(parseInt(itemId, 10), parseInt(quantity, 10), attributes, e.target.hasAttribute('data-cart-checkout'));
                }

            } else {

                const itemId = parseInt(e.target.getAttribute('data-cart-add'), 10);
                const quantity = parseInt(e.target.getAttribute('data-cart-quantity'), 10);

                this.addItem(itemId, quantity, [], e.target.hasAttribute('data-cart-checkout'));
            }
        };

        const remove = (e) => {

            e.preventDefault();

            this.removeItem(parseInt(e.target.getAttribute('data-cart-remove'), 10));
        };

        const update = (e) => {

            e.preventDefault();

            const itemId = parseInt(e.target.getAttribute('data-cart-update'), 10);
            const quantity = parseInt(e.target.getAttribute('data-cart-quantity'), 10);

            this.updateItem(itemId, quantity);
        };

        const quantityDynamic = (e) => {

            e.preventDefault();

            const itemId = parseInt(e.target.getAttribute('data-cart-quantity-dynamic'), 10);
            const quantity = parseInt(e.target.value, 10);
            const minValue = parseInt(e.target.getAttribute('min'), 10) ?? 1;

            if (Number.isInteger(quantity)) {

                if (quantity < minValue) {
                    this.removeItem(itemId);
                } else {
                    this.updateItem(itemId, quantity);
                }
            }
        };

        const quantityDecrease = (e) => {

            e.preventDefault();

            const itemId = parseInt(e.target.getAttribute('data-cart-quantity-decrease'), 10);
            const item = this.items.find(item => item.id === itemId);
            const quantityEl = e.target.parentElement.querySelector('[data-cart-quantity-dynamic]');

            if (item) {

                if (quantityEl) {

                    const minValue = parseInt(quantityEl.getAttribute('min'), 10) ?? 1;

                    if (item.quantity - 1 < minValue) {

                        this.removeItem(item.id);

                        return;
                    }
                }

                this.updateItem(item.id, item.quantity - 1);
            }
        };

        const quantityIncrease = (e) => {

            e.preventDefault();

            const itemId = parseInt(e.target.getAttribute('data-cart-quantity-increase'), 10);
            const item = this.items.find(item => item.id === itemId);

            if (item) {
                this.updateItem(item.id, item.quantity + 1);
            }
        };

        const clear = (e) => {

            e.preventDefault();

            this.clearItems();
        };

        const checkout = (e) => {

            e.preventDefault()

            this.checkout();
        };

        const render = () => {

            const cartContainerEl = document.querySelector('[data-cart-container]');
            const cartMiniContainerEl = document.querySelector('[data-cart-mini-container]');
            const cartOffcanvasContainerEl = document.querySelector('[data-cart-offcanvas-container]');
            const itemCountEls = document.querySelectorAll('[data-cart-item-count]');
            const subtotalEls = document.querySelectorAll('[data-cart-subtotal]');
            const paymentFeeEls = document.querySelectorAll('[data-cart-payment-fee]');
            const shippingPriceEls = document.querySelectorAll('[data-cart-shipping-price]');
            const discountsEls = document.querySelectorAll('[data-cart-discounts]');
            const taxFreeEls = document.querySelectorAll('[data-cart-tax-free]');
            const taxEls = document.querySelectorAll('[data-cart-tax]');
            const totalEls = document.querySelectorAll('[data-cart-total]');

            itemCountEls.forEach(el => {

                if (this.cart.item_count > 0 && !el.parentNode.classList.contains('has-items')) {

                    el.parentNode.classList.add('has-items');

                } else if (this.cart.item_count < 1 && el.parentNode.classList.contains('has-items')) {

                    el.parentNode.classList.remove('has-items');
                }

                if (this.initialized) {
                    theme.utils.animate(el.parentNode, 'bounce');
                }

                el.innerHTML = this.cart.item_count || 0;
            });

            subtotalEls.forEach(el => {
                el.innerHTML = this.cart.subtotal || 0;
            });

            paymentFeeEls.forEach(el => {
                el.innerHTML = this.cart.payment_fee || 0;
            });

            shippingPriceEls.forEach(el => {
                el.innerHTML = this.cart.shipping_price || 0;
            });

            if (discountsEls && this.cart.discounts) {

                const discountsTemplate = theme.hbs.compile(document.querySelector('#hbs-cart-discounts').innerHTML);

                discountsEls.forEach(el => {

                    if (discountsTemplate) {
                        el.innerHTML = discountsTemplate({
                            discounts: this.cart.discounts
                        });
                    }
                });
            }

            taxFreeEls.forEach(el => {
                el.innerHTML = this.cart.tax_free || 0;
            });

            taxEls.forEach(el => {
                el.innerHTML = this.cart.tax || 0;
            });

            totalEls.forEach(el => {
                el.innerHTML = this.cart.total || 0;
            });

            if (cartContainerEl) {

                cartContainerEl.innerHTML = this.cartTemplate({
                    cart: this.cart,
                    itemCount: this.items.length,
                    taxFreeShopping: theme.store.taxFreeShopping,
                    isInitialRender: isInitialRender,
                    productShowManufacturer: theme.store.product.showManufacturer,
                    productShowPromotion: theme.store.product.showPromotion,
                    productShowPricing: theme.store.product.showPricing,
                    productShowRating: theme.store.product.showRating,
                    productShowNewBadge: theme.store.product.showNewBadge,
                    productShowDiscountBadge: theme.store.product.showDiscountBadge,
                    productShowOutOfStockBadge: theme.store.product.showOutOfStockBadge,
                    productWrapName: theme.store.product.showWrapName,
                    productImageAspectRatio: theme.store.product.ImageAspectRatio,
                    productImageAspectRatioFit:theme.store.product.ImageAspectRatioFit,
                    assetUrl: theme.store.routes.assetUrl,
                    cartUrl: theme.store.routes.cartUrl,
                    checkoutUrl: theme.store.routes.checkoutUrl,
                    rootUrl: theme.store.routes.rootUrl
                });

                cartContainerEl.querySelectorAll('[data-cart-quantity-dynamic]').forEach(el => {

                    theme.utils.filterInput(el, (value) => {
                        return value != 0 && /^\d+$/.test(value);
                    });

                    el.addEventListener('change', e => {
                        quantityDynamic(e);
                    })
                });
            }

            if (cartMiniContainerEl) {

                cartMiniContainerEl.innerHTML = this.cartMiniTemplate({
                    cart: this.cart,
                    itemCount: this.items.length,
                    taxFreeShopping: theme.store.taxFreeShopping,
                    isInitialRender: isInitialRender,
                    productShowManufacturer: theme.store.product.showManufacturer,
                    productShowPromotion: theme.store.product.showPromotion,
                    productShowPricing: theme.store.product.showPricing,
                    productShowRating: theme.store.product.showRating,
                    productShowNewBadge: theme.store.product.showNewBadge,
                    productShowDiscountBadge: theme.store.product.showDiscountBadge,
                    productShowOutOfStockBadge: theme.store.product.showOutOfStockBadge,
                    productWrapName: theme.store.product.showWrapName,
                    productImageAspectRatio: theme.store.product.ImageAspectRatio,
                    productImageAspectRatioFit:theme.store.product.ImageAspectRatioFit,
                    assetUrl: theme.store.routes.assetUrl,
                    cartUrl: theme.store.routes.cartUrl,
                    checkoutUrl: theme.store.routes.checkoutUrl,
                    rootUrl: theme.store.routes.rootUrl
                });
            }

            if (cartOffcanvasContainerEl) {

                let templateHtml = this.cartOffcanvasTemplate({
                    cart: this.cart,
                    itemCount: this.items.length,
                    taxFreeShopping: theme.store.taxFreeShopping,
                    isInitialRender: isInitialRender,
                    productShowManufacturer: theme.store.product.showManufacturer,
                    productShowPromotion: theme.store.product.showPromotion,
                    productShowPricing: theme.store.product.showPricing,
                    productShowRating: theme.store.product.showRating,
                    productShowNewBadge: theme.store.product.showNewBadge,
                    productShowDiscountBadge: theme.store.product.showDiscountBadge,
                    productShowOutOfStockBadge: theme.store.product.showOutOfStockBadge,
                    productWrapName: theme.store.product.showWrapName,
                    productImageAspectRatio: theme.store.product.ImageAspectRatio,
                    productImageAspectRatioFit:theme.store.product.ImageAspectRatioFit,
                    assetUrl: theme.store.routes.assetUrl,
                    cartUrl: theme.store.routes.cartUrl,
                    checkoutUrl: theme.store.routes.checkoutUrl,
                    rootUrl: theme.store.routes.rootUrl
                });

                if (!this.cache.cartOffcanvasTemplateImgEls) {
                    this.cache.cartOffcanvasTemplateImgEls = [];
                }

                if (this.cache.cartOffcanvasTemplateImgEls.length) {

                    const templateDom = new DOMParser().parseFromString(templateHtml, 'text/html');

                    templateDom.querySelectorAll('.lazy').forEach((el, i) => {
                        el.outerHTML = this.cache.cartOffcanvasTemplateImgEls[i];
                    });

                    templateHtml = templateDom.body.innerHTML;
                }

                cartOffcanvasContainerEl.innerHTML = templateHtml;

                const lazyNodeList = cartOffcanvasContainerEl.querySelectorAll('.lazy');

                if (this.cache.cartOffcanvasTemplateImgEls.length !== lazyNodeList.length) {
                    setTimeout(() => {
                        this.cache.cartOffcanvasTemplateImgEls = Array.from(lazyNodeList, node => node.outerHTML);
                    }, 2000);
                }
            }

            document.dispatchEvent(new CustomEvent('theme:cart:render'));

            isInitialRender = false;
        };

        document.addEventListener('click', (e) => {

            if (e.target.hasAttribute('data-cart-add')) {
                return add(e);
            }

            if (e.target.hasAttribute('data-cart-remove')) {
                return remove(e);
            }

            if (e.target.hasAttribute('data-cart-update')) {
                return update(e);
            }

            if (e.target.hasAttribute('data-cart-quantity-decrease')) {
                return quantityDecrease(e);
            }

            if (e.target.hasAttribute('data-cart-quantity-increase')) {
                return quantityIncrease(e);
            }

            if (e.target.hasAttribute('data-cart-clear')) {
                return clear(e);
            }

            if (e.target.hasAttribute('data-cart-checkout')) {
                return checkout(e);
            }
        });

        document.addEventListener('theme:cart:update', (e) => {

            render(e)

            if (!this.initialized) {
                this.initialized = true;
            }
        });
    }

    addToQueue(method, url, data = null) {

        return new Promise((resolve, reject) => {

            const request = {
                url: url,
                method: method,
                data: data,
                resolve,
                reject
            };

            this.queue.push(request);

            if (this.processing) {
                return;
            }

            this.processQueue();
        });
    }

    processQueue() {

        if (!this.queue.length) {

            this.processing = false;

            return;
        }

        this.processing = true;

        const request = this.queue.shift();
        const headers = {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        };

        if (request.data) {
            headers['Content-Type'] = 'application/json';
        }

        fetch(request.url, {
            method: request.method,
            body: request.data ? JSON.stringify(request.data) : null,
            headers
        }).then(async (resp) => {

            if (Math.floor(resp.status / 100) !== 2) {
                request.reject(await resp.json());
            } else {
                request.resolve(await resp.json());
            }
            
            this.processQueue();

        }).catch(async (err) => {
            
            request.reject({});
        });
    }

    getCart() {

        // Customer account required to purchase
        if (theme.store.customer.accountsEnabled == true &&
            theme.store.customer.accountsRequireApproval == false &&
            theme.store.customer.accountsOptional == false &&
            theme.store.customer.loggedIn == false) {

                document.dispatchEvent(new CustomEvent('theme:cart:update', {
                    detail: this.cart
                }));

                return;
        }

        // Customer account requires approval in order to purchase
        if (theme.store.customer.accountsEnabled == true &&
            theme.store.customer.accountsRequireApproval == true &&
            theme.store.customer.hasAccess == false) {

                document.dispatchEvent(new CustomEvent('theme:cart:update', {
                    detail: this.cart
                }));

                return;
        }

        // Set test data for preview in design mode
        if (theme.store.template === 'cart' && theme.store.designMode === 'edit') {

            this.updateCart({
                currency: "EUR",
                total: 24.9,
                subtotal: 29.9,
                payment_fee: 0,
                shipping_price: 0,
                tax: 4.82,
                tax_subtotal: 5.79,
                tax_free: 20.08,  
                tax_free_subtotal: 24.11,
                item_count: 1,
                expires: null,
                has_free_delivery: false,
                free_delivery_limit: null,
                weight_in_grams: 0,
                items: [
                    {
                        name: theme.utils.t('placeholder.product'),
                        description: "",
                        id: null,
                        url: null,
                        image: null,
                        quantity: 1,
                        unit_price: 29.9,
                        line_price: 29.9,
                        net_price: 24.11,
                        rate: 0.24,
                        tax: 5.79,
                        unit_name: theme.utils.t('placeholder.unit'),
                        out_of_stock: false,
                        product_id: null,
                        requires_shipping: true,
                        category_path: [],
                        sku: null,
                        model: "",
                        manufacturer: null,
                        type: "product",
                        attributes: false,
                        attributes_label: false,
                        weight_in_grams: 0,
                        shipping_weight_in_grams: 0
                    }
                ],
                payment_methods: [],
                shipping_methods: [],
                discounts: []
            });

            document.dispatchEvent(new CustomEvent('theme:cart:update', {
                detail: this.cart
            }));

            return;
        }

        this.addToQueue('GET', '/api/cart').then((res) => {
            this.updateCart(res);
        });
    }

    updateCart(data = null, triggerEvent = true) {

        if (data) {
            this.cart = data;
            this.items = data.items || {};
        } else {
            this.cart = {};
            this.items = {};
        }

        if (triggerEvent) {
            
            document.dispatchEvent(new CustomEvent('theme:cart:update', {
                detail: this.cart
            }));
        }
    }

    addItem(id = null, quantity = 1, attributes = [], checkout = false) {

        if (id === null) {
            return;
        }

        // Customer account required to purchase
        if (theme.store.customer.accountsEnabled == true &&
            theme.store.customer.accountsRequireApproval == false &&
            theme.store.customer.accountsOptional == false &&
            theme.store.customer.loggedIn == false) {
                return;
        }

        // Customer account requires approval in order to purchase
        if (theme.store.customer.accountsEnabled == true &&
            theme.store.customer.accountsRequireApproval == true &&
            theme.store.customer.hasAccess == false) {
                return;
        }

        const data = {
            product: id,
            quantity,
        };

        attributes.forEach(item => {
            data[item.name] = item.value;
        });

        this.addToQueue('POST', '/api/cart/items', data).then((res) => {

            this.updateCart(res, !checkout);

            const lastItem = res.items.filter((item) => item.product_id === parseInt(id, 10))[0];

            if (lastItem) {

                if (theme.store.cart.showAddNotification && !checkout) {
                    this.notify.success(theme.utils.t('cart.product_added_to_cart'), lastItem.name, null, () => {
                        window.location.href = theme.store.routes.cartUrl;
                    });
                }

                const eventDetail = lastItem;

                eventDetail.currency = this.cart.currency;

                document.dispatchEvent(new CustomEvent('theme:cart:addItem', {
                    detail: eventDetail
                }));

                if (checkout) {
                    this.checkout();
                }
            }

        }).catch((res) => {

            this.notify.warning(null, theme.utils.t('error.'+res.error));
        });
    }

    updateItem(id = null, quantity = null) {

        if (id === null || quantity === null) {
            return;
        }

        const data = {
            quantity
        };

        data.quantity = quantity;

        this.addToQueue('PUT', '/api/cart/items/'+id, data).then((res) => {

            this.updateCart(res);

            const eventDetail = this.items.filter((item) => item.id === parseInt(id, 10))[0];

            eventDetail.currency = this.cart.currency;

            document.dispatchEvent(new CustomEvent('theme:cart:updateItem', {
                detail: eventDetail
            }));

        }).catch((res) => {

            this.notify.warning(null, theme.utils.t('error.'+res.error));
        });
    }

    removeItem(id = null) {

        if (id === null) {
            return;
        }

        const itemToBeRemoved = this.items.filter((item) => item.id === parseInt(id, 10))[0];

        this.addToQueue('DELETE', '/api/cart/items/'+id).then((res) => {

            this.updateCart(res);

            if (itemToBeRemoved) {

                const eventDetail = itemToBeRemoved;

                eventDetail.currency = this.cart.currency;

                document.dispatchEvent(new CustomEvent('theme:cart:removeItem', {
                    detail: eventDetail
                }));
            }

        }).catch((res) => {

            this.notify.warning(null, theme.utils.t('error.'+res.error));
        });
    }

    clearItems() {

        this.addToQueue('DELETE', '/api/cart').then((res) => {

            this.updateCart(res);

            document.dispatchEvent(new CustomEvent('theme:cart:clear', {
                detail: this.cart
            }));

        }).catch((res) => {

            this.notify.warning(null, theme.utils.t('error.'+res.error));
        });
    }

    checkout() {

        document.dispatchEvent(new CustomEvent('theme:cart:initiateCheckout', {
            detail: this.cart
        }));

        window.location.href = theme.store.routes.checkoutUrl;
    }
}