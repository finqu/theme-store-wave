import Notify from './notify';

export default class Cart {

    constructor(data = {}) {
        this.cart = data;
        this.queue = [];
        this.processing = false;
        this.initialized = false;
        this.notify = new Notify();
        this.cache = {};
        this.isInitialRender = true;
    }

    init() {
        this.bindEvents();
        this.getCart();
    }

    bindEvents() {

        const addItem = (e) => {

            e.preventDefault();

            if (e.target.matches('[data-cart-form]')) {

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
                    let customizations = [];

                    formData.delete('form_type');
                    formData.delete('form_id'); 

                    for (const entry of formData.entries()) {

                        if (entry[0] === 'product') {

                            itemId = entry[1];

                        } else if (entry[0] === 'quantity') {

                            quantity = entry[1];

                        } else {

                            customizations.push({
                                name: entry[0],
                                value: entry[1]
                            });
                        }
                    };

                    let checkboxNames = [];

                    customizations.forEach(obj => {

                        const name = obj.name.slice(0, -2);

                        if (obj.name.slice(-2) === '[]' && !checkboxNames.includes(name)) {
                            checkboxNames.push(name);
                        }
                    });

                    customizations = customizations.filter(obj => obj.name.slice(-2) !== '[]');

                    checkboxNames.forEach((name, i) => {

                        const domName = name+'[]';
                        const checkboxEls = cartFormEl.querySelectorAll('[name="'+domName+'"]');

                        let customization = {
                            name: name,
                            value: []
                        };

                        checkboxEls.forEach((el) => {
                            if (el.checked && (el.parentElement.offsetWidth || el.parentElement.offsetHeight || el.parentElement.getClientRects().length)) {
                                customization.value.push(el.value);
                            }
                        });

                        customizations.push(customization);
                    });

                    try {

                        customizations.forEach(obj => {

                            const el = cartFormEl.querySelector('[name="'+obj.name+'"]');

                            if (el && el.nodeName === 'TEXTAREA') {

                                const minlength = el.getAttribute('minlength');
                                const maxlength = el.getAttribute('maxlength');

                                if (minlength && obj.value.length < minlength) {

                                    this.notify.warning(null, theme.utils.t('error.attribute_text_min_length'));

                                    throw new Error('Customization text min length error.');

                                } else if (maxlength && obj.value.length > maxlength) {

                                    this.notify.warning(null, theme.utils.t('error.attribute_text_max_length'));

                                    throw new Error('Customization text max length error.');
                                }
                            }
                        });

                    } catch (e) {

                        return;
                    }

                    if (!itemId) {
                        return;
                    }

                    this.addItem(parseInt(itemId, 10), parseInt(quantity || 1, 10), customizations, e.target.matches('[data-cart-checkout]'));
                }

            } else {

                const itemId = e.target.getAttribute('data-cart-add');
                const quantity = e.target.getAttribute('data-cart-quantity');

                if (!itemId) {
                    return;
                }

                this.addItem(parseInt(itemId, 10), parseInt(quantity || 1, 10), [], e.target.matches('[data-cart-checkout]'));
            }
        };

        const removeItem = (e) => {

            e.preventDefault();

            this.removeItem(parseInt(e.target.getAttribute('data-cart-remove'), 10));
        };

        const updateItem = (e) => {

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
            const item = this.cart.items.find(item => item.id === itemId);
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
            const item = this.cart.items.find(item => item.id === itemId);

            if (item) {
                this.updateItem(item.id, item.quantity + 1);
            }
        };

        const clearItems = (e) => {

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

                if (el.dataset.cartItemCount && this.initialized) {
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

                discountsEls.forEach(el => {

                    if (discountsTemplate) {
                        el.innerHTML = theme.renderer.render('cart-discounts', {
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

                const data = {
                    cart: this.cart,
                    itemCount: this.cart.items.length,
                    taxInformation: theme.store.taxInformation,
                    taxFreeShopping: theme.store.taxFreeShopping,
                    isInitialRender: this.isInitialRender,
                    productShowManufacturer: theme.store.product.showManufacturer,
                    productShowPromotion: theme.store.product.showPromotion,
                    productShowPricing: theme.store.product.showPricing,
                    productShowRating: theme.store.product.showRating,
                    productShowNewBadge: theme.store.product.showNewBadge,
                    productShowDiscountBadge: theme.store.product.showDiscountBadge,
                    productShowOutOfStockBadge: theme.store.product.showOutOfStockBadge,
                    productShowBackorderBadge: theme.store.product.showBackorderBadge,
                    productWrapName: theme.store.product.showWrapName,
                    productImageAspectRatio: theme.store.product.ImageAspectRatio,
                    productImageAspectRatioFit:theme.store.product.ImageAspectRatioFit,
                    assetUrl: theme.store.routes.assetUrl,
                    cartUrl: theme.store.routes.cartUrl,
                    checkoutUrl: theme.store.routes.checkoutUrl,
                    rootUrl: theme.store.routes.rootUrl
                };

                if (this.isInitialRender || !this.cart.items.length) {

                    cartContainerEl.innerHTML = theme.renderer.render('cart', data);

                } else {

                    cartContainerEl.querySelectorAll('[data-cart-partial]').forEach(el => {
                        el.innerHTML = theme.renderer.render(el.dataset.cartPartial, data);
                    });
                }

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

                const lazyNodeList = cartMiniContainerEl.querySelectorAll('.lazy');
                const data = {
                    cart: this.cart,
                    itemCount: this.cart.items.length,
                    taxInformation: theme.store.taxInformation,
                    taxFreeShopping: theme.store.taxFreeShopping,
                    isInitialRender: this.isInitialRender,
                    productShowManufacturer: theme.store.product.showManufacturer,
                    productShowPromotion: theme.store.product.showPromotion,
                    productShowPricing: theme.store.product.showPricing,
                    productShowRating: theme.store.product.showRating,
                    productShowNewBadge: theme.store.product.showNewBadge,
                    productShowDiscountBadge: theme.store.product.showDiscountBadge,
                    productShowOutOfStockBadge: theme.store.product.showOutOfStockBadge,
                    productShowBackorderBadge: theme.store.product.showBackorderBadge,
                    productWrapName: theme.store.product.showWrapName,
                    productImageAspectRatio: theme.store.product.ImageAspectRatio,
                    productImageAspectRatioFit:theme.store.product.ImageAspectRatioFit,
                    assetUrl: theme.store.routes.assetUrl,
                    cartUrl: theme.store.routes.cartUrl,
                    checkoutUrl: theme.store.routes.checkoutUrl,
                    rootUrl: theme.store.routes.rootUrl
                };

                if (this.isInitialRender || !this.cart.items.length) {

                    this.cache.cartMiniImgEls = [];

                    cartMiniContainerEl.innerHTML = theme.renderer.render('cart-mini', data);

                } else {

                    let cartMiniImgIndex = 0;

                    cartMiniContainerEl.querySelectorAll('[data-cart-partial]').forEach(el => {

                        let templateHtml = theme.renderer.render(el.dataset.cartPartial, data);
                        const templateDom = new DOMParser().parseFromString(templateHtml, 'text/html');
                        const newLazyNodeList = templateDom.querySelectorAll('.lazy');

                        if (this.cache.cartMiniImgEls.length && cartMiniImgIndex < this.cache.cartMiniImgEls.length) {
        
                            newLazyNodeList.forEach((el) => {

                                el.outerHTML = this.cache.cartMiniImgEls[cartMiniImgIndex];

                                cartMiniImgIndex++;
                            });
        
                            templateHtml = templateDom.body.innerHTML;
                        }

                        el.innerHTML = templateHtml;
                    });
                }

                if (this.cache.cartMiniImgEls.length !== lazyNodeList.length) {
                    setTimeout(() => {
                        this.cache.cartMiniImgEls = Array.from(lazyNodeList, node => node.outerHTML);
                    }, 2000);
                } 
            }

            if (cartOffcanvasContainerEl) {

                const lazyNodeList = cartOffcanvasContainerEl.querySelectorAll('.lazy');
                const data = {
                    cart: this.cart,
                    itemCount: this.cart.items.length,
                    taxInformation: theme.store.taxInformation,
                    taxFreeShopping: theme.store.taxFreeShopping,
                    isInitialRender: this.isInitialRender,
                    productShowManufacturer: theme.store.product.showManufacturer,
                    productShowPromotion: theme.store.product.showPromotion,
                    productShowPricing: theme.store.product.showPricing,
                    productShowRating: theme.store.product.showRating,
                    productShowNewBadge: theme.store.product.showNewBadge,
                    productShowDiscountBadge: theme.store.product.showDiscountBadge,
                    productShowOutOfStockBadge: theme.store.product.showOutOfStockBadge,
                    productShowBackorderBadge: theme.store.product.showBackorderBadge,
                    productWrapName: theme.store.product.showWrapName,
                    productImageAspectRatio: theme.store.product.ImageAspectRatio,
                    productImageAspectRatioFit:theme.store.product.ImageAspectRatioFit,
                    assetUrl: theme.store.routes.assetUrl,
                    cartUrl: theme.store.routes.cartUrl,
                    checkoutUrl: theme.store.routes.checkoutUrl,
                    rootUrl: theme.store.routes.rootUrl
                };

                if (this.isInitialRender || !this.cart.items.length) {

                    this.cache.cartOffcanvasImgEls = [];

                    cartOffcanvasContainerEl.innerHTML = theme.renderer.render('cart-offcanvas', data);

                } else {

                    let cartOffcanvasImgIndex = 0;

                    cartOffcanvasContainerEl.querySelectorAll('[data-cart-partial]').forEach(el => {

                        let templateHtml = theme.renderer.render(el.dataset.cartPartial, data);
                        const templateDom = new DOMParser().parseFromString(templateHtml, 'text/html');
                        const newLazyNodeList = templateDom.querySelectorAll('.lazy');

                        if (this.cache.cartOffcanvasImgEls.length && cartOffcanvasImgIndex < this.cache.cartOffcanvasImgEls.length) {
        
                            newLazyNodeList.forEach((el) => {

                                el.outerHTML = this.cache.cartOffcanvasImgEls[cartOffcanvasImgIndex];

                                cartOffcanvasImgIndex++;
                            });
        
                            templateHtml = templateDom.body.innerHTML;
                        }

                        el.innerHTML = templateHtml;
                    });
                }

                if (this.cache.cartOffcanvasImgEls.length !== lazyNodeList.length) {
                    setTimeout(() => {
                        this.cache.cartOffcanvasImgEls = Array.from(lazyNodeList, node => node.outerHTML);
                    }, 2000);
                } 
            }

            document.dispatchEvent(new CustomEvent('theme:cart:render'));

            this.isInitialRender = false;
        };

        document.addEventListener('click', e => {

            if (e.target.matches('[data-cart-add]')) {
                return addItem(e);
            }

            if (e.target.matches('[data-cart-remove]')) {
                return removeItem(e);
            }

            if (e.target.matches('[data-cart-update]')) {
                return updateItem(e);
            }

            if (e.target.matches('[data-cart-quantity-decrease]')) {
                return quantityDecrease(e);
            }

            if (e.target.matches('[data-cart-quantity-increase]')) {
                return quantityIncrease(e);
            }

            if (e.target.matches('[data-cart-clear]')) {
                return clearItems(e);
            }

            if (e.target.matches('[data-cart-checkout]')) {
                return checkout(e);
            }
        });

        document.addEventListener('theme:cart:update', async e => {

            if (e.details?.refreshData) {
                this.cart = {};
                await this.getCart();
            }

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

        }).catch(async () => {
            
            request.reject({});
        });
    }

    async getCart() {

        if (!theme.store.customer.hasPurchaseRight) {

            document.dispatchEvent(new CustomEvent('theme:cart:update', {
                detail: this.cart
            }));

            return;
        }

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

        if (Object.keys(this.cart).length) {

            document.dispatchEvent(new CustomEvent('theme:cart:update', {
                detail: this.cart
            }));

        } else {

            await this.addToQueue('GET', '/api/cart').then(res => {
                this.updateCart(res);
            });
        }
    }

    updateCart(data = {}, triggerEvent = true) {

        if (!this.cart.items.length && data.items.length || this.cart.items.length && !data.items.length) {
            this.isInitialRender = true;
        }

        this.cart = data;

        if (triggerEvent) {
            
            document.dispatchEvent(new CustomEvent('theme:cart:update', {
                detail: this.cart
            }));
        }
    }

    addItem(id = null, quantity = 1, customizations = [], checkout = false) {

        if (id === null || !theme.store.customer.hasPurchaseRight) {
            return;
        }

        const data = {
            product: id,
            quantity,
        };

        customizations.forEach(item => {
            data[item.name] = item.value;
        });

        this.addToQueue('POST', '/api/cart/items', data).then((res) => {

            this.updateCart(res, !checkout);

            const lastItem = res.items.filter((item) => item.product_id === parseInt(id, 10))[0];

            if (lastItem) {

                if (theme.store.cart.showAddNotification && !checkout) {
                    this.notify.success(theme.utils.t('cart.product_added_to_cart'), lastItem.name, () => document.dispatchEvent(new CustomEvent('theme:cart:show')));
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

        this.addToQueue('PUT', '/api/cart/items/'+id, data).then(res => {

            this.updateCart(res);

            const eventDetail = this.cart.items.filter((item) => item.id === parseInt(id, 10))[0];

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

        const itemToBeRemoved = this.cart.items.filter((item) => item.id === parseInt(id, 10))[0];

        this.addToQueue('DELETE', '/api/cart/items/'+id).then(res => {

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

        this.addToQueue('DELETE', '/api/cart').then(res => {

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